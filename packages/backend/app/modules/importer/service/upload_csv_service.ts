import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { promises as fs } from 'node:fs'
import { inject } from '@adonisjs/core'
import Match from '#match/domain/match'
import { MatchRepository } from '#match/secondary/ports/match_repository'

function parseDate(value: string): Date {
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(trimmed)
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/')
    return new Date(`${y}-${m}-${d}`)
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
  constructor(private readonly matchRepository: MatchRepository) {
    super()
  }

  async execute(file: MultipartFile): Promise<void> {
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

    const buffer = await fs.readFile(file.tmpPath)

    const utf8Check = Buffer.from(buffer.toString('utf8'), 'utf8')
    if (!buffer.equals(utf8Check)) {
      throw new Error('Encodage invalide : UTF-8 requis')
    }

    const [headerLine] = buffer.toString('utf8').split(/\r?\n/)
    const headers = headerLine.split(';').map((h) => h.trim().toLowerCase())

    const requiredHeaders = ['code renc', 'le', 'horaire', 'club rec', 'club vis', 'nom salle']
    const missing = requiredHeaders.filter((h) => !headers.includes(h))
    if (missing.length) {
      throw new Error(`Entêtes manquantes: ${missing.join(', ')}`)
    }

    const lines = buffer
      .toString('utf8')
      .split(/\r?\n/)
      .slice(1)
      .filter((l) => l.trim().length > 0)

    for (const line of lines) {
      const [codeRenc, le, horaire, clubRec, clubVis] = line.split(';')
      const date = parseDate(le)
      const heure = parseTime(horaire)
      const match = Match.create({
        id: codeRenc.trim(),
        date,
        heure,
        equipeDomicileId: clubRec.trim(),
        equipeExterieurId: clubVis.trim(),
      })
      await this.matchRepository.upsert(match)
    }
  }
}
