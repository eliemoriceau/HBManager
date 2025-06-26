import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ListTeamsUseCase } from '#team/use_case/list_teams_use_case'

@inject()
export default class GetTeamsController {
  constructor(private readonly useCase: ListTeamsUseCase) {}

  async handle({ response }: HttpContext) {
    const teams = await this.useCase.execute()

    const body = teams.map((t) => ({
      id: t.id.toString(),
      nom: t.nom.toString(),
      codeFederal: t.codeFederal.toString(),
      logo: t.logo ?? null,
    }))

    return response.ok(body)
  }
}
