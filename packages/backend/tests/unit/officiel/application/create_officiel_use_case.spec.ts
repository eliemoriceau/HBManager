import { test } from '@japa/runner'
import { CreateOfficielUseCase } from '#officiel/application/use_case/create_officiel_use_case'
import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

class MockOfficielRepository {
  private officiels = new Map<string, Officiel>()

  async findByEmail(email: string) {
    for (const officiel of this.officiels.values()) {
      if (officiel.email === email) {
        return officiel
      }
    }
    return null
  }

  async save(officiel: Officiel) {
    this.officiels.set(officiel.id.toString(), officiel)
  }

  getAll() {
    return Array.from(this.officiels.values())
  }
}

test.group('CreateOfficielUseCase', () => {
  test('should successfully create officiel', async ({ assert }) => {
    // Arrange
    const repository = new MockOfficielRepository()
    const useCase = new CreateOfficielUseCase(repository as any)

    const request = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@test.com',
      telephone: '0123456789',
      qualifications: [OfficielTypeEnum.SECRETAIRE, OfficielTypeEnum.CHRONOMETREUR],
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isTrue(result.success)
    assert.exists(result.officielId)
    assert.equal(result.errors.length, 0)

    // Vérifier que l'officiel a été sauvegardé
    const savedOfficiels = repository.getAll()
    assert.equal(savedOfficiels.length, 1)
    assert.equal(savedOfficiels[0].nom, 'Dupont')
    assert.equal(savedOfficiels[0].prenom, 'Jean')
    assert.equal(savedOfficiels[0].email, 'jean.dupont@test.com')
  })

  test('should fail when email already exists', async ({ assert }) => {
    // Arrange
    const repository = new MockOfficielRepository()
    const useCase = new CreateOfficielUseCase(repository as any)

    // Créer un officiel existant
    const existingOfficiel = Officiel.create({
      nom: 'Existing',
      prenom: 'User',
      email: 'test@test.com',
      qualifications: [],
    })
    await repository.save(existingOfficiel)

    const request = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'test@test.com', // Email déjà utilisé
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isFalse(result.success)
    assert.isTrue(result.errors.includes('Un officiel avec cet email existe déjà'))
  })

  test('should fail when nom is empty', async ({ assert }) => {
    // Arrange
    const repository = new MockOfficielRepository()
    const useCase = new CreateOfficielUseCase(repository as any)

    const request = {
      nom: '   ', // Nom vide
      prenom: 'Jean',
      email: 'jean.dupont@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isFalse(result.success)
    assert.isTrue(result.errors.includes('Le nom est requis'))
  })

  test('should fail when prenom is empty', async ({ assert }) => {
    // Arrange
    const repository = new MockOfficielRepository()
    const useCase = new CreateOfficielUseCase(repository as any)

    const request = {
      nom: 'Dupont',
      prenom: '   ', // Prénom vide
      email: 'jean.dupont@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isFalse(result.success)
    assert.isTrue(result.errors.includes('Le prénom est requis'))
  })

  test('should fail when email is invalid', async ({ assert }) => {
    // Arrange
    const repository = new MockOfficielRepository()
    const useCase = new CreateOfficielUseCase(repository as any)

    const request = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'invalid-email', // Email invalide
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isFalse(result.success)
    assert.isTrue(result.errors.includes('Un email valide est requis'))
  })

  test('should normalize email to lowercase', async ({ assert }) => {
    // Arrange
    const repository = new MockOfficielRepository()
    const useCase = new CreateOfficielUseCase(repository as any)

    const request = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'Jean.DUPONT@TEST.COM', // Email avec majuscules
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isTrue(result.success)

    const savedOfficiels = repository.getAll()
    assert.equal(savedOfficiels[0].email, 'jean.dupont@test.com')
  })
})
