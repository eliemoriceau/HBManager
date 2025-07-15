import { RegisterUserUseCase } from '#auth/use_case/register_user_use_case'
import { UserRepository } from '#auth/secondary/ports/user_repository'
import { PasswordHasher } from '#auth/secondary/ports/password_hashing_interface'
import User from '#auth/domain/user'
import { EmailAlreadyExistsException } from '#auth/exceptions/email_already_exists_exception'
import { Role } from '#auth/domain/role'
import { inject } from '@adonisjs/core'
import { AuthenticationResult } from '#auth/use_case/login_user_use_case'
import TokenProvider, { TokenPayload } from '#auth/secondary/ports/token_provider'

@inject()
export class RegisterUserService extends RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenProvider: TokenProvider
  ) {
    super()
  }

  async execute(email: string, plainPassword: string): Promise<AuthenticationResult> {
    if (await this.userRepository.exists(email)) {
      throw new EmailAlreadyExistsException(email)
    }

    const hashedPassword = await this.passwordHasher.hash(plainPassword)
    const user = User.create({ email: email, password: hashedPassword, roles: [Role.GUEST] })

    await this.userRepository.save(user)

    const payload: TokenPayload = {
      sub: user.email.toString(),
      roles: user.roles,
    }

    const token = this.tokenProvider.generate(payload)

    return {
      token,
      user: {
        id: user.id.toString(),
        email: user.email.toString(),
        roles: user.roles,
      },
    }
  }
}
