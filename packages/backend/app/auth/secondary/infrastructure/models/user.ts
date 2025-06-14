import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Role } from '#auth/domain/role'

export class UserModel extends BaseModel {
  static table = 'users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column({
    prepare: (value: Role[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare roles: Role[]
}
