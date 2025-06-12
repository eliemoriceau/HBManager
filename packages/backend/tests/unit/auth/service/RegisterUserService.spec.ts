import { test } from '@japa/runner'
import { StubUserRepository } from '#tests/unit/auth/stubs/stub_user_repository'
import { StubPasswordHasher } from '#tests/unit/auth/stubs/stub_password_hasher'
import { RegisterUserService } from '#auth/service/register_user_service_implementation'
import { Role } from '#auth/domain/role'
import User from '#auth/domain/user'

test.group('RegisterUserService', (group) => {
  let userRepository: StubUserRepository
  let passwordHasher: StubPasswordHasher
  let registerService: RegisterUserService

  group.each.setup(() => {
    userRepository = new StubUserRepository([])
    passwordHasher = new StubPasswordHasher()
    registerService = new RegisterUserService(userRepository, passwordHasher)
  })

  test('devrait créer un nouvel utilisateur avec le rôle GUEST', async ({ assert }) => {
    // Act
    const user = await registerService.execute('test@example.com', 'password123')

    // Assert
    assert.equal(user.email.toString(), 'test@example.com')
    assert.deepEqual(user.roles, [Role.GUEST])
    assert.equal(user.password.toString(), 'hashed_password123')
  })

  test('devrait persister le nouvel utilisateur', async ({ assert }) => {
    // Act
    await registerService.execute('test@example.com', 'password123')

    // Assert
    const savedUser = await userRepository.findByEmail('test@example.com')
    assert.isNotNull(savedUser)
    assert.deepEqual(savedUser?.roles, [Role.GUEST])
  })

  test('devrait lever EmailAlreadyExistsException si email existe déjà', async ({ assert }) => {
    // Arrange
    const existingUser = User.create('test@example.com', 'password123', [Role.GUEST])
    userRepository = new StubUserRepository([existingUser])
    registerService = new RegisterUserService(userRepository, passwordHasher)

    // Act & Assert
    assert.rejects(async () => {
      await registerService.execute('test@example.com', 'newpassword')
    })
  })
})
