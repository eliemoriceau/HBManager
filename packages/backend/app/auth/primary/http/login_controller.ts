import { AuthenticationResult, LoginUserUseCase } from '#auth/use_case/login_user_use_case'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { loginValidator } from '#auth/primary/http/login_validator'
import { InvalidCredentialsException } from '#auth/exceptions/invalid_credentials_exception'

@inject()
export default class LoginController {
  constructor(private readonly useCase: LoginUserUseCase) {}

  async handle({ request, response }: HttpContext) {
    const { email, password } = await loginValidator.validate(request.body())
    try {
      const user: AuthenticationResult = await this.useCase.execute(email, password)
      return response.ok(user)
    } catch (error: unknown) {
      if (error instanceof InvalidCredentialsException) {
        return response.unauthorized({ error: error.message })
      }
      throw error
    }
  }
}
