import Team from '#team/domain/team'
import { TeamExisteFilter } from '#team/use_case/team_by_filter_use_case'

/**
 * Port d'accès et de manipulation des équipes.
 */
export abstract class TeamRepository {
  /**
   * Retourne toutes les équipes.
   */
  abstract findAll(): Promise<Team[]>

  /**
   * Recherche une équipe par son identifiant.
   * @param id Identifiant de l'équipe
   */
  abstract findById(id: string): Promise<Team | null>

  /**
   * Recherche les équipes correspondant au nom donné.
   * La recherche peut être effectuée en ignorant la casse.
   * @param name Nom de l'équipe recherché
   */
  abstract findByName(name: string): Promise<Team[]>

  /**
   * Ajoute une nouvelle équipe.
   */
  abstract create(team: Team): Promise<void>

  /**
   * Met à jour une équipe existante.
   */
  abstract update(team: Team): Promise<void>

  /**
   * Supprime une équipe par son identifiant.
   */
  abstract delete(id: string): Promise<void>

  abstract findByFilter(filter: TeamExisteFilter): Promise<Team[]>

  /**
   * Retourne un mapping nom -> équipe pour optimiser les recherches.
   * Utilisé pour éviter les requêtes N+1 lors des imports.
   */
  abstract findTeamsByNames(names: string[]): Promise<Map<string, Team>>

  /**
   * Crée plusieurs équipes en une seule transaction.
   * @param teams Liste des équipes à créer
   */
  abstract createBatch(teams: Team[]): Promise<void>
}
