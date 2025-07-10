import Team from '#team/domain/team'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { TeamExisteFilter } from '#team/use_case/team_by_filter_use_case'

export class StubTeamRepository extends TeamRepository {
  constructor(private teams: Team[] = []) {
    super()
  }

  async findAll(): Promise<Team[]> {
    return [...this.teams]
  }

  async findById(id: string): Promise<Team | null> {
    return this.teams.find((t) => t.id.toString() === id) ?? null
  }

  async findByName(name: string): Promise<Team[]> {
    const lower = name.toLowerCase()
    return this.teams.filter((t) => t.nom.toString().toLowerCase() === lower)
  }

  async create(team: Team): Promise<void> {
    this.teams.push(team)
  }

  async update(team: Team): Promise<void> {
    const index = this.teams.findIndex((t) => t.id.toString() === team.id.toString())
    if (index >= 0) {
      this.teams[index] = team
    } else {
      this.teams.push(team)
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.teams.findIndex((t) => t.id.toString() === id)
    if (index >= 0) {
      this.teams.splice(index, 1)
    }
  }

  async findByFilter(filter: TeamExisteFilter): Promise<Team[]> {
    return this.teams.filter((team) => {
      if (filter.nom && !team.nom.toString().toLowerCase().includes(filter.nom.toLowerCase())) {
        return false
      }
      if (filter.codeFederal && team.codeFederal !== filter.codeFederal) {
        return false
      }
      return true
    })
  }

  async findTeamsByNames(names: string[]): Promise<Map<string, Team>> {
    const result = new Map<string, Team>()
    const lowerNames = names.map((name) => name.toLowerCase())

    for (const team of this.teams) {
      const teamName = team.nom.toString().toLowerCase()
      if (lowerNames.includes(teamName)) {
        result.set(teamName, team)
      }
    }

    return result
  }

  async createBatch(teams: Team[]): Promise<void> {
    this.teams.push(...teams)
  }
}
