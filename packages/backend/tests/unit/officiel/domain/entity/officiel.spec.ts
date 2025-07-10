import { test } from '@japa/runner'
import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

test.group('Officiel Entity', () => {
  test('should create a valid Officiel', ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      telephone: '0123456789',
      qualifications: [OfficielTypeEnum.SECRETAIRE, OfficielTypeEnum.CHRONOMETREUR],
    })

    assert.equal(officiel.nom, 'Dupont')
    assert.equal(officiel.prenom, 'Jean')
    assert.equal(officiel.email, 'jean.dupont@email.com')
    assert.equal(officiel.nomComplet, 'Jean Dupont')
    assert.equal(officiel.qualifications.length, 2)
    assert.exists(officiel.id)
  })

  test('should throw error if required fields are missing', ({ assert }) => {
    assert.throws(() => {
      Officiel.create({
        nom: '',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
      })
    }, 'Nom, prénom et email sont requis')

    assert.throws(() => {
      Officiel.create({
        nom: 'Dupont',
        prenom: '',
        email: 'jean.dupont@email.com',
      })
    }, 'Nom, prénom et email sont requis')

    assert.throws(() => {
      Officiel.create({
        nom: 'Dupont',
        prenom: 'Jean',
        email: '',
      })
    }, 'Nom, prénom et email sont requis')
  })

  test('should check qualifications', ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })

    const secretaireType = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const chronometreurType = OfficielType.create(OfficielTypeEnum.CHRONOMETREUR)

    assert.isTrue(officiel.hasQualification(secretaireType))
    assert.isFalse(officiel.hasQualification(chronometreurType))
  })

  test('should add and remove qualifications', ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
    })

    const secretaireType = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const chronometreurType = OfficielType.create(OfficielTypeEnum.CHRONOMETREUR)

    // Add qualification
    officiel.addQualification(secretaireType)
    assert.isTrue(officiel.hasQualification(secretaireType))
    assert.equal(officiel.qualifications.length, 1)

    // Add same qualification should not duplicate
    officiel.addQualification(secretaireType)
    assert.equal(officiel.qualifications.length, 1)

    // Add different qualification
    officiel.addQualification(chronometreurType)
    assert.equal(officiel.qualifications.length, 2)

    // Remove qualification
    officiel.removeQualification(secretaireType)
    assert.isFalse(officiel.hasQualification(secretaireType))
    assert.isTrue(officiel.hasQualification(chronometreurType))
    assert.equal(officiel.qualifications.length, 1)
  })

  test('should manage availability', ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
    })

    // Default availability should be true
    assert.isTrue(officiel.isAvailable('2024-01-15'))

    // Set unavailable
    officiel.setDisponibilite('2024-01-15', false)
    assert.isFalse(officiel.isAvailable('2024-01-15'))

    // Set available
    officiel.setDisponibilite('2024-01-15', true)
    assert.isTrue(officiel.isAvailable('2024-01-15'))
  })

  test('should check if can assign to type', ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })

    const secretaireType = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const chronometreurType = OfficielType.create(OfficielTypeEnum.CHRONOMETREUR)

    assert.isTrue(officiel.canAssignTo(secretaireType))
    assert.isFalse(officiel.canAssignTo(chronometreurType))
  })

  test('should handle optional fields', ({ assert }) => {
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
    })

    assert.equal(officiel.telephone, undefined)
    assert.equal(officiel.clubId, undefined)
    assert.equal(officiel.qualifications.length, 0)
  })
})
