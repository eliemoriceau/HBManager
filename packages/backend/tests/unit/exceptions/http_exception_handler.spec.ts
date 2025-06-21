import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import HttpExceptionHandler from '#exceptions/handler'
import { DatabaseConnectionException } from '#exceptions/database_connection_exception'

/**
 * Unit tests for HttpExceptionHandler
 */

test.group('HttpExceptionHandler', () => {
  test('returns 503 on DatabaseConnectionException', async ({ assert }) => {
    await testUtils.boot()
    const ctx = await testUtils.createHttpContext()
    const handler = new HttpExceptionHandler()

    await handler.handle(new DatabaseConnectionException(), ctx)

    assert.equal(ctx.response.response.statusCode, 503)
    assert.deepEqual(ctx.response.getBody(), {
      error: 'Connexion \u00e0 la base de donn\u00e9es impossible',
      template: '/docs/csv_template.csv',
    })
  })
})
