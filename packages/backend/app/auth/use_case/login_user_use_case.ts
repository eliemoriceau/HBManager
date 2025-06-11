import { Role } from '#auth/domain/role'

export interface AuthenticationResult {
  token: string
  roles: Role[]
}

export interface LoginUserUseCase {
  execute(email: string, plainPassword: string): Promise<AuthenticationResult>
}
