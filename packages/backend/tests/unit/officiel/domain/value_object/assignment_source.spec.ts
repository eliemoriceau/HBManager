import { test } from '@japa/runner'
import {
  AssignmentSource,
  AssignmentSourceEnum,
} from '#officiel/domain/value_object/assignment_source'

test.group('AssignmentSource', () => {
  test('should create a valid AssignmentSource', ({ assert }) => {
    const source = AssignmentSource.create(AssignmentSourceEnum.FEDERATION_CSV)

    assert.equal(source.value, AssignmentSourceEnum.FEDERATION_CSV)
    assert.isTrue(source.isFederation())
  })

  test('should create static factory methods', ({ assert }) => {
    const federation = AssignmentSource.federation()
    const clubManual = AssignmentSource.clubManual()
    const systemAuto = AssignmentSource.systemAuto()

    assert.equal(federation.value, AssignmentSourceEnum.FEDERATION_CSV)
    assert.equal(clubManual.value, AssignmentSourceEnum.CLUB_MANUAL)
    assert.equal(systemAuto.value, AssignmentSourceEnum.SYSTEM_AUTO)
  })

  test('should identify federation source', ({ assert }) => {
    const federation = AssignmentSource.federation()
    const clubManual = AssignmentSource.clubManual()

    assert.isTrue(federation.isFederation())
    assert.isFalse(clubManual.isFederation())
  })

  test('should identify club manual source', ({ assert }) => {
    const federation = AssignmentSource.federation()
    const clubManual = AssignmentSource.clubManual()

    assert.isTrue(clubManual.isClubManual())
    assert.isFalse(federation.isClubManual())
  })

  test('should require strict validation for federation source', ({ assert }) => {
    const federation = AssignmentSource.federation()
    const clubManual = AssignmentSource.clubManual()
    const systemAuto = AssignmentSource.systemAuto()

    assert.isTrue(federation.requiresStrictValidation())
    assert.isFalse(clubManual.requiresStrictValidation())
    assert.isFalse(systemAuto.requiresStrictValidation())
  })

  test('should be equal when same source', ({ assert }) => {
    const source1 = AssignmentSource.federation()
    const source2 = AssignmentSource.federation()
    const source3 = AssignmentSource.clubManual()

    assert.isTrue(source1.equals(source2))
    assert.isFalse(source1.equals(source3))
  })

  test('should convert to string correctly', ({ assert }) => {
    const federation = AssignmentSource.federation()
    const clubManual = AssignmentSource.clubManual()

    assert.equal(federation.toString(), 'FEDERATION_CSV')
    assert.equal(clubManual.toString(), 'CLUB_MANUAL')
  })

  test('should handle all source types', ({ assert }) => {
    const sources = [
      AssignmentSourceEnum.FEDERATION_CSV,
      AssignmentSourceEnum.CLUB_MANUAL,
      AssignmentSourceEnum.SYSTEM_AUTO,
    ]

    sources.forEach((sourceEnum) => {
      const source = AssignmentSource.create(sourceEnum)
      assert.equal(source.value, sourceEnum)
    })
  })
})
