import { AuthenticationResult, LoginUserUseCase } from '#auth/use_case/login_user_use_case'
import { UserRepository } from '#auth/secondary/ports/user_repository'
import TokenProvider, { TokenPayload } from '#auth/secondary/ports/token_provider'
import { PasswordHasher } from '#auth/secondary/ports/password_hashing_interface'
import { InvalidCredentialsException } from '#auth/exceptions/invalid_credentials_exception'
import { inject } from '@adonisjs/core'

@inject()
export class LoginUserUseCaseImpl extends LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenProvider: TokenProvider,
    private readonly passwordHasher: PasswordHasher
  ) {
    super()
  }

  async execute(email: string, plainPassword: string): Promise<AuthenticationResult> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsException()
    }

    const isValid = await this.passwordHasher.verify(plainPassword, user.password.toString())
    if (!isValid) {
      throw new InvalidCredentialsException()
    }

    const payload: TokenPayload = {
      sub: user.email.toString(),
      roles: user.roles,
    }

    const token = this.tokenProvider.generate(payload)

    return {
      token,
      roles: user.roles,
    }
  }
}
