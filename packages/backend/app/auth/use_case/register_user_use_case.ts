import User from '#auth/domain/user'

export interface RegisterUserUseCase {
  execute(email: string, plainPassword: string): Promise<User>
}
