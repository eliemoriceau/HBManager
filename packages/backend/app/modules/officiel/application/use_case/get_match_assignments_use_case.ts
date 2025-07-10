import { inject } from '@adonisjs/core'
import { AssignmentRepository } from '#officiel/domain/repository/assignment_repository'
import { OfficielRepository } from '#officiel/domain/repository/officiel_repository'
import { OfficielAssignmentRepository } from '#officiel/domain/repository/officiel_assignment_repository'
import { Assignment } from '#officiel/domain/entity/assignment'
import { Officiel } from '#officiel/domain/entity/officiel'

export interface AssignmentWithOfficiel {
  assignment: Assignment
  officiel: Officiel
}

export interface GetMatchAssignmentsRequest {
  matchId: string
}

export interface GetMatchAssignmentsResponse {
  success: boolean
  assignments: AssignmentWithOfficiel[]
  isComplete: boolean
  missingRequiredTypes: string[]
  canStartMatch: boolean
  errors: string[]
}

@inject()
export class GetMatchAssignmentsUseCase {
  constructor(
    private assignmentRepository: AssignmentRepository,
    private officielRepository: OfficielRepository,
    private officielAssignmentRepository: OfficielAssignmentRepository
  ) {}

  async execute(request: GetMatchAssignmentsRequest): Promise<GetMatchAssignmentsResponse> {
    try {
      // 1. Récupérer toutes les assignations du match
      const assignments = await this.assignmentRepository.findByMatch(request.matchId)

      // 2. Récupérer les informations des officiels pour chaque assignation
      const assignmentsWithOfficiels: AssignmentWithOfficiel[] = []
      for (const assignment of assignments) {
        const officiel = await this.officielRepository.findById(assignment.officielId.toString())
        if (officiel) {
          assignmentsWithOfficiels.push({
            assignment,
            officiel,
          })
        }
      }

      // 3. Récupérer l'agrégat d'assignations pour analyser la complétude
      const officielAssignment = await this.officielAssignmentRepository.findByMatch(
        request.matchId
      )

      let isComplete = false
      let missingRequiredTypes: string[] = []
      let canStartMatch = false

      if (officielAssignment) {
        isComplete = officielAssignment.isComplete()
        missingRequiredTypes = officielAssignment
          .getMissingRequiredTypes()
          .map((type) => type.value)
        canStartMatch = officielAssignment.canStartMatch()
      } else {
        // Si pas d'agrégat, tous les types requis sont manquants
        missingRequiredTypes = [
          'SECRETAIRE',
          'CHRONOMETREUR',
          'RESPONSABLE_SALLE',
          'ARBITRE_PRINCIPAL',
        ]
      }

      return {
        success: true,
        assignments: assignmentsWithOfficiels,
        isComplete,
        missingRequiredTypes,
        canStartMatch,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        assignments: [],
        isComplete: false,
        missingRequiredTypes: [],
        canStartMatch: false,
        errors: [`Erreur lors de la récupération des assignations: ${error.message}`],
      }
    }
  }
}
