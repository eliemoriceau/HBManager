import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

export abstract class OfficielRepository {
  /**
   * Trouve un officiel par son identifiant
   */
  abstract findById(id: string): Promise<Officiel | null>

  /**
   * Trouve un officiel par son email
   */
  abstract findByEmail(email: string): Promise<Officiel | null>

  /**
   * Trouve tous les officiels ayant une qualification spécifique
   */
  abstract findByQualification(qualification: OfficielTypeEnum): Promise<Officiel[]>

  /**
   * Trouve tous les officiels disponibles à une date donnée
   */
  abstract findAvailableOn(date: string): Promise<Officiel[]>

  /**
   * Trouve tous les officiels d'un club donné
   */
  abstract findByClub(clubId: string): Promise<Officiel[]>

  /**
   * Trouve tous les officiels ayant une qualification et disponibles à une date
   */
  abstract findAvailableWithQualification(
    qualification: OfficielTypeEnum,
    date: string
  ): Promise<Officiel[]>

  /**
   * Sauvegarde un officiel
   */
  abstract save(officiel: Officiel): Promise<void>

  /**
   * Supprime un officiel
   */
  abstract delete(id: string): Promise<void>

  /**
   * Liste tous les officiels avec pagination
   */
  abstract findAll(
    page?: number,
    limit?: number
  ): Promise<{
    data: Officiel[]
    total: number
    page: number
    limit: number
  }>
}
