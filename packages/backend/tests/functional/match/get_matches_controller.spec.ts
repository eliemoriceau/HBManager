import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Match from '#match/domain/entity/match'
import { MatchModel } from '#match/infrastructure/models/match'
import testUtils from '@adonisjs/core/services/test_utils'
import Team from '#team/domain/team'

const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const official = '33333333-3333-4333-8333-333333333333'

function createTeam(id: string, name: string) {
  return Team.create({ id, nom: name })
}

function createMatch(date: string, heure = '12:00', officials: string[] = [official]) {
  const teamHome = createTeam(equipeHome, 'Team Home')
  const teamAway = createTeam(equipeAway, 'Team Away')

  return Match.create({
    codeRenc: 'CR1',
    date: DateTime.fromISO(date),
    heure,
    equipeDomicile: teamHome,
    equipeExterieur: teamAway,
    officiels: officials,
  })
}

test.group('GetMatchesController', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  test('returns all matches', async ({ client, assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    await MatchModel.create({
      id: match1.id.toString(),
      date: match1.date,
      heure: match1.heure,
      equipeDomicileId: match1.equipeDomicile.toString(),
      equipeExterieurId: match1.equipeExterieur.toString(),
      officiels: match1.officiels.map((o) => o.toString()),
      statut: match1.statut,
      codeRenc: match1.codeRenc,
    })
    await MatchModel.create({
      id: match2.id.toString(),
      date: match2.date,
      heure: match2.heure,
      equipeDomicileId: match2.equipeDomicile.toString(),
      equipeExterieurId: match2.equipeExterieur.toString(),
      officiels: match2.officiels.map((o) => o.toString()),
      statut: match2.statut,
      codeRenc: match2.codeRenc,
    })

    const response = await client.get('/api/matches').send()
    response.assertStatus(200)
    assert.lengthOf(response.body(), 2)
  })

  test('filters by official', async ({ client, assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02', '14:00', ['44444444-4444-4444-4444-444444444444'])
    for (const m of [match1, match2]) {
      await MatchModel.create({
        id: m.id.toString(),
        date: m.date,
        heure: m.heure,
        equipeDomicileId: m.equipeDomicile.toString(),
        equipeExterieurId: m.equipeExterieur.toString(),
        officiels: m.officiels.map((o) => o.toString()),
        statut: m.statut,
        codeRenc: m.codeRenc,
      })
    }

    const response = await client.get('/api/matches').qs({ officielId: official }).send()
    response.assertStatus(200)
    assert.lengthOf(response.body(), 1)
    assert.equal(response.body()[0].id, match1.id.toString())
  })
})
