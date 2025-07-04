import { RegisterUserUseCase } from '#auth/use_case/register_user_use_case'
import { UserRepository } from '#auth/secondary/ports/user_repository'
import { PasswordHasher } from '#auth/secondary/ports/password_hashing_interface'
import User from '#auth/domain/user'
import { EmailAlreadyExistsException } from '#auth/exceptions/email_already_exists_exception'
import { Role } from '#auth/domain/role'
import { inject } from '@adonisjs/core'

@inject()
export class RegisterUserService extends RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {
    super()
  }

  async execute(email: string, plainPassword: string): Promise<User> {
    if (await this.userRepository.exists(email)) {
      throw new EmailAlreadyExistsException(email)
    }

    const hashedPassword = await this.passwordHasher.hash(plainPassword)
    const user = User.create({ email: email, password: hashedPassword, roles: [Role.GUEST] })

    await this.userRepository.save(user)
    return user
  }
}
