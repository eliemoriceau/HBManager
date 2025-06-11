import User from '#auth/domain/user'

/**
 * Port abstrait pour la persistance des utilisateurs.
 * Toute implémentation doit fournir les méthodes de ce repository
 * pour découpler la logique métier de la couche de stockage.
 */
export interface UserRepository {
  /**
   * Recherche un utilisateur par son email.
   * @param email — adresse email de l’utilisateur à rechercher.
   * @returns la `User` associée si trouvée, ou `null` si aucun utilisateur n’existe avec cet email.
   */
  findByEmail(email: string): Promise<User | null>

  /**
   * Persiste une entité `User` (création ou mise à jour).
   * @param user — instance de `User` à enregistrer.
   */
  save(user: User): Promise<void>

  /**
   * Indique si un utilisateur existe déjà pour un email donné.
   * @param email — adresse email à vérifier.
   * @returns `true` si un utilisateur existe, `false` sinon.
   */
  exists(email: string): Promise<boolean>
}
