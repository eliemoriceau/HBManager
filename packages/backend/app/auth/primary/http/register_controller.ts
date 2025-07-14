import { RegisterUserUseCase } from '#auth/use_case/register_user_use_case'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { registerValidator } from '#auth/primary/http/register_validator'
import { EmailAlreadyExistsException } from '#auth/exceptions/email_already_exists_exception'

@inject()
export default class RegisterController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async handle({ request, response }: HttpContext) {
    const { email, password } = await registerValidator.validate(request.body())
    try {
      const user = await this.registerUserUseCase.execute(email, password)
      return response.status(201).json({
        id: user.id.toString(),
        email: user.email.toString(),
        roles: user.roles,
      })
    } catch (error: unknown) {
      if (error instanceof EmailAlreadyExistsException) {
        return response.badRequest({ error: error.message })
      }
      throw error
    }
  }
}
