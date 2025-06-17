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
