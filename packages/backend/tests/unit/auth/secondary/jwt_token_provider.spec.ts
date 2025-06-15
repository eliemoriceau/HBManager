import { test } from '@japa/runner'
import { JwtTokenProvider } from '#auth/secondary/adapters/jwt_token_provider'
import env from '#start/env'

process.env.JWT_SECRET = 'testsecret'
process.env.JWT_EXPIRES_IN = '1s'

let provider = new JwtTokenProvider()

test.group('JwtTokenProvider', () => {
  test('devrait créer et vérifier un token', ({ assert }) => {
    const payload = { hello: 'world' }
    const token = provider.generate(payload)
    const decoded = provider.verify(token)
    assert.equal(decoded.hello, 'world')
  })

  test('devrait lever TokenInvalidError pour un token invalide', ({ assert }) => {
    assert.throws(() => provider.verify('bad.token'))
  })

  test('devrait lever TokenExpiredError pour un token expiré', async ({ assert }) => {
    const payload = { foo: 'bar' }
    env.set('JWT_EXPIRES_IN', '1s')
    provider = new JwtTokenProvider()

    const token = provider.generate(payload)
    // Wait for token to expire (1s)
    await new Promise((r) => setTimeout(r, 1100))
    assert.throws(() => provider.verify(token))
  })
})
