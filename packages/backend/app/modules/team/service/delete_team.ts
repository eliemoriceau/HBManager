import { inject } from '@adonisjs/core'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { DeleteTeamUseCase } from '#team/use_case/delete_team_use_case'
import { MatchRepository } from '#match/secondary/ports/match_repository'

@inject()
export class DeleteTeam extends DeleteTeamUseCase {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly matchRepository: MatchRepository
  ) {
    super()
  }

  async execute(id: string): Promise<void> {
    const team = await this.teamRepository.findById(id)
    if (!team) {
      throw new InvalidTeamException('Equipe introuvable')
    }
    const matches = await this.matchRepository.findByCriteria({ equipeId: id })
    if (matches.length > 0) {
      throw new InvalidTeamException('Equipe associ\u00e9e \u00e0 un match')
    }
    await this.teamRepository.delete(id)
  }
}
