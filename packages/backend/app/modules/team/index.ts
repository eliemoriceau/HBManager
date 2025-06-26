import { CreateTeamUseCase } from '#team/use_case/create_team_use_case'
import { UpdateTeamUseCase } from '#team/use_case/update_team_use_case'
import { DeleteTeamUseCase } from '#team/use_case/delete_team_use_case'
import { ListTeamsUseCase } from '#team/use_case/list_teams_use_case'
import { CreateTeam } from '#team/service/create_team'
import { UpdateTeam } from '#team/service/update_team'
import { DeleteTeam } from '#team/service/delete_team'
import { ListTeams } from '#team/service/list_teams'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { LucidTeamRepository } from '#team/secondary/adapters/lucid_team_repository'

export const teamProviderMap = [
  [CreateTeamUseCase, CreateTeam],
  [UpdateTeamUseCase, UpdateTeam],
  [DeleteTeamUseCase, DeleteTeam],
  [ListTeamsUseCase, ListTeams],
  [TeamRepository, LucidTeamRepository],
]
