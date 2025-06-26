import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DeleteTeamUseCase } from '#team/use_case/delete_team_use_case'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'

@inject()
export default class DeleteTeamController {
  constructor(private readonly useCase: DeleteTeamUseCase) {}

  async handle({ params, response }: HttpContext) {
    try {
      await this.useCase.execute(params.id)
      return response.noContent()
    } catch (error) {
      if (error instanceof InvalidTeamException) {
        return response.badRequest({ error: error.message })
      }
      throw error
    }
  }
}
