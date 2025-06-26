import Match from '#match/domain/match'
import Team from '#team/domain/team'

export interface MatchDetails {
  match: Match
  equipeDomicile: Team
  equipeExterieur: Team
}

export abstract class GetMatchUseCase {
  abstract execute(id: string): Promise<MatchDetails>
}
