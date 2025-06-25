import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.date('date').notNullable()
      table.string('heure').notNullable()
      table.string('equipe_domicile_id').notNullable()
      table.string('equipe_exterieur_id').notNullable()
      // Les officiels peuvent être ajoutés après la création du match
      table.text('officiels').nullable()
      table.string('statut').notNullable()
      table.string('motif_annulation')
      table.string('motif_report')
      table.integer('score_domicile')
      table.integer('score_exterieur')
      table.string('code_renc').nullable().notNullable()
      table.date('created_at').notNullable()
      table.date('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
