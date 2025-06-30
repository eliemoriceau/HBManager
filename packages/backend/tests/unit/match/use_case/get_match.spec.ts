import { test } from '@japa/runner'
import Match from '#match/domain/entity/match'
import Team from '#team/domain/team'
import { GetMatch } from '#match/application/usecase/impl/get_match'
import { StubMatchRepository } from '#tests/unit/match/stubs/stub_match_repository'
import { StubTeamRepository } from '#tests/unit/team/stubs/stub_team_repository'
import { DateTime } from 'luxon'

const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'

function createMatch() {
  return Match.create({
    codeRenc: 'CR1',
    date: DateTime.fromISO('2025-01-01'),
    heure: '12:00',
    equipeDomicile: equipeHome,
    equipeExterieur: equipeAway,
    officiels: [],
  })
}

function createTeam(id: string, name: string, code: string) {
  return Team.create({ id, nom: name, codeFederal: code })
}

test.group('GetMatch', () => {
  test('returns match with teams', async ({ assert }) => {
    const match = createMatch()
    const teamHome = createTeam(equipeHome, 'Home', 'C1')
    const teamAway = createTeam(equipeAway, 'Away', 'C2')
    const matchRepo = new StubMatchRepository([match])
    const teamRepo = new StubTeamRepository([teamHome, teamAway])
    const useCase = new GetMatch(matchRepo, teamRepo)

    const res = await useCase.execute(match.id.toString())

    assert.equal(res.match.id.toString(), match.id.toString())
    assert.equal(res.equipeDomicile.id.toString(), equipeHome)
    assert.equal(res.equipeExterieur.id.toString(), equipeAway)
  })
})
