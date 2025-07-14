/**
 * Entity representing a CSV upload in the system
 */
export interface CsvUpload {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  processedAt: Date | null;
  status: CsvUploadStatus;
  reportId: string | null;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Status of a CSV upload
 */
export enum CsvUploadStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Value object for CSV upload result
 */
export interface CsvUploadResult {
  upload: CsvUpload;
  message: string;
  success: boolean;
}

/**
 * Value object for CSV validation errors
 */
export interface CsvValidationError {
  row: number;
  column: string;
  message: string;
}

/**
 * Value object for CSV upload report
 */
export interface CsvUploadReport {
  id: string;
  uploadId: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  errors: CsvValidationError[];
  createdAt: Date;
}

/**
 * Represents the progress of a CSV upload
 */
export interface CsvUploadProgress {
  uploadId: string;
  status: CsvUploadStatus;
  progress: number; // 0-100
  currentRow: number;
  totalRows: number;
  message: string;
}