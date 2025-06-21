import type { MultipartFile } from '@adonisjs/bodyparser'

export abstract class EnqueueCsvImportUseCase {
  abstract execute(file: MultipartFile): Promise<void>
}
