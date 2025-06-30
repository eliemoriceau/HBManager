import { inject } from '@adonisjs/core'
import InvalidMatchException from '#match/application/exception/invalid_match_exception'
import { MatchRepository } from '#match/domain/repository/match_repository'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { GetMatchUseCase } from '#match/application/usecase/get_match_use_case'
import {
  MatchDetailsDto,
  matchDetailsDtoDomainsToDto,
} from '#match/application/dto/match_details_dto'

@inject()
export class GetMatch implements GetMatchUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly teamRepository: TeamRepository
  ) {}

  async execute(id: string): Promise<MatchDetailsDto> {
    const match = await this.matchRepository.findById(id)
    if (!match) {
      throw new InvalidMatchException('Match introuvable')
    }
    // const home = await this.teamRepository.findById(match.equipeDomicile.toString())
    // const away = await this.teamRepository.findById(match.equipeExterieur.toString())
    // if (!home || !away) {
    //   throw new InvalidMatchException('Equipe introuvable')
    // }
    return matchDetailsDtoDomainsToDto(match)
  }
}
