import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { TeamModel } from '#team/secondary/infrastructure/models/team'
import { FederalCode } from '#team/domain/federal_code'

test.group('CreateTeamController', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
    FederalCode.reset()
  })

  test('creates a team', async ({ client, assert }) => {
    const response = await client.post('/api/equipes').json({ nom: 'A', codeFederal: 'C1' }).send()

    response.assertStatus(201)
    const teams = await TeamModel.all()
    assert.lengthOf(teams, 1)
    assert.equal(teams[0].nom, 'A')
  })
})
