import { ImportReportRepository } from '#importer/secondary/ports/import_report_repository'
import { CsvImportReport } from '#importer/domain/import_report'

export class StubImportReportRepository extends ImportReportRepository {
  public saved: CsvImportReport | null = null

  async save(report: CsvImportReport): Promise<void> {
    this.saved = report
  }
}
