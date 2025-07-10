import { inject } from '@adonisjs/core'
import { AssignmentRepository } from '#officiel/domain/repository/assignment_repository'
import { OfficielAssignmentRepository } from '#officiel/domain/repository/officiel_assignment_repository'

export interface ConfirmAssignmentRequest {
  assignmentId: string
  confirmedBy: string
}

export interface ConfirmAssignmentResponse {
  success: boolean
  errors: string[]
}

@inject()
export class ConfirmAssignmentUseCase {
  constructor(
    private assignmentRepository: AssignmentRepository,
    private officielAssignmentRepository: OfficielAssignmentRepository
  ) {}

  async execute(request: ConfirmAssignmentRequest): Promise<ConfirmAssignmentResponse> {
    try {
      // 1. Récupérer l'assignation
      const assignment = await this.assignmentRepository.findById(request.assignmentId)
      if (!assignment) {
        return {
          success: false,
          errors: ['Assignation non trouvée'],
        }
      }

      // 2. Vérifier que l'assignation peut être confirmée
      if (!assignment.status.canTransitionTo('CONFIRMED' as any)) {
        return {
          success: false,
          errors: ['Cette assignation ne peut pas être confirmée dans son état actuel'],
        }
      }

      // 3. Confirmer l'assignation
      assignment.confirm()

      // 4. Sauvegarder l'assignation
      await this.assignmentRepository.save(assignment)

      // 5. Mettre à jour l'agrégat d'assignations
      const officielAssignment = await this.officielAssignmentRepository.findByMatch(
        assignment.matchId.toString()
      )
      if (officielAssignment) {
        await this.officielAssignmentRepository.save(officielAssignment)
      }

      return {
        success: true,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Erreur lors de la confirmation: ${error.message}`],
      }
    }
  }
}
