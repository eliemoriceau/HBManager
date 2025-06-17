import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { Role } from '#auth/domain/role'
import hash from '@adonisjs/core/services/hash'

process.env.JWT_SECRET = 'testsecret'
process.env.JWT_EXPIRES_IN = '1h'

// Setup database schema for tests
const createUsersTable = async () => {
  await db.connection().schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.text('roles').notNullable()
  })
  await db
    .connection()
    .table('users')
    .insert({
      id: '1',
      email: 'admin@example.com',
      password: await hash.make('secret'),
      roles: JSON.stringify([Role.ADMIN]),
    })
}

const dropUsersTable = async () => {
  await db.connection().schema.dropTable('users')
  await db.manager.closeAll()
}

test.group('AuthFlow', (group) => {
  group.setup(createUsersTable)
  group.each.teardown(async () => {
    await db.connection().truncate('users')
  })
  group.teardown(dropUsersTable)

  test('register then login and access protected route', async ({ client, assert }) => {
    const regResponse = await client
      .post('/api/auth/register')
      .json({ email: 'a@b.com', password: 'secret' })
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
