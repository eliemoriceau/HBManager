import { UploadCsvUseCase } from '#importer/use_case/upload_csv_use_case'
import { UploadCsvService } from '#importer/service/upload_csv_service'

export const importerProviderMap = [[UploadCsvUseCase, UploadCsvService]]
