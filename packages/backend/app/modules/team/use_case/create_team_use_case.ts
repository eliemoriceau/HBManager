import { TeamExisteResult } from '#team/use_case/team_by_filter_use_case'

export abstract class CreateTeamUseCase {
  abstract execute(payload: {
    nom: string
    codeFederal?: string
    logo?: string
  }): Promise<TeamExisteResult>
}
