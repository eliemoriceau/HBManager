import User from '#auth/domain/user'
import { test } from '@japa/runner'
import { Role } from '#auth/domain/role'

test.group('User.create', () => {
  test('devrait créer un utilisateur valide (cas nominal)', ({ assert }) => {
    const email = 'test@example.com'
    const password = 'SecureP@ssw0rd'
    const roles = [Role.ADMIN]

    const user = User.create(email, password, roles)

    assert.equal(user.email.toString(), email)
    assert.equal(user.password.toString(), password)
    assert.deepEqual(
      user.roles.map((role) => role.toString()),
      roles
    )
    assert.exists(user.id)
  })

  test('devrait échouer si l’email est invalide', ({ assert }) => {
    const invalidEmail = 'not-an-email'
    const password = 'SecureP@ssw0rd'
    const roles = ['user']

    assert.throws(() => {
      User.create(invalidEmail, password, roles)
    })
  })

  test('devrait créer l’utilisateur même avec une liste de rôles vide', ({ assert }) => {
    const email = 'test@example.com'
    const password = 'SecureP@ssw0rd'
    const roles: string[] = []

    const user = User.create(email, password, roles)

    assert.exists(user)
    assert.deepEqual(user.roles, [])
  })
})
