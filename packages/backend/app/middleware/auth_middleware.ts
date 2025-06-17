import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { JwtTokenProvider } from '#auth/secondary/adapters/jwt_token_provider'
import { Role } from '#auth/domain/role'

export default class AuthMiddleware {
  private tokenProvider = new JwtTokenProvider()

  async handle({ request, response }: HttpContext, next: NextFn, role: Role) {
    const header = request.header('authorization')
    if (!header) {
      response.forbidden({ error: 'Accès interdit' })
      return
    }

    const tokenMatch = header.match(/Bearer\s+(.*)/i)
    if (!tokenMatch) {
      response.forbidden({ error: 'Accès interdit' })
      return
    }

    try {
      const payload = this.tokenProvider.verify(tokenMatch[1]) as { roles?: Role[] }
      const roles = Array.isArray(payload.roles) ? payload.roles : []
      if (roles.includes(role)) {
        await next()
        return
      }
    } catch (e) {
      // ignore error and return forbidden
    }
    response.forbidden({ error: 'Accès interdit' })
  }
}
