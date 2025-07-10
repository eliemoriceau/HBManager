import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Officiel extends BaseModel {
  public static table = 'officiels'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nom: string

  @column()
  declare prenom: string

  @column()
  declare email: string

  @column()
  declare telephone: string | null

  @column({ columnName: 'club_id' })
  declare clubId: string | null

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare qualifications: string[]

  @column({
    prepare: (value: Record<string, boolean>) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare disponibilites: Record<string, boolean>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
