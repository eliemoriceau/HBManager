import { test } from '@japa/runner'

process.env.JWT_SECRET = 'testsecret'
process.env.JWT_EXPIRES_IN = '1h'

test.group('AuthValidation', () => {
  test('rejects invalid login payload', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({ password: 'azer' })
    response.assertStatus(422)
  })

  test('rejects invalid register payload', async ({ client }) => {
    const response = await client.post('/api/auth/register').json({ email: 'bad' })
    response.assertStatus(422)
  })
})
