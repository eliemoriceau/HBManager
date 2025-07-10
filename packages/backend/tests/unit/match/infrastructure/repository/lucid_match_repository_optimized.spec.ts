import { test } from '@japa/runner'
import Match from '#match/domain/entity/match'
import Team from '#team/domain/team'
import { StatutMatch } from '#match/domain/entity/statut_match'
import { StubMatchRepository } from '#tests/unit/match/stubs/stub_match_repository'
import { DateTime } from 'luxon'

test.group('LucidMatchRepository - Optimisations N+1', () => {
  test('findExistingCodes devrait retourner uniquement les codes existants', async ({ assert }) => {
    // Arrange
    const repository = new StubMatchRepository()
    const match1 = Match.create({
      id: '1',
      date: DateTime.fromISO('2024-01-01'),
      heure: '10:00',
      equipeDomicile: Team.create({ id: '1', nom: 'Team A' }),
      equipeExterieur: Team.create({ id: '2', nom: 'Team B' }),
      officiels: ['Referee 1'],
      statut: StatutMatch.A_VENIR,
      codeRenc: 'ABC123',
    })
    const match2 = Match.create({
      id: '2',
      date: DateTime.fromISO('2024-01-02'),
      heure: '14:00',
      equipeDomicile: Team.create({ id: '3', nom: 'Team C' }),
      equipeExterieur: Team.create({ id: '4', nom: 'Team D' }),
      officiels: ['Referee 2'],
      statut: StatutMatch.A_VENIR,
      codeRenc: 'DEF456',
    })

    await repository.upsert(match1)
    await repository.upsert(match2)

    // Act
    const codes = await repository.findExistingCodes()

    // Assert
    assert.isTrue(codes.has('ABC123'))
    assert.isTrue(codes.has('DEF456'))
    assert.equal(codes.size, 2)
  })

  test('upsertBatch devrait traiter plusieurs matchs efficacement', async ({ assert }) => {
    // Arrange
    const repository = new StubMatchRepository()
    const matches = [
      Match.create({
        id: '1',
        date: DateTime.fromISO('2024-01-01'),
        heure: '10:00',
        equipeDomicile: Team.create({ id: '1', nom: 'Team A' }),
        equipeExterieur: Team.create({ id: '2', nom: 'Team B' }),
        officiels: ['Referee 1'],
        statut: StatutMatch.A_VENIR,
        codeRenc: 'BATCH001',
      }),
      Match.create({
        id: '2',
        date: DateTime.fromISO('2024-01-02'),
        heure: '14:00',
        equipeDomicile: Team.create({ id: '3', nom: 'Team C' }),
        equipeExterieur: Team.create({ id: '4', nom: 'Team D' }),
        officiels: ['Referee 2'],
        statut: StatutMatch.A_VENIR,
        codeRenc: 'BATCH002',
      }),
    ]

    // Act
    await repository.upsertBatch(matches)

    // Assert
    const allMatches = await repository.findAll()
    assert.equal(allMatches.length, 2)

    const codes = await repository.findExistingCodes()
    assert.isTrue(codes.has('BATCH001'))
    assert.isTrue(codes.has('BATCH002'))
  })

  test('upsertBatch devrait gérer les mises à jour et créations', async ({ assert }) => {
    // Arrange
    const repository = new StubMatchRepository()

    // Créer un match existant
    const existingMatch = Match.create({
      id: '1',
      date: DateTime.fromISO('2024-01-01'),
      heure: '10:00',
      equipeDomicile: Team.create({ id: '1', nom: 'Team A' }),
      equipeExterieur: Team.create({ id: '2', nom: 'Team B' }),
      officiels: ['Referee 1'],
      statut: StatutMatch.A_VENIR,
      codeRenc: 'EXISTING123',
    })
    await repository.upsert(existingMatch)

    // Préparer un lot avec mise à jour et création
    const matches = [
      Match.create({
        id: '1',
        date: DateTime.fromISO('2024-01-01'),
        heure: '10:00',
        equipeDomicile: Team.create({ id: '1', nom: 'Team A' }),
        equipeExterieur: Team.create({ id: '2', nom: 'Team B' }),
        officiels: ['Referee 1', 'Referee 2'], // Modification
        statut: StatutMatch.TERMINE, // Modification
        codeRenc: 'EXISTING123',
      }),
      Match.create({
        id: '2',
        date: DateTime.fromISO('2024-01-02'),
        heure: '14:00',
        equipeDomicile: Team.create({ id: '3', nom: 'Team C' }),
        equipeExterieur: Team.create({ id: '4', nom: 'Team D' }),
        officiels: ['Referee 3'],
        statut: StatutMatch.A_VENIR,
        codeRenc: 'NEW456',
      }),
    ]

    // Act
    await repository.upsertBatch(matches)

    // Assert
    const allMatches = await repository.findAll()
    assert.equal(allMatches.length, 2)

    const updatedMatch = allMatches.find((m) => m.codeRenc === 'EXISTING123')
    assert.isDefined(updatedMatch)
    assert.equal(updatedMatch!.statut, StatutMatch.TERMINE)
    assert.equal(updatedMatch!.officiels.length, 2)

    const newMatch = allMatches.find((m) => m.codeRenc === 'NEW456')
    assert.isDefined(newMatch)
    assert.equal(newMatch!.statut, StatutMatch.A_VENIR)
  })

  test('upsertBatch devrait gérer les lots vides', async ({ assert }) => {
    // Arrange
    const repository = new StubMatchRepository()

    // Act & Assert - ne devrait pas lancer d'erreur
    await repository.upsertBatch([])

    const allMatches = await repository.findAll()
    assert.equal(allMatches.length, 0)
  })
})
