/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { Role } from '#auth/domain/role'
import { middleware } from '#start/kernel'

import { DatabaseUserRepository } from '#auth/secondary/adapters/database_user_repository'
import { JwtTokenProvider } from '#auth/secondary/adapters/jwt_token_provider'
import { HashPasswordHasher } from '#auth/secondary/adapters/hash_password_hasher'
import { RegisterUserService } from '#auth/service/register_user_service_implementation'
import { LoginUserService } from '#auth/service/login_user_service'

const userRepository = new DatabaseUserRepository()
const tokenProvider = new JwtTokenProvider()
const passwordHasher = new HashPasswordHasher()
const registerService = new RegisterUserService(userRepository, passwordHasher)
const loginService = new LoginUserService(userRepository, tokenProvider, passwordHasher)

router.post('/api/auth/register', async ({ request, response }) => {
  const { email, password } = request.only(['email', 'password'])
  try {
    const user = await registerService.execute(email, password)
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
})

router.post('/api/auth/login', async ({ request, response }) => {
  const { email, password } = request.only(['email', 'password'])
  try {
    const result = await loginService.execute(email, password)
    return response.ok(result)
  } catch (error) {
    if (error.name === 'InvalidCredentialsException') {
      return response.unauthorized({ error: error.message })
    }
    throw error
  }
})

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .get('/admin', async () => {
    return { ok: true }
  })
  .use(middleware.auth(Role.ADMIN))
