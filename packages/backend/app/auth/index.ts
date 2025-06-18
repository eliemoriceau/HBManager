import { LoginUserUseCase } from '#auth/use_case/login_user_use_case'
import { LoginUserUseCaseImpl } from '#auth/service/login_user_service'
import { RegisterUserUseCase } from '#auth/use_case/register_user_use_case'
import { RegisterUserService } from '#auth/service/register_user_service_implementation'
import { UserRepository } from '#auth/secondary/ports/user_repository'
import { DatabaseUserRepository } from '#auth/secondary/adapters/database_user_repository'
import TokenProvider from '#auth/secondary/ports/token_provider'
import { JwtTokenProvider } from '#auth/secondary/adapters/jwt_token_provider'
import { PasswordHasher } from '#auth/secondary/ports/password_hashing_interface'
import { HashPasswordHasher } from '#auth/secondary/adapters/hash_password_hasher'

export const authProviderMap = [
  [LoginUserUseCase, LoginUserUseCaseImpl],
  [RegisterUserUseCase, RegisterUserService],
  [UserRepository, DatabaseUserRepository],
  [TokenProvider, JwtTokenProvider],
  [PasswordHasher, HashPasswordHasher],
]
