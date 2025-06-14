import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Role } from '#auth/domain/role'

export class UserModel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare roles: Role[]
}
