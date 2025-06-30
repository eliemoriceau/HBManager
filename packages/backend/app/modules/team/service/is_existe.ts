import TeamExisteUseCase, {
  TeamExisteFilter,
  TeamExisteResult,
} from '#team/use_case/team_by_filter_use_case'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class IsExiste extends TeamExisteUseCase {
  constructor(private readonly repository: TeamRepository) {
    super()
  }

  async execute(filter: TeamExisteFilter): Promise<TeamExisteResult[]> {
    const teams = await this.repository.findByFilter(filter)
    logger.debug({ filter, teams })
    return teams.map((team) => ({
      id: team.id.toString(),
      nom: team.nom.toString(),
      codeFederal: team.codeFederal?.toString(),
    }))
  }
}
