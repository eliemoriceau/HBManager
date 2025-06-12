import { test } from '@japa/runner'
import { PlainPassword } from '#auth/domain/plain_password'

test.group('PlainPassword', () => {
  test('devrait créer un mot de passe valide', async ({ assert }) => {
    const password = PlainPassword.fromString('password123')
    assert.equal(password.toString(), 'password123')
  })

  test('devrait rejeter un mot de passe vide', async ({ assert }) => {
    assert.throws(() => PlainPassword.fromString(''))
  })
})
