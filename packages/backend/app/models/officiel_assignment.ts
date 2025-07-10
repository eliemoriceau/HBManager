import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OfficielAssignment extends BaseModel {
  public static table = 'officiel_assignments'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'match_id' })
  declare matchId: string

  @column({
    prepare: (value: any[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare assignments: any[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
