import { UserRepository } from '#auth/secondary/ports/user_repository'
import User from '#auth/domain/user'

/**
 * Stub de UserRepository pour les tests unitaires.
 * Permet d’émuler la persistance sans dépendance à une base de données réelle.
 */
export class StubUserRepository implements UserRepository {
  private readonly store = new Map<string, User>()

  /**
   * @param initialUsers — liste facultative d’utilisateurs préchargés dans le stub.
   */
  constructor(initialUsers: User[] = []) {
    for (const u of initialUsers) {
      this.store.set(u.email.toString(), u)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.store.get(email) ?? null
  }

  async save(user: User): Promise<void> {
    this.store.set(user.email.toString(), user)
  }

  async exists(email: string): Promise<boolean> {
    return this.store.has(email)
  }
}
