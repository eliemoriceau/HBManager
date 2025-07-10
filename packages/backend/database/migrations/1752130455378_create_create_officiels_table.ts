import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'officiels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('nom', 100).notNullable()
      table.string('prenom', 100).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('telephone', 20).nullable()
      table.uuid('club_id').nullable()
      table.json('qualifications').notNullable().defaultTo('[]')
      table.json('disponibilites').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['email'])
      table.index(['club_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
