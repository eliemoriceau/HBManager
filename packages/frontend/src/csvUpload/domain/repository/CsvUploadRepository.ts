import { CsvUpload, CsvUploadReport, CsvUploadResult } from '../model/CsvUpload'

/**
 * Repository interface for CsvUpload entity
 * Following Hexagonal Architecture / Ports & Adapters pattern
 */
export interface CsvUploadRepository {
  /**
   * Upload a CSV file to the server
   * @param file The file to upload
   * @returns Result of the upload operation
   */
  uploadCsv(file: File): Promise<CsvUploadResult>

  /**
   * Get all CSV uploads for the current user
   * @returns List of CSV uploads
   */
  getUploads(): Promise<CsvUpload[]>

  /**
   * Get a specific CSV upload by ID
   * @param id ID of the upload to get
   * @returns The CSV upload or null if not found
   */
  getUploadById(id: string): Promise<CsvUpload | null>

  /**
   * Get the report for a specific CSV upload
   * @param uploadId ID of the upload to get the report for
   * @returns The CSV upload report or null if not found
   */
  getUploadReport(uploadId: string): Promise<CsvUploadReport | null>

  /**
   * Delete a CSV upload and its associated report
   * @param id ID of the upload to delete
   * @returns true if successful, false otherwise
   */
  deleteUpload(id: string): Promise<boolean>
}
