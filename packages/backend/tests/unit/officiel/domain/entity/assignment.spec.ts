import { test } from '@japa/runner'
import { Assignment } from '#officiel/domain/entity/assignment'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import { AssignmentStatusEnum } from '#officiel/domain/value_object/assignment_status'

test.group('Assignment Entity', () => {
  test('should create a valid Assignment', ({ assert }) => {
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
      notes: 'Test assignment',
    })

    assert.equal(assignment.matchId.toString(), 'match-123')
    assert.equal(assignment.officielId.toString(), 'officiel-456')
    assert.equal(assignment.type.value, OfficielTypeEnum.SECRETAIRE)
    assert.isTrue(assignment.status.isPending())
    assert.equal(assignment.notes, 'Test assignment')
    assert.exists(assignment.id)
    assert.exists(assignment.dateAssignment)
  })

  test('should create arbitre assignment from federation', ({ assert }) => {
    const assignment = Assignment.createArbitreFromFederation({
      matchId: 'match-123',
      arbitreId: 'arbitre-456',
      type: OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL),
      assignedBy: 'federation',
      notes: 'Federation arbitre',
    })

    assert.isTrue(assignment.type.isArbitre())
    assert.isTrue(assignment.status.isConfirmed()) // Auto-confirmed for federation
    assert.isTrue(assignment.isFromFederation())
    assert.equal(assignment.notes, 'Federation arbitre')
  })

  test('should create arbitre assignment from club', ({ assert }) => {
    const assignment = Assignment.createArbitreFromClub({
      matchId: 'match-123',
      arbitreId: 'arbitre-456',
      type: OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL),
      assignedBy: 'club-manager',
      notes: 'Club arbitre',
    })

    assert.isTrue(assignment.type.isArbitre())
    assert.isTrue(assignment.status.isPending()) // Pending for club
    assert.isTrue(assignment.isFromClub())
    assert.equal(assignment.notes, 'Club arbitre')
  })

  test('should throw error for non-arbitre type in arbitre creation', ({ assert }) => {
    assert.throws(() => {
      Assignment.createArbitreFromFederation({
        matchId: 'match-123',
        arbitreId: 'arbitre-456',
        type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
        assignedBy: 'federation',
      })
    }, 'Type doit être un arbitre')

    assert.throws(() => {
      Assignment.createArbitreFromClub({
        matchId: 'match-123',
        arbitreId: 'arbitre-456',
        type: OfficielType.create(OfficielTypeEnum.CHRONOMETREUR),
        assignedBy: 'club',
      })
    }, 'Type doit être un arbitre')
  })

  test('should confirm assignment when valid transition', ({ assert }) => {
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    assert.isTrue(assignment.status.isPending())

    assignment.confirm()
    assert.isTrue(assignment.status.isConfirmed())
    assert.isTrue(assignment.isActive())
  })

  test('should decline assignment when valid transition', ({ assert }) => {
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    assignment.decline()
    assert.equal(assignment.status.value, AssignmentStatusEnum.DECLINED)
    assert.isFalse(assignment.isActive())
  })

  test('should cancel confirmed assignment', ({ assert }) => {
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    assignment.confirm()
    assignment.cancel()
    assert.equal(assignment.status.value, AssignmentStatusEnum.CANCELLED)
    assert.isFalse(assignment.isActive())
  })

  test('should throw error for invalid transitions', ({ assert }) => {
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    // Cannot cancel from pending
    assert.throws(() => {
      assignment.cancel()
    }, "Impossible d'annuler cette assignation")

    // Confirm first
    assignment.confirm()

    // Cannot decline from confirmed
    assert.throws(() => {
      assignment.decline()
    }, 'Impossible de décliner cette assignation')
  })

  test('should add notes', ({ assert }) => {
    const assignment = Assignment.create({
      matchId: 'match-123',
      officielId: 'officiel-456',
      type: OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      assignedBy: 'user-789',
    })

    assignment.addNote('Updated note')
    assert.equal(assignment.notes, 'Updated note')
  })

  test('should determine if requires strict validation', ({ assert }) => {
    const federationAssignment = Assignment.createArbitreFromFederation({
      matchId: 'match-123',
      arbitreId: 'arbitre-456',
      type: OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL),
      assignedBy: 'federation',
    })

    const clubAssignment = Assignment.createArbitreFromClub({
      matchId: 'match-123',
      arbitreId: 'arbitre-456',
      type: OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL),
      assignedBy: 'club',
    })

    assert.isTrue(federationAssignment.requiresStrictValidation())
    assert.isFalse(clubAssignment.requiresStrictValidation())
  })
})
