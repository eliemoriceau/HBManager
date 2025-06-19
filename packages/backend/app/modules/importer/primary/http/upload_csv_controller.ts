import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'

@inject()
export default class UploadCsvController {
  constructor(private readonly useCase: UploadCsvUseCase) {}

  async handle({ request, response }: HttpContext) {
    const file = request.file('file')
    if (!file) {
      return response.badRequest({ error: 'file is required' })
    }

    await this.useCase.execute(file)
    return response.created({ uploaded: true })
  }
}
