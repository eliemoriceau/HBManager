import Match from '#match/domain/entity/match'
import { StatutMatch } from '#match/domain/entity/statut_match'
import { MatchRepository, MatchSearchCriteria } from '#match/domain/repository/match_repository'
import { MatchModel } from '#match/infrastructure/models/match'
import { DatabaseConnectionException } from '#exceptions/database_connection_exception'
import Team from '#team/domain/team'
import TeamExisteUseCase, { TeamExisteResult } from '#team/use_case/team_by_filter_use_case'
import { inject } from '@adonisjs/core'
import { CreateTeamUseCase } from '#team/use_case/create_team_use_case'
import logger from '@adonisjs/core/services/logger'

@inject()
export class LucidMatchRepository implements MatchRepository {
  constructor(
    private readonly teamExisteUseCase: TeamExisteUseCase,
    private readonly createTeamUseCase: CreateTeamUseCase
  ) {}

  private toDomain(model: MatchModel): Match {
    return Match.create({
      id: model.id,
      date: model.date,
      heure: model.heure,
      equipeDomicile: Team.create({
        id: model.equipeDomicile.id.toString(),
        nom: model.equipeDomicile.nom,
        codeFederal: model.equipeDomicile.codeFederal?.toString(),
      }),
      equipeExterieur: Team.create({
        id: model.equipeExterieur.id.toString(),
        nom: model.equipeExterieur.nom,
        codeFederal: model.equipeExterieur.codeFederal?.toString(),
      }),
      officiels: model.officiels,
      statut: model.statut as StatutMatch,
      codeRenc: model.codeRenc,
    })
  }

  async findAll(): Promise<Match[]> {
    try {
      const models = await MatchModel.query().preload('equipeDomicile').preload('equipeExterieur')
      return models.map((m) => this.toDomain(m))
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async findByCriteria(criteria: MatchSearchCriteria): Promise<Match[]> {
    const query = MatchModel.query()
    if (criteria.startDate) {
      query.where('date', '>=', criteria.startDate.toISOString().slice(0, 10))
    }
    if (criteria.endDate) {
      query.where('date', '<=', criteria.endDate.toISOString().slice(0, 10))
    }
    if (criteria.equipeId) {
      query.where((builder) => {
        builder
          .where('equipe_domicile_id', criteria.equipeId!)
          .orWhere('equipe_exterieur_id', criteria.equipeId!)
      })
    }
    if (criteria.officielId) {
      query.whereRaw('officiels LIKE ?', [`%${criteria.officielId}%`])
    }
    try {
      const models = await query
      return models.map((m) => this.toDomain(m))
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async findById(id: string): Promise<Match | null> {
    try {
      const model = await MatchModel.find(id)
      return model ? this.toDomain(model) : null
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async upsert(match: Match): Promise<void> {
    try {
      const existing = await MatchModel.query().where('code_renc', match.codeRenc).first()
      logger.debug({ match, existing, domicileType: match.equipeDomicile.nom.toString() })
      if (existing) {
        existing.officiels = match.officiels.map((o) => o.toString())
        existing.statut = match.statut
        await existing.save()
        return
      }

      let equipeDomicile: TeamExisteResult[] = await this.teamExisteUseCase.execute({
        nom: match.equipeDomicile.nom.toString(),
      })
      logger.debug({ equipeDomicile })

      if (equipeDomicile.length === 0) {
        equipeDomicile = [
          await this.createTeamUseCase.execute({
            nom: match.equipeDomicile.nom.toString(),
          }),
        ]
      }
      logger.debug({ equipeDomicile })
      if (equipeDomicile.length !== 1) {
        throw new Error('erreur avec equipe domicile')
      }

      let equipeExterieur = await this.teamExisteUseCase.execute({
        nom: match.equipeExterieur.nom.toString(),
      })

      if (equipeExterieur.length === 0) {
        equipeExterieur = [
          await this.createTeamUseCase.execute({ nom: match.equipeExterieur.nom.toString() }),
        ]
      }

      if (equipeExterieur.length !== 1) {
        throw new Error('erreur avec equipe exterieur')
      }
      logger.debug({ equipeExterieur })
      const values = {
        id: match.id.toString(),
        date: match.date,
        heure: match.heure,
        equipe_domicile: equipeDomicile.at(0)?.id,
        equipe_exterieur: equipeExterieur.at(0)?.id,
        officiels: match.officiels.map((o) => o.toString()),
        statut: match.statut,
        codeRenc: match.codeRenc,
      }
      logger.debug({ values })
      const matchRes = await MatchModel.create(values)
      logger.debug({ res: matchRes })
      return
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      logger.error(error)
      throw error
    }
  }
}
