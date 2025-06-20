export interface IgnoredLine {
  lineNumber: number
  content: string
  reason: string
}

export interface CsvImportReport {
  totalLines: number
  importedCount: number
  ignored: IgnoredLine[]
}
