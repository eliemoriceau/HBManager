import { test } from '@japa/runner'
import Team from '#team/domain/team'
import { FederalCode } from '#team/domain/federal_code'

test.group('Team.create', (group) => {
  group.each.teardown(() => {
    FederalCode.reset()
  })

  test('crée une équipe valide', ({ assert }) => {
    const team = Team.create({ nom: 'HB Club', codeFederal: 'FED1', logo: 'logo.png' })

    assert.equal(team.nom.toString(), 'HB Club')
    assert.equal(team.codeFederal.toString(), 'FED1')
    assert.equal(team.logo, 'logo.png')
  })

  test('rejette un nom vide', ({ assert }) => {
    assert.throws(() => {
      Team.create({ nom: '', codeFederal: 'FED2' })
    }, "Le nom d'équipe est requis")
  })

  test('rejette un code fédéral déjà utilisé', ({ assert }) => {
    Team.create({ nom: 'Team A', codeFederal: 'FED3' })

    assert.throws(() => {
      Team.create({ nom: 'Team B', codeFederal: 'FED3' })
    }, 'Code fédéral déjà utilisé')
  })
})
