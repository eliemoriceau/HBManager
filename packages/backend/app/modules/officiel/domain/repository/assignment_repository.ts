import { Assignment } from '#officiel/domain/entity/assignment'
import { AssignmentStatusEnum } from '#officiel/domain/value_object/assignment_status'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'

export abstract class AssignmentRepository {
  /**
   * Trouve une assignation par son identifiant
   */
  abstract findById(id: string): Promise<Assignment | null>

  /**
   * Trouve toutes les assignations d'un match
   */
  abstract findByMatch(matchId: string): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un officiel
   */
  abstract findByOfficiel(officielId: string): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations actives d'un officiel
   */
  abstract findActiveByOfficiel(officielId: string): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un officiel dans une période donnée
   */
  abstract findByOfficielInPeriod(
    officielId: string,
    startDate: string,
    endDate: string
  ): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un match par statut
   */
  abstract findByMatchAndStatus(
    matchId: string,
    status: AssignmentStatusEnum
  ): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations d'un type spécifique
   */
  abstract findByType(type: OfficielTypeEnum): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations en attente
   */
  abstract findPending(): Promise<Assignment[]>

  /**
   * Trouve toutes les assignations en attente pour un officiel
   */
  abstract findPendingByOfficiel(officielId: string): Promise<Assignment[]>

  /**
   * Vérifie s'il existe une assignation active pour un officiel sur un match
   */
  abstract existsActiveAssignmentForOfficielOnMatch(
    officielId: string,
    matchId: string
  ): Promise<boolean>

  /**
   * Sauvegarde une assignation
   */
  abstract save(assignment: Assignment): Promise<void>

  /**
   * Supprime une assignation
   */
  abstract delete(id: string): Promise<void>

  /**
   * Liste toutes les assignations avec pagination
   */
  abstract findAll(
    page?: number,
    limit?: number
  ): Promise<{
    data: Assignment[]
    total: number
    page: number
    limit: number
  }>
}
