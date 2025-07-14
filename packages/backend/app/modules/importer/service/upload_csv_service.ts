import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { inject } from '@adonisjs/core'
import { CsvImportReport } from '#importer/domain/import_report'
import { ImportReportBuilder } from './import_report_builder.js'
import { CsvFileValidator } from './csv_file_validator.js'
import { CsvParser } from './csv_parser.js'
import { MatchFactory } from './match_factory.js'
import { ImportReportRepository } from '#importer/secondary/ports/import_report_repository'
import { MatchRepository } from '#match/domain/repository/match_repository'
import { PerformanceMeasurementService } from './performance_measurement_service.js'
import { promises as fs } from 'node:fs'
import Match from '#match/domain/entity/match'

const REQUIRED_HEADERS = ['code renc', 'le', 'horaire', 'club rec', 'club vis', 'nom salle']

@inject()
export class UploadCsvService extends UploadCsvUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly reportRepository: ImportReportRepository,
    private readonly performanceService: PerformanceMeasurementService
  ) {
    super()
  }

  async execute(file: MultipartFile): Promise<CsvImportReport> {
    return this.performanceService.measureAsync(
      'csv_import_total',
      async () => {
        await this.performanceService.measureAsync('csv_validation', async () => {
          await CsvFileValidator.validate(file, REQUIRED_HEADERS)
        })

        if (!file.tmpPath) throw new Error("Le fichier n'a pas été traité")

        const { fileContentUtf8, lines } = await this.performanceService.measureAsync(
          'file_reading',
          async () => {
            const fileBuffer = await fs.readFile(file.tmpPath)
            const content = fileBuffer.toString('utf8')
            const lineArray = content
              .split(/\r?\n/)
              .slice(1)
              .filter((l) => l.trim().length > 0)
            return { fileContentUtf8: content, lines: lineArray }
          }
        )

        const report = ImportReportBuilder.create(lines.length)

        try {
          const records = await this.performanceService.measureAsync(
            'csv_parsing',
            async () => {
              return CsvParser.parse(fileContentUtf8)
            },
            { recordCount: lines.length }
          )

          const existingCodes = await this.performanceService.measureAsync(
            'existing_codes_fetch',
            async () => {
              return this.matchRepository.findExistingCodes()
            }
          )

          const { processedMatches, processedIgnoredRecords } =
            await this.performanceService.measureAsync(
              'records_processing',
              async () => {
                const matchResults: Match[] = []
                const ignoredResults: Array<{ index: number; line: any; error: string }> = []

                // Traitement et validation de tous les enregistrements
                for (const [index, line] of records.entries()) {
                  try {
                    const match = MatchFactory.fromCsvLine(line)
                    const isUpdate = existingCodes.has(match.codeRenc)

                    matchResults.push(match)
                    ImportReportBuilder.addImported(report, isUpdate)

                    if (!isUpdate) {
                      existingCodes.add(match.codeRenc)
                    }
                  } catch (error) {
                    const errorRecord = {
                      index: index + 2,
                      line,
                      error: (error as Error).message,
                    }
                    ignoredResults.push(errorRecord)
                    ImportReportBuilder.addIgnored(
                      report,
                      errorRecord.index,
                      errorRecord.line,
                      errorRecord.error
                    )
                  }
                }

                return { processedMatches: matchResults, processedIgnoredRecords: ignoredResults }
              },
              { totalRecords: records.length }
            )

          // Traitement en lot des matchs valides
          if (processedMatches.length > 0) {
            await this.performanceService.measureAsync(
              'batch_upsert',
              async () => {
                await this.matchRepository.upsertBatch(processedMatches)
              },
              {
                validMatchCount: processedMatches.length,
                ignoredRecordCount: processedIgnoredRecords.length,
              }
            )
          }

          await this.performanceService.measureAsync('report_save', async () => {
            await this.reportRepository.save(report)
          })

          return report
        } finally {
          await this.performanceService.measureAsync('file_cleanup', async () => {
            await fs.unlink(file.tmpPath)
          })
        }
      },
      {
        fileName: file.clientName,
        fileSize: file.size,
      }
    )
  }
}
