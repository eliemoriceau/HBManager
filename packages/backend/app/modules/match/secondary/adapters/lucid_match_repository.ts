import Match from '#match/domain/match'
import { StatutMatch } from '#match/domain/statut_match'
import { MatchRepository, MatchSearchCriteria } from '#match/secondary/ports/match_repository'
import { MatchModel } from '#match/secondary/infrastructure/models/match'
import { DatabaseConnectionException } from '#exceptions/database_connection_exception'
import logger from '@adonisjs/core/services/logger'

export class LucidMatchRepository implements MatchRepository {
  private toDomain(model: MatchModel): Match {
    return Match.create({
      id: model.id,
      date: model.date,
      heure: model.heure,
      equipeDomicileId: model.equipeDomicileId,
      equipeExterieurId: model.equipeExterieurId,
      officiels: model.officiels,
      statut: model.statut as StatutMatch,
      codeRenc: model.codeRenc,
    })
  }

  async findAll(): Promise<Match[]> {
    try {
      const models = await MatchModel.all()
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

  async upsert(match: Match): Promise<void> {
    try {
      const existing = await MatchModel.query().where('code_renc', match.codeRenc).first()

      if (existing) {
        existing.officiels = match.officiels.map((o) => o.toString())
        existing.statut = match.statut
        await existing.save()
        return
      }

      const values = {
        id: match.id.toString(),
        date: match.date,
        heure: match.heure,
        equipeDomicileId: match.equipeDomicileId.toString(),
        equipeExterieurId: match.equipeExterieurId.toString(),
        officiels: match.officiels.map((o) => o.toString()),
        statut: match.statut,
        codeRenc: match.codeRenc,
      }
      logger.debug(values)
      await MatchModel.create(values)
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }
}
