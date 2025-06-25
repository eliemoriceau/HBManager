import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { UserModel } from '#auth/secondary/infrastructure/models/user'
import { Role } from '#auth/domain/role'
import logger from '@adonisjs/core/services/logger'
import { Identifier } from '#shared/domaine/identifier'

process.env.JWT_SECRET = 'testsecret'
process.env.JWT_EXPIRES_IN = '1h'

test.group('AuthFlow', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  test('register then login and access protected route', async ({ client, assert }) => {
    const loginResponse = await client
      .post('/api/auth/login')
      .json({ email: 'admin@example.com', password: 'secret' })

    logger.info(loginResponse)
    loginResponse.assertOk()
    const token = loginResponse.body().token
    assert.exists(token)

    const protectedRes = await client
      .get('/admin')
      .header('Authorization', `Bearer ${token}`)
      .send()
    protectedRes.assertOk()
  }).setup(async () => {
    await UserModel.create({
      id: Identifier.generate().toString(),
      email: 'admin@example.com',
      password: 'secret',
      roles: [Role.ADMIN],
    })
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
