import { test } from '@japa/runner'
import { StubUserRepository } from '#tests/unit/auth/stubs/stub_user_repository'
import { StubTokenProvider } from '#tests/unit/auth/stubs/stub_token_provider'
import { LoginUserService } from '#auth/service/login_user_service'
import { StubPasswordHasher } from '#tests/unit/auth/stubs/stub_password_hasher'
import { TokenPayload } from '#auth/secondary/ports/token_provider'
import { Role } from '#auth/domain/role'
import User from '#auth/domain/user'

test.group('LoginUserService', (group) => {
  let userRepository: StubUserRepository
  let tokenProvider: StubTokenProvider
  let passwordHasher: StubPasswordHasher
  let loginService: LoginUserService

  group.each.setup(() => {
    // Arrangement par défaut pour chaque test
    const stubPayload: TokenPayload = {
      sub: 'test@example.com',
      roles: [Role.ADMIN],
    }
    const stubToken = 'test-jwt-token'

    userRepository = new StubUserRepository([])
    tokenProvider = new StubTokenProvider(stubPayload, stubToken)
    passwordHasher = new StubPasswordHasher()
    loginService = new LoginUserService(userRepository, tokenProvider, passwordHasher)
  })

  test('devrait retourner un token et les rôles pour des identifiants valides', async ({
    assert,
  }) => {
    // Arrange
    const testUser = User.create({
      email: 'test@example.com',
      password: await passwordHasher.hash('password123'),
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])
    loginService = new LoginUserService(userRepository, tokenProvider, passwordHasher)

    // Act
    const result = await loginService.execute('test@example.com', 'password123')

    // Assert
    assert.equal(result.token, 'test-jwt-token')
    assert.deepEqual(result.roles, [Role.ADMIN])
  })

  test('devrait lever InvalidCredentialsException pour un email inconnu', async ({ assert }) => {
    // Arrange
    const testUser = User.create({
      email: 'test@example.com',
      password: await passwordHasher.hash('password123'),
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])
    loginService = new LoginUserService(userRepository, tokenProvider, passwordHasher)

    // Act & Assert
    assert.rejects(async () => await loginService.execute('unknown@example.com', 'password123'))
  })

  test('devrait lever InvalidCredentialsException pour un mot de passe incorrect', async ({
    assert,
  }) => {
    // Arrange
    const testUser = User.create({
      email: 'test@example.com',
      password: await passwordHasher.hash('correctPassword'),
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])
    loginService = new LoginUserService(userRepository, tokenProvider, passwordHasher)

    // Act & Assert
    assert.rejects(async () => await loginService.execute('test@example.com', 'wrongPassword'))
  })

  test('devrait générer un token avec les informations correctes', async ({ assert }) => {
    // Arrange
    const testUser = User.create({
      email: 'test@example.com',
      password: await passwordHasher.hash('password123'),
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])

    const expectedPayload: TokenPayload = {
      sub: 'test@example.com',
      roles: [Role.ADMIN],
    }
    tokenProvider = new StubTokenProvider(expectedPayload, 'custom-token')
    loginService = new LoginUserService(userRepository, tokenProvider, passwordHasher)

    // Act
    const result = await loginService.execute('test@example.com', 'password123')

    // Assert
    assert.equal(result.token, 'custom-token')
    assert.deepEqual(tokenProvider.verify(result.token), expectedPayload)
  })
})
