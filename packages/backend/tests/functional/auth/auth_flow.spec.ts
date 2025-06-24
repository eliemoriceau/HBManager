import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

process.env.JWT_SECRET = 'testsecret'
process.env.JWT_EXPIRES_IN = '1h'

test.group('AuthFlow', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('register then login and access protected route', async ({ client, assert }) => {
    const regResponse = await client
      .post('/api/auth/register')
      .json({ email: 'admin@example.com', password: 'secret' })
    regResponse.assertStatus(201)

    const loginResponse = await client
      .post('/api/auth/login')
      .json({ email: 'admin@example.com', password: 'secret' })

    loginResponse.assertOk()
    const token = loginResponse.body().token
    assert.exists(token)

    const protectedRes = await client
      .get('/admin')
      .header('Authorization', `Bearer ${token}`)
      .send()
    protectedRes.assertOk()
  })

  test('rejects access without token', async ({ client }) => {
    const response = await client.get('/admin').send()
    response.assertForbidden()
  })

  test('login fails with invalid credentials', async ({ client }) => {
    const response = await client
      .post('/api/auth/login')
      .json({ email: 'ghost@example.com', password: 'bad' })
    response.assertUnauthorized()
  })
})
