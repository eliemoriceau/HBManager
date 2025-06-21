import { UserRepository } from '#auth/secondary/ports/user_repository'
import User from '#auth/domain/user'
import { UserModel } from '#auth/secondary/infrastructure/models/user'
import { EmailAlreadyExistsException } from '#auth/exceptions/email_already_exists_exception'
import { DatabaseConnectionException } from '#exceptions/database_connection_exception'

export class DatabaseUserRepository extends UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const userModel = await UserModel.findBy('email', email)
      if (!userModel) {
        return null
      }
      return User.create({
        id: userModel.id,
        email: userModel.email,
        password: userModel.password,
        roles: userModel.roles,
      })
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }

  async save(user: User): Promise<void> {
    const trx = await UserModel.transaction()
    try {
      await UserModel.create(
        {
          id: user.id.toString(),
          email: user.email.toString(),
          roles: user.roles,
          password: user.password.toString(),
        },
        { client: trx }
      )
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      if (error.code === '23505' || error.code?.startsWith('SQLITE_CONSTRAINT')) {
        throw new EmailAlreadyExistsException(user.email.toString())
      }
      throw error
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const userModel = await UserModel.findBy('email', email)
      return !!userModel
    } catch (error) {
      if (error && ['ECONNREFUSED', 'ENOTFOUND'].includes((error as any).code)) {
        throw new DatabaseConnectionException()
      }
      throw error
    }
  }
}
