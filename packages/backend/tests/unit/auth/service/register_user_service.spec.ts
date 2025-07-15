import { test } from '@japa/runner'
import { StubUserRepository } from '#tests/unit/auth/stubs/stub_user_repository'
import { StubPasswordHasher } from '#tests/unit/auth/stubs/stub_password_hasher'
import { StubTokenProvider } from '#tests/unit/auth/stubs/stub_token_provider'
import { RegisterUserService } from '#auth/service/register_user_service_implementation'
import { Role } from '#auth/domain/role'
import User from '#auth/domain/user'

test.group('RegisterUserService', (group) => {
  let userRepository: StubUserRepository
  let passwordHasher: StubPasswordHasher
  let tokenProvider: StubTokenProvider
  let registerService: RegisterUserService

  group.each.setup(() => {
    userRepository = new StubUserRepository([])
    passwordHasher = new StubPasswordHasher()
    tokenProvider = new StubTokenProvider()
    registerService = new RegisterUserService(userRepository, passwordHasher, tokenProvider)
  })

  test('devrait créer un nouvel utilisateur avec le rôle GUEST', async ({ assert }) => {
    // Act
    const result = await registerService.execute('test@example.com', 'password123')

    // Assert
    assert.equal(result.user.email, 'test@example.com')
    assert.deepEqual(result.user.roles, [Role.GUEST])
    assert.equal(result.token, 'stub-token')
  })

  test('devrait persister le nouvel utilisateur et générer un token', async ({ assert }) => {
    // Act
    const result = await registerService.execute('test@example.com', 'password123')

    // Assert
    const savedUser = await userRepository.findByEmail('test@example.com')
    assert.isNotNull(savedUser)
    assert.deepEqual(savedUser?.roles, [Role.GUEST])
    assert.exists(result.token)
    assert.equal(result.token, 'stub-token')
  })

  test('devrait lever EmailAlreadyExistsException si email existe déjà', async ({ assert }) => {
    // Arrange
    const existingUser = User.create({
      email: 'test@example.com',
      password: 'password123',
      roles: [Role.GUEST],
    })
    userRepository = new StubUserRepository([existingUser])
    registerService = new RegisterUserService(userRepository, passwordHasher, tokenProvider)

    // Act & Assert
    assert.rejects(async () => {
      await registerService.execute('test@example.com', 'newpassword')
    })
  })
})
