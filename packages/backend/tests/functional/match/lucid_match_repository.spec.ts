import { test } from '@japa/runner'
import { MatchModel } from '#match/infrastructure/models/match'
import Match from '#match/domain/entity/match'
import { Identifier } from '#shared/domaine/identifier'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import Team from '#team/domain/team'
import { LucidMatchRepository } from '#match/infrastructure/repository/lucid_match_repository'
import TeamExisteUseCase, {
  TeamExisteFilter,
  TeamExisteResult,
} from '#team/use_case/team_by_filter_use_case'
import { CreateTeamUseCase } from '#team/use_case/create_team_use_case'
import { OptimizedTeamCacheService } from '#importer/service/optimized_team_cache_service'
import app from '@adonisjs/core/services/app'

const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const official = '33333333-3333-4333-8333-333333333333'

function createMatch(
  date: string,
  heure = '12:00',
  officials: string[] = [official],
  id = Identifier.generate().toString()
) {
  return Match.create({
    id,
    codeRenc: 'CR1',
    date: DateTime.fromISO(date),
    heure,
    equipeDomicile: Team.create({ nom: equipeHome }),
    equipeExterieur: Team.create({ nom: equipeAway }),
    officiels: officials,
  })
}

test.group('LucidMatchRepository', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  test('findAll returns all matches', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    await MatchModel.create({
      id: match1.id.toString(),
      date: match1.date,
      heure: match1.heure,
      equipeDomicileId: match1.equipeDomicile.toString(),
      equipeExterieurId: match1.equipeExterieur.toString(),
      officiels: match1.officiels.map((o) => o.toString()),
      statut: match1.statut,
      codeRenc: match1.codeRenc,
    })
    await MatchModel.create({
      id: match2.id.toString(),
      date: match2.date,
      heure: match2.heure,
      equipeDomicileId: match2.equipeDomicile.toString(),
      equipeExterieurId: match2.equipeExterieur.toString(),
      officiels: match2.officiels.map((o) => o.toString()),
      statut: match2.statut,
      codeRenc: match2.codeRenc,
    })
    const repo = await testUtils.app.container.make(LucidMatchRepository)
    const res = await repo.findAll()

    assert.lengthOf(res, 2)
  })
    .setup(() => {
      class mockTeamExisteUseCase extends TeamExisteUseCase {
        async execute(filter: TeamExisteFilter): Promise<TeamExisteResult[]> {
          return [{ nom: filter.nom ?? '', id: filter.id ?? '' } satisfies TeamExisteResult]
        }
      }
      app.container.swap(TeamExisteUseCase, () => {
        return new mockTeamExisteUseCase()
      })
    })
    .teardown(() => {
      app.container.restore(TeamExisteUseCase)
    })

  test('findByCriteria filters by date range', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02')
    const match3 = createMatch('2025-01-03')
    for (const m of [match1, match2, match3]) {
      await MatchModel.create({
        id: m.id.toString(),
        date: m.date,
        heure: m.heure,
        equipeDomicileId: m.equipeDomicile.toString(),
        equipeExterieurId: m.equipeExterieur.toString(),
        officiels: m.officiels.map((o) => o.toString()),
        statut: m.statut,
        codeRenc: m.codeRenc,
      })
    }

    const repo = await testUtils.app.container.make(LucidMatchRepository)
    const res = await repo.findByCriteria({
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
    })

    assert.lengthOf(res, 2)
  })
    .teardown(() => {
      app.container.restore(TeamExisteUseCase)
    })
    .setup(() => {
      class mockTeamExisteUseCase extends TeamExisteUseCase {
        async execute(filter: TeamExisteFilter): Promise<TeamExisteResult[]> {
          return [{ nom: filter.nom ?? '', id: filter.id ?? '' } satisfies TeamExisteResult]
        }
      }
      app.container.swap(TeamExisteUseCase, () => {
        return new mockTeamExisteUseCase()
      })
    })
    .teardown(() => {
      app.container.restore(TeamExisteUseCase)
    })

  test('findByCriteria filters by official', async ({ assert }) => {
    const match1 = createMatch('2025-01-01')
    const match2 = createMatch('2025-01-02', '14:00', ['44444444-4444-4444-4444-444444444444'])
    for (const m of [match1, match2]) {
      await MatchModel.create({
        id: m.id.toString(),
        date: m.date,
        heure: m.heure,
        equipeDomicileId: m.equipeDomicile.toString(),
        equipeExterieurId: m.equipeExterieur.toString(),
        officiels: m.officiels.map((o) => o.toString()),
        statut: m.statut,
        codeRenc: m.codeRenc,
      })
    }

    const repo = new LucidMatchRepository()
    const res = await repo.findByCriteria({ officielId: official })

    assert.lengthOf(res, 1)
    assert.equal(res[0].id.toString(), match1.id.toString())
  })

  test('findById returns a single match', async ({ assert }) => {
    const match = createMatch('2025-05-05')
    await MatchModel.create({
      id: match.id.toString(),
      date: match.date,
      heure: match.heure,
      equipeDomicileId: match.equipeDomicile.toString(),
      equipeExterieurId: match.equipeExterieur.toString(),
      officiels: match.officiels.map((o) => o.toString()),
      statut: match.statut,
      codeRenc: match.codeRenc,
    })

    const repo = new LucidMatchRepository()
    const found = await repo.findById(match.id.toString())

    assert.isNotNull(found)
    assert.equal(found?.id.toString(), match.id.toString())
  })

  test('upsert creates or updates a match', async ({ assert }) => {
    const repo = await testUtils.app.container.make(LucidMatchRepository)
    const matchId = Identifier.generate().toString()
    const match = createMatch('2025-05-05', '12:00', [official], matchId)
    await repo.upsert(match)

    let models = await MatchModel.all()
    assert.lengthOf(models, 1)

    const newOfficial = Identifier.generate().toString()
    const updated = Match.create({
      id: match.id.toString(),
      codeRenc: 'CR1',
      date: match.date,
      heure: match.heure,
      equipeDomicile: match.equipeDomicile,
      equipeExterieur: match.equipeExterieur,
      officiels: [newOfficial],
    })
    await repo.upsert(updated)

    models = await MatchModel.all()
    assert.lengthOf(models, 1)
    assert.deepEqual(models[0].officiels, [newOfficial])
  })
    .setup(() => {
      class mockTeamExisteUseCase extends TeamExisteUseCase {
        async execute(filter: TeamExisteFilter): Promise<TeamExisteResult[]> {
          return [{ nom: filter.nom ?? '', id: filter.id ?? '' } satisfies TeamExisteResult]
        }
      }
      class mockCreateTeamUseCase extends CreateTeamUseCase {
        async execute(payload: { nom: string }): Promise<TeamExisteResult> {
          return { nom: payload.nom, id: 'generated-id' }
        }
      }
      class mockOptimizedTeamCacheService extends OptimizedTeamCacheService {
        async getOrCreateTeam(nom: string): Promise<TeamExisteResult> {
          return { nom, id: 'cached-id' }
        }
      }
      app.container.swap(TeamExisteUseCase, () => new mockTeamExisteUseCase())
      app.container.swap(CreateTeamUseCase, () => new mockCreateTeamUseCase())
      app.container.swap(OptimizedTeamCacheService, () => new mockOptimizedTeamCacheService())
    })
    .teardown(() => {
      app.container.restore(TeamExisteUseCase)
      app.container.restore(CreateTeamUseCase)
      app.container.restore(OptimizedTeamCacheService)
    })
})
