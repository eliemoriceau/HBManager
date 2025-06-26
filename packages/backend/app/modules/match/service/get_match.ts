import { inject } from '@adonisjs/core'
import InvalidMatchException from '#match/exceptions/invalid_match_exception'
import { MatchRepository } from '#match/secondary/ports/match_repository'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { GetMatchUseCase, MatchDetails } from '#match/use_case/get_match_use_case'

@inject()
export class GetMatch extends GetMatchUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly teamRepository: TeamRepository
  ) {
    super()
  }

  async execute(id: string): Promise<MatchDetails> {
    const match = await this.matchRepository.findById(id)
    if (!match) {
      throw new InvalidMatchException('Match introuvable')
    }
    const home = await this.teamRepository.findById(match.equipeDomicileId.toString())
    const away = await this.teamRepository.findById(match.equipeExterieurId.toString())
    if (!home || !away) {
      throw new InvalidMatchException('Equipe introuvable')
    }
    return { match, equipeDomicile: home, equipeExterieur: away }
  }
}
