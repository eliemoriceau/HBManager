import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('nom').notNullable().unique()
      table.string('code_federal').nullable().defaultTo('')
      table.string('logo')
      table.date('created_at').notNullable()
      table.date('updated_at').notNullable()
    })
    this.schema.table('matches', (table) => {
      table
        .uuid('equipe_domicile_id')
        .unsigned()
        .references('id')
        .inTable('teams')
        .notNullable()
        .onDelete('CASCADE')
      table
        .uuid('equipe_exterieur_id')
        .unsigned()
        .references('id')
        .inTable('teams')
        .notNullable()
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable('matches')
    this.schema.dropTable(this.tableName)
  }
}
