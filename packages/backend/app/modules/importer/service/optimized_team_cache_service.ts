import { inject } from '@adonisjs/core'
import { CreateTeamUseCase } from '#team/use_case/create_team_use_case'
import TeamExisteUseCase, { TeamExisteResult } from '#team/use_case/team_by_filter_use_case'

/**
 * Service optimisé pour la gestion des équipes avec cache
 * Évite les requêtes N+1 lors des imports CSV
 */
@inject()
export class OptimizedTeamCacheService {
  private teamCache: Map<string, TeamExisteResult> = new Map()

  constructor(
    private readonly teamExisteUseCase: TeamExisteUseCase,
    private readonly createTeamUseCase: CreateTeamUseCase
  ) {}

  /**
   * Récupère ou crée une équipe de manière optimisée
   * Utilise un cache pour éviter les requêtes répétées
   */
  async getOrCreateTeam(teamName: string): Promise<TeamExisteResult> {
    // Vérifier le cache d'abord
    if (this.teamCache.has(teamName)) {
      return this.teamCache.get(teamName)!
    }

    // Rechercher l'équipe existante
    const existingTeams = await this.teamExisteUseCase.execute({ nom: teamName })

    if (existingTeams.length === 1) {
      // Équipe trouvée, la mettre en cache
      this.teamCache.set(teamName, existingTeams[0])
      return existingTeams[0]
    }

    if (existingTeams.length === 0) {
      // Créer une nouvelle équipe
      const newTeam = await this.createTeamUseCase.execute({ nom: teamName })
      this.teamCache.set(teamName, newTeam)
      return newTeam
    }

    // Cas d'erreur : plusieurs équipes avec le même nom
    throw new Error(`Plusieurs équipes trouvées pour le nom: ${teamName}`)
  }

  /**
   * Précharge les équipes pour un ensemble de noms
   * Optimise les requêtes pour les imports en lot
   */
  async preloadTeams(teamNames: string[]): Promise<Map<string, TeamExisteResult>> {
    const uniqueNames = Array.from(new Set(teamNames))
    const result = new Map<string, TeamExisteResult>()

    // Traiter chaque nom d'équipe
    for (const name of uniqueNames) {
      try {
        const team = await this.getOrCreateTeam(name)
        result.set(name, team)
      } catch (error) {
        // Log l'erreur mais continue le traitement
        console.error(`Erreur lors du traitement de l'équipe ${name}:`, error)
        throw error
      }
    }

    return result
  }

  /**
   * Vide le cache des équipes
   * Utile pour les tests ou après une mise à jour importante
   */
  clearCache(): void {
    this.teamCache.clear()
  }

  /**
   * Retourne les statistiques du cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.teamCache.size,
      keys: Array.from(this.teamCache.keys()),
    }
  }
}
