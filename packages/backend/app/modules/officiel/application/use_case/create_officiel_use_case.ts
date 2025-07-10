import { OfficielRepository } from '#officiel/domain/repository/officiel_repository'
import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import { inject } from '@adonisjs/core'

export interface CreateOfficielRequest {
  nom: string
  prenom: string
  email: string
  telephone?: string
  clubId?: string
  qualifications?: OfficielTypeEnum[]
}

export interface CreateOfficielResponse {
  success: boolean
  officielId?: string
  errors: string[]
}

@inject()
export class CreateOfficielUseCase {
  constructor(private officielRepository: OfficielRepository) {}

  async execute(request: CreateOfficielRequest): Promise<CreateOfficielResponse> {
    try {
      // 1. Vérifier que l'email n'est pas déjà utilisé
      const existingOfficiel = await this.officielRepository.findByEmail(request.email)
      if (existingOfficiel) {
        return {
          success: false,
          errors: ['Un officiel avec cet email existe déjà'],
        }
      }

      // 2. Valider les données de base
      if (!request.nom.trim()) {
        return {
          success: false,
          errors: ['Le nom est requis'],
        }
      }

      if (!request.prenom.trim()) {
        return {
          success: false,
          errors: ['Le prénom est requis'],
        }
      }

      if (!request.email.trim() || !this.isValidEmail(request.email)) {
        return {
          success: false,
          errors: ['Un email valide est requis'],
        }
      }

      // 3. Créer l'officiel
      const officiel = Officiel.create({
        nom: request.nom.trim(),
        prenom: request.prenom.trim(),
        email: request.email.trim().toLowerCase(),
        telephone: request.telephone?.trim(),
        clubId: request.clubId,
        qualifications: request.qualifications || [],
      })

      // 4. Sauvegarder l'officiel
      await this.officielRepository.save(officiel)

      return {
        success: true,
        officielId: officiel.id.toString(),
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Erreur lors de la création de l'officiel: ${error.message}`],
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
