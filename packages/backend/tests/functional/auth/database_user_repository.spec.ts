import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DatabaseUserRepository } from '#auth/secondary/adapters/database_user_repository'
import User from '#auth/domain/user'
import { Role } from '#auth/domain/role'

test.group('DatabaseUserRepository', (group) => {
  group.setup(async () => {
    await db.connection().schema.createTable('users', (table) => {
      table.uuid('id').primary()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.text('roles').notNullable()
    })
  })

  group.each.teardown(async () => {
    await db.connection().truncate('users')
  })

  group.teardown(async () => {
    await db.connection().schema.dropTable('users')
    await db.manager.closeAll()
  })

  test('save and findByEmail', async ({ assert }) => {
    const repo = new DatabaseUserRepository()
    const user = User.create({ email: 'a@b.com', password: 'pass', roles: [Role.GUEST] })

    await repo.save(user)
    const found = await repo.findByEmail('a@b.com')

    assert.exists(found)
    assert.equal(found?.email.toString(), 'a@b.com')
  })

  test('exists returns true when user present', async ({ assert }) => {
    const repo = new DatabaseUserRepository()
    const user = User.create({ email: 'c@d.com', password: 'pass', roles: [Role.GUEST] })

    await repo.save(user)
    assert.isTrue(await repo.exists('c@d.com'))
  })

  test('exists returns false when absent', async ({ assert }) => {
    const repo = new DatabaseUserRepository()
    assert.isFalse(await repo.exists('ghost@example.com'))
  })

  test('save throws when email duplicated', async ({ assert }) => {
    const repo = new DatabaseUserRepository()
    const user1 = User.create({ email: 'dup@example.com', password: 'pass', roles: [Role.GUEST] })
    const user2 = User.create({ email: 'dup@example.com', password: 'pass', roles: [Role.GUEST] })

    await repo.save(user1)
    await assert.rejects(() => repo.save(user2))
  })
})
