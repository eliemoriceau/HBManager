import { OfficielRepository } from '#officiel/domain/repository/officiel_repository'
import { AssignmentRepository } from '#officiel/domain/repository/assignment_repository'
import { OfficielAssignmentRepository } from '#officiel/domain/repository/officiel_assignment_repository'
import { AssignmentValidationService } from '#officiel/service/assignment_validation_service'
import { Assignment } from '#officiel/domain/entity/assignment'
import { OfficielAssignment } from '#officiel/domain/entity/officiel_assignment'
import { OfficielType } from '#officiel/domain/value_object/officiel_type'
import { inject } from '@adonisjs/core'

export interface AssignOfficielToMatchRequest {
  matchId: string
  officielId: string
  type: string
  assignedBy: string
  notes?: string
}

export interface AssignOfficielToMatchResponse {
  success: boolean
  assignmentId?: string
  errors: string[]
  warnings: string[]
}

@inject()
export class AssignOfficielToMatchUseCase {
  constructor(
    private officielRepository: OfficielRepository,
    private assignmentRepository: AssignmentRepository,
    private officielAssignmentRepository: OfficielAssignmentRepository,
    private validationService: AssignmentValidationService
  ) {}

  async execute(request: AssignOfficielToMatchRequest): Promise<AssignOfficielToMatchResponse> {
    try {
      // 1. Vérifier que l'officiel existe
      const officiel = await this.officielRepository.findById(request.officielId)
      if (!officiel) {
        return {
          success: false,
          errors: ['Officiel non trouvé'],
          warnings: [],
        }
      }

      // 2. Créer le type d'officiel
      const type = OfficielType.create(request.type as any)

      // 3. Créer l'assignation
      const assignment = Assignment.create({
        matchId: request.matchId,
        officielId: request.officielId,
        type,
        assignedBy: request.assignedBy,
        notes: request.notes,
      })

      // 4. Récupérer les assignations existantes pour ce match
      const existingAssignments = await this.assignmentRepository.findByMatch(request.matchId)

      // 5. Valider l'assignation
      // Pour la validation, nous avons besoin du match, mais nous ne l'avons pas dans ce use case
      // Nous pourrions soit l'ajouter en paramètre, soit créer un service qui va le chercher
      // Pour l'instant, on fait une validation basique sans le match
      const basicValidation = this.validationService.validateAssignment(
        officiel,
        assignment,
        null as any, // TODO: ajouter le match
        existingAssignments
      )

      if (!basicValidation.isValid) {
        return {
          success: false,
          errors: basicValidation.errors,
          warnings: basicValidation.warnings,
        }
      }

      // 6. Sauvegarder l'assignation
      await this.assignmentRepository.save(assignment)

      // 7. Mettre à jour ou créer l'agrégat d'assignations du match
      let officielAssignment = await this.officielAssignmentRepository.findByMatch(request.matchId)
      if (!officielAssignment) {
        officielAssignment = OfficielAssignment.create({ matchId: request.matchId })
      }

      try {
        officielAssignment.addAssignment(assignment)
        await this.officielAssignmentRepository.save(officielAssignment)
      } catch (error) {
        // Si l'ajout échoue (ex: doublon), supprimer l'assignation et retourner l'erreur
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
        warnings: basicValidation.warnings,
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Erreur lors de l'assignation: ${error.message}`],
        warnings: [],
      }
    }
  }
}
