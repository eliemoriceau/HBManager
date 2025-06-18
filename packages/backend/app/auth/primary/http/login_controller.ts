import { AuthenticationResult, LoginUserUseCase } from '#auth/use_case/login_user_use_case'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { inject } from '@adonisjs/core'

@inject()
export default class LoginController {
  constructor(private readonly useCase: LoginUserUseCase) {}

  async handle({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    try {
      const user: AuthenticationResult = await this.useCase.execute(email, password)
      logger.info('User logged in', { user })
      return response.ok(user)
    } catch (error) {
      if (error.name === 'InvalidCredentialsException') {
        return response.unauthorized({ error: error.message })
      }
      throw error
    }
  }
}
