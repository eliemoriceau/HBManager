import Team from '#team/domain/team'
import { TeamRepository } from '#team/secondary/ports/team_repository'
import { TeamModel } from '#team/secondary/infrastructure/models/team'
import { DatabaseConnectionException } from '#exceptions/database_connection_exception'

export class LucidTeamRepository implements TeamRepository {
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

  async create(team: Team): Promise<void> {
    try {
      await TeamModel.create({
        id: team.id.toString(),
        nom: team.nom.toString(),
        codeFederal: team.codeFederal.toString(),
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
      model.codeFederal = team.codeFederal.toString()
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
}
