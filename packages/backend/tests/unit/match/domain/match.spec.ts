import { test } from '@japa/runner'
import Match from '#match/domain/match'

const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const official = '33333333-3333-3333-3333-333333333333'

test.group('Match.create', () => {
  test('devrait créer un match valide', ({ assert }) => {
    const date = new Date('2025-01-01')
    const heure = '12:30'

    const match = Match.create({
      date,
      heure,
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
      officiels: [official],
    })

    assert.equal(match.date, date)
    assert.equal(match.heure, heure)
    assert.equal(match.equipeDomicileId.toString(), equipeHome)
    assert.equal(match.equipeExterieurId.toString(), equipeAway)
    assert.deepEqual(
      match.officiels.map((id) => id.toString()),
      [official]
    )
    assert.equal(match.statut, 'À venir')
  })

  test('devrait échouer si les équipes sont identiques', ({ assert }) => {
    const date = new Date('2025-01-01')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        date,
        heure,
        equipeDomicileId: equipeHome,
        equipeExterieurId: equipeHome,
      })
    }, 'Les équipes doivent être différentes')
  })

  test("devrait échouer si l'identifiant d'équipe domicile est manquant", ({ assert }) => {
    const date = new Date('2025-01-01')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        date,
        heure,
        equipeDomicileId: '' as any,
        equipeExterieurId: equipeAway,
      })
    }, "Les identifiants d'équipe sont requis")
  })

  test("devrait échouer si l'identifiant d'équipe extérieur est manquant", ({ assert }) => {
    const date = new Date('2025-01-01')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        date,
        heure,
        equipeDomicileId: equipeHome,
        equipeExterieurId: '' as any,
      })
    }, "Les identifiants d'équipe sont requis")
  })

  test('devrait échouer si la date est invalide', ({ assert }) => {
    const date = new Date('invalid-date')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        date,
        heure,
        equipeDomicileId: equipeHome,
        equipeExterieurId: equipeAway,
      })
    }, 'Date du match invalide')
  })

  test("devrait échouer si l'heure est invalide", ({ assert }) => {
    const date = new Date('2025-01-01')
    const heure = '25:61'

    assert.throws(() => {
      Match.create({
        date,
        heure,
        equipeDomicileId: equipeHome,
        equipeExterieurId: equipeAway,
      })
    }, 'Heure du match invalide')
  })
})
