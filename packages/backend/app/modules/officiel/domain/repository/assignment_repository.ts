import { Assignment } from '#officiel/domain/entity/assignment'
import { AssignmentStatusEnum } from '#officiel/domain/value_object/assignment_status'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

export interface AssignmentRepository {
  /**
   * Trouve une assignation par son identifiant
   */
  findById(id: string): Promise<Assignment | null>

  /**
   * Trouve toutes les assignations d'un match
   */
  findByMatch(matchId: string): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un officiel
   */
  findByOfficiel(officielId: string): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations actives d'un officiel
   */
  findActiveByOfficiel(officielId: string): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un officiel dans une période donnée
   */
  findByOfficielInPeriod(
    officielId: string,
    startDate: string,
    endDate: string
  ): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un match par statut
   */
  findByMatchAndStatus(matchId: string, status: AssignmentStatusEnum): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un type spécifique
   */
  findByType(type: OfficielTypeEnum): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations en attente
   */
  findPending(): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations en attente pour un officiel
   */
  findPendingByOfficiel(officielId: string): Promise<Assignment[]>

  /**
   * Vérifie s'il existe une assignation active pour un officiel sur un match
   */
  existsActiveAssignmentForOfficielOnMatch(officielId: string, matchId: string): Promise<boolean>

  /**
   * Sauvegarde une assignation
   */
  save(assignment: Assignment): Promise<void>

  /**
   * Supprime une assignation
   */
  delete(id: string): Promise<void>

  /**
   * Liste toutes les assignations avec pagination
   */
  findAll(
    page?: number,
    limit?: number
  ): Promise<{
    data: Assignment[]
    total: number
    page: number
    limit: number
  }>
}
