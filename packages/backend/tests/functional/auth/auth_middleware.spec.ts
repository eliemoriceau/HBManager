import { test } from '@japa/runner'
import { JwtTokenProvider } from '#auth/secondary/adapters/jwt_token_provider'
import { Role } from '#auth/domain/role'

process.env.JWT_SECRET = 'testsecret'
process.env.JWT_EXPIRES_IN = '1h'

const tokenProvider = new JwtTokenProvider()

test.group('AuthMiddleware', () => {

  test("autorise l'accès pour un rôle présent", async ({ client }) => {
    const token = tokenProvider.generate({ roles: [Role.ADMIN] })
    const response = await client.get('/admin').header('Authorization', `Bearer ${token}`).send()
    response.assertOk()
  })

  test('renvoie 403 pour rôle manquant', async ({ client }) => {
    const token = tokenProvider.generate({ roles: [Role.GUEST] })
    const response = await client.get('/admin').header('Authorization', `Bearer ${token}`).send()
    response.assertForbidden()
  })

  test('renvoie 403 pour token invalide', async ({ client }) => {
    const response = await client.get('/admin').header('Authorization', 'Bearer bad').send()
    response.assertForbidden()
  })
})
