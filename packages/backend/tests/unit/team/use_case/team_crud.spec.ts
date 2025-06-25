import { test } from '@japa/runner'
import { StubTeamRepository } from '#tests/unit/team/stubs/stub_team_repository'
import { StubMatchRepository } from '#tests/unit/match/stubs/stub_match_repository'
import { CreateTeam } from '#team/service/create_team'
import { UpdateTeam } from '#team/service/update_team'
import { DeleteTeam } from '#team/service/delete_team'
import { ListTeams } from '#team/service/list_teams'
import Team from '#team/domain/team'
import { FederalCode } from '#team/domain/federal_code'
import InvalidTeamException from '#team/exceptions/invalid_team_exception'
import Match from '#match/domain/match'

const equipeId = '11111111-1111-1111-1111-111111111111'
const otherId = '22222222-2222-2222-2222-222222222222'

function createTeam(name: string, code: string, id?: string) {
  return Team.create({ id, nom: name, codeFederal: code })
}

test.group('Team use cases', (group) => {
  group.each.teardown(() => {
    FederalCode.reset()
  })

  test('create team rejects duplicate name', async ({ assert }) => {
    const repo = new StubTeamRepository([createTeam('A', 'C1')])
    const useCase = new CreateTeam(repo)

    await assert.rejects(
      () => useCase.execute({ nom: 'A', codeFederal: 'C2' }),
      InvalidTeamException
    )
  })

  test('create team stores and returns entity', async ({ assert }) => {
    const repo = new StubTeamRepository()
    const useCase = new CreateTeam(repo)

    const team = await useCase.execute({ nom: 'A', codeFederal: 'C1' })

    assert.equal(team.nom.toString(), 'A')
    const all = await repo.findAll()
    assert.lengthOf(all, 1)
  })

  test('update team changes name', async ({ assert }) => {
    const team = createTeam('A', 'C1', equipeId)
    const repo = new StubTeamRepository([team])
    const useCase = new UpdateTeam(repo)

    const updated = await useCase.execute(equipeId, { nom: 'B', codeFederal: 'C1' })

    assert.equal(updated.nom.toString(), 'B')
    const saved = await repo.findById(equipeId)
    assert.equal(saved?.nom.toString(), 'B')
  })

  test('update team rejects duplicate name', async ({ assert }) => {
    const teamA = createTeam('A', 'C1', equipeId)
    const teamB = createTeam('B', 'C2', otherId)
    const repo = new StubTeamRepository([teamA, teamB])
    const useCase = new UpdateTeam(repo)

    await assert.rejects(
      () => useCase.execute(otherId, { nom: 'A', codeFederal: 'C2' }),
      InvalidTeamException
    )
  })

  test('delete team prevents removal when match exists', async ({ assert }) => {
    const team = createTeam('A', 'C1', equipeId)
    const repo = new StubTeamRepository([team])
    const match = Match.create({
      date: new Date('2025-01-01'),
      heure: '12:00',
      equipeDomicileId: equipeId,
      equipeExterieurId: otherId,
      officiels: [],
      codeRenc: '1',
    })
    const matchRepo = new StubMatchRepository([match])
    const useCase = new DeleteTeam(repo, matchRepo)

    await assert.rejects(() => useCase.execute(equipeId), InvalidTeamException)
  })

  test('delete team removes entity', async ({ assert }) => {
    const team = createTeam('A', 'C1', equipeId)
    const repo = new StubTeamRepository([team])
    const matchRepo = new StubMatchRepository([])
    const useCase = new DeleteTeam(repo, matchRepo)

    await useCase.execute(equipeId)

    const all = await repo.findAll()
    assert.lengthOf(all, 0)
  })

  test('list teams returns all', async ({ assert }) => {
    const teamA = createTeam('A', 'C1')
    const teamB = createTeam('B', 'C2')
    const repo = new StubTeamRepository([teamA, teamB])
    const useCase = new ListTeams(repo)

    const list = await useCase.execute()

    assert.lengthOf(list, 2)
  })
})
