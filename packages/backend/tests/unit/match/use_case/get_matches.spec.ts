import { test } from '@japa/runner'
import Match from '#match/domain/match'
import { GetMatches } from '#match/service/get_matches'
import { StubMatchRepository } from '#tests/unit/match/stubs/stub_match_repository'

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

test.group('GetMatches', () => {
  test('devrait filtrer par plage de dates', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    const match3 = createMatch('2025-01-03')
    const repo = new StubMatchRepository([match1, match2, match3])
    const usecase = new GetMatches(repo)

    const result = await usecase.execute({
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
    })

    assert.lengthOf(result, 2)
    assert.deepEqual(
      result.map((m) => m.id.toString()),
      [match1.id.toString(), match2.id.toString()]
    )
  })

  test('devrait retourner vide si aucun match ne correspond', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const repo = new StubMatchRepository([match1])
    const usecase = new GetMatches(repo)

    const result = await usecase.execute({ officielId: 'unknown' })

    assert.deepEqual(result, [])
  })

  test('devrait retourner tous les matchs sans filtre', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    const repo = new StubMatchRepository([match1, match2])
    const usecase = new GetMatches(repo)

    const result = await usecase.execute()

    assert.lengthOf(result, 2)
  })

  test('devrait filtrer par critères multiples', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-01', '14:00', ['44444444-4444-4444-4444-444444444444'])
    const repo = new StubMatchRepository([match1, match2])
    const usecase = new GetMatches(repo)

    const result = await usecase.execute({
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-01'),
      officielId: official,
    })

    assert.lengthOf(result, 1)
    assert.equal(result[0].id.toString(), match1.id.toString())
  })
})
