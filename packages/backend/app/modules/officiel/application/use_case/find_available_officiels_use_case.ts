import { inject } from '@adonisjs/core'
import { OfficielRepository } from '#officiel/domain/repository/officiel_repository'
import { AssignmentRepository } from '#officiel/domain/repository/assignment_repository'
import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

export interface FindAvailableOfficielsRequest {
  date: string
  qualification?: OfficielTypeEnum
  excludeClubId?: string
}

export interface OfficielAvailability {
  officiel: Officiel
  hasConflicts: boolean
  conflictDetails: string[]
}

export interface FindAvailableOfficielsResponse {
  success: boolean
  availableOfficiels: OfficielAvailability[]
  errors: string[]
}

@inject()
export class FindAvailableOfficielsUseCase {
  constructor(
    private officielRepository: OfficielRepository,
    private assignmentRepository: AssignmentRepository
  ) {}

  async execute(request: FindAvailableOfficielsRequest): Promise<FindAvailableOfficielsResponse> {
    try {
      let officiels: Officiel[] = []

      // 1. Récupérer les officiels selon les critères
      if (request.qualification) {
        officiels = await this.officielRepository.findAvailableWithQualification(
          request.qualification,
          request.date
        )
      } else {
        officiels = await this.officielRepository.findAvailableOn(request.date)
      }

      // 2. Exclure les officiels du club spécifié si demandé
      if (request.excludeClubId) {
        officiels = officiels.filter((officiel) => officiel.clubId !== request.excludeClubId)
      }

      // 3. Vérifier les conflits pour chaque officiel
      const availableOfficiels: OfficielAvailability[] = []

      for (const officiel of officiels) {
        const conflicts: string[] = []

        // Vérifier les assignations existantes à la même date
        const existingAssignments = await this.assignmentRepository.findByOfficielInPeriod(
          officiel.id.toString(),
          request.date,
          request.date
        )

        const activeAssignments = existingAssignments.filter((a) => a.isActive())

        if (activeAssignments.length > 0) {
          conflicts.push(`${activeAssignments.length} assignation(s) confirmée(s) ce jour`)
        }

        availableOfficiels.push({
          officiel,
          hasConflicts: conflicts.length > 0,
          conflictDetails: conflicts,
        })
      }

      // 4. Trier par disponibilité (sans conflits en premier)
      availableOfficiels.sort((a, b) => {
        if (a.hasConflicts && !b.hasConflicts) return 1
        if (!a.hasConflicts && b.hasConflicts) return -1
        return 0
      })

      return {
        success: true,
        availableOfficiels,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        availableOfficiels: [],
        errors: [`Erreur lors de la recherche d'officiels disponibles: ${error.message}`],
      }
    }
  }
}
