import { EnqueueCsvImportUseCase } from '#importer/use_case/enqueue_csv_import_use_case'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { promises as fs } from 'node:fs'
import app from '@adonisjs/core/services/app'
import { importCsvQueue } from '#importer/secondary/infrastructure/import_csv_queue'
import { inject } from '@adonisjs/core'

@inject()
export class EnqueueCsvImportService extends EnqueueCsvImportUseCase {
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
    const dest = app.tmpPath(`import_${Date.now()}_${file.clientName}`)
    await fs.copyFile(file.tmpPath, dest)
    await importCsvQueue.add('import', { filePath: dest })
  }
}
