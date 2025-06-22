import { test } from '@japa/runner'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'

import { UploadCsvService } from '#importer/service/upload_csv_service'
import { StubMatchRepository } from '#tests/unit/match/stubs/stub_match_repository'
import { StubImportReportRepository } from '#tests/unit/importer/stubs/stub_import_report_repository'

function createFile(content: string): Promise<string> {
  const filePath = join(os.tmpdir(), `test-${Date.now()}.csv`)
  return fs.writeFile(filePath, content).then(() => filePath)
}

test.group('UploadCsvService', (group) => {
  let matchRepository: StubMatchRepository
  let reportRepository: StubImportReportRepository
  let service: UploadCsvService

  group.each.setup(() => {
    matchRepository = new StubMatchRepository([])
    reportRepository = new StubImportReportRepository()
    service = new UploadCsvService(matchRepository, reportRepository)
  })

  test('importe un fichier CSV valide', async ({ assert }) => {
    const csv =
      'code renc;le;horaire;club rec;club vis;nom salle\nCODE1;2025-01-01;12:00;A;B;Gym\nCODE2;2025-01-02;12:30;C;D;Gym'
    const path = await createFile(csv)
    const file = {
      extname: 'csv',
      tmpPath: path,
      size: Buffer.byteLength(csv),
      isMultipartFile: true,
    } as any

    const report = await service.execute(file)

    assert.equal(report.totalLines, 2)
    assert.equal(report.importedCount, 2)
    assert.lengthOf(report.ignored, 0)

    const matches = await matchRepository.findAll()
    assert.lengthOf(matches, 2)
    assert.deepEqual(reportRepository.saved[0], report)

    await fs.unlink(path)
  })

  test('rejette un fichier trop volumineux', async ({ assert }) => {
    const buffer = Buffer.alloc(6 * 1024 * 1024, 'a')
    const path = await createFile(buffer.toString())
    const file = {
      extname: 'csv',
      tmpPath: path,
      size: buffer.length,
      isMultipartFile: true,
    } as any

    await assert.rejects(() => service.execute(file), 'Fichier trop volumineux')

    await fs.unlink(path)
  })

  test('rejette un fichier avec des en-t\u00eates manquantes', async ({ assert }) => {
    const csv = 'le;horaire;club rec;club vis;nom salle\n2025-01-01;12:00;A;B;Gym'
    const path = await createFile(csv)
    const file = {
      extname: 'csv',
      tmpPath: path,
      size: Buffer.byteLength(csv),
      isMultipartFile: true,
    } as any

    await assert.rejects(() => service.execute(file), /Ent\u00eates manquantes/)

    await fs.unlink(path)
  })

  test("ignore les lignes vides lors de l'import", async ({ assert }) => {
    const csv =
      'code renc;le;horaire;club rec;club vis;nom salle\nCODE1;2025-01-01;12:00;A;B;Gym\n\nCODE2;2025-01-02;12:30;C;D;Gym\n'
    const path = await createFile(csv)
    const file = {
      extname: 'csv',
      tmpPath: path,
      size: Buffer.byteLength(csv),
      isMultipartFile: true,
    } as any

    const report = await service.execute(file)

    assert.equal(report.totalLines, 2)
    assert.equal(report.importedCount, 2)

    await fs.unlink(path)
  })
})
