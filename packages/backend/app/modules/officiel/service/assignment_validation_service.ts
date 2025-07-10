import { Officiel } from '#officiel/domain/entity/officiel'
import { Assignment } from '#officiel/domain/entity/assignment'
import Match from '#match/domain/entity/match'

export interface AssignmentValidationResult {
  isValid: boolean
  hasWarnings: boolean
  errors: string[]
  warnings: string[]
}

export class AssignmentValidationService {
  validateAssignment(
    officiel: Officiel,
    assignment: Assignment,
    match: Match,
    existingAssignments: Assignment[]
  ): AssignmentValidationResult {
    const result: AssignmentValidationResult = {
      isValid: true,
      hasWarnings: false,
      errors: [],
      warnings: [],
    }

    // 1. Vérifier les qualifications
    this.validateQualifications(officiel, assignment, result)

    // 2. Vérifier la disponibilité
    this.validateAvailability(officiel, match, result)

    // 3. Vérifier les conflits de temps et clubs selon le type d'assignation
    this.validateConflicts(officiel, assignment, match, existingAssignments, result)

    // 4. Vérifier qu'il n'y a pas de multiples rôles sur le même match
    this.validateSingleRolePerMatch(assignment, existingAssignments, result)

    return result
  }

  private validateQualifications(
    officiel: Officiel,
    assignment: Assignment,
    result: AssignmentValidationResult
  ): void {
    if (!officiel.hasQualification(assignment.type)) {
      result.isValid = false
      result.errors.push(
        `L'officiel ${officiel.nom} ${officiel.prenom} n'a pas la qualification ${assignment.type.value}`
      )
    }
  }

  private validateAvailability(
    officiel: Officiel,
    match: Match,
    result: AssignmentValidationResult
  ): void {
    const matchDateStr = match.date.toFormat('yyyy-MM-dd')
    if (!officiel.isAvailable(matchDateStr)) {
      result.isValid = false
      result.errors.push(
        `L'officiel ${officiel.nom} ${officiel.prenom} n'est pas disponible le ${matchDateStr}`
      )
    }
  }

  private validateConflicts(
    officiel: Officiel,
    assignment: Assignment,
    match: Match,
    existingAssignments: Assignment[],
    result: AssignmentValidationResult
  ): void {
    // Vérifier les conflits de temps avec d'autres assignations
    this.validateTimeConflicts(officiel, assignment, existingAssignments, result)

    // Vérifier les conflits de club selon le type d'arbitre
    if (assignment.type.isArbitre()) {
      this.validateClubConflicts(officiel, assignment, match, result)
    }
  }

  private validateTimeConflicts(
    officiel: Officiel,
    assignment: Assignment,
    existingAssignments: Assignment[],
    result: AssignmentValidationResult
  ): void {
    const conflictingAssignments = existingAssignments.filter(
      (existing) =>
        existing.officielId.toString() === officiel.id.toString() &&
        existing.matchId.toString() !== assignment.matchId.toString() &&
        existing.isActive()
    )

    if (conflictingAssignments.length > 0) {
      if (assignment.requiresStrictValidation()) {
        // Pour les arbitres de fédération, c'est une erreur
        result.isValid = false
        result.errors.push(
          `L'arbitre ${officiel.nom} ${officiel.prenom} a des assignations en conflit`
        )
      } else {
        // Pour les arbitres de club, c'est un avertissement
        result.hasWarnings = true
        result.warnings.push(
          `L'arbitre ${officiel.nom} ${officiel.prenom} a des assignations en conflit`
        )
      }
    }
  }

  private validateClubConflicts(
    officiel: Officiel,
    assignment: Assignment,
    match: Match,
    result: AssignmentValidationResult
  ): void {
    if (!officiel.clubId) {
      return // Pas de conflit possible si l'arbitre n'a pas de club
    }

    const sameClubAsTeam =
      match.equipeDomicile.id.toString() === officiel.clubId ||
      match.equipeExterieur.id.toString() === officiel.clubId

    if (sameClubAsTeam) {
      if (assignment.requiresStrictValidation()) {
        // Pour les arbitres de fédération, interdiction stricte
        result.isValid = false
        result.errors.push(
          `L'arbitre ${officiel.nom} ${officiel.prenom} est du même club qu'une des équipes`
        )
      } else {
        // Pour les arbitres de club, avertissement seulement
        result.hasWarnings = true
        result.warnings.push(
          `L'arbitre ${officiel.nom} ${officiel.prenom} est du même club qu'une des équipes`
        )
      }
    }
  }

  private validateSingleRolePerMatch(
    assignment: Assignment,
    existingAssignments: Assignment[],
    result: AssignmentValidationResult
  ): void {
    const conflictingAssignment = existingAssignments.find(
      (existing) =>
        existing.officielId.toString() === assignment.officielId.toString() &&
        existing.matchId.toString() === assignment.matchId.toString() &&
        existing.isActive()
    )

    if (conflictingAssignment) {
      result.isValid = false
      result.errors.push(
        `L'officiel est déjà assigné à ce match pour le rôle ${conflictingAssignment.type.value}`
      )
    }
  }
}
