import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { promises as fs } from 'node:fs'
import { inject } from '@adonisjs/core'
import { CsvImportReport } from '#importer/domain/import_report'
import { ImportReportRepository } from '#importer/secondary/ports/import_report_repository'
import Match from '#match/domain/match'
import { MatchRepository } from '#match/secondary/ports/match_repository'
import { parse } from 'csv-parse/sync'
import { StatutMatch } from '#match/domain/statut_match'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

function parseDate(value: string): DateTime {
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return DateTime.fromFormat(trimmed, 'yyyy-MM-dd')
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return DateTime.fromFormat(trimmed, 'dd/MM/yyyy')
  }
  throw new Error(`Format de date invalide: ${value}`)
}

function parseTime(value: string): string {
  const parts = value.trim().split(' ')
  const time = parts[parts.length - 1]
  const [h, m] = time.split(':')
  if (!h || !m) {
    throw new Error(`Heure invalide: ${value}`)
  }
  return `${h}:${m}`
}

@inject()
export class UploadCsvService extends UploadCsvUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly reportRepository: ImportReportRepository
  ) {
    super()
  }

  async execute(file: MultipartFile): Promise<CsvImportReport> {
    if (!file || !file.isMultipartFile) {
      throw new Error('Fichier manquant')
    }
    if (file.extname !== 'csv') {
      throw new Error('Format de fichier invalide')
    }
    if (!file.tmpPath) {
      throw new Error("Le fichier n'a pas été traité")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Fichier trop volumineux')
    }

    const tmpPath = file.tmpPath
    try {
      const buffer = await fs.readFile(tmpPath)

      const utf8Check = Buffer.from(buffer.toString('utf8'), 'utf8')
      if (!buffer.equals(utf8Check)) {
        throw new Error('Encodage invalide : UTF-8 requis')
      }

      const records = parse(buffer.toString('utf8'), {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';',
        autoParse: true,
      })

      const lines = buffer
        .toString('utf8')
        .split(/\r?\n/)
        .slice(1)
        .filter((l) => l.trim().length > 0)

      const report: CsvImportReport = {
        totalLines: lines.length,
        importedCount: 0,
        ignored: [],
      }

      for (const [index, line] of records.entries()) {
        try {
          const date = parseDate(line['le'])
          const heure = parseTime(line['horaire'])
          const match = Match.create({
            codeRenc: line['code renc'].trim(),
            date,
            heure,
            equipeDomicileId: line['club rec'].trim(),
            equipeExterieurId: line['club vis'].trim(),
            officiels: [line['arb1 designe'], line['arb2 designe']],
            statut: StatutMatch.A_VENIR,
          })
          logger.debug(match)
          await this.matchRepository.upsert(match)
          report.importedCount++
        } catch (error) {
          report.ignored.push({
            lineNumber: index + 2,
            content: line,
            reason: (error as Error).message,
          })
        }
      }

      await this.reportRepository.save(report)
      return report
    } finally {
      await fs.unlink(tmpPath)
    }
  }
}
