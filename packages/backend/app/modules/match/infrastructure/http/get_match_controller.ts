import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { GetMatchUseCase } from '#match/application/usecase/get_match_use_case'

@inject()
export default class GetMatchController {
  constructor(private readonly useCase: GetMatchUseCase) {}

  async handle({ params, response }: HttpContext) {
    const result = await this.useCase.execute(params.id)
    const { match, equipeDomicile, equipeExterieur } = result

    return response.ok({
      id: match.id.toString(),
      date: match.date.toISO(),
      heure: match.heure,
      statut: match.statut,
      codeRenc: match.codeRenc,
      officiels: match.officiels.map((o) => o.toString()),
      equipeDomicile: {
        id: equipeDomicile.id.toString(),
        nom: equipeDomicile.nom.toString(),
        codeFederal: equipeDomicile.codeFederal.toString(),
        logo: equipeDomicile.logo ?? null,
      },
      equipeExterieur: {
        id: equipeExterieur.id.toString(),
        nom: equipeExterieur.nom.toString(),
        codeFederal: equipeExterieur.codeFederal.toString(),
        logo: equipeExterieur.logo ?? null,
      },
    })
  }
}
