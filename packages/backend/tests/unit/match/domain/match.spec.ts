import { test } from '@japa/runner'
import Match from '#match/domain/match'
import { StatutMatch } from '#match/domain/statut_match'

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
    assert.equal(match.statut, StatutMatch.A_VENIR)
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

test.group('Match methods', () => {
  test('changerStatut devrait accepter une transition valide', ({ assert }) => {
    const match = Match.create({
      date: new Date('2025-01-01'),
      heure: '12:30',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
    })

    match.changerStatut(StatutMatch.REPORTE)

    assert.equal(match.statut, StatutMatch.REPORTE)
  })

  test('changerStatut devrait refuser une transition interdite', ({ assert }) => {
    const match = Match.create({
      date: new Date('2025-01-01'),
      heure: '12:30',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
      statut: StatutMatch.TERMINE,
    })

    assert.throws(
      () => match.changerStatut(StatutMatch.EN_COURS),
      'Transition de Terminé vers En cours interdite'
    )
  })

  test('affecterOfficiels devrait mettre à jour les officiels', ({ assert }) => {
    const match = Match.create({
      date: new Date('2025-01-01'),
      heure: '12:30',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
    })

    match.affecterOfficiels([official])

    assert.deepEqual(
      match.officiels.map((o) => o.toString()),
      [official]
    )
  })

  test('modifierHoraire devrait changer date et heure', ({ assert }) => {
    const match = Match.create({
      date: new Date('2025-01-01'),
      heure: '12:30',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
    })

    const newDate = new Date(Date.now() + 86_400_000)
    match.modifierHoraire(newDate, '14:00')

    assert.equal(match.date, newDate)
    assert.equal(match.heure, '14:00')
    assert.equal(match.statut, StatutMatch.A_VENIR)
  })

  test('annulerMatch devrait mettre le statut à ANNULE', ({ assert }) => {
    const match = Match.create({
      date: new Date('2025-01-01'),
      heure: '12:30',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
    })

    match.annulerMatch('pluie')

    assert.equal(match.statut, StatutMatch.ANNULE)
  })

  test('reporterMatch devrait définir une nouvelle date et le statut', ({ assert }) => {
    const match = Match.create({
      date: new Date('2025-01-01'),
      heure: '12:30',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
    })

    const newDate = new Date(Date.now() + 172_800_000)
    match.reporterMatch(newDate, '16:00', 'terrain indisponible')

    assert.equal(match.date, newDate)
    assert.equal(match.heure, '16:00')
    assert.equal(match.statut, StatutMatch.REPORTE)
  })

  test('demarrerMatch devrait passer le statut à EN_COURS', ({ assert }) => {
    const date = new Date(Date.now() - 3600_000)
    const match = Match.create({
      date,
      heure: '00:00',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
    })

    match.demarrerMatch()

    assert.equal(match.statut, StatutMatch.EN_COURS)
  })

  test('terminerMatch devrait enregistrer le score', ({ assert }) => {
    const date = new Date(Date.now() - 3600_000)
    const match = Match.create({
      date,
      heure: '00:00',
      equipeDomicileId: equipeHome,
      equipeExterieurId: equipeAway,
    })

    match.demarrerMatch()
    match.terminerMatch(2, 1)

    assert.equal(match.statut, StatutMatch.TERMINE)
  })
})
