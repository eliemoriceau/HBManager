import Match from '#match/domain/match'

export interface GetMatchesFilter {
  startDate?: Date
  endDate?: Date
  equipeId?: string
  officielId?: string
}

export abstract class GetMatchesUseCase {
  abstract execute(filters?: GetMatchesFilter): Promise<Match[]>
}
