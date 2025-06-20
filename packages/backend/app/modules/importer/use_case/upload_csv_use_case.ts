import { CsvImportReport } from '#importer/domain/import_report'

export abstract class UploadCsvUseCase {
  abstract execute(file: import('@adonisjs/bodyparser').MultipartFile): Promise<CsvImportReport>
}
