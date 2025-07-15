import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { JwtTokenProvider } from '#auth/secondary/adapters/jwt_token_provider'
import { UserRepository } from '#auth/secondary/ports/user_repository'
import { TokenInvalidError } from '#auth/exceptions/token_invalid_error'
import { TokenExpiredError } from '#auth/exceptions/token_expired_error'

@inject()
export default class MeController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenProvider: JwtTokenProvider
  ) {}

  async handle({ request, response }: HttpContext) {
    // Récupérer le token de l'en-tête Authorization
    const authHeader = request.header('authorization')
    if (!authHeader) {
      return response.unauthorized({ error: 'Token non fourni' })
    }

    const tokenMatch = authHeader.match(/Bearer\s+(.*)/i)
    if (!tokenMatch) {
      return response.unauthorized({ error: 'Format de token invalide' })
    }

    const token = tokenMatch[1]

    try {
      // Vérifier et décoder le token
      const payload = this.tokenProvider.verify(token)

      // Récupérer l'email de l'utilisateur à partir du payload
      const email = payload.sub

      // Chercher l'utilisateur dans le repository
      const user = await this.userRepository.findByEmail(email)

      if (!user) {
        return response.notFound({ error: 'Utilisateur non trouvé' })
      }

      // Retourner les informations de l'utilisateur
      return response.ok({
        user: {
          id: user.id.toString(),
          email: user.email.toString(),
          roles: user.roles,
        },
      })
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return response.unauthorized({ error: 'Token expiré' })
      }
      if (error instanceof TokenInvalidError) {
        return response.unauthorized({ error: 'Token invalide' })
      }
      throw error
    }
  }
}
