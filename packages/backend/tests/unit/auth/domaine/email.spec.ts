import { test } from '@japa/runner'
import { Email } from '#auth/domain/email'

const testCases = [
  // Format invalide
  'user@@domain.com',
  '@domain.com',
  'user@',
  'user@domain',
  // Domaine invalide
  'user@domain.c',
  'user@domain.c1',
  'user@.com',
  'user@domain..com',
  // Caractères spéciaux invalides
  'user#name@domain.com',
  'user@do_main.com',
  'user@domain!.com',
  // Espaces et formatage
  'user @domain.com',
  'user@domain.com ',
  'user@domain, com',
  // Caractères internationaux
  'üser@domain.com',
]

test.group('Auth domaine email', () => {
  test('should be create email', async ({ assert }) => {
    const emailValue = 'email@test.fr'
    const email = Email.fromString('email@test.fr')

    assert.equal(
      email.get(),
      emailValue,
      'Methode Email.fromString should be return a valide email'
    )
  })
  test('Invalid email should be throw exception', async ({ assert }, emailValue) => {
    assert.throws(() => Email.fromString(emailValue as unknown as string))
  }).with(testCases)
})
