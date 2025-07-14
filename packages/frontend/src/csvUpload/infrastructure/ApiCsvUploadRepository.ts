import { CsvUploadRepository } from '../domain/repository/CsvUploadRepository'
import {
  CsvUpload,
  CsvUploadReport,
  CsvUploadResult,
  CsvUploadStatus,
} from '../domain/model/CsvUpload'

/**
 * API implementation of the CsvUploadRepository interface
 * This is an adapter in the Hexagonal Architecture that connects to the backend API
 */
export class ApiCsvUploadRepository implements CsvUploadRepository {
  private apiBaseUrl: string = '/api/csv-uploads' // This would be configured from environment

  /**
   * Upload a CSV file to the server
   */
  async uploadCsv(file: File): Promise<CsvUploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload CSV file')
      }

      const data = await response.json()
      return {
        upload: this.mapToCsvUpload(data.upload),
        message: data.message,
        success: data.success,
      }
    } catch (error: any) {
      console.error('CSV upload error:', error)
      throw error
    }
  }

  /**
   * Get all CSV uploads for the current user
   */
  async getUploads(): Promise<CsvUpload[]> {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(this.apiBaseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch CSV uploads')
      }

      const data = await response.json()
      return data.uploads.map((upload: any) => this.mapToCsvUpload(upload))
    } catch (error) {
      console.error('Get uploads error:', error)
      throw error
    }
  }

  /**
   * Get a specific CSV upload by ID
   */
  async getUploadById(id: string): Promise<CsvUpload | null> {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch CSV upload')
      }

      const data = await response.json()
      return this.mapToCsvUpload(data.upload)
    } catch (error) {
      console.error('Get upload error:', error)
      throw error
    }
  }

  /**
   * Get the report for a specific CSV upload
   */
  async getUploadReport(uploadId: string): Promise<CsvUploadReport | null> {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${this.apiBaseUrl}/${uploadId}/report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch CSV upload report')
      }

      const data = await response.json()
      return this.mapToCsvUploadReport(data.report)
    } catch (error) {
      console.error('Get upload report error:', error)
      throw error
    }
  }

  /**
   * Delete a CSV upload and its associated report
   */
  async deleteUpload(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error('Delete upload error:', error)
      return false
    }
  }

  /**
   * Map API response to CsvUpload domain model
   */
  private mapToCsvUpload(data: any): CsvUpload {
    return {
      id: data.id,
      filename: data.filename,
      originalName: data.originalName,
      size: data.size,
      processedAt: data.processedAt ? new Date(data.processedAt) : null,
      status: data.status as CsvUploadStatus,
      reportId: data.reportId,
      uploadedBy: data.uploadedBy,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }
  }

  /**
   * Map API response to CsvUploadReport domain model
   */
  private mapToCsvUploadReport(data: any): CsvUploadReport {
    return {
      id: data.id,
      uploadId: data.uploadId,
      totalRows: data.totalRows,
      processedRows: data.processedRows,
      successRows: data.successRows,
      failedRows: data.failedRows,
      errors: data.errors.map((error: any) => ({
        row: error.row,
        column: error.column,
        message: error.message,
      })),
      createdAt: new Date(data.createdAt),
    }
  }
}
