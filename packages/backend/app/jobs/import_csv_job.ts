import { Job } from '@rlanz/bull-queue'
import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/types/bodyparser'
import logger from '@adonisjs/core/services/logger'

interface ImportCsvJobPayload {
  file: MultipartFile
}

@inject()
export default class ImportCsvJob extends Job {
  constructor(private uploadCsvUseCase: UploadCsvUseCase) {
    super()
  }
  // This is the path to the file that is used to create the job
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Base Entry point
   */
  async handle(payload: ImportCsvJobPayload) {
    logger.info('Importing CSV file job : %o', { payload })
    await this.uploadCsvUseCase.execute(payload.file)
  }

  /**
   * This is an optional method that gets called when the retries has exceeded and is marked failed.
   */
  async rescue(_payload: ImportCsvJobPayload) {}
}
