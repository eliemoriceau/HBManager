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
const getMatchesController = () => import('#match/primary/http/get_matches_controller')
const getMatchController = () => import('#match/primary/http/get_match_controller')
const uploadCsvController = () => import('#importer/primary/http/upload_csv_controller')
const getTeamsController = () => import('#team/primary/http/get_teams_controller')
const createTeamController = () => import('#team/primary/http/create_team_controller')
const updateTeamController = () => import('#team/primary/http/update_team_controller')
const deleteTeamController = () => import('#team/primary/http/delete_team_controller')

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
router.get('/api/matches/:id', [getMatchController])

router.post('/api/import/csv', [uploadCsvController])

router.get('/api/equipes', [getTeamsController])
router.post('/api/equipes', [createTeamController])
router.put('/api/equipes/:id', [updateTeamController])
router.delete('/api/equipes/:id', [deleteTeamController])
