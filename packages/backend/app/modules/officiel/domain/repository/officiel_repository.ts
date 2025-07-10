import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

export interface OfficielRepository {
  /**
   * Trouve un officiel par son identifiant
   */
  findById(id: string): Promise<Officiel | null>

  /**
   * Trouve un officiel par son email
   */
  findByEmail(email: string): Promise<Officiel | null>

  /**
   * Trouve tous les officiels ayant une qualification spécifique
   */
  findByQualification(qualification: OfficielTypeEnum): Promise<Officiel[]>

  /**
   * Trouve tous les officiels disponibles à une date donnée
   */
  findAvailableOn(date: string): Promise<Officiel[]>

  /**
   * Trouve tous les officiels d'un club donné
   */
  findByClub(clubId: string): Promise<Officiel[]>

  /**
   * Trouve tous les officiels ayant une qualification et disponibles à une date
   */
  findAvailableWithQualification(qualification: OfficielTypeEnum, date: string): Promise<Officiel[]>

  /**
   * Sauvegarde un officiel
   */
  save(officiel: Officiel): Promise<void>

  /**
   * Supprime un officiel
   */
  delete(id: string): Promise<void>

  /**
   * Liste tous les officiels avec pagination
   */
  findAll(
    page?: number,
    limit?: number
  ): Promise<{
    data: Officiel[]
    total: number
    page: number
    limit: number
  }>
}
