import { GetMatchesUseCase } from '#match/use_case/get_matches_use_case'
import { GetMatches } from '#match/service/get_matches'
import { MatchRepository } from '#match/secondary/ports/match_repository'
import { LucidMatchRepository } from '#match/secondary/adapters/lucid_match_repository'

export const matchProviderMap = [
  [GetMatchesUseCase, GetMatches],
  [MatchRepository, LucidMatchRepository],
]
