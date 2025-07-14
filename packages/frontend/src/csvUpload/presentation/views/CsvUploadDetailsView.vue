<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCsvUploadStore } from '../../store/csvUploadStore'
import { useAuthStore } from '../../../auth/store/authStore'
import Card from '../../../components/ui/Card.vue'
import Button from '../../../components/ui/Button.vue'
import Alert from '../../../components/ui/Alert.vue'
import Badge from '../../../components/ui/Badge.vue'
import { CsvUploadStatus } from '../../domain/model/CsvUpload'

const route = useRoute()
const router = useRouter()
const csvUploadStore = useCsvUploadStore()
const authStore = useAuthStore()

// Check if user has secretary role
const hasSecretaryRole = computed(() => {
  return authStore.hasRole('SECRETAIRE')
})

// Get upload ID from route params
const uploadId = computed(() => route.params.id as string)

// Upload and report data
const upload = computed(() => csvUploadStore.currentUpload)
const report = computed(() => csvUploadStore.currentReport)

// Loading state
const isLoading = computed(() => csvUploadStore.loading)

// Error state
const error = computed(() => csvUploadStore.error)

// Format file size for display
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
}

// Format date for display
const formatDate = (date: Date | null): string => {
  if (!date) return 'N/A'

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Status badge variant
const statusVariant = computed(() => {
  if (!upload.value) return 'default'

  switch (upload.value.status) {
    case CsvUploadStatus.COMPLETED:
      return 'success'
    case CsvUploadStatus.FAILED:
      return 'danger'
    case CsvUploadStatus.PROCESSING:
      return 'warning'
    case CsvUploadStatus.PENDING:
    default:
      return 'info'
  }
})

// Status text
const statusText = computed(() => {
  if (!upload.value) return 'Unknown'

  switch (upload.value.status) {
    case CsvUploadStatus.COMPLETED:
      return 'Completed'
    case CsvUploadStatus.FAILED:
      return 'Failed'
    case CsvUploadStatus.PROCESSING:
      return 'Processing'
    case CsvUploadStatus.PENDING:
    default:
      return 'Pending'
  }
})

// Fetch upload details on component mount
onMounted(async () => {
  if (!hasSecretaryRole.value) {
    // Redirect to home if user doesn't have secretary role
    router.push('/')
    return
  }

  await csvUploadStore.fetchUploadById(uploadId.value)
})

// Go back to uploads page
const goBack = () => {
  router.push('/csv-uploads')
}

// Delete upload
const deleteUpload = async () => {
  if (!upload.value) return

  if (confirm('Are you sure you want to delete this upload? This action cannot be undone.')) {
    const success = await csvUploadStore.deleteUpload(upload.value.id)

    if (success) {
      router.push('/csv-uploads')
    }
  }
}
</script>

<template>
  <div>
    <!-- Back button -->
    <div class="mb-4">
      <Button variant="secondary" size="sm" @click="goBack">
        <span class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Uploads
        </span>
      </Button>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">CSV Upload Details</h1>
    </div>

    <!-- Role check warning -->
    <Alert v-if="!hasSecretaryRole" variant="error" title="Access Denied">
      You don't have permission to access this page. Only users with the Secretary role can view CSV
      upload details.
    </Alert>

    <template v-else>
      <!-- Error message -->
      <Alert v-if="error" variant="error" dismissible @dismiss="csvUploadStore.error = null">
        {{ error }}
      </Alert>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="py-8 text-center">
        <svg
          class="animate-spin h-8 w-8 text-blue-500 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading upload details...</p>
      </div>

      <!-- Upload not found message -->
      <Alert v-else-if="!upload" variant="error" title="Upload Not Found">
        The requested CSV upload could not be found. It may have been deleted or you don't have
        permission to view it.
        <div class="mt-4">
          <Button variant="primary" @click="goBack">Go Back to Uploads</Button>
        </div>
      </Alert>

      <!-- Upload details -->
      <div v-else class="space-y-8">
        <Card>
          <div class="space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">
                  {{ upload.originalName }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  {{ formatFileSize(upload.size) }}
                </p>
              </div>

              <Badge :variant="statusVariant">
                {{ statusText }}
              </Badge>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Upload ID</h3>
                <p class="mt-1 text-gray-900 dark:text-white">{{ upload.id }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Filename</h3>
                <p class="mt-1 text-gray-900 dark:text-white">{{ upload.filename }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded By</h3>
                <p class="mt-1 text-gray-900 dark:text-white">{{ upload.uploadedBy }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Upload Date</h3>
                <p class="mt-1 text-gray-900 dark:text-white">{{ formatDate(upload.createdAt) }}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Processing Date
                </h3>
                <p class="mt-1 text-gray-900 dark:text-white">
                  {{ formatDate(upload.processedAt) }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Report ID</h3>
                <p class="mt-1 text-gray-900 dark:text-white">{{ upload.reportId || 'N/A' }}</p>
              </div>
            </div>

            <div class="flex justify-end">
              <Button variant="danger" @click="deleteUpload"> Delete Upload </Button>
            </div>
          </div>
        </Card>

        <!-- Processing report -->
        <div v-if="report" class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">Processing Report</h2>

          <Card>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rows</h3>
                <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ report.totalRows }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Processed Rows</h3>
                <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {{ report.processedRows }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Successful Rows
                </h3>
                <p class="mt-1 text-2xl font-semibold text-green-600 dark:text-green-500">
                  {{ report.successRows }}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Failed Rows</h3>
                <p class="mt-1 text-2xl font-semibold text-red-600 dark:text-red-500">
                  {{ report.failedRows }}
                </p>
              </div>
            </div>
          </Card>

          <!-- Errors list -->
          <div v-if="report.errors.length > 0" class="space-y-4">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Processing Errors</h3>

            <Card>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Row
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Column
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Error Message
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    <tr v-for="error in report.errors" :key="`${error.row}-${error.column}`">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ error.row }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ error.column }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {{ error.message }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        <!-- No report message -->
        <Alert
          v-else-if="
            upload.status !== CsvUploadStatus.PENDING &&
            upload.status !== CsvUploadStatus.PROCESSING
          "
          variant="warning"
          title="No Processing Report Available"
        >
          No processing report is available for this upload. The file may still be pending
          processing or an error occurred during processing.
        </Alert>

        <!-- Processing message -->
        <Alert v-else variant="info" title="Upload is Being Processed">
          This upload is currently being processed. Please check back later for the processing
          report.
        </Alert>
      </div>
    </template>
  </div>
</template>
