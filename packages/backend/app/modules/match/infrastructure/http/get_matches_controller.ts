import type { HttpContext } from '@adonisjs/core/http'
import { getMatchesValidator } from '#match/infrastructure/http/get_matches_validator'
import { GetMatchesUseCase } from '#match/application/usecase/get_matches_use_case'
import { inject } from '@adonisjs/core'

@inject()
export default class GetMatchesController {
  constructor(private readonly useCase: GetMatchesUseCase) {}

  async handle({ request, response }: HttpContext) {
    const payload = await getMatchesValidator.validate(request.qs())
    const matches = await this.useCase.execute(payload)

    const body = matches.map((m) => ({
      id: m.match.id,
      date: m.match.date.toISO(),
      heure: m.match.heure,
      equipeDomicile: m.match.equipeDomicile,
      equipeExterieur: m.match.equipeExterieur,
      officiels: m.match.officiels.map((o) => o.toString()),
      statut: m.match.statut,
    }))

    return response.ok(body)
  }
}
