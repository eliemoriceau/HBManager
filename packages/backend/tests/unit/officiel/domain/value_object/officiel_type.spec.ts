import { test } from '@japa/runner'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

test.group('OfficielType', () => {
  test('should create a valid OfficielType', ({ assert }) => {
    const type = OfficielType.create(OfficielTypeEnum.SECRETAIRE)

    assert.equal(type.value, OfficielTypeEnum.SECRETAIRE)
    assert.equal(type.toString(), OfficielTypeEnum.SECRETAIRE)
  })

  test('should create OfficielType from string', ({ assert }) => {
    const type = OfficielType.fromString('SECRETAIRE')

    assert.equal(type.value, OfficielTypeEnum.SECRETAIRE)
    assert.isTrue(type.isRequired())
  })

  test('should throw error for invalid string', ({ assert }) => {
    assert.throws(() => {
      OfficielType.fromString('INVALID_TYPE')
    }, "Type d'officiel invalide: INVALID_TYPE")
  })

  test('should identify required officials', ({ assert }) => {
    const secretaire = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const chronometreur = OfficielType.create(OfficielTypeEnum.CHRONOMETREUR)
    const responsableSalle = OfficielType.create(OfficielTypeEnum.RESPONSABLE_SALLE)
    const arbitrePrincipal = OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL)

    assert.isTrue(secretaire.isRequired())
    assert.isTrue(chronometreur.isRequired())
    assert.isTrue(responsableSalle.isRequired())
    assert.isTrue(arbitrePrincipal.isRequired())
  })

  test('should identify optional officials', ({ assert }) => {
    const tuteurTable = OfficielType.create(OfficielTypeEnum.TUTEUR_TABLE)
    const tuteurJugeArbitre = OfficielType.create(OfficielTypeEnum.TUTEUR_JUGE_ARBITRE)
    const arbitreAssistant = OfficielType.create(OfficielTypeEnum.ARBITRE_ASSISTANT)

    assert.isFalse(tuteurTable.isRequired())
    assert.isFalse(tuteurJugeArbitre.isRequired())
    assert.isFalse(arbitreAssistant.isRequired())
  })

  test('should identify arbitres', ({ assert }) => {
    const arbitrePrincipal = OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL)
    const arbitreAssistant = OfficielType.create(OfficielTypeEnum.ARBITRE_ASSISTANT)
    const secretaire = OfficielType.create(OfficielTypeEnum.SECRETAIRE)

    assert.isTrue(arbitrePrincipal.isArbitre())
    assert.isTrue(arbitreAssistant.isArbitre())
    assert.isFalse(secretaire.isArbitre())
  })

  test('should be equal when same type', ({ assert }) => {
    const type1 = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const type2 = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const type3 = OfficielType.create(OfficielTypeEnum.CHRONOMETREUR)

    assert.isTrue(type1.equals(type2))
    assert.isFalse(type1.equals(type3))
  })

  test('should list all required types', ({ assert }) => {
    const requiredTypes = [
      OfficielTypeEnum.SECRETAIRE,
      OfficielTypeEnum.CHRONOMETREUR,
      OfficielTypeEnum.RESPONSABLE_SALLE,
      OfficielTypeEnum.ARBITRE_PRINCIPAL,
    ]

    requiredTypes.forEach((type) => {
      const officielType = OfficielType.create(type)
      assert.isTrue(officielType.isRequired(), `${type} should be required`)
    })
  })

  test('should list all optional types', ({ assert }) => {
    const optionalTypes = [
      OfficielTypeEnum.TUTEUR_TABLE,
      OfficielTypeEnum.TUTEUR_JUGE_ARBITRE,
      OfficielTypeEnum.ARBITRE_ASSISTANT,
    ]

    optionalTypes.forEach((type) => {
      const officielType = OfficielType.create(type)
      assert.isFalse(officielType.isRequired(), `${type} should be optional`)
    })
  })
})
