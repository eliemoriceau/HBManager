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

test.group('GetTeamsController', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
    FederalCode.reset()
  })

  test('returns all teams', async ({ client, assert }) => {
    const teamA = createTeam()
    const teamB = createTeam()
    await TeamModel.create({
      id: teamA.id.toString(),
      nom: teamA.nom.toString(),
      codeFederal: teamA.codeFederal.toString(),
    })
    await TeamModel.create({
      id: teamB.id.toString(),
      nom: teamB.nom.toString(),
      codeFederal: teamB.codeFederal.toString(),
    })
    FederalCode.reset()

    const response = await client.get('/api/equipes').send()
    response.assertStatus(200)
    assert.lengthOf(response.body(), 2)
  })
})
