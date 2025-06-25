import Team from '#team/domain/team'

export abstract class ListTeamsUseCase {
  abstract execute(): Promise<Team[]>
}
