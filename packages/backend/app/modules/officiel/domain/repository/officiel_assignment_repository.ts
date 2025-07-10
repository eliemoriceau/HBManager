import { OfficielAssignment } from '#officiel/domain/entity/officiel_assignment'

export interface OfficielAssignmentRepository {
  /**
   * Trouve un agrégat d'assignations par son identifiant
   */
  findById(id: string): Promise<OfficielAssignment | null>

  /**
   * Trouve un agrégat d'assignations par identifiant de match
   */
  findByMatch(matchId: string): Promise<OfficielAssignment | null>

  /**
   * Trouve tous les agrégats d'assignations incomplets
   */
  findIncomplete(): Promise<OfficielAssignment[]>

  /**
   * Trouve tous les agrégats d'assignations complets
   */
  findComplete(): Promise<OfficielAssignment[]>

  /**
   * Trouve tous les agrégats d'assignations prêts pour le match
   */
  findReadyForMatch(): Promise<OfficielAssignment[]>

  /**
   * Trouve tous les agrégats d'assignations par période
   */
  findByPeriod(startDate: string, endDate: string): Promise<OfficielAssignment[]>

  /**
   * Vérifie si un match a des assignations
   */
  existsForMatch(matchId: string): Promise<boolean>

  /**
   * Sauvegarde un agrégat d'assignations
   */
  save(officielAssignment: OfficielAssignment): Promise<void>

  /**
   * Supprime un agrégat d'assignations
   */
  delete(id: string): Promise<void>

  /**
   * Liste tous les agrégats d'assignations avec pagination
   */
  findAll(
    page?: number,
    limit?: number
  ): Promise<{
    data: OfficielAssignment[]
    total: number
    page: number
    limit: number
  }>
}
