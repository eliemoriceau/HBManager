import { BaseModel, beforeSave, column } from '@adonisjs/lucid/orm'
import { Role } from '#auth/domain/role'
import hash from '@adonisjs/core/services/hash'
import { inject } from '@adonisjs/core'

@inject()
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

  @beforeSave()
  static async hashPassword<T extends typeof UserModel>(this: T, user: InstanceType<T>) {
    if (!hash.isValidHash(user.password)) {
      ;(user as any).password = await hash.make((user as any).password)
    }
  }
}
