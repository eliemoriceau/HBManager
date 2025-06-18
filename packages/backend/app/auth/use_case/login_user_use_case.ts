import { Role } from '#auth/domain/role'

export interface AuthenticationResult {
  token: string
  roles: Role[]
}

export abstract class LoginUserUseCase {
  abstract execute(email: string, plainPassword: string): Promise<AuthenticationResult>
}
