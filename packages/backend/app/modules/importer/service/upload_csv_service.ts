import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { promises as fs } from 'node:fs'

export class UploadCsvService extends UploadCsvUseCase {
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

    const requiredHeaders = ['le', 'horaire', 'club rec', 'club vis', 'nom salle']
    const missing = requiredHeaders.filter((h) => !headers.includes(h))
    if (missing.length) {
      throw new Error(`Entêtes manquantes: ${missing.join(', ')}`)
    }
  }
}
