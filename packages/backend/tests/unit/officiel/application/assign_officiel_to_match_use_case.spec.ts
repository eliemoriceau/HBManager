import { test } from '@japa/runner'
import { AssignOfficielToMatchUseCase } from '#officiel/application/use_case/assign_officiel_to_match_use_case'
import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import { OfficielAssignment } from '#officiel/domain/entity/officiel_assignment'

// Mock repositories et services
class MockOfficielRepository {
  private officiels = new Map<string, Officiel>()

  async findById(id: string) {
    return this.officiels.get(id) || null
  }

  addOfficiel(officiel: Officiel) {
    this.officiels.set(officiel.id.toString(), officiel)
  }
}

class MockAssignmentRepository {
  private assignments: any[] = []

  async findByMatch(matchId: string) {
    return this.assignments.filter((a) => a.matchId.toString() === matchId)
  }

  async save(assignment: any) {
    this.assignments.push(assignment)
  }

  async delete(id: string) {
    const index = this.assignments.findIndex((a) => a.id.toString() === id)
    if (index >= 0) {
      this.assignments.splice(index, 1)
    }
  }
}

class MockOfficielAssignmentRepository {
  private assignments = new Map<string, OfficielAssignment>()

  async findByMatch(matchId: string) {
    return this.assignments.get(matchId) || null
  }

  async save(assignment: OfficielAssignment) {
    this.assignments.set(assignment.matchId.toString(), assignment)
  }
}

class MockValidationService {
  validateAssignment() {
    return {
      isValid: true,
      hasWarnings: false,
      errors: [],
      warnings: [],
    }
  }
}

test.group('AssignOfficielToMatchUseCase', () => {
  test('should successfully assign officiel to match', async ({ assert }) => {
    // Arrange
    const officielRepo = new MockOfficielRepository()
    const assignmentRepo = new MockAssignmentRepository()
    const officielAssignmentRepo = new MockOfficielAssignmentRepository()
    const validationService = new MockValidationService()

    const useCase = new AssignOfficielToMatchUseCase(
      officielRepo as any,
      assignmentRepo as any,
      officielAssignmentRepo as any,
      validationService as any
    )

    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })
    officielRepo.addOfficiel(officiel)

    const request = {
      matchId: '11111111-1111-1111-1111-111111111111',
      officielId: officiel.id.toString(),
      type: OfficielTypeEnum.SECRETAIRE,
      assignedBy: '22222222-2222-2222-2222-222222222222',
      notes: 'Test assignment',
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isTrue(result.success)
    assert.exists(result.assignmentId)
    assert.equal(result.errors.length, 0)
  })

  test('should fail when officiel not found', async ({ assert }) => {
    // Arrange
    const officielRepo = new MockOfficielRepository()
    const assignmentRepo = new MockAssignmentRepository()
    const officielAssignmentRepo = new MockOfficielAssignmentRepository()
    const validationService = new MockValidationService()

    const useCase = new AssignOfficielToMatchUseCase(
      officielRepo as any,
      assignmentRepo as any,
      officielAssignmentRepo as any,
      validationService as any
    )

    const request = {
      matchId: '11111111-1111-1111-1111-111111111111',
      officielId: '99999999-9999-9999-9999-999999999999',
      type: OfficielTypeEnum.SECRETAIRE,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isFalse(result.success)
    assert.isTrue(result.errors.includes('Officiel non trouvé'))
  })

  test('should fail when validation fails', async ({ assert }) => {
    // Arrange
    const officielRepo = new MockOfficielRepository()
    const assignmentRepo = new MockAssignmentRepository()
    const officielAssignmentRepo = new MockOfficielAssignmentRepository()

    class FailingValidationService {
      validateAssignment() {
        return {
          isValid: false,
          hasWarnings: false,
          errors: ['Validation failed'],
          warnings: [],
        }
      }
    }

    const validationService = new FailingValidationService()

    const useCase = new AssignOfficielToMatchUseCase(
      officielRepo as any,
      assignmentRepo as any,
      officielAssignmentRepo as any,
      validationService as any
    )

    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@test.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })
    officielRepo.addOfficiel(officiel)

    const request = {
      matchId: '11111111-1111-1111-1111-111111111111',
      officielId: officiel.id.toString(),
      type: OfficielTypeEnum.SECRETAIRE,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    }

    // Act
    const result = await useCase.execute(request)

    // Assert
    assert.isFalse(result.success)
    assert.isTrue(result.errors.includes('Validation failed'))
  })
})
