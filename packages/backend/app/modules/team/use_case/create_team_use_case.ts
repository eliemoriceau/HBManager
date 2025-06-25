import Team from '#team/domain/team'

export abstract class CreateTeamUseCase {
  abstract execute(payload: { nom: string; codeFederal: string; logo?: string }): Promise<Team>
}
