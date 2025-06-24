import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'
import { UploadCsvService } from '#importer/service/upload_csv_service'
import { ImportReportRepository } from '#importer/secondary/ports/import_report_repository'
import { FileImportReportRepository } from '#importer/secondary/adapters/file_import_report_repository'

export const importerProviderMap = [
  [UploadCsvUseCase, UploadCsvService],
  [ImportReportRepository, FileImportReportRepository],
]
