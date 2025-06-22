import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import { Role } from '#auth/domain/role'

process.env.JWT_SECRET = 'testsecret'
process.env.JWT_EXPIRES_IN = '1h'

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

test.group('AuthValidation', (group) => {
  group.setup(createUsersTable)
  group.each.teardown(async () => {
    await db.connection().truncate('users')
  })
  group.teardown(dropUsersTable)

  test('rejects invalid login payload', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({ email: 'bad', password: '' })
    response.assertStatus(422)
  })

  test('rejects invalid register payload', async ({ client }) => {
    const response = await client.post('/api/auth/register').json({ email: 'bad', password: '' })
    response.assertStatus(422)
  })
})
