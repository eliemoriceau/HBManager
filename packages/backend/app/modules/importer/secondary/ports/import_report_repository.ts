import { CsvImportReport } from '#importer/domain/import_report'

export abstract class ImportReportRepository {
  abstract save(report: CsvImportReport): Promise<void>
}
