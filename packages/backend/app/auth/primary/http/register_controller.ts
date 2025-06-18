import { RegisterUserUseCase } from '#auth/use_case/register_user_use_case'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'

@inject()
export default class RegisterController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async handle({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    try {
      const user = await this.registerUserUseCase.execute(email, password)
      return response.status(201).json({
        id: user.id.toString(),
        email: user.email.toString(),
        roles: user.roles,
      })
    } catch (error) {
      if (error.name === 'EmailAlreadyExistsException') {
        return response.badRequest({ error: error.message })
      }
      throw error
    }
  }
}
