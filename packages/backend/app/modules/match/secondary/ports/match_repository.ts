import Match from '#match/domain/match'

export interface MatchSearchCriteria {
  startDate?: Date
  endDate?: Date
  equipeId?: string
  officielId?: string
}

export interface MatchRepository {
  search(criteria: MatchSearchCriteria): Promise<Match[]>
}
