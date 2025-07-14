import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { CsvUploadService } from '../application/CsvUploadService'
import { ApiCsvUploadRepository } from '../infrastructure/ApiCsvUploadRepository'
import { CsvUpload, CsvUploadReport, CsvUploadResult } from '../domain/model/CsvUpload'

// Create repository and service instances
const csvUploadRepository = new ApiCsvUploadRepository()
const csvUploadService = new CsvUploadService(csvUploadRepository)

/**
 * CSV Upload store using Pinia
 * Serves as a presentation layer state management for the CSV Upload bounded context
 */
export const useCsvUploadStore = defineStore('csvUpload', () => {
  // State
  const uploads = ref<CsvUpload[]>([])
  const currentUpload = ref<CsvUpload | null>(null)
  const currentReport = ref<CsvUploadReport | null>(null)
  const loading = ref(false)
  const uploading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasUploads = computed(() => uploads.value.length > 0)

  const pendingUploads = computed(() =>
    uploads.value.filter((upload) => upload.status === 'PENDING' || upload.status === 'PROCESSING'),
  )

  const completedUploads = computed(() =>
    uploads.value.filter((upload) => upload.status === 'COMPLETED'),
  )

  const failedUploads = computed(() => uploads.value.filter((upload) => upload.status === 'FAILED'))

  // Actions
  async function fetchUploads() {
    loading.value = true
    error.value = null

    try {
      uploads.value = await csvUploadService.getUploads()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch uploads'
      console.error('Error fetching uploads:', err)
    } finally {
      loading.value = false
    }
  }

  async function uploadCsvFile(file: File): Promise<CsvUploadResult> {
    uploading.value = true
    error.value = null

    try {
      const result = await csvUploadService.uploadCsv(file)

      // Add the new upload to the list
      uploads.value = [result.upload, ...uploads.value]

      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to upload CSV file'
      throw err
    } finally {
      uploading.value = false
    }
  }

  async function fetchUploadById(id: string) {
    loading.value = true
    error.value = null

    try {
      currentUpload.value = await csvUploadService.getUploadById(id)

      if (currentUpload.value && currentUpload.value.reportId) {
        await fetchUploadReport(currentUpload.value.id)
      } else {
        currentReport.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch upload details'
      console.error('Error fetching upload details:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchUploadReport(uploadId: string) {
    loading.value = true
    error.value = null

    try {
      currentReport.value = await csvUploadService.getUploadReport(uploadId)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch upload report'
      console.error('Error fetching upload report:', err)
    } finally {
      loading.value = false
    }
  }

  async function deleteUpload(id: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const success = await csvUploadService.deleteUpload(id)

      if (success) {
        // Remove the deleted upload from the list
        uploads.value = uploads.value.filter((upload) => upload.id !== id)

        // Clear current upload if it's the one that was deleted
        if (currentUpload.value && currentUpload.value.id === id) {
          currentUpload.value = null
          currentReport.value = null
        }
      }

      return success
    } catch (err: any) {
      error.value = err.message || 'Failed to delete upload'
      return false
    } finally {
      loading.value = false
    }
  }

  // Initialize store by fetching uploads
  fetchUploads()

  return {
    // State
    uploads,
    currentUpload,
    currentReport,
    loading,
    uploading,
    error,

    // Getters
    hasUploads,
    pendingUploads,
    completedUploads,
    failedUploads,

    // Actions
    fetchUploads,
    uploadCsvFile,
    fetchUploadById,
    fetchUploadReport,
    deleteUpload,
  }
})
