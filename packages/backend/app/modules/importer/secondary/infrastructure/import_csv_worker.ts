import { Worker } from '#queue/simple_queue'
import { importCsvQueue } from '#importer/secondary/infrastructure/import_csv_queue'
import { UploadCsvService } from '#importer/service/upload_csv_service'
import app from '@adonisjs/core/services/app'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { promises as fs } from 'node:fs'

new Worker(importCsvQueue.name, async (job) => {
  try {
    const service = await app.container.make(UploadCsvService)
    const stat = await fs.stat(job.data.filePath)
    const file: MultipartFile = {
      isMultipartFile: true,
      tmpPath: job.data.filePath,
      size: stat.size,
      extname: 'csv',
      clientName: job.data.filePath.split('/').pop() ?? 'file.csv',
    } as MultipartFile
    await service.execute(file)
  } catch {
    /* silent failure to keep queue running */
  }
})
