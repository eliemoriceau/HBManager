import { test } from '@japa/runner'
import { OfficielAssignment } from '#officiel/domain/entity/officiel_assignment'
import { Assignment } from '#officiel/domain/entity/assignment'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

test.group('OfficielAssignment Aggregate', () => {
  test('should create a valid OfficielAssignment', ({ assert }) => {
    const assignment = OfficielAssignment.create({ matchId: 'match-123' })

    assert.equal(assignment.matchId.toString(), 'match-123')
    assert.equal(assignment.assignments.length, 0)
    assert.exists(assignment.id)
  })

  test('should add assignment', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    officielAssignment.addAssignment(assignment)

    assert.equal(officielAssignment.assignments.length, 1)
    assert.equal(officielAssignment.assignments[0].id, assignment.id)
  })

  test('should prevent duplicate assignments for same type', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    const assignment1 = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })
    assignment1.confirm()

    const assignment2 = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-789',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })
    assignment2.confirm()

    officielAssignment.addAssignment(assignment1)

    assert.throws(() => {
      officielAssignment.addAssignment(assignment2)
    }, 'Une assignation existe déjà pour le type SECRETAIRE')
  })

  test('should allow multiple assignments for different types', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    const secretaireAssignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    const chronometreurAssignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-789',
      type: OfficielType.create(OfficielTypeEnum.CHRONOMETREUR),
      assignedBy: 'user-789',
    })

    officielAssignment.addAssignment(secretaireAssignment)
    officielAssignment.addAssignment(chronometreurAssignment)

    assert.equal(officielAssignment.assignments.length, 2)
  })

  test('should remove assignment', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    officielAssignment.addAssignment(assignment)
    assert.equal(officielAssignment.assignments.length, 1)

    officielAssignment.removeAssignment(assignment.id.toString())
    assert.equal(officielAssignment.assignments.length, 0)
  })

  test('should throw error when removing non-existent assignment', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    assert.throws(() => {
      officielAssignment.removeAssignment('non-existent-id')
    }, 'Assignation non trouvée')
  })

  test('should get assignments by type', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    const secretaireType = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: secretaireType,
      assignedBy: 'user-789',
    })

    officielAssignment.addAssignment(assignment)

    const secretaireAssignments = officielAssignment.getAssignmentsByType(secretaireType)
    assert.equal(secretaireAssignments.length, 1)
    assert.equal(secretaireAssignments[0].id, assignment.id)

    const chronometreurType = OfficielType.create(OfficielTypeEnum.CHRONOMETREUR)
    const chronometreurAssignments = officielAssignment.getAssignmentsByType(chronometreurType)
    assert.equal(chronometreurAssignments.length, 0)
  })

  test('should get active assignments', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    const activeAssignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })
    activeAssignment.confirm()

    const pendingAssignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-789',
      type: OfficielType.create(OfficielTypeEnum.CHRONOMETREUR),
      assignedBy: 'user-789',
    })

    officielAssignment.addAssignment(activeAssignment)
    officielAssignment.addAssignment(pendingAssignment)

    const activeAssignments = officielAssignment.getActiveAssignments()
    assert.equal(activeAssignments.length, 1)
    assert.equal(activeAssignments[0].id, activeAssignment.id)
  })

  test('should get required assignments', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    const secretaireAssignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    const tuteurAssignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-789',
      type: OfficielType.create(OfficielTypeEnum.TUTEUR_TABLE),
      assignedBy: 'user-789',
    })

    officielAssignment.addAssignment(secretaireAssignment)
    officielAssignment.addAssignment(tuteurAssignment)

    const requiredAssignments = officielAssignment.getRequiredAssignments()
    assert.equal(requiredAssignments.length, 1)
    assert.equal(requiredAssignments[0].type.value, OfficielTypeEnum.SECRETAIRE)
  })

  test('should identify missing required types', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    // Initially, all required types are missing
    const allMissing = officielAssignment.getMissingRequiredTypes()
    assert.equal(allMissing.length, 4) // SECRETAIRE, CHRONOMETREUR, RESPONSABLE_SALLE, ARBITRE_PRINCIPAL

    // Add secretaire
    const secretaireAssignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })
    secretaireAssignment.confirm()
    officielAssignment.addAssignment(secretaireAssignment)

    const missingSome = officielAssignment.getMissingRequiredTypes()
    assert.equal(missingSome.length, 3)
    assert.isFalse(missingSome.some((type) => type.value === OfficielTypeEnum.SECRETAIRE))
  })

  test('should check if assignment is complete', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    assert.isFalse(officielAssignment.isComplete())

    // Add all required assignments
    const requiredTypes = [
      OfficielTypeEnum.SECRETAIRE,
      OfficielTypeEnum.CHRONOMETREUR,
      OfficielTypeEnum.RESPONSABLE_SALLE,
      OfficielTypeEnum.ARBITRE_PRINCIPAL,
    ]

    requiredTypes.forEach((type, index) => {
      const assignment = Assignment.create({
        matchId: 'match-123',
        officielId: `officiel-${index}`,
        type: OfficielType.create(type),
        assignedBy: 'user-789',
      })
      assignment.confirm()
      officielAssignment.addAssignment(assignment)
    })

    assert.isTrue(officielAssignment.isComplete())
  })

  test('should check if match can start', ({ assert }) => {
    const officielAssignment = OfficielAssignment.create({ matchId: 'match-123' })

    assert.isFalse(officielAssignment.canStartMatch())

    // Add all required assignments
    const requiredTypes = [
      OfficielTypeEnum.SECRETAIRE,
      OfficielTypeEnum.CHRONOMETREUR,
      OfficielTypeEnum.RESPONSABLE_SALLE,
      OfficielTypeEnum.ARBITRE_PRINCIPAL,
    ]

    requiredTypes.forEach((type, index) => {
      const assignment = Assignment.create({
        matchId: 'match-123',
        officielId: `officiel-${index}`,
        type: OfficielType.create(type),
        assignedBy: 'user-789',
      })
      assignment.confirm()
      officielAssignment.addAssignment(assignment)
    })

    assert.isTrue(officielAssignment.canStartMatch())
  })
})
