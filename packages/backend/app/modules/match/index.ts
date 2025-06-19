import { GetMatchesUseCase } from '#match/use_case/get_matches_use_case'
import { GetMatches } from '#match/service/get_matches'

export const matchProviderMap = [[GetMatchesUseCase], [GetMatchesUseCase, GetMatches]]
