import { inject } from '@adonisjs/core'
import Team from '#team/domain/team'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { UpdateTeamUseCase } from '#team/use_case/update_team_use_case'

@inject()
export class UpdateTeam extends UpdateTeamUseCase {
  constructor(private readonly repository: TeamRepository) {
    super()
  }

  async execute(
    id: string,
    payload: { nom: string; codeFederal: string; logo?: string }
  ): Promise<Team> {
    const team = await this.repository.findById(id)
    if (!team) {
      throw new InvalidTeamException('Equipe introuvable')
    }
    const byName = await this.repository.findByName(payload.nom)
    if (byName.some((t) => t.id.toString() !== id)) {
      throw new InvalidTeamException("Nom d'équipe déjà utilisé")
    }
    const updated = Team.create({ id, ...payload })
    await this.repository.update(updated)
    return updated
  }
}
