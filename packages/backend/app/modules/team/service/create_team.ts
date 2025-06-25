import { inject } from '@adonisjs/core'
import Team from '#team/domain/team'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { CreateTeamUseCase } from '#team/use_case/create_team_use_case'

@inject()
export class CreateTeam extends CreateTeamUseCase {
  constructor(private readonly repository: TeamRepository) {
    super()
  }

  async execute(payload: { nom: string; codeFederal: string; logo?: string }): Promise<Team> {
    const existing = await this.repository.findByName(payload.nom)
    if (existing.length > 0) {
      throw new InvalidTeamException("Nom d'équipe déjà utilisé")
    }
    const team = Team.create(payload)
    await this.repository.create(team)
    return team
  }
}
