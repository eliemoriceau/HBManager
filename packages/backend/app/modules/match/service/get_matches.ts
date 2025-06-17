import Match from '#match/domain/match'
import { MatchRepository } from '#match/secondary/ports/match_repository'
import { GetMatchesFilter, GetMatchesUseCase } from '#match/use_case/get_matches_use_case'

export class GetMatches implements GetMatchesUseCase {
  constructor(private readonly matchRepository: MatchRepository) {}

  async execute(filters: GetMatchesFilter = {}): Promise<Match[]> {
    return this.matchRepository.search(filters)
  }
}
