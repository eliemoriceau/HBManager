import { inject } from '@adonisjs/core'
import InvalidMatchException from '#match/application/exception/invalid_match_exception'
import { MatchRepository } from '#match/domain/repository/match_repository'
import { GetMatchUseCase } from '#match/application/usecase/get_match_use_case'
import {
  MatchDetailsDto,
  matchDetailsDtoDomainsToDto,
} from '#match/application/dto/match_details_dto'

@inject()
export class GetMatch implements GetMatchUseCase {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(id: string): Promise<MatchDetailsDto> {
    const match = await this.matchRepository.findById(id)
    if (!match) {
      throw new InvalidMatchException('Match introuvable')
    }
    return matchDetailsDtoDomainsToDto(match)
  }
}
