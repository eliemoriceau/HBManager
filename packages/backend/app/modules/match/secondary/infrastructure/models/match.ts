import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { StatutMatch } from '#match/domain/statut_match'

export class MatchModel extends BaseModel {
  static table = 'matches'

  @column({ isPrimary: true })
  declare id: string

  @column.date()
  declare date: DateTime

  @column()
  declare heure: string

  @column({ columnName: 'equipe_domicile_id' })
  declare equipeDomicileId: string

  @column({ columnName: 'equipe_exterieur_id' })
  declare equipeExterieurId: string

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare officiels: string[]

  @column()
  declare statut: StatutMatch

  @column({ columnName: 'motif_annulation' })
  declare motifAnnulation?: string | null

  @column({ columnName: 'motif_report' })
  declare motifReport?: string | null

  @column({ columnName: 'score_domicile' })
  declare scoreDomicile?: number | null

  @column({ columnName: 'score_exterieur' })
  declare scoreExterieur?: number | null
}
