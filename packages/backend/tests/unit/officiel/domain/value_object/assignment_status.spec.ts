import { test } from '@japa/runner'
import {
  AssignmentStatus,
  AssignmentStatusEnum,
} from '#officiel/domain/value_object/assignment_status'

test.group('AssignmentStatus', () => {
  test('should create a valid AssignmentStatus', ({ assert }) => {
    const status = AssignmentStatus.create(AssignmentStatusEnum.PENDING)

    assert.equal(status.value, AssignmentStatusEnum.PENDING)
    assert.isTrue(status.isPending())
  })

  test('should create static factory methods', ({ assert }) => {
    const pending = AssignmentStatus.pending()
    const confirmed = AssignmentStatus.confirmed()

    assert.equal(pending.value, AssignmentStatusEnum.PENDING)
    assert.equal(confirmed.value, AssignmentStatusEnum.CONFIRMED)
    assert.isTrue(pending.isPending())
    assert.isTrue(confirmed.isConfirmed())
  })

  test('should validate valid transitions from PENDING', ({ assert }) => {
    const pending = AssignmentStatus.pending()

    assert.isTrue(pending.canTransitionTo(AssignmentStatusEnum.CONFIRMED))
    assert.isTrue(pending.canTransitionTo(AssignmentStatusEnum.DECLINED))
    assert.isFalse(pending.canTransitionTo(AssignmentStatusEnum.CANCELLED))
  })

  test('should validate valid transitions from CONFIRMED', ({ assert }) => {
    const confirmed = AssignmentStatus.confirmed()

    assert.isTrue(confirmed.canTransitionTo(AssignmentStatusEnum.CANCELLED))
    assert.isFalse(confirmed.canTransitionTo(AssignmentStatusEnum.PENDING))
    assert.isFalse(confirmed.canTransitionTo(AssignmentStatusEnum.DECLINED))
  })

  test('should validate valid transitions from DECLINED', ({ assert }) => {
    const declined = AssignmentStatus.create(AssignmentStatusEnum.DECLINED)

    assert.isTrue(declined.canTransitionTo(AssignmentStatusEnum.PENDING))
    assert.isFalse(declined.canTransitionTo(AssignmentStatusEnum.CONFIRMED))
    assert.isFalse(declined.canTransitionTo(AssignmentStatusEnum.CANCELLED))
  })

  test('should validate no transitions from CANCELLED', ({ assert }) => {
    const cancelled = AssignmentStatus.create(AssignmentStatusEnum.CANCELLED)

    assert.isFalse(cancelled.canTransitionTo(AssignmentStatusEnum.PENDING))
    assert.isFalse(cancelled.canTransitionTo(AssignmentStatusEnum.CONFIRMED))
    assert.isFalse(cancelled.canTransitionTo(AssignmentStatusEnum.DECLINED))
  })

  test('should be equal when same status', ({ assert }) => {
    const status1 = AssignmentStatus.pending()
    const status2 = AssignmentStatus.pending()
    const status3 = AssignmentStatus.confirmed()

    assert.isTrue(status1.equals(status2))
    assert.isFalse(status1.equals(status3))
  })

  test('should handle state machine correctly', ({ assert }) => {
    // Test full workflow: pending -> confirmed -> cancelled
    const pending = AssignmentStatus.pending()
    assert.isTrue(pending.canTransitionTo(AssignmentStatusEnum.CONFIRMED))

    const confirmed = AssignmentStatus.confirmed()
    assert.isTrue(confirmed.canTransitionTo(AssignmentStatusEnum.CANCELLED))

    const cancelled = AssignmentStatus.create(AssignmentStatusEnum.CANCELLED)
    assert.isFalse(cancelled.canTransitionTo(AssignmentStatusEnum.PENDING))
  })

  test('should handle alternative workflow: pending -> declined -> pending', ({ assert }) => {
    const pending = AssignmentStatus.pending()
    assert.isTrue(pending.canTransitionTo(AssignmentStatusEnum.DECLINED))

    const declined = AssignmentStatus.create(AssignmentStatusEnum.DECLINED)
    assert.isTrue(declined.canTransitionTo(AssignmentStatusEnum.PENDING))
  })
})
