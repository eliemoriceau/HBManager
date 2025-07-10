import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'assignments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('match_id').notNullable()
      table.uuid('officiel_id').notNullable()
      table.string('type', 50).notNullable()
      table.string('status', 20).notNullable().defaultTo('PENDING')
      table.string('source', 20).notNullable().defaultTo('SYSTEM_AUTO')
      table.timestamp('date_assignment').notNullable()
      table.text('notes').nullable()
      table.string('assigned_by', 255).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['match_id'])
      table.index(['officiel_id'])
      table.index(['status'])
      table.index(['type'])
      table.index(['source'])

      // Contrainte unique pour éviter les doublons
      table.unique(['match_id', 'officiel_id', 'type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
