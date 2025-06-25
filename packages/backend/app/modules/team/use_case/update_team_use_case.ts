import Team from '#team/domain/team'

export abstract class UpdateTeamUseCase {
  abstract execute(
    id: string,
    payload: { nom: string; codeFederal: string; logo?: string }
  ): Promise<Team>
}
