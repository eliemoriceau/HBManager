import Match from '#match/domain/match'
import { MatchRepository, MatchSearchCriteria } from '#match/secondary/ports/match_repository'

export class StubMatchRepository implements MatchRepository {
  constructor(private matches: Match[] = []) {}

  async search(criteria: MatchSearchCriteria): Promise<Match[]> {
    return this.matches.filter((m) => {
      if (criteria.startDate && m.date.getTime() < criteria.startDate.getTime()) {
        return false
      }
      if (criteria.endDate && m.date.getTime() > criteria.endDate.getTime()) {
        return false
      }
      if (
        criteria.equipeId &&
        ![m.equipeDomicileId.toString(), m.equipeExterieurId.toString()].includes(criteria.equipeId)
      ) {
        return false
      }
      if (criteria.officielId && !m.officiels.some((o) => o.toString() === criteria.officielId)) {
        return false
      }
      return true
    })
  }
}
