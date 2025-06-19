import Match from '#match/domain/match'
import { MatchRepository } from '#match/secondary/ports/match_repository'
import { GetMatchesFilter, GetMatchesUseCase } from '#match/use_case/get_matches_use_case'
import { inject } from '@adonisjs/core'

@inject()
export class GetMatches extends GetMatchesUseCase {
  constructor(private readonly matchRepository: MatchRepository) {
    super()
  }

  async execute(filters: GetMatchesFilter = {}): Promise<Match[]> {
    if (Object.keys(filters).length === 0) {
      return this.matchRepository.findAll()
    }
    return this.matchRepository.findByCriteria(filters)
  }
}
