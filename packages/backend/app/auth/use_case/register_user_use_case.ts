import { AuthenticationResult } from '#auth/use_case/login_user_use_case'

export abstract class RegisterUserUseCase {
  abstract execute(email: string, plainPassword: string): Promise<AuthenticationResult>
}
