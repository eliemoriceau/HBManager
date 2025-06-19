export abstract class UploadCsvUseCase {
  abstract execute(file: import('@adonisjs/bodyparser').MultipartFile): Promise<void>
}
