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

const loginController = () => import('#auth/primary/http/login_controller')
const registerController = () => import('#auth/primary/http/register_controller')
const getMatchesController = () =>
  import('../app/modules/match/primary/http/get_matches_controller')

router.post('/api/auth/register', [registerController])

router.post('/api/auth/login', [loginController])

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

router.get('/api/matches', [getMatchesController])
