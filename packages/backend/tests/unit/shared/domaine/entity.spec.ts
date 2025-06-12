import { test } from '@japa/runner'
import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'

class TestEntity extends Entity<{ id: Identifier; value: string }> {
  constructor(id: Identifier, value: string) {
    super({ id, value })
  }
}

test.group('Entity', () => {
  test('devrait comparer deux entités égales', async ({ assert }) => {
    const id = Identifier.generate()
    const entity1 = new TestEntity(id, 'value1')
    const entity2 = new TestEntity(id, 'value2')

    assert.isTrue(entity1.equals(entity2))
  })

  test('devrait comparer une entité avec elle-même', async ({ assert }) => {
    const entity = new TestEntity(Identifier.generate(), 'value')
    assert.isTrue(entity.equals(entity))
  })

  test('devrait comparer deux entités différentes', async ({ assert }) => {
    const entity1 = new TestEntity(Identifier.generate(), 'value1')
    const entity2 = new TestEntity(Identifier.generate(), 'value2')

    assert.isFalse(entity1.equals(entity2))
  })

  test("devrait exposer l'id via le getter", async ({ assert }) => {
    const id = Identifier.generate()
    const entity = new TestEntity(id, 'value')

    assert.equal(entity.id.toString(), id.toString())
  })
})
