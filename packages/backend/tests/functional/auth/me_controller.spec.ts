import { test } from '@japa/runner'
import { JwtTokenProvider } from '#auth/secondary/adapters/jwt_token_provider'
import { Role } from '#auth/domain/role'
import { UserRepository } from '#auth/secondary/ports/user_repository'
import User from '#auth/domain/user'
import Email from '#auth/domain/email'
import { PlainPassword } from '#auth/domain/plain_password'
import { container } from '@adonisjs/core'

test.group('MeController', () => {
  let tokenProvider: JwtTokenProvider
  let mockUserRepository: {
    findByEmail: (email: string) => Promise<User | null>
    save: (user: User) => Promise<void>
    exists: (email: string) => Promise<boolean>
  }

  test.setup(async () => {
    tokenProvider = new JwtTokenProvider()

    // Mock UserRepository pour les tests
    mockUserRepository = {
      findByEmail: async (email: string) => {
        if (email === 'test@example.com') {
          const user = new User(
            'user-id-123',
            Email.fromString('test@example.com'),
            PlainPassword.fromString('password123').hash(),
            [Role.USER]
          )
          return user
        }
        return null
      },
      save: async () => {},
      exists: async () => false,
    }

    // Enregistrer le mock dans le container
    container.bind(UserRepository, () => mockUserRepository)
  })

  test("devrait retourner 401 si aucun token n'est fourni", async ({ client }) => {
    const response = await client.get('/api/auth/me')

    response.assertStatus(401)
    response.assertBodyContains({ error: 'Token non fourni' })
  })

  test('devrait retourner 401 si le format du token est invalide', async ({ client }) => {
    const response = await client.get('/api/auth/me').header('authorization', 'Invalid-token')

    response.assertStatus(401)
    response.assertBodyContains({ error: 'Format de token invalide' })
  })

  test('devrait retourner 401 si le token est invalide', async ({ client }) => {
    const response = await client
      .get('/api/auth/me')
      .header('authorization', 'Bearer invalid.token.value')

    response.assertStatus(401)
  })

  test("devrait retourner 404 si l'utilisateur n'est pas trouvé", async ({ client }) => {
    // Générer un token valide pour un utilisateur qui n'existe pas
    const token = tokenProvider.generate({ sub: 'nonexistent@example.com', roles: [Role.USER] })

    const response = await client.get('/api/auth/me').header('authorization', `Bearer ${token}`)

    response.assertStatus(404)
    response.assertBodyContains({ error: 'Utilisateur non trouvé' })
  })

  test("devrait retourner les informations de l'utilisateur si le token est valide", async ({
    client,
  }) => {
    // Générer un token valide pour l'utilisateur de test
    const token = tokenProvider.generate({ sub: 'test@example.com', roles: [Role.USER] })

    const response = await client.get('/api/auth/me').header('authorization', `Bearer ${token}`)

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        id: 'user-id-123',
        email: 'test@example.com',
        roles: [Role.USER],
      },
    })
  })
})
