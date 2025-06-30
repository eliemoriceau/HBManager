import { GetMatchesUseCase } from '#match/application/usecase/get_matches_use_case'
import { GetMatches } from '#match/application/usecase/impl/get_matches'
import { GetMatch } from '#match/application/usecase/impl/get_match'
import { MatchRepository } from '#match/domain/repository/match_repository'
import { LucidMatchRepository } from '#match/infrastructure/repository/lucid_match_repository'
import { GetMatchUseCase } from '#match/application/usecase/get_match_use_case'

export const matchProviderMap = [
  [GetMatchesUseCase, GetMatches],
  [GetMatchUseCase, GetMatch],
  [MatchRepository, LucidMatchRepository],
]
