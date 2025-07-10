import type { HttpContext } from '@adonisjs/core/http'
import { CreateOfficielUseCase } from '#officiel/application/use_case/create_officiel_use_case'
import { FindAvailableOfficielsUseCase } from '#officiel/application/use_case/find_available_officiels_use_case'
import { inject } from '@adonisjs/core'
import vine from '@vinejs/vine'

@inject()
export default class OfficielsController {
  constructor(
    private createOfficielUseCase: CreateOfficielUseCase,
    private findAvailableOfficielsUseCase: FindAvailableOfficielsUseCase
  ) {}

  /**
   * Créer un nouvel officiel
   */
  async store({ request, response }: HttpContext) {
    const createOfficielSchema = vine.object({
      nom: vine.string().trim().minLength(1),
      prenom: vine.string().trim().minLength(1),
      email: vine.string().email(),
      telephone: vine.string().optional(),
      clubId: vine.string().uuid().optional(),
      qualifications: vine
        .array(
          vine.enum([
            'SECRETAIRE',
            'CHRONOMETREUR',
            'RESPONSABLE_SALLE',
            'TUTEUR_TABLE',
            'TUTEUR_JUGE_ARBITRE',
            'ARBITRE_PRINCIPAL',
            'ARBITRE_ASSISTANT',
          ])
        )
        .optional(),
    })

    try {
      const payload = await request.validateUsing(createOfficielSchema)

      const result = await this.createOfficielUseCase.execute({
        nom: payload.nom,
        prenom: payload.prenom,
        email: payload.email,
        telephone: payload.telephone,
        clubId: payload.clubId,
        qualifications: payload.qualifications as any,
      })

      if (!result.success) {
        return response.badRequest({
          errors: result.errors,
        })
      }

      return response.created({
        success: true,
        data: {
          id: result.officielId,
        },
      })
    } catch (error) {
      return response.badRequest({
        errors: ['Données invalides', error.message],
      })
    }
  }

  /**
   * Trouver les officiels disponibles
   */
  async findAvailable({ request, response }: HttpContext) {
    const findAvailableSchema = vine.object({
      date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      qualification: vine
        .enum([
          'SECRETAIRE',
          'CHRONOMETREUR',
          'RESPONSABLE_SALLE',
          'TUTEUR_TABLE',
          'TUTEUR_JUGE_ARBITRE',
          'ARBITRE_PRINCIPAL',
          'ARBITRE_ASSISTANT',
        ])
        .optional(),
      excludeClubId: vine.string().uuid().optional(),
    })

    try {
      const payload = await request.validateUsing(findAvailableSchema)

      const result = await this.findAvailableOfficielsUseCase.execute({
        date: payload.date,
        qualification: payload.qualification as any,
        excludeClubId: payload.excludeClubId,
      })

      if (!result.success) {
        return response.badRequest({
          errors: result.errors,
        })
      }

      return response.ok({
        success: true,
        data: {
          officiels: result.availableOfficiels.map((item) => ({
            officiel: {
              id: item.officiel.id.toString(),
              nom: item.officiel.nom,
              prenom: item.officiel.prenom,
              email: item.officiel.email,
              telephone: item.officiel.telephone,
              clubId: item.officiel.clubId,
              qualifications: item.officiel.qualifications.map((q) => q.value),
            },
            hasConflicts: item.hasConflicts,
            conflictDetails: item.conflictDetails,
          })),
        },
      })
    } catch (error) {
      return response.badRequest({
        errors: ['Paramètres invalides', error.message],
      })
    }
  }
}
