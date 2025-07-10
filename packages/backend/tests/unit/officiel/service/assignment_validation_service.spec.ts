import { test } from '@japa/runner'
import { AssignmentValidationService } from '#officiel/service/assignment_validation_service'
import { Officiel } from '#officiel/domain/entity/officiel'
import { Assignment } from '#officiel/domain/entity/assignment'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import Match from '#match/domain/entity/match'
import Team from '#team/domain/team'
import { DateTime } from 'luxon'

let counter = 0
function uniqueCode(prefix: string): string {
  return `${prefix}_${++counter}`
}

test.group('AssignmentValidationService', () => {
  test('should validate valid assignment', ({ assert }) => {
    const service = new AssignmentValidationService()
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })

    const type = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const assignment = Assignment.create({
      matchId: '11111111-1111-1111-1111-111111111111',
      officielId: officiel.id.toString(),
      type,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    })

    const match = Match.create({
      codeRenc: 'CR001',
      date: DateTime.now().plus({ days: 1 }),
      heure: '15:00',
      equipeDomicile: Team.create({ nom: 'Team A', codeFederal: uniqueCode('TEAM_A') }),
      equipeExterieur: Team.create({ nom: 'Team B', codeFederal: uniqueCode('TEAM_B') }),
      officiels: [],
    })

    const result = service.validateAssignment(officiel, assignment, match, [])

    assert.isTrue(result.isValid)
    assert.equal(result.errors.length, 0)
  })

  test('should fail when officiel lacks qualification', ({ assert }) => {
    const service = new AssignmentValidationService()
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      qualifications: [OfficielTypeEnum.CHRONOMETREUR], // Missing SECRETAIRE
    })

    const type = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const assignment = Assignment.create({
      matchId: '11111111-1111-1111-1111-111111111111',
      officielId: officiel.id.toString(),
      type,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    })

    const match = Match.create({
      codeRenc: 'CR001',
      date: DateTime.now().plus({ days: 1 }),
      heure: '15:00',
      equipeDomicile: Team.create({ nom: 'Team A', codeFederal: uniqueCode('TEAM_A') }),
      equipeExterieur: Team.create({ nom: 'Team B', codeFederal: uniqueCode('TEAM_B') }),
      officiels: [],
    })

    const result = service.validateAssignment(officiel, assignment, match, [])

    assert.isFalse(result.isValid)
    assert.isTrue(result.errors.some((e) => e.includes("n'a pas la qualification")))
  })

  test('should fail when officiel is not available', ({ assert }) => {
    const service = new AssignmentValidationService()
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE],
    })

    const matchDate = DateTime.now().plus({ days: 1 })
    officiel.setDisponibilite(matchDate.toFormat('yyyy-MM-dd'), false)

    const type = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const assignment = Assignment.create({
      matchId: '11111111-1111-1111-1111-111111111111',
      officielId: officiel.id.toString(),
      type,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    })

    const match = Match.create({
      codeRenc: 'CR001',
      date: matchDate,
      heure: '15:00',
      equipeDomicile: Team.create({ nom: 'Team A', codeFederal: uniqueCode('TEAM_A') }),
      equipeExterieur: Team.create({ nom: 'Team B', codeFederal: uniqueCode('TEAM_B') }),
      officiels: [],
    })

    const result = service.validateAssignment(officiel, assignment, match, [])

    assert.isFalse(result.isValid)
    assert.isTrue(result.errors.some((e) => e.includes("n'est pas disponible")))
  })

  test('should warn about time conflicts for club arbitre', ({ assert }) => {
    const service = new AssignmentValidationService()
    const arbitre = Officiel.create({
      nom: 'Arbitre',
      prenom: 'Jean',
      email: 'jean.arbitre@email.com',
      qualifications: [OfficielTypeEnum.ARBITRE_PRINCIPAL],
      clubId: '33333333-3333-3333-3333-333333333333',
    })

    const type = OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL)
    const assignment = Assignment.createArbitreFromClub({
      matchId: '11111111-1111-1111-1111-111111111111',
      arbitreId: arbitre.id.toString(),
      type,
      assignedBy: 'club-manager',
    })

    const match = Match.create({
      codeRenc: 'CR001',
      date: DateTime.now().plus({ days: 1 }),
      heure: '15:00',
      equipeDomicile: Team.create({ nom: 'Team A', codeFederal: uniqueCode('TEAM_A') }),
      equipeExterieur: Team.create({ nom: 'Team B', codeFederal: uniqueCode('TEAM_B') }),
      officiels: [],
    })

    // Existing assignment for same arbitre
    const conflictingAssignment = Assignment.create({
      matchId: '44444444-4444-4444-4444-444444444444',
      officielId: arbitre.id.toString(),
      type,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    })
    conflictingAssignment.confirm()

    const result = service.validateAssignment(arbitre, assignment, match, [conflictingAssignment])

    assert.isTrue(result.isValid) // Should not be an error for club arbitre
    assert.isTrue(result.hasWarnings)
    assert.isTrue(result.warnings.some((w) => w.includes('assignations en conflit')))
  })

  test('should prevent federation arbitre from same club as teams', ({ assert }) => {
    const service = new AssignmentValidationService()
    const teamA = Team.create({ nom: 'Team A', codeFederal: uniqueCode('TEAM_A') })
    const arbitre = Officiel.create({
      nom: 'Arbitre',
      prenom: 'Jean',
      email: 'jean.arbitre@email.com',
      qualifications: [OfficielTypeEnum.ARBITRE_PRINCIPAL],
      clubId: teamA.id.toString(), // Same club as team A
    })

    const type = OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL)
    const assignment = Assignment.createArbitreFromFederation({
      matchId: '11111111-1111-1111-1111-111111111111',
      arbitreId: arbitre.id.toString(),
      type,
      assignedBy: 'federation',
    })

    const match = Match.create({
      codeRenc: 'CR001',
      date: DateTime.now().plus({ days: 1 }),
      heure: '15:00',
      equipeDomicile: teamA,
      equipeExterieur: Team.create({ nom: 'Team B', codeFederal: uniqueCode('TEAM_B') }),
      officiels: [],
    })

    const result = service.validateAssignment(arbitre, assignment, match, [])

    assert.isFalse(result.isValid)
    assert.isTrue(result.errors.some((e) => e.includes("même club qu'une des équipes")))
  })

  test('should allow club arbitre from same club as teams', ({ assert }) => {
    const service = new AssignmentValidationService()
    const teamA = Team.create({ nom: 'Team A', codeFederal: uniqueCode('TEAM_A') })
    const arbitre = Officiel.create({
      nom: 'Arbitre',
      prenom: 'Jean',
      email: 'jean.arbitre@email.com',
      qualifications: [OfficielTypeEnum.ARBITRE_PRINCIPAL],
      clubId: teamA.id.toString(), // Same club as team A
    })

    const type = OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL)
    const assignment = Assignment.createArbitreFromClub({
      matchId: '11111111-1111-1111-1111-111111111111',
      arbitreId: arbitre.id.toString(),
      type,
      assignedBy: 'club-manager',
    })

    const match = Match.create({
      codeRenc: 'CR001',
      date: DateTime.now().plus({ days: 1 }),
      heure: '15:00',
      equipeDomicile: teamA,
      equipeExterieur: Team.create({ nom: 'Team B', codeFederal: uniqueCode('TEAM_B') }),
      officiels: [],
    })

    const result = service.validateAssignment(arbitre, assignment, match, [])

    assert.isTrue(result.isValid)
    assert.isTrue(result.hasWarnings)
    assert.isTrue(result.warnings.some((w) => w.includes("même club qu'une des équipes")))
  })

  test('should prevent officiel from being assigned to multiple roles on same match', ({
    assert,
  }) => {
    const service = new AssignmentValidationService()
    const officiel = Officiel.create({
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      qualifications: [OfficielTypeEnum.SECRETAIRE, OfficielTypeEnum.CHRONOMETREUR],
    })

    const secretaireType = OfficielType.create(OfficielTypeEnum.SECRETAIRE)
    const chronometreurType = OfficielType.create(OfficielTypeEnum.CHRONOMETREUR)

    const secretaireAssignment = Assignment.create({
      matchId: '11111111-1111-1111-1111-111111111111',
      officielId: officiel.id.toString(),
      type: secretaireType,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    })
    secretaireAssignment.confirm()

    const chronometreurAssignment = Assignment.create({
      matchId: '11111111-1111-1111-1111-111111111111', // Same match
      officielId: officiel.id.toString(),
      type: chronometreurType,
      assignedBy: '22222222-2222-2222-2222-222222222222',
    })

    const match = Match.create({
      codeRenc: 'CR001',
      date: DateTime.now().plus({ days: 1 }),
      heure: '15:00',
      equipeDomicile: Team.create({ nom: 'Team A', codeFederal: uniqueCode('TEAM_A') }),
      equipeExterieur: Team.create({ nom: 'Team B', codeFederal: uniqueCode('TEAM_B') }),
      officiels: [],
    })

    const result = service.validateAssignment(officiel, chronometreurAssignment, match, [
      secretaireAssignment,
    ])

    assert.isFalse(result.isValid)
    assert.isTrue(result.errors.some((e) => e.includes('déjà assigné à ce match')))
  })
})
