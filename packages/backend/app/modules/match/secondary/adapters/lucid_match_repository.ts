import Match from '#match/domain/match'
import { StatutMatch } from '#match/domain/statut_match'
import { MatchRepository, MatchSearchCriteria } from '#match/secondary/ports/match_repository'
import { MatchModel } from '#match/secondary/infrastructure/models/match'

export class LucidMatchRepository implements MatchRepository {
  private toDomain(model: MatchModel): Match {
    return Match.create({
      id: model.id,
      date: model.date.toJSDate(),
      heure: model.heure,
      equipeDomicileId: model.equipeDomicileId,
      equipeExterieurId: model.equipeExterieurId,
      officiels: model.officiels,
      statut: model.statut as StatutMatch,
    })
  }

  async findAll(): Promise<Match[]> {
    const models = await MatchModel.all()
    return models.map((m) => this.toDomain(m))
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
          .where('equipe_domicile_id', criteria.equipeId)
          .orWhere('equipe_exterieur_id', criteria.equipeId)
      })
    }
    if (criteria.officielId) {
      query.whereRaw('officiels LIKE ?', [`%${criteria.officielId}%`])
    }
    const models = await query
    return models.map((m) => this.toDomain(m))
  }
}
