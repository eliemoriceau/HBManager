import { MatchRepository } from '#match/domain/repository/match_repository'
import {
  GetMatchesFilter,
  GetMatchesUseCase,
} from '#match/application/usecase/get_matches_use_case'
import { inject } from '@adonisjs/core'
import {
  MatchDetailsDto,
  matchDetailsDtoDomainsToDto,
} from '#match/application/dto/match_details_dto'

@inject()
export class GetMatches extends GetMatchesUseCase {
  constructor(private readonly matchRepository: MatchRepository) {
    super()
  }

  async execute(_filters: GetMatchesFilter = {}): Promise<MatchDetailsDto[]> {
    const matches = await this.matchRepository.findAll()
    // if (Object.keys(filters).length === 0) {
    //   return this.matchRepository.findAll()
    // }
    // return this.matchRepository.findByCriteria(filters)
    return matches.map((match) => matchDetailsDtoDomainsToDto(match))
  }
}
