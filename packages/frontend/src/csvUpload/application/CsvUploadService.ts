import { CsvUploadRepository } from '../domain/repository/CsvUploadRepository'
import { CsvUpload, CsvUploadReport, CsvUploadResult } from '../domain/model/CsvUpload'

/**
 * CSV Upload service that implements use cases for the CSV Upload bounded context
 */
export class CsvUploadService {
  constructor(private readonly csvUploadRepository: CsvUploadRepository) {}

  /**
   * Upload a CSV file
   * @param file File to upload (must be a CSV file)
   * @returns Result of the upload operation
   * @throws Error if file is not a valid CSV
   */
  async uploadCsv(file: File): Promise<CsvUploadResult> {
    // Validate file is a CSV
    if (!this.isValidCsvFile(file)) {
      throw new Error('Only CSV files are allowed')
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit')
    }

    // Upload the file
    return this.csvUploadRepository.uploadCsv(file)
  }

  /**
   * Get all CSV uploads
   * @returns List of CSV uploads
   */
  async getUploads(): Promise<CsvUpload[]> {
    return this.csvUploadRepository.getUploads()
  }

  /**
   * Get a specific CSV upload by ID
   * @param id ID of the upload to get
   * @returns The CSV upload or null if not found
   */
  async getUploadById(id: string): Promise<CsvUpload | null> {
    return this.csvUploadRepository.getUploadById(id)
  }

  /**
   * Get the report for a specific CSV upload
   * @param uploadId ID of the upload to get the report for
   * @returns The CSV upload report or null if not found
   */
  async getUploadReport(uploadId: string): Promise<CsvUploadReport | null> {
    return this.csvUploadRepository.getUploadReport(uploadId)
  }

  /**
   * Delete a CSV upload and its associated report
   * @param id ID of the upload to delete
   * @returns true if successful, false otherwise
   */
  async deleteUpload(id: string): Promise<boolean> {
    return this.csvUploadRepository.deleteUpload(id)
  }

  /**
   * Check if a file is a valid CSV file
   * @param file File to check
   * @returns true if the file is a valid CSV, false otherwise
   */
  private isValidCsvFile(file: File): boolean {
    // Check file type
    if (file.type && file.type === 'text/csv') {
      return true
    }

    // Check file extension as fallback
    const fileName = file.name.toLowerCase()
    return fileName.endsWith('.csv')
  }
}
