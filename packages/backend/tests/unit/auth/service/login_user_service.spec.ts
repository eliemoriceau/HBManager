import { test } from '@japa/runner'
import { StubUserRepository } from '#tests/unit/auth/stubs/stub_user_repository'
import { StubTokenProvider } from '#tests/unit/auth/stubs/stub_token_provider'
import { LoginUserService } from '#auth/service/login_user_service'
import { TokenPayload } from '#auth/secondary/ports/token_provider'
import { Role } from '#auth/domain/role'
import User from '#auth/domain/user'

test.group('LoginUserService', (group) => {
  let userRepository: StubUserRepository
  let tokenProvider: StubTokenProvider
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
    loginService = new LoginUserService(userRepository, tokenProvider)
  })

  test('devrait retourner un token et les rôles pour des identifiants valides', async ({
    assert,
  }) => {
    // Arrange
    const testUser = User.create({
      email: 'test@example.com',
      password: 'password123',
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])
    loginService = new LoginUserService(userRepository, tokenProvider)

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
      password: 'password123',
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])
    loginService = new LoginUserService(userRepository, tokenProvider)

    // Act & Assert
    assert.rejects(async () => await loginService.execute('unknown@example.com', 'password123'))
  })

  test('devrait lever InvalidCredentialsException pour un mot de passe incorrect', async ({
    assert,
  }) => {
    // Arrange
    const testUser = User.create({
      email: 'test@example.com',
      password: 'correctPassword',
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])
    loginService = new LoginUserService(userRepository, tokenProvider)

    // Act & Assert
    assert.rejects(async () => await loginService.execute('test@example.com', 'wrongPassword'))
  })

  test('devrait générer un token avec les informations correctes', async ({ assert }) => {
    // Arrange
    const testUser = User.create({
      email: 'test@example.com',
      password: 'password123',
      roles: [Role.ADMIN],
    })
    userRepository = new StubUserRepository([testUser])

    const expectedPayload: TokenPayload = {
      sub: 'test@example.com',
      roles: [Role.ADMIN],
    }
    tokenProvider = new StubTokenProvider(expectedPayload, 'custom-token')
    loginService = new LoginUserService(userRepository, tokenProvider)

    // Act
    const result = await loginService.execute('test@example.com', 'password123')

    // Assert
    assert.equal(result.token, 'custom-token')
    assert.deepEqual(tokenProvider.verify(result.token), expectedPayload)
  })
})
