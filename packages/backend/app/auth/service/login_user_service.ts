import { AuthenticationResult, LoginUserUseCase } from '#auth/use_case/login_user_use_case'
import { UserRepository } from '#auth/secondary/ports/user_repository'
import TokenProvider, { TokenPayload } from '#auth/secondary/ports/token_provider'
import { InvalidCredentialsException } from '#auth/exceptions/invalid_credentials_exception'

export class LoginUserService implements LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenProvider: TokenProvider
  ) {}

  async execute(email: string, plainPassword: string): Promise<AuthenticationResult> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsException()
    }

    if (user.password.toString() !== plainPassword) {
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
