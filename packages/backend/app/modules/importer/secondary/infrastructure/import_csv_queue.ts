import { Queue } from '#queue/simple_queue'

export interface ImportCsvJobData {
  filePath: string
}

export const importCsvQueue = new Queue<ImportCsvJobData>('importCsv')
