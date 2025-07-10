import { BaseModel, belongsTo, column, dateTimeColumn } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { StatutMatch } from '#match/domain/entity/statut_match'
import { TeamModel } from '#team/secondary/infrastructure/models/team'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

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

  @belongsTo(() => TeamModel, {
    foreignKey: 'equipeDomicileId',
    localKey: 'id',
  })
  declare equipeDomicile: BelongsTo<typeof TeamModel>

  @column({ columnName: 'equipe_exterieur_id' })
  declare equipeExterieurId: string

  @belongsTo(() => TeamModel, { foreignKey: 'equipeExterieurId', localKey: 'id' })
  declare equipeExterieur: BelongsTo<typeof TeamModel>

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

  @column({ columnName: 'code_renc' })
  declare codeRenc: string

  @dateTimeColumn({ autoCreate: true })
  declare createdAt: DateTime

  @dateTimeColumn({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
