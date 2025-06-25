import { test } from '@japa/runner'
import Team from '#team/domain/team'
import { StubTeamRepository } from '#tests/unit/team/stubs/stub_team_repository'
import { FederalCode } from '#team/domain/federal_code'

function createTeam(name: string, code: string) {
  return Team.create({ nom: name, codeFederal: code })
}

test.group('StubTeamRepository', (group) => {
  group.each.teardown(() => {
    FederalCode.reset()
  })
  test('create and findAll', async ({ assert }) => {
    const repo = new StubTeamRepository()
    const team = createTeam('A', 'CODE1')

    await repo.create(team)
    const all = await repo.findAll()

    assert.lengthOf(all, 1)
    assert.equal(all[0].id.toString(), team.id.toString())
  })

  test('findById returns correct team', async ({ assert }) => {
    const team = createTeam('A', 'CODE1')
    const repo = new StubTeamRepository([team])

    const found = await repo.findById(team.id.toString())

    assert.isNotNull(found)
    assert.equal(found?.id.toString(), team.id.toString())
  })

  test('update modifies existing team', async ({ assert }) => {
    const team = createTeam('A', 'CODE1')
    const repo = new StubTeamRepository([team])
    const updated = Team.create({ id: team.id.toString(), nom: 'B', codeFederal: 'CODE2' })

    await repo.update(updated)
    const result = await repo.findByName('B')

    assert.lengthOf(result, 1)
    assert.equal(result[0].nom.toString(), 'B')
  })

  test('delete removes a team', async ({ assert }) => {
    const team = createTeam('A', 'CODE1')
    const repo = new StubTeamRepository([team])

    await repo.delete(team.id.toString())
    const all = await repo.findAll()

    assert.lengthOf(all, 0)
  })
})
