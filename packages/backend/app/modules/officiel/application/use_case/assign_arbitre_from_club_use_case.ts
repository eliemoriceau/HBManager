import { inject } from '@adonisjs/core'
import { OfficielRepository } from '#officiel/domain/repository/officiel_repository'
import { AssignmentRepository } from '#officiel/domain/repository/assignment_repository'
import { OfficielAssignmentRepository } from '#officiel/domain/repository/officiel_assignment_repository'
import { AssignmentValidationService } from '#officiel/service/assignment_validation_service'
import { Assignment } from '#officiel/domain/entity/assignment'
import { OfficielAssignment } from '#officiel/domain/entity/officiel_assignment'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

export interface AssignArbitreFromClubRequest {
  matchId: string
  arbitreId: string
  type: OfficielTypeEnum.ARBITRE_PRINCIPAL | OfficielTypeEnum.ARBITRE_ASSISTANT
  assignedBy: string
  notes?: string
}

export interface AssignArbitreFromClubResponse {
  success: boolean
  assignmentId?: string
  errors: string[]
  warnings: string[]
}

@inject()
export class AssignArbitreFromClubUseCase {
  constructor(
    private officielRepository: OfficielRepository,
    private assignmentRepository: AssignmentRepository,
    private officielAssignmentRepository: OfficielAssignmentRepository,
    private validationService: AssignmentValidationService
  ) {}

  async execute(request: AssignArbitreFromClubRequest): Promise<AssignArbitreFromClubResponse> {
    try {
      // 1. Vérifier que l'arbitre existe
      const arbitre = await this.officielRepository.findById(request.arbitreId)
      if (!arbitre) {
        return {
          success: false,
          errors: ['Arbitre non trouvé'],
          warnings: [],
        }
      }

      // 2. Créer le type d'arbitre
      const type = OfficielType.create(request.type)

      // 3. Vérifier que l'arbitre a les qualifications (règles assouplies pour les clubs)
      if (!arbitre.hasQualification(type)) {
        // Pour les arbitres de club, on peut être plus flexible
        // mais on avertit quand même
        return {
          success: false,
          errors: [],
          warnings: [
            `L'arbitre n'a pas officiellement la qualification ${request.type}, mais peut être assigné par le club hôte`,
          ],
        }
      }

      // 4. Créer l'assignation d'arbitre de club (en attente de confirmation)
      const assignment = Assignment.createArbitreFromClub({
        matchId: request.matchId,
        arbitreId: request.arbitreId,
        type,
        assignedBy: request.assignedBy,
        notes: request.notes,
      })

      // 5. Récupérer les assignations existantes pour validation
      const existingAssignments = await this.assignmentRepository.findByMatch(request.matchId)

      // 6. Valider l'assignation avec les règles assouplies pour les clubs
      const validation = this.validationService.validateAssignment(
        arbitre,
        assignment,
        null as any, // TODO: ajouter le match pour validation complète
        existingAssignments
      )

      // Pour les arbitres de club, on accepte même s'il y a des warnings
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
        }
      }

      // 7. Sauvegarder l'assignation
      await this.assignmentRepository.save(assignment)

      // 8. Mettre à jour l'agrégat d'assignations du match
      let officielAssignment = await this.officielAssignmentRepository.findByMatch(request.matchId)
      if (!officielAssignment) {
        officielAssignment = OfficielAssignment.create({ matchId: request.matchId })
      }

      try {
        officielAssignment.addAssignment(assignment)
        await this.officielAssignmentRepository.save(officielAssignment)
      } catch (error) {
        // Rollback en cas d'erreur
        await this.assignmentRepository.delete(assignment.id.toString())
        return {
          success: false,
          errors: [error.message],
          warnings: [],
        }
      }

      return {
        success: true,
        assignmentId: assignment.id.toString(),
        errors: [],
        warnings: validation.warnings,
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Erreur lors de l'assignation de l'arbitre: ${error.message}`],
        warnings: [],
      }
    }
  }
}
