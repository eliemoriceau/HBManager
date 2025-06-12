import { test } from '@japa/runner'
import { TokenExpiredError } from '#auth/exceptions/token_expired_error'

test.group('TokenExpiredError', () => {
  test('devrait créer une erreur avec le message correct', async ({ assert }) => {
    const error = new TokenExpiredError()
    assert.equal(error.message, 'Token expiré')
    assert.equal(error.name, 'TokenExpiredError')
  })
})