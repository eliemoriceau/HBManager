import { ImportReportRepository } from '#importer/secondary/ports/import_report_repository'
import { CsvImportReport } from '#importer/domain/import_report'

export class StubImportReportRepository implements ImportReportRepository {
  public saved: CsvImportReport[] = []

  async save(report: CsvImportReport): Promise<void> {
    this.saved.push(report)
  }
}
