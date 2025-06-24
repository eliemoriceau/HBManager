import { test } from '@japa/runner'
import { Identifier } from '#shared/domaine/identifier'

test.group('Identifier', () => {
  test('devrait créer un identifiant valide', ({ assert }) => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const identifier = Identifier.fromString(uuid)

    assert.equal(identifier.toString(), uuid)
  })

  test('devrait rejeter un identifiant invalide', ({ assert }) => {
    assert.throws(() => Identifier.fromString('invalid-uuid'))
  })
})
