import { CsvImportReport } from '#importer/domain/import_report'

export class ImportReportBuilder {
  static create(totalLines: number): CsvImportReport {
    return {
      totalLines,
      importedCount: 0,
      addedCount: 0,
      updatedCount: 0,
      ignored: [],
    }
  }

  static addImported(report: CsvImportReport, isUpdate: boolean) {
    report.importedCount++
    if (isUpdate) {
      report.updatedCount++
    } else {
      report.addedCount++
    }
  }

  static addIgnored(report: CsvImportReport, lineNumber: number, content: any, reason: string) {
    report.ignored.push({ lineNumber, content, reason })
  }
}
