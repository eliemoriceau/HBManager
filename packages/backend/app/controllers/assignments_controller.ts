import type { HttpContext } from '@adonisjs/core/http'
import { AssignOfficielToMatchUseCase } from '#officiel/application/use_case/assign_officiel_to_match_use_case'
import { AssignArbitreFromFederationUseCase } from '#officiel/application/use_case/assign_arbitre_from_federation_use_case'
import { AssignArbitreFromClubUseCase } from '#officiel/application/use_case/assign_arbitre_from_club_use_case'
import { ConfirmAssignmentUseCase } from '#officiel/application/use_case/confirm_assignment_use_case'
import { GetMatchAssignmentsUseCase } from '#officiel/application/use_case/get_match_assignments_use_case'
import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'

@inject()
export default class AssignmentsController {
  constructor(
    private assignOfficielUseCase: AssignOfficielToMatchUseCase,
    private assignArbitreFromFederationUseCase: AssignArbitreFromFederationUseCase,
    private assignArbitreFromClubUseCase: AssignArbitreFromClubUseCase,
    private confirmAssignmentUseCase: ConfirmAssignmentUseCase,
    private getMatchAssignmentsUseCase: GetMatchAssignmentsUseCase
  ) {}

  /**
   * Assigner un officiel à un match
   */
  async assignOfficiel({ request, response }: HttpContext) {
    const assignOfficielSchema = vine.object({
      matchId: vine.string().uuid(),
      officielId: vine.string().uuid(),
      type: vine.enum([
        'SECRETAIRE',
        'CHRONOMETREUR',
        'RESPONSABLE_SALLE',
        'TUTEUR_TABLE',
        'TUTEUR_JUGE_ARBITRE',
        'ARBITRE_PRINCIPAL',
        'ARBITRE_ASSISTANT',
      ]),
      notes: vine.string().optional(),
    })

    try {
      const payload = await request.validateUsing(assignOfficielSchema)
      const assignedBy = 'current-user' // TODO: récupérer depuis l'auth

      const result = await this.assignOfficielUseCase.execute({
        matchId: payload.matchId,
        officielId: payload.officielId,
        type: payload.type,
        assignedBy,
        notes: payload.notes,
      })

      if (!result.success) {
        return response.badRequest({
          errors: result.errors,
          warnings: result.warnings,
        })
      }

      return response.created({
        success: true,
        data: {
          assignmentId: result.assignmentId,
        },
        warnings: result.warnings,
      })
    } catch (error) {
      return response.badRequest({
        errors: ['Données invalides', error.message],
      })
    }
  }

  /**
   * Assigner un arbitre depuis la fédération
   */
  async assignArbitreFromFederation({ request, response }: HttpContext) {
    const assignArbitreSchema = vine.object({
      matchId: vine.string().uuid(),
      arbitreId: vine.string().uuid(),
      type: vine.enum(['ARBITRE_PRINCIPAL', 'ARBITRE_ASSISTANT']),
      notes: vine.string().optional(),
    })

    try {
      const payload = await request.validateUsing(assignArbitreSchema)
      const assignedBy = 'federation' // TODO: récupérer depuis l'auth

      const result = await this.assignArbitreFromFederationUseCase.execute({
        matchId: payload.matchId,
        arbitreId: payload.arbitreId,
        type: payload.type as any,
        assignedBy,
        notes: payload.notes,
      })

      if (!result.success) {
        return response.badRequest({
          errors: result.errors,
          warnings: result.warnings,
        })
      }

      return response.created({
        success: true,
        data: {
          assignmentId: result.assignmentId,
        },
        warnings: result.warnings,
      })
    } catch (error) {
      return response.badRequest({
        errors: ['Données invalides', error.message],
      })
    }
  }

  /**
   * Assigner un arbitre depuis un club
   */
  async assignArbitreFromClub({ request, response }: HttpContext) {
    const assignArbitreSchema = vine.object({
      matchId: vine.string().uuid(),
      arbitreId: vine.string().uuid(),
      type: vine.enum(['ARBITRE_PRINCIPAL', 'ARBITRE_ASSISTANT']),
      notes: vine.string().optional(),
    })

    try {
      const payload = await request.validateUsing(assignArbitreSchema)
      const assignedBy = 'club' // TODO: récupérer depuis l'auth

      const result = await this.assignArbitreFromClubUseCase.execute({
        matchId: payload.matchId,
        arbitreId: payload.arbitreId,
        type: payload.type as any,
        assignedBy,
        notes: payload.notes,
      })

      if (!result.success) {
        return response.badRequest({
          errors: result.errors,
          warnings: result.warnings,
        })
      }

      return response.created({
        success: true,
        data: {
          assignmentId: result.assignmentId,
        },
        warnings: result.warnings,
      })
    } catch (error) {
      return response.badRequest({
        errors: ['Données invalides', error.message],
      })
    }
  }

  /**
   * Confirmer une assignation
   */
  async confirm({ params, response }: HttpContext) {
    try {
      const assignmentId = params.id
      const confirmedBy = 'current-user' // TODO: récupérer depuis l'auth

      const result = await this.confirmAssignmentUseCase.execute({
        assignmentId,
        confirmedBy,
      })

      if (!result.success) {
        return response.badRequest({
          errors: result.errors,
        })
      }

      return response.ok({
        success: true,
      })
    } catch (error) {
      return response.badRequest({
        errors: ['Erreur lors de la confirmation', error.message],
      })
    }
  }

  /**
   * Récupérer les assignations d'un match
   */
  async getMatchAssignments({ params, response }: HttpContext) {
    try {
      const matchId = params.matchId

      const result = await this.getMatchAssignmentsUseCase.execute({
        matchId,
      })

      if (!result.success) {
        return response.badRequest({
          errors: result.errors,
        })
      }

      return response.ok({
        success: true,
        data: {
          assignments: result.assignments.map((item) => ({
            assignment: {
              id: item.assignment.id.toString(),
              type: item.assignment.type.value,
              status: item.assignment.status.value,
              source: item.assignment.source.value,
              dateAssignment: item.assignment.dateAssignment.toISO(),
              notes: item.assignment.notes,
            },
            officiel: {
              id: item.officiel.id.toString(),
              nom: item.officiel.nom,
              prenom: item.officiel.prenom,
              email: item.officiel.email,
              telephone: item.officiel.telephone,
              clubId: item.officiel.clubId,
            },
          })),
          isComplete: result.isComplete,
          missingRequiredTypes: result.missingRequiredTypes,
          canStartMatch: result.canStartMatch,
        },
      })
    } catch (error) {
      return response.badRequest({
        errors: ['Erreur lors de la récupération', error.message],
      })
    }
  }
}
