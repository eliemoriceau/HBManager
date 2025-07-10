import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Assignment extends BaseModel {
  public static table = 'assignments'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'match_id' })
  declare matchId: string

  @column({ columnName: 'officiel_id' })
  declare officielId: string

  @column()
  declare type: string

  @column()
  declare status: string

  @column()
  declare source: string

  @column.dateTime({ columnName: 'date_assignment' })
  declare dateAssignment: DateTime

  @column()
  declare notes: string | null

  @column({ columnName: 'assigned_by' })
  declare assignedBy: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
