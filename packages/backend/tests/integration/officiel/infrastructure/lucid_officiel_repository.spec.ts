import { test } from '@japa/runner'
import { LucidOfficielRepository } from '#officiel/infrastructure/repository/lucid_officiel_repository'
import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import Database from '@adonisjs/lucid/services/db'

test.group('LucidOfficielRepository', (group) => {
  let repository: LucidOfficielRepository

  group.setup(async () => {
    repository = new LucidOfficielRepository()
  })

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('should save and find officiel by id', async ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@test.com',
      telephone: '0123456789',
      qualifications: [OfficielTypeEnum.SECRETAIRE, OfficielTypeEnum.CHRONOMETREUR],
    })

    await repository.save(officiel)

    const found = await repository.findById(officiel.id.toString())

    assert.isNotNull(found)
    assert.equal(found!.nom, 'Dupont')
    assert.equal(found!.prenom, 'Jean')
    assert.equal(found!.email, 'jean.dupont@test.com')
    assert.equal(found!.telephone, '0123456789')
    assert.equal(found!.qualifications.length, 2)
  })

  test('should find officiel by email', async ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Martin',
      prenom: 'Paul',
      email: 'paul.martin@test.com',
      qualifications: [OfficielTypeEnum.ARBITRE_PRINCIPAL],
    })

    await repository.save(officiel)

    const found = await repository.findByEmail('paul.martin@test.com')

    assert.isNotNull(found)
    assert.equal(found!.nom, 'Martin')
    assert.equal(found!.prenom, 'Paul')
  })

  test('should find officiels by qualification', async ({ assert }) => {
    const secretaire = Officiel.create({
      nom: 'Durand',
      prenom: 'Marie',
      email: 'marie.durand@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })

    const arbitre = Officiel.create({
      nom: 'Moreau',
      prenom: 'Pierre',
      email: 'pierre.moreau@test.com',
      qualifications: [OfficielTypeEnum.ARBITRE_PRINCIPAL],
    })

    const polyvalent = Officiel.create({
      nom: 'Leroy',
      prenom: 'Sophie',
      email: 'sophie.leroy@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE, OfficielTypeEnum.CHRONOMETREUR],
    })

    await repository.save(secretaire)
    await repository.save(arbitre)
    await repository.save(polyvalent)

    const secretaires = await repository.findByQualification(OfficielTypeEnum.SECRETAIRE)
    const arbitres = await repository.findByQualification(OfficielTypeEnum.ARBITRE_PRINCIPAL)

    assert.equal(secretaires.length, 2) // secretaire + polyvalent
    assert.equal(arbitres.length, 1) // arbitre seulement
  })

  test('should find officiels by club', async ({ assert }) => {
    const clubId = '11111111-1111-1111-1111-111111111111'

    const officiel1 = Officiel.create({
      nom: 'Club1',
      prenom: 'Membre1',
      email: 'membre1@club.com',
      clubId,
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })

    const officiel2 = Officiel.create({
      nom: 'Club1',
      prenom: 'Membre2',
      email: 'membre2@club.com',
      clubId,
      qualifications: [OfficielTypeEnum.CHRONOMETREUR],
    })

    const officiel3 = Officiel.create({
      nom: 'Club2',
      prenom: 'Membre1',
      email: 'membre1@autreclub.com',
      clubId: '22222222-2222-2222-2222-222222222222',
      qualifications: [OfficielTypeEnum.ARBITRE_PRINCIPAL],
    })

    await repository.save(officiel1)
    await repository.save(officiel2)
    await repository.save(officiel3)

    const membresClub1 = await repository.findByClub(clubId)

    assert.equal(membresClub1.length, 2)
    assert.isTrue(membresClub1.every((o) => o.clubId === clubId))
  })

  test('should find available officiels on date', async ({ assert }) => {
    const available = Officiel.create({
      nom: 'Disponible',
      prenom: 'Jean',
      email: 'disponible@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })
    available.setDisponibilite('2025-01-15', true)

    const unavailable = Officiel.create({
      nom: 'Indisponible',
      prenom: 'Paul',
      email: 'indisponible@test.com',
      qualifications: [OfficielTypeEnum.CHRONOMETREUR],
    })
    unavailable.setDisponibilite('2025-01-15', false)

    const noPreference = Officiel.create({
      nom: 'Neutre',
      prenom: 'Marie',
      email: 'neutre@test.com',
      qualifications: [OfficielTypeEnum.ARBITRE_PRINCIPAL],
    })

    await repository.save(available)
    await repository.save(unavailable)
    await repository.save(noPreference)

    const availableOn15 = await repository.findAvailableOn('2025-01-15')

    // Doit trouver 'available' et 'noPreference' mais pas 'unavailable'
    assert.equal(availableOn15.length, 2)
    assert.isFalse(availableOn15.some((o) => o.email === 'indisponible@test.com'))
  })

  test('should delete officiel', async ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'ToDelete',
      prenom: 'Test',
      email: 'todelete@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })

    await repository.save(officiel)

    let found = await repository.findById(officiel.id.toString())
    assert.isNotNull(found)

    await repository.delete(officiel.id.toString())

    found = await repository.findById(officiel.id.toString())
    assert.isNull(found)
  })

  test('should paginate officiels', async ({ assert }) => {
    // Créer plusieurs officiels
    for (let i = 1; i <= 5; i++) {
      const officiel = Officiel.create({
        nom: `Test${i}`,
        prenom: `User${i}`,
        email: `test${i}@test.com`,
        qualifications: [OfficielTypeEnum.SECRETAIRE],
      })
      await repository.save(officiel)
    }

    const result = await repository.findAll(1, 3)

    assert.equal(result.data.length, 3)
    assert.isTrue(result.total >= 5)
    assert.equal(result.page, 1)
    assert.equal(result.limit, 3)
  })
})
