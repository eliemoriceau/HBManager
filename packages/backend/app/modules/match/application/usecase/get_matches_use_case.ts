import { MatchDetailsDto } from '#match/application/dto/match_details_dto'

export interface GetMatchesFilter {
  startDate?: Date
  endDate?: Date
  equipeId?: string
  officielId?: string
}

export abstract class GetMatchesUseCase {
  abstract execute(filters?: GetMatchesFilter): Promise<MatchDetailsDto[]>
}
