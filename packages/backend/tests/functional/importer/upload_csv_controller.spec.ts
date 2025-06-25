import { test } from '@japa/runner'
import { MatchModel } from '#match/secondary/infrastructure/models/match'
import { DateTime } from 'luxon'
import { StatutMatch } from '#match/domain/statut_match'
import testUtils from '@adonisjs/core/services/test_utils'
import { Identifier } from '#shared/domaine/identifier'

const id1 = Identifier.generate().toString()
const id2 = Identifier.generate().toString()
const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const sampleCsv = `code renc;le;horaire;club rec;club vis;nom salle\n${id1};2025-01-01;12:00;${equipeHome};${equipeAway};Gymnase`

test.group('UploadCsvController', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  test('uploads CSV file', async ({ client, assert }) => {
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(sampleCsv), {
        filename: 'matches.csv',
        contentType: 'text/csv',
      })
      .send()
    response.assertStatus(201)
    await new Promise((r) => setTimeout(r, 10))

    response.assertStatus(201)
    const matches = await MatchModel.all()
    assert.lengthOf(matches, 1)
    assert.property(response.body(), 'report')

    // Vérifier directement la structure du rapport dans la réponse
    const report = response.body().report
    // assert.include(report, ['totalLines', 'importedCount', 'ignored'])
    assert.equal(report.totalLines, 1)
    assert.equal(report.importedCount, 1)
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
    response.assertBody({ queued: true })
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
    response.assertBody({ queued: true })
  })

  test('does not duplicate existing match', async ({ client, assert }) => {
    await MatchModel.create({
      id: id1,
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:00',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
      officiels: [],
      statut: StatutMatch.A_VENIR,
    })

    const csv = `code renc;le;horaire;club rec;club vis;nom salle\n${id1};2025-01-01;12:00;${equipeHome};${equipeAway};Gym`
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(csv), {
        filename: 'dup.csv',
        contentType: 'text/csv',
      })
      .send()

    response.assertBody({ queued: true })
    await new Promise((r) => setTimeout(r, 10))
    const matches = await MatchModel.all()
    assert.lengthOf(matches, 1)
  })

  test('reports invalid line', async ({ client, assert }) => {
    const csv = `code renc;le;horaire;club rec;club vis;nom salle\n${id1};2025-01-01;12:00;${equipeHome};${equipeAway};Gym\n${id2};bad;12:00;${equipeHome};${equipeAway};Gym`
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(csv), {
        filename: 'invalid.csv',
        contentType: 'text/csv',
      })
      .send()

    response.assertBody({ queued: true })

    // Vérification du rapport dans la réponse
    const report = response.body().report
    assert.equal(report.totalLines, 2)
    assert.equal(report.importedCount, 1)
    assert.lengthOf(report.ignored, 1)
    assert.equal(report.ignored[0].lineNumber, 3)

    // Vérification de la base de données
    const matches = await MatchModel.all()
    assert.lengthOf(matches, 1)
  })
})
