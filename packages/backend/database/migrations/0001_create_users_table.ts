import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.text('roles').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
