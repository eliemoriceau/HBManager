import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { LucidMatchRepository } from '#match/secondary/adapters/lucid_match_repository'
import { MatchModel } from '#match/secondary/infrastructure/models/match'
import Match from '#match/domain/match'
import { DateTime } from 'luxon'

const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const official = '33333333-3333-3333-3333-333333333333'

function createMatch(date: string, heure = '12:00', officials: string[] = [official]) {
  return Match.create({
    date: new Date(date),
    heure,
    equipeDomicileId: equipeHome,
    equipeExterieurId: equipeAway,
    officiels: officials,
  })
}

test.group('LucidMatchRepository', (group) => {
  group.setup(async () => {
    await db.connection().schema.createTable('matches', (table) => {
      table.uuid('id').primary()
      table.date('date').notNullable()
      table.string('heure').notNullable()
      table.uuid('equipe_domicile_id').notNullable()
      table.uuid('equipe_exterieur_id').notNullable()
      table.text('officiels').notNullable()
      table.string('statut').notNullable()
      table.string('motif_annulation')
      table.string('motif_report')
      table.integer('score_domicile')
      table.integer('score_exterieur')
    })
  })

  group.each.teardown(async () => {
    await db.connection().truncate('matches')
  })

  group.teardown(async () => {
    await db.connection().schema.dropTable('matches')
    await db.manager.closeAll()
  })

  test('findAll returns all matches', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    await MatchModel.create({
      id: match1.id.toString(),
      date: DateTime.fromJSDate(match1.date),
      heure: match1.heure,
      equipeDomicileId: match1.equipeDomicileId.toString(),
      equipeExterieurId: match1.equipeExterieurId.toString(),
      officiels: match1.officiels.map((o) => o.toString()),
      statut: match1.statut,
    })
    await MatchModel.create({
      id: match2.id.toString(),
      date: DateTime.fromJSDate(match2.date),
      heure: match2.heure,
      equipeDomicileId: match2.equipeDomicileId.toString(),
      equipeExterieurId: match2.equipeExterieurId.toString(),
      officiels: match2.officiels.map((o) => o.toString()),
      statut: match2.statut,
    })

    const repo = new LucidMatchRepository()
    const res = await repo.findAll()

    assert.lengthOf(res, 2)
  })

  test('findByCriteria filters by date range', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    const match3 = createMatch('2025-01-03')
    for (const m of [match1, match2, match3]) {
      await MatchModel.create({
        id: m.id.toString(),
        date: DateTime.fromJSDate(m.date),
        heure: m.heure,
        equipeDomicileId: m.equipeDomicileId.toString(),
        equipeExterieurId: m.equipeExterieurId.toString(),
        officiels: m.officiels.map((o) => o.toString()),
        statut: m.statut,
      })
    }

    const repo = new LucidMatchRepository()
    const res = await repo.findByCriteria({
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
    })

    assert.lengthOf(res, 2)
  })

  test('findByCriteria filters by official', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02', '14:00', ['44444444-4444-4444-4444-444444444444'])
    for (const m of [match1, match2]) {
      await MatchModel.create({
        id: m.id.toString(),
        date: DateTime.fromJSDate(m.date),
        heure: m.heure,
        equipeDomicileId: m.equipeDomicileId.toString(),
        equipeExterieurId: m.equipeExterieurId.toString(),
        officiels: m.officiels.map((o) => o.toString()),
        statut: m.statut,
      })
    }

    const repo = new LucidMatchRepository()
    const res = await repo.findByCriteria({ officielId: official })

    assert.lengthOf(res, 1)
    assert.equal(res[0].id.toString(), match1.id.toString())
  })
})
