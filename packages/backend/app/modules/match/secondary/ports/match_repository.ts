import Match from '#match/domain/match'

/**
 * Ensemble de critères permettant de rechercher des matchs.
 * Tous les champs sont optionnels et peuvent être combinés.
 */
export interface MatchSearchCriteria {
  /** Date minimale du match (inclus). */
  startDate?: Date
  /** Date maximale du match (inclus). */
  endDate?: Date
  /** Identifiant d'une équipe concernée par le match. */
  equipeId?: string
  /** Identifiant d'un officiel assigné au match. */
  officielId?: string
}

/**
 * Port d'accès aux données Match.
 * Fournit les méthodes de récupération des matchs pour la couche Domaine.
 */
export abstract class MatchRepository {
  /**
   * Retourne l'ensemble des matchs disponibles.
   */
  abstract findAll(): Promise<Match[]>

  /**
   * Recherche des matchs correspondant aux critères spécifiés.
   * Les critères non renseignés sont ignorés.
   *
   * @param criteria — filtres optionnels sur la période, les équipes ou les officiels.
   * @returns La liste des matchs satisfaisant les critères.
   */
  abstract findByCriteria(criteria: MatchSearchCriteria): Promise<Match[]>

  /**
   * Crée ou met à jour un match en base selon son identifiant naturel.
   * @param match Match à sauvegarder
   */
  abstract upsert(match: Match): Promise<void>
}
