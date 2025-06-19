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

    await fs.readFile(file.tmpPath)
  }
}
