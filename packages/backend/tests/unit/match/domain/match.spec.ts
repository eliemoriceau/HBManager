import { test } from '@japa/runner'
import Match from '#match/domain/entity/match'
import { StatutMatch } from '#match/domain/entity/statut_match'
import { DateTime } from 'luxon'

const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const official = '33333333-3333-4333-8333-333333333333'

test.group('Match.create', () => {
  test('devrait créer un match valide', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')
    const heure = '12:30'

    const match = Match.create({
      codeRenc: 'CR1',
      date,
      heure,
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
      officiels: [official],
    })

    assert.equal(match.date, date)
    assert.equal(match.heure, heure)
    assert.equal(match.equipeDomicile.toString(), equipeHome)
    assert.equal(match.equipeExterieur.toString(), equipeAway)
    assert.deepEqual(
      match.officiels.map((id) => id.toString()),
      [official]
    )
    assert.equal(match.statut, StatutMatch.A_VENIR)
  })

  test('devrait accepter un id fourni', ({ assert }) => {
    const id = '44444444-4444-4444-4444-444444444444'
    const match = Match.create({
      codeRenc: 'CR1',
      id,
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.equal(match.id.toString(), id)
  })

  test('devrait échouer si les équipes sont identiques', ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        codeRenc: 'CR1',
        date,
        heure,
        equipeDomicile: equipeHome,
        equipeExterieur: equipeHome,
      })
    }, 'Les équipes doivent être différentes')
  })

  test("devrait échouer si l'identifiant d'équipe domicile est manquant", ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        codeRenc: 'CR1',
        date,
        heure,
        equipeDomicile: '' as any,
        equipeExterieur: equipeAway,
      })
    }, "Les identifiants d'équipe sont requis")
  })

  test("devrait échouer si l'identifiant d'équipe extérieur est manquant", ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        codeRenc: 'CR1',
        date,
        heure,
        equipeDomicile: equipeHome,
        equipeExterieur: '' as any,
      })
    }, "Les identifiants d'équipe sont requis")
  })

  test('devrait échouer si la date est invalide', ({ assert }) => {
    const date = DateTime.fromISO('invalid-date')
    const heure = '12:30'

    assert.throws(() => {
      Match.create({
        codeRenc: 'CR1',
        date,
        heure,
        equipeDomicile: equipeHome,
        equipeExterieur: equipeAway,
      })
    }, 'Date du match invalide')
  })

  test("devrait échouer si l'heure est invalide", ({ assert }) => {
    const date = DateTime.fromISO('2025-01-01')
    const heure = '25:61'

    assert.throws(() => {
      Match.create({
        codeRenc: 'CR1',
        date,
        heure,
        equipeDomicile: equipeHome,
        equipeExterieur: equipeAway,
      })
    }, 'Heure du match invalide')
  })
})

test.group('Match methods', () => {
  test('changerStatut devrait accepter une transition valide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.changerStatut(StatutMatch.REPORTE)

    assert.equal(match.statut, StatutMatch.REPORTE)
  })

  test('changerStatut devrait refuser une transition interdite', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
      statut: StatutMatch.TERMINE,
    })

    assert.throws(
      () => match.changerStatut(StatutMatch.EN_COURS),
      'Transition de Terminé vers En cours interdite'
    )
  })

  test('changerStatut devrait refuser un statut inconnu', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(() => match.changerStatut('INCONNU' as any), 'Statut inconnu')
  })

  test('affecterOfficiels devrait mettre à jour les officiels', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.affecterOfficiels([official])

    assert.deepEqual(
      match.officiels.map((o) => o.toString()),
      [official]
    )
  })

  test('affecterOfficiels devrait dédupliquer les officiels', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.affecterOfficiels([official, official])

    assert.lengthOf(match.officiels, 1)
  })

  test('affecterOfficiels devrait refuser une liste vide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(() => match.affecterOfficiels([]), 'La liste des officiels est vide')
  })

  test('modifierHoraire devrait changer date et heure', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    const newDate = DateTime.fromMillis(Date.now() + 86_400_000)
    match.modifierHoraire(newDate, '14:00')

    assert.equal(match.date, newDate)
    assert.equal(match.heure, '14:00')
    assert.equal(match.statut, StatutMatch.A_VENIR)
  })

  test('modifierHoraire accepte une date passée', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    const past = DateTime.fromMillis(Date.now() - 1000)
    match.modifierHoraire(past, '00:00')

    assert.equal(match.date.toISO(), past.toISO())
  })

  test('modifierHoraire devrait refuser une heure invalide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(
      () => match.modifierHoraire(DateTime.fromMillis(Date.now() + 86_400_000), '99:99'),
      'Heure du match invalide'
    )
  })

  test('modifierHoraire devrait refuser une date invalide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(
      () => match.modifierHoraire(DateTime.fromISO('invalid-date'), '12:00'),
      'Date du match invalide'
    )
  })

  test('modifierHoraire remet le statut à A_VENIR', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    const newDate = DateTime.fromMillis(Date.now() + 172_800_000)
    match.changerStatut(StatutMatch.REPORTE)
    match.modifierHoraire(newDate, '18:00')

    assert.equal(match.statut, StatutMatch.A_VENIR)
  })

  test('annulerMatch devrait mettre le statut à ANNULE', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.annulerMatch('pluie')

    assert.equal(match.statut, StatutMatch.ANNULE)
  })

  test('annulerMatch devrait refuser un motif vide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(() => match.annulerMatch(''), 'Le motif est requis pour annuler')
  })

  test('reporterMatch devrait définir une nouvelle date et le statut', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    const newDate = DateTime.fromMillis(Date.now() + 172_800_000)
    match.reporterMatch(newDate, '16:00', 'terrain indisponible')

    assert.equal(match.date, newDate)
    assert.equal(match.heure, '16:00')
    assert.equal(match.statut, StatutMatch.REPORTE)
  })

  test('reporterMatch devrait refuser un motif vide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    const newDate = DateTime.fromMillis(Date.now() + 172_800_000)

    assert.throws(
      () => match.reporterMatch(newDate, '16:00', ''),
      'Le motif est requis pour reporter'
    )
  })

  test('reporterMatch accepte une date passée', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    const past = DateTime.fromMillis(Date.now() - 1000)
    match.reporterMatch(past, '00:00', 'motif')

    assert.equal(match.date.toISO(), past.toISO())
    assert.equal(match.statut, StatutMatch.REPORTE)
  })

  test('reporterMatch devrait refuser une date invalide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(
      () => match.reporterMatch(DateTime.fromISO('invalid-date'), '12:00', 'motif'),
      'Date du match invalide'
    )
  })

  test('reporterMatch devrait refuser une heure invalide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromISO('2025-01-01'),
      heure: '12:30',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    const future = DateTime.fromMillis(Date.now() + 86_400_000)

    assert.throws(() => match.reporterMatch(future, '99:99', 'motif'), 'Heure du match invalide')
  })

  test('demarrerMatch devrait passer le statut à EN_COURS', ({ assert }) => {
    const date = DateTime.fromMillis(Date.now() - 3600_000)
    const match = Match.create({
      codeRenc: 'CR1',
      date,
      heure: '00:00',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.demarrerMatch()

    assert.equal(match.statut, StatutMatch.EN_COURS)
  })

  test('demarrerMatch devrait refuser un statut invalide', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromMillis(Date.now() - 3600_000),
      heure: '00:00',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.changerStatut(StatutMatch.ANNULE)

    assert.throws(
      () => match.demarrerMatch(),
      'Impossible de démarrer le match depuis le statut Annulé'
    )
  })

  test("demarrerMatch devrait refuser si l'heure n'est pas atteinte", ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromMillis(Date.now() + 86_400_000),
      heure: '23:59',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(
      () => match.demarrerMatch(),
      "L'heure de début du match n'est pas encore atteinte"
    )
  })

  test('terminerMatch devrait enregistrer le score', ({ assert }) => {
    const date = DateTime.fromMillis(Date.now() - 3600_000)
    const match = Match.create({
      codeRenc: 'CR1',
      date,
      heure: '00:00',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.demarrerMatch()
    match.terminerMatch(2, 1)

    assert.equal(match.statut, StatutMatch.TERMINE)
  })

  test('terminerMatch devrait refuser si le match nest pas en cours', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromMillis(Date.now() - 3600_000),
      heure: '00:00',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    assert.throws(() => match.terminerMatch(1, 1), 'Le match doit être en cours')
  })

  test('terminerMatch devrait refuser des scores invalides', ({ assert }) => {
    const match = Match.create({
      codeRenc: 'CR1',
      date: DateTime.fromMillis(Date.now() - 3600_000),
      heure: '00:00',
      equipeDomicile: equipeHome,
      equipeExterieur: equipeAway,
    })

    match.demarrerMatch()

    assert.throws(() => match.terminerMatch(-1, 0), 'Scores invalides')
  })
})
