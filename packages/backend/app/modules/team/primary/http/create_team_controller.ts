import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { CreateTeamUseCase } from '#team/use_case/create_team_use_case'
import { upsertTeamValidator } from '#team/primary/http/upsert_team_validator'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'

@inject()
export default class CreateTeamController {
  constructor(private readonly useCase: CreateTeamUseCase) {}

  async handle({ request, response }: HttpContext) {
    const payload = await upsertTeamValidator.validate(request.body())
    try {
      const team = await this.useCase.execute(payload)
      return response.created({
        id: team.id.toString(),
        nom: team.nom.toString(),
        codeFederal: team.codeFederal.toString(),
        logo: team.logo ?? null,
      })
    } catch (error) {
      if (error instanceof InvalidTeamException) {
        return response.badRequest({ error: error.message })
      }
      throw error
    }
  }
}
