import { test } from '@japa/runner'
import { TokenInvalidError } from '#auth/exceptions/token_invalid_error'

test.group('TokenInvalidError', () => {
  test('devrait créer une erreur avec le message correct', async ({ assert }) => {
    const error = new TokenInvalidError()
    assert.equal(error.message, 'Token invalide')
    assert.equal(error.name, 'TokenInvalidError')
  })
})
