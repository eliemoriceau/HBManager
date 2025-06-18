import User from '#auth/domain/user'

export abstract class RegisterUserUseCase {
  abstract execute(email: string, plainPassword: string): Promise<User>
}
