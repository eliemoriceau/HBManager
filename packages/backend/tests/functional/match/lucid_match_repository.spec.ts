import { test } from '@japa/runner'
import { LucidMatchRepository } from '#match/secondary/adapters/lucid_match_repository'
import { MatchModel } from '#match/secondary/infrastructure/models/match'
import Match from '#match/domain/match'
import { Identifier } from '#shared/domaine/identifier'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const official = '33333333-3333-4333-8333-333333333333'

function createMatch(
  date: string,
  heure = '12:00',
  officials: string[] = [official],
  id = Identifier.generate().toString()
) {
  return Match.create({
    id,
    codeRenc: 'CR1',
    date: DateTime.fromISO(date),
    heure,
    equipeDomicileId: equipeHome,
    equipeExterieurId: equipeAway,
    officiels: officials,
  })
}

test.group('LucidMatchRepository', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  test('findAll returns all matches', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    await MatchModel.create({
      id: match1.id.toString(),
      date: match1.date,
      heure: match1.heure,
      equipeDomicileId: match1.equipeDomicileId.toString(),
      equipeExterieurId: match1.equipeExterieurId.toString(),
      officiels: match1.officiels.map((o) => o.toString()),
      statut: match1.statut,
      codeRenc: match1.codeRenc,
    })
    await MatchModel.create({
      id: match2.id.toString(),
      date: match2.date,
      heure: match2.heure,
      equipeDomicileId: match2.equipeDomicileId.toString(),
      equipeExterieurId: match2.equipeExterieurId.toString(),
      officiels: match2.officiels.map((o) => o.toString()),
      statut: match2.statut,
      codeRenc: match2.codeRenc,
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
        date: m.date,
        heure: m.heure,
        equipeDomicileId: m.equipeDomicileId.toString(),
        equipeExterieurId: m.equipeExterieurId.toString(),
        officiels: m.officiels.map((o) => o.toString()),
        statut: m.statut,
        codeRenc: m.codeRenc,
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
        date: m.date,
        heure: m.heure,
        equipeDomicileId: m.equipeDomicileId.toString(),
        equipeExterieurId: m.equipeExterieurId.toString(),
        officiels: m.officiels.map((o) => o.toString()),
        statut: m.statut,
        codeRenc: m.codeRenc,
      })
    }

    const repo = new LucidMatchRepository()
    const res = await repo.findByCriteria({ officielId: official })

    assert.lengthOf(res, 1)
    assert.equal(res[0].id.toString(), match1.id.toString())
  })

  test('findById returns a single match', async ({ assert }) => {
    const match = createMatch('2025-05-05')
    await MatchModel.create({
      id: match.id.toString(),
      date: match.date,
      heure: match.heure,
      equipeDomicileId: match.equipeDomicileId.toString(),
      equipeExterieurId: match.equipeExterieurId.toString(),
      officiels: match.officiels.map((o) => o.toString()),
      statut: match.statut,
      codeRenc: match.codeRenc,
    })

    const repo = new LucidMatchRepository()
    const found = await repo.findById(match.id.toString())

    assert.isNotNull(found)
    assert.equal(found?.id.toString(), match.id.toString())
  })

  test('upsert creates or updates a match', async ({ assert }) => {
    const repo = new LucidMatchRepository()
    const matchId = Identifier.generate().toString()
    const match = createMatch('2025-05-05', '12:00', [official], matchId)
    await repo.upsert(match)

    let models = await MatchModel.all()
    assert.lengthOf(models, 1)

    const newOfficial = Identifier.generate().toString()
    const updated = Match.create({
      id: match.id.toString(),
      codeRenc: 'CR1',
      date: match.date,
      heure: match.heure,
      equipeDomicileId: match.equipeDomicileId.toString(),
      equipeExterieurId: match.equipeExterieurId.toString(),
      officiels: [newOfficial],
    })
    await repo.upsert(updated)

    models = await MatchModel.all()
    assert.lengthOf(models, 1)
    assert.deepEqual(models[0].officiels, [newOfficial])
  })
})
