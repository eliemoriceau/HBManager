import Team from '#team/domain/team'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { TeamModel } from '#team/secondary/infrastructure/models/team'
import { DatabaseConnectionException } from '#exceptions/database_connection_exception'
import { TeamExisteFilter } from '#team/use_case/team_by_filter_use_case'
import { Identifier } from '#shared/domaine/identifier'

export class LucidTeamRepository extends TeamRepository {
  private toDomain(model: TeamModel): Team {
    return Team.create({
      id: model.id,
      nom: model.nom,
      codeFederal: model.codeFederal,
      logo: model.logo ?? undefined,
    })
  }

  async findAll(): Promise<Team[]> {
    try {
      const models = await TeamModel.all()
      return models.map((m) => this.toDomain(m))
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async findById(id: string): Promise<Team | null> {
    try {
      const model = await TeamModel.find(id)
      return model ? this.toDomain(model) : null
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async findByName(name: string): Promise<Team[]> {
    try {
      const models = await TeamModel.query().whereRaw('LOWER(nom) = ?', [name.toLowerCase()])
      return models.map((m) => this.toDomain(m))
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async findByFilter(filter: TeamExisteFilter): Promise<Team[]> {
    try {
      const query = TeamModel.query()
      if (filter.nom) {
        query.whereRaw('LOWER(nom) = ?', [filter.nom.toLowerCase()])
      }
      if (filter.id) {
        query.whereRaw('LOWER(id) = ?', [filter.id.toLowerCase()])
      }
      if (filter.codeFederal) {
        query.whereRaw('LOWER(codeFederal) = ?', [filter.codeFederal.toLowerCase()])
      }
      const result = await query.exec()

      return result.map((team) => this.toDomain(team))
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async create(team: Team): Promise<void> {
    try {
      // Générer un code fédéral unique si vide ou null
      const codeFederal =
        team.codeFederal?.toString() || `gen_${Identifier.generate().toString().substring(0, 8)}`

      await TeamModel.create({
        id: team.id.toString(),
        nom: team.nom.toString(),
        codeFederal,
        logo: team.logo ?? null,
      })
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async update(team: Team): Promise<void> {
    const trx = await TeamModel.transaction()
    try {
      const model = await TeamModel.findOrFail(team.id.toString(), { client: trx })
      model.nom = team.nom.toString()
      model.codeFederal =
        team.codeFederal?.toString() || `gen_${Identifier.generate().toString().substring(0, 8)}`
      model.logo = team.logo ?? null
      await model.save()
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await TeamModel.query().where('id', id).delete()
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async findTeamsByNames(names: string[]): Promise<Map<string, Team>> {
    try {
      const lowerNames = names.map((name) => name.toLowerCase())
      const models = await TeamModel.query().whereRaw('LOWER(nom) IN (?)', [lowerNames])
      const result = new Map<string, Team>()

      for (const model of models) {
        const teamName = model.nom.toLowerCase()
        result.set(teamName, this.toDomain(model))
      }

      return result
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async createBatch(teams: Team[]): Promise<void> {
    if (teams.length === 0) return

    const trx = await TeamModel.transaction()
    try {
      const data = teams.map((team) => {
        // Générer un code fédéral unique si vide ou null
        const codeFederal =
          team.codeFederal?.toString() || `gen_${Identifier.generate().toString().substring(0, 8)}`

        return {
          id: team.id.toString(),
          nom: team.nom.toString(),
          codeFederal,
          logo: team.logo ?? null,
        }
      })

      await TeamModel.createMany(data, { client: trx })
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }
}
