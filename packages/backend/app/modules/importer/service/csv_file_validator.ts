import type { MultipartFile } from '@adonisjs/bodyparser'
import { promises as fs } from 'node:fs'

export class CsvFileValidator {
  static async validate(file: MultipartFile, requiredHeaders: string[]): Promise<void> {
    if (!file || !file.isMultipartFile) throw new Error('Fichier manquant')
    if (file.extname !== 'csv') throw new Error('Format de fichier invalide')
    if (!file.tmpPath) {
      throw new Error('Le fichier n’a pas été traité')
    }
    const MAX_FILE_SIZE_OCTETS = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE_OCTETS) {
      throw new Error('Fichier trop volumineux')
    }
    const fileBuffer = await fs.readFile(file.tmpPath)
    if (!fileBuffer || !(fileBuffer instanceof Buffer)) {
      throw new Error('Impossible de lire le contenu du fichier')
    }
    const fileContentUtf8 = fileBuffer.toString('utf8')
    const reEncodedBuffer = Buffer.from(fileContentUtf8, 'utf8')
    if (!fileBuffer.equals(reEncodedBuffer)) {
      throw new Error('Encodage invalide : UTF-8 requis')
    }
    const [headerLine] = fileContentUtf8.split(/\r?\n/)
    const headers = headerLine.split(';').map((h) => h.trim().toLowerCase())
    const missing = requiredHeaders.filter((h) => !headers.includes(h))
    if (missing.length > 0) throw new Error('Entêtes manquants')
  }
}
