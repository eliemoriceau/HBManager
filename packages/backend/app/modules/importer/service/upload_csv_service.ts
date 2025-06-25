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

<<<<<<< codex/ajouter-statistiques-sur-l-upload-de-csv
      const existingMatches = await this.matchRepository.findAll()
      const existingCodes = new Set(existingMatches.map((m) => m.codeRenc))

      const records = parse(buffer.toString('utf8'), {
=======
      const content = buffer.toString('utf8')

      const [headerLine] = content.split(/\r?\n/)
      const headers = headerLine.split(';').map((h) => h.trim().toLowerCase())
      const required = ['code renc', 'le', 'horaire', 'club rec', 'club vis', 'nom salle']
      const missing = required.filter((h) => !headers.includes(h))
      if (missing.length > 0) {
        throw new Error('Entêtes manquants')
      }

      const records = parse(content, {
>>>>>>> main
        columns: true,
        skip_empty_lines: true,
        delimiter: ';',
        cast: (value) => value,
      })

      const lines = content
        .split(/\r?\n/)
        .slice(1)
        .filter((l) => l.trim().length > 0)

      const report: CsvImportReport = {
        totalLines: lines.length,
        importedCount: 0,
        addedCount: 0,
        updatedCount: 0,
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
            officiels: [line['arb1 designe'], line['arb2 designe']].filter(Boolean),
            statut: StatutMatch.A_VENIR,
          })
          logger.debug(match)
          const isUpdate = existingCodes.has(match.codeRenc)
          await this.matchRepository.upsert(match)
          report.importedCount++
          if (isUpdate) {
            report.updatedCount++
          } else {
            report.addedCount++
            existingCodes.add(match.codeRenc)
          }
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
