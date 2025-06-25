import { inject } from '@adonisjs/core'
import Team from '#team/domain/team'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { ListTeamsUseCase } from '#team/use_case/list_teams_use_case'

@inject()
export class ListTeams extends ListTeamsUseCase {
  constructor(private readonly repository: TeamRepository) {
    super()
  }

  async execute(): Promise<Team[]> {
    return this.repository.findAll()
  }
}
