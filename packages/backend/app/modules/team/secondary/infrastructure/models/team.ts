import { BaseModel, column, dateTimeColumn } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export class TeamModel extends BaseModel {
  static table = 'teams'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nom: string

  @column({ columnName: 'code_federal' })
  declare codeFederal: string

  @column()
  declare logo?: string | null

  @dateTimeColumn({ autoCreate: true })
  declare createdAt: DateTime

  @dateTimeColumn({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
