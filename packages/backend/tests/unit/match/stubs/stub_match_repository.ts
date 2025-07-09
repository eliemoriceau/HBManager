import Match from '#match/domain/entity/match'
import { MatchRepository, MatchSearchCriteria } from '#match/domain/repository/match_repository'

export class StubMatchRepository implements MatchRepository {
  constructor(private matches: Match[] = []) {}

  async findAll(): Promise<Match[]> {
    return [...this.matches]
  }

  async findByCriteria(criteria: MatchSearchCriteria): Promise<Match[]> {
    return this.matches.filter((m) => {
      if (criteria.startDate && m.date.toMillis() < criteria.startDate.getTime()) {
        return false
      }
      if (criteria.endDate && m.date.toMillis() > criteria.endDate.getTime()) {
        return false
      }
      if (
        criteria.equipeId &&
        ![m.equipeDomicile.toString(), m.equipeExterieur.toString()].includes(criteria.equipeId)
      ) {
        return false
      }
      if (criteria.officielId && !m.officiels.some((o) => o.toString() === criteria.officielId)) {
        return false
      }
      return true
    })
  }

  async findById(id: string): Promise<Match | null> {
    return this.matches.find((m) => m.id.toString() === id) ?? null
  }

  async upsert(match: Match): Promise<void> {
    const index = this.matches.findIndex((m) => m.codeRenc === match.codeRenc)
    if (index >= 0) {
      this.matches[index] = match
    } else {
      this.matches.push(match)
    }
  }

  async findExistingCodes(): Promise<Set<string>> {
    return new Set(this.matches.map((m) => m.codeRenc))
  }

  async upsertBatch(matches: Match[]): Promise<void> {
    for (const match of matches) {
      await this.upsert(match)
    }
  }
}
