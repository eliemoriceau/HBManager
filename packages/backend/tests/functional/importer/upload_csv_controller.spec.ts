import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { promises as fs } from 'node:fs'
import { MatchModel } from '#match/secondary/infrastructure/models/match'
import { DateTime } from 'luxon'

const sampleCsv = `code renc;le;horaire;club rec;club vis;nom salle\nCODE1;2025-01-01;12:00;Equipe A;Equipe B;Gymnase`

test.group('UploadCsvController', (group) => {
  group.setup(async () => {
    await db.connection().schema.createTable('matches', (table) => {
      table.uuid('id').primary()
      table.date('date').notNullable()
      table.string('heure').notNullable()
      table.string('equipe_domicile_id').notNullable()
      table.string('equipe_exterieur_id').notNullable()
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
  test('uploads CSV file', async ({ client, assert }) => {
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(sampleCsv), {
        filename: 'matches.csv',
        contentType: 'text/csv',
      })
      .send()
    response.assertStatus(201)
    const matches = await MatchModel.all()
    assert.lengthOf(matches, 1)
    assert.property(response.body(), 'report')
    const fileContent = JSON.parse(await fs.readFile('/tmp/import_report.json', 'utf8'))
    assert.deepEqual(response.body().report, fileContent)
  })

  test('rejects file larger than 5MB', async ({ client }) => {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a')
    const response = await client
      .post('/api/import/csv')
      .file('file', largeBuffer, {
        filename: 'big.csv',
        contentType: 'text/csv',
      })
      .send()
    response.assertStatus(400)
  })

  test('rejects non UTF-8 encoding', async ({ client }) => {
    const invalidBuffer = Buffer.from([0xff, 0xff])
    const response = await client
      .post('/api/import/csv')
      .file('file', invalidBuffer, {
        filename: 'enc.csv',
        contentType: 'text/csv',
      })
      .send()
    response.assertStatus(400)
  })

  test('rejects missing headers', async ({ client }) => {
    const csv = `le;horaire;club rec;club vis;nom salle\n2024-01-01;10:00;A;B;Salle`
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(csv), {
        filename: 'bad.csv',
        contentType: 'text/csv',
      })
      .send()
    response.assertStatus(400)
  })

  test('does not duplicate existing match', async ({ client, assert }) => {
    await MatchModel.create({
      id: 'CODE1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:00',
      equipeDomicileId: 'Equipe A',
      equipeExterieurId: 'Equipe B',
      officiels: [],
      statut: 'À venir',
    })

    const csv =
      'code renc;le;horaire;club rec;club vis;nom salle\nCODE1;2025-01-01;12:00;Equipe A;Equipe B;Gym'
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(csv), {
        filename: 'dup.csv',
        contentType: 'text/csv',
      })
      .send()

    response.assertStatus(201)
    const matches = await MatchModel.all()
    assert.lengthOf(matches, 1)
  })

  test('reports invalid line', async ({ client, assert }) => {
    const csv =
      'code renc;le;horaire;club rec;club vis;nom salle\nCODE1;2025-01-01;12:00;Equipe A;Equipe B;Gym\nCODE2;bad;12:00;X;Y;Gym'
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(csv), {
        filename: 'invalid.csv',
        contentType: 'text/csv',
      })
      .send()

    response.assertStatus(201)
    assert.equal(response.body().report.totalLines, 2)
    assert.equal(response.body().report.importedCount, 1)
    assert.lengthOf(response.body().report.ignored, 1)
    assert.equal(response.body().report.ignored[0].lineNumber, 3)
    const fileContent = JSON.parse(await fs.readFile('/tmp/import_report.json', 'utf8'))
    assert.deepEqual(response.body().report, fileContent)
    const matches = await MatchModel.all()
    assert.lengthOf(matches, 1)
  })
})
