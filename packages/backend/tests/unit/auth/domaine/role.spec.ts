import { Role, setRoles } from '#auth/domain/role'
import { test } from '@japa/runner'

test.group('setRoles', () => {
  test('should successfully return a deduplicated Role array for valid roles', ({ assert }) => {
    const roles = [Role.SECRETAIRE, Role.ENTRAINEUR, Role.SECRETAIRE]
    const result = setRoles(roles)
    assert.deepEqual(result, [Role.SECRETAIRE, Role.ENTRAINEUR])
  })

  test('should throw an error for an unknown role', ({ assert }) => {
    const roles = ['UNKNOWN_ROLE']
    assert.throws(() => setRoles(roles as any), 'Rôle inconnu : UNKNOWN_ROLE')
  })

  test('should handle an empty roles array and return an empty array', ({ assert }) => {
    const roles: Role[] = []
    const result = setRoles(roles)
    assert.deepEqual(result, [])
  })
})
