import { test } from '@japa/runner'
import { OptimizedTeamCacheService } from '#importer/service/optimized_team_cache_service'
import Team from '#team/domain/team'
import { StubTeamRepository } from '#tests/unit/team/stubs/stub_team_repository'

test.group('OptimizedTeamCacheService', () => {
  test('getOrCreateTeam devrait retourner une équipe existante', async ({ assert }) => {
    // Arrange
    const teamRepository = new StubTeamRepository()
    const existingTeam = Team.create({ id: '1', nom: 'Team Existing' })
    await teamRepository.create(existingTeam)

    // Créer des stubs pour les use cases
    const teamExisteUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        const teams = await teamRepository.findByName(nom)
        return teams.map((team) => ({
          id: team.id.toString(),
          nom: team.nom.toString(),
          codeFederal: team.codeFederal?.toString(),
        }))
      },
    }

    const createTeamUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        const newTeam = Team.create({ id: Date.now().toString(), nom })
        await teamRepository.create(newTeam)
        return {
          id: newTeam.id.toString(),
          nom: newTeam.nom.toString(),
          codeFederal: newTeam.codeFederal?.toString(),
        }
      },
    }

    const cacheService = new OptimizedTeamCacheService(
      teamExisteUseCase as any,
      createTeamUseCase as any
    )

    // Act
    const result = await cacheService.getOrCreateTeam('Team Existing')

    // Assert
    assert.equal(result.nom, 'Team Existing')
    assert.equal(result.id, '1')
  })

  test("getOrCreateTeam devrait créer une nouvelle équipe si elle n'existe pas", async ({
    assert,
  }) => {
    // Arrange
    const teamRepository = new StubTeamRepository()

    const teamExisteUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        const teams = await teamRepository.findByName(nom)
        return teams.map((team) => ({
          id: team.id.toString(),
          nom: team.nom.toString(),
          codeFederal: team.codeFederal?.toString(),
        }))
      },
    }

    const createTeamUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        const newTeam = Team.create({ id: Date.now().toString(), nom })
        await teamRepository.create(newTeam)
        return {
          id: newTeam.id.toString(),
          nom: newTeam.nom.toString(),
          codeFederal: newTeam.codeFederal?.toString(),
        }
      },
    }

    const cacheService = new OptimizedTeamCacheService(
      teamExisteUseCase as any,
      createTeamUseCase as any
    )

    // Act
    const result = await cacheService.getOrCreateTeam('New Team')

    // Assert
    assert.equal(result.nom, 'New Team')
    assert.isString(result.id)

    // Vérifier que l'équipe a été créée
    const createdTeams = await teamRepository.findByName('New Team')
    assert.equal(createdTeams.length, 1)
  })

  test('getOrCreateTeam devrait utiliser le cache pour les appels répétés', async ({ assert }) => {
    // Arrange
    const teamRepository = new StubTeamRepository()
    const existingTeam = Team.create({ id: '1', nom: 'Cached Team' })
    await teamRepository.create(existingTeam)

    let callCount = 0
    const teamExisteUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        callCount++
        const teams = await teamRepository.findByName(nom)
        return teams.map((team) => ({
          id: team.id.toString(),
          nom: team.nom.toString(),
          codeFederal: team.codeFederal?.toString(),
        }))
      },
    }

    const createTeamUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        const newTeam = Team.create({ id: Date.now().toString(), nom })
        await teamRepository.create(newTeam)
        return {
          id: newTeam.id.toString(),
          nom: newTeam.nom.toString(),
          codeFederal: newTeam.codeFederal?.toString(),
        }
      },
    }

    const cacheService = new OptimizedTeamCacheService(
      teamExisteUseCase as any,
      createTeamUseCase as any
    )

    // Act
    const result1 = await cacheService.getOrCreateTeam('Cached Team')
    const result2 = await cacheService.getOrCreateTeam('Cached Team')

    // Assert
    assert.equal(callCount, 1) // Une seule requête DB
    assert.equal(result1.nom, result2.nom)
    assert.equal(result1.id, result2.id)
  })

  test('preloadTeams devrait charger plusieurs équipes efficacement', async ({ assert }) => {
    // Arrange
    const teamRepository = new StubTeamRepository()
    const team1 = Team.create({ id: '1', nom: 'Team A' })
    const team2 = Team.create({ id: '2', nom: 'Team B' })
    await teamRepository.create(team1)
    await teamRepository.create(team2)

    const teamExisteUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        const teams = await teamRepository.findByName(nom)
        return teams.map((team) => ({
          id: team.id.toString(),
          nom: team.nom.toString(),
          codeFederal: team.codeFederal?.toString(),
        }))
      },
    }

    const createTeamUseCase = {
      execute: async ({ nom }: { nom: string }) => {
        const newTeam = Team.create({ id: Date.now().toString(), nom })
        await teamRepository.create(newTeam)
        return {
          id: newTeam.id.toString(),
          nom: newTeam.nom.toString(),
          codeFederal: newTeam.codeFederal?.toString(),
        }
      },
    }

    const cacheService = new OptimizedTeamCacheService(
      teamExisteUseCase as any,
      createTeamUseCase as any
    )

    // Act
    const result = await cacheService.preloadTeams(['Team A', 'Team B', 'Team C'])

    // Assert
    assert.equal(result.size, 3)
    assert.isTrue(result.has('Team A'))
    assert.isTrue(result.has('Team B'))
    assert.isTrue(result.has('Team C'))

    // Vérifier que Team C a été créée
    const createdTeams = await teamRepository.findByName('Team C')
    assert.equal(createdTeams.length, 1)
  })

  test('clearCache devrait vider le cache', async ({ assert }) => {
    // Arrange
    const teamRepository = new StubTeamRepository()
    const teamExisteUseCase = { execute: async () => [] }
    const createTeamUseCase = {
      execute: async ({ nom }: { nom: string }) => ({ id: '1', nom, codeFederal: undefined }),
    }

    const cacheService = new OptimizedTeamCacheService(
      teamExisteUseCase as any,
      createTeamUseCase as any
    )

    // Ajouter quelque chose au cache
    await cacheService.getOrCreateTeam('Test Team')

    // Act
    cacheService.clearCache()

    // Assert
    const stats = cacheService.getCacheStats()
    assert.equal(stats.size, 0)
    assert.equal(stats.keys.length, 0)
  })

  test('getCacheStats devrait retourner les statistiques du cache', async ({ assert }) => {
    // Arrange
    const teamRepository = new StubTeamRepository()
    const teamExisteUseCase = { execute: async () => [] }
    const createTeamUseCase = {
      execute: async ({ nom }: { nom: string }) => ({ id: '1', nom, codeFederal: undefined }),
    }

    const cacheService = new OptimizedTeamCacheService(
      teamExisteUseCase as any,
      createTeamUseCase as any
    )

    // Ajouter des équipes au cache
    await cacheService.getOrCreateTeam('Team 1')
    await cacheService.getOrCreateTeam('Team 2')

    // Act
    const stats = cacheService.getCacheStats()

    // Assert
    assert.equal(stats.size, 2)
    assert.includeMembers(stats.keys, ['Team 1', 'Team 2'])
  })
})
