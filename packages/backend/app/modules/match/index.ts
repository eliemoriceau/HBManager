import { GetMatchesUseCase } from '#match/use_case/get_matches_use_case'
import { GetMatchUseCase } from '#match/use_case/get_match_use_case'
import { GetMatches } from '#match/service/get_matches'
import { GetMatch } from '#match/service/get_match'
import { MatchRepository } from '#match/secondary/ports/match_repository'
import { LucidMatchRepository } from '#match/secondary/adapters/lucid_match_repository'

export const matchProviderMap = [
  [GetMatchesUseCase, GetMatches],
  [GetMatchUseCase, GetMatch],
  [MatchRepository, LucidMatchRepository],
]
