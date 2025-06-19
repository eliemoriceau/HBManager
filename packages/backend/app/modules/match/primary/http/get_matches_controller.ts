import type { HttpContext } from '@adonisjs/core/http'
import { getMatchesValidator } from '#match/primary/http/get_matches_validator'
import type { GetMatchesUseCase } from '#match/use_case/get_matches_use_case'
import { inject } from '@adonisjs/core'

export default class GetMatchesController {
  constructor(private readonly useCase: GetMatchesUseCase) {}

  @inject()
  async handle({ request, response }: HttpContext) {
    const payload = await getMatchesValidator.validate(request.qs())
    const matches = await this.useCase.execute(payload)

    const body = matches.map((m) => ({
      id: m.id.toString(),
      date: m.date.toISOString(),
      heure: m.heure,
      equipeDomicileId: m.equipeDomicileId.toString(),
      equipeExterieurId: m.equipeExterieurId.toString(),
      officiels: m.officiels.map((o) => o.toString()),
      statut: m.statut,
    }))

    return response.ok(body)
  }
}
