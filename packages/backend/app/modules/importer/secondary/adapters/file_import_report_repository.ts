import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'
import { ImportReportRepository } from '#importer/secondary/ports/import_report_repository'
import { CsvImportReport } from '#importer/domain/import_report'

export class FileImportReportRepository implements ImportReportRepository {
  async save(report: CsvImportReport): Promise<void> {
    const filePath = join(os.tmpdir(), 'import_report.json')
    await fs.writeFile(filePath, JSON.stringify(report, null, 2))
  }
}
