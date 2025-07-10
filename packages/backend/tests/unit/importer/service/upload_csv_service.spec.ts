import { test } from '@japa/runner'
import { UploadCsvService } from '#importer/service/upload_csv_service'
import { StubMatchRepository } from '#tests/unit/match/stubs/stub_match_repository'
import { StubImportReportRepository } from '#tests/unit/importer/stubs/stub_import_report_repository'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { Identifier } from '#shared/domaine/identifier'

// Création d'un mock directement dans le test
class MockPerformanceMeasurementService {
  async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    return await fn()
  }
}

const csvId = Identifier.generate().toString()
const equipeHome = '11111111-1111-1111-1111-111111111111'
const equipeAway = '22222222-2222-2222-2222-222222222222'
const csvContent = `code renc;le;horaire;club rec;club vis;nom salle\n${csvId};2025-01-01;12:00;${equipeHome};${equipeAway};Gym`

/**
 * Tests unitaires pour UploadCsvService
 */

test.group('UploadCsvService', () => {
  test('supprime le fichier temporaire après traitement', async ({ assert }) => {
    const matchRepo = new StubMatchRepository()
    const reportRepo = new StubImportReportRepository()
    const performanceService = new MockPerformanceMeasurementService()
    const service = new UploadCsvService(matchRepo, reportRepo, performanceService)

    const tmpPath = join(os.tmpdir(), 'upload_test.csv')
    await fs.writeFile(tmpPath, csvContent)

    const file = {
      isMultipartFile: true,
      extname: 'csv',
      size: Buffer.byteLength(csvContent),
      tmpPath,
    } as unknown as MultipartFile

    await service.execute(file)

    await assert.rejects(async () => {
      await fs.access(tmpPath)
    })
  })
})
