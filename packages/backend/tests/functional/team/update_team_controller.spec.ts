import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Team from '#team/domain/team'
import { TeamModel } from '#team/secondary/infrastructure/models/team'
import { FederalCode } from '#team/domain/federal_code'
import { Identifier } from '#shared/domaine/identifier'

function createTeam(
  nom: string = Identifier.generate().toString(),
  code: string = Identifier.generate().toString()
) {
  return Team.create({ nom, codeFederal: code })
}

test.group('UpdateTeamController', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
    FederalCode.reset()
  })

  test('updates a team', async ({ client, assert }) => {
    const team = createTeam()
    await TeamModel.create({
      id: team.id.toString(),
      nom: team.nom.toString(),
      codeFederal: team.codeFederal.toString(),
    })
    FederalCode.reset()

    const response = await client
      .put(`/api/equipes/${team.id}`)
      .json({ nom: 'B', codeFederal: team.codeFederal.toString() })
      .send()

    response.assertStatus(200)
    const updated = await TeamModel.find(team.id.toString())
    assert.equal(updated?.nom, 'B')
  })
})
