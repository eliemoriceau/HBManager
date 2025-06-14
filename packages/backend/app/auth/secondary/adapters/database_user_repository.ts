import { UserRepository } from '#auth/secondary/ports/user_repository'
import User from '#auth/domain/user'
import { UserModel } from '#auth/secondary/infrastructure/models/user'

export class DatabaseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const userModel = await UserModel.findBy({ email })
    if (!userModel) {
      return null
    }
    return User.create({
      id: userModel.id,
      email: userModel.email,
      password: userModel.password,
      roles: userModel.roles,
    })
  }

  async save(user: User): Promise<void> {
    const userModel = await UserModel.create({
      id: user.id.toString(),
      email: user.email.toString(),
      roles: user.roles,
      password: user.password.toString(),
    })
    await userModel.save()
  }

  async exists(email: string): Promise<boolean> {
    const userModel = await UserModel.findBy({ email })
    return !userModel
  }
}
