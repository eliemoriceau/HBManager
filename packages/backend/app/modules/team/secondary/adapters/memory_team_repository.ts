import Team from '#team/domain/team'
import { TeamRepository } from '#team/secondary/ports/team_repository'

export class MemoryTeamRepository implements TeamRepository {
  constructor(private teams: Team[] = []) {}

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
}
