import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DatabaseConnectionException } from '#exceptions/database_connection_exception'
import queue from '@rlanz/bull-queue/services/main'
import ImportCsvJob from '../../../../jobs/import_csv_job.js'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class UploadCsvController {
  async handle({ request, response }: HttpContext) {
    const file = request.file('file')
    if (!file) {
      return response.badRequest({ error: 'file is required' })
    }

    try {
      logger.info('Importing CSV file controller %o', { file })
      await queue.dispatch(ImportCsvJob, { file }, { queueName: 'importCSV' })
      return response.accepted({ queued: true })
    } catch (error) {
      if (!(error instanceof DatabaseConnectionException)) {
        return response.badRequest({
          error: (error as Error).message,
          template: '/docs/csv_template.csv',
        })
      }
      throw error
    }
  }
}
