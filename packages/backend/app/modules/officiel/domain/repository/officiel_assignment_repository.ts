import { OfficielAssignment } from '#officiel/domain/entity/officiel_assignment'

export abstract class OfficielAssignmentRepository {
  /**
   * Trouve un agrégat d'assignations par son identifiant
   */
  abstract findById(id: string): Promise<OfficielAssignment | null>

  /**
   * Trouve un agrégat d'assignations par identifiant de match
   */
  abstract findByMatch(matchId: string): Promise<OfficielAssignment | null>

  /**
   * Trouve tous les agrégats d'assignations incomplets
   */
  abstract findIncomplete(): Promise<OfficielAssignment[]>

  /**
   * Trouve tous les agrégats d'assignations complets
   */
  abstract findComplete(): Promise<OfficielAssignment[]>

  /**
   * Trouve tous les agrégats d'assignations prêts pour le match
   */
  abstract findReadyForMatch(): Promise<OfficielAssignment[]>

  /**
   * Trouve tous les agrégats d'assignations par période
   */
  abstract findByPeriod(startDate: string, endDate: string): Promise<OfficielAssignment[]>

  /**
   * Vérifie si un match a des assignations
   */
  abstract existsForMatch(matchId: string): Promise<boolean>

  /**
   * Sauvegarde un agrégat d'assignations
   */
  abstract save(officielAssignment: OfficielAssignment): Promise<void>

  /**
   * Supprime un agrégat d'assignations
   */
  abstract delete(id: string): Promise<void>

  /**
   * Liste tous les agrégats d'assignations avec pagination
   */
  abstract findAll(
    page?: number,
    limit?: number
  ): Promise<{
    data: OfficielAssignment[]
    total: number
    page: number
    limit: number
  }>
}
