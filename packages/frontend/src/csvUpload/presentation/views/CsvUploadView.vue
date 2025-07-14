<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCsvUploadStore } from '../../store/csvUploadStore'
import { useAuthStore } from '../../../auth/store/authStore'
import Card from '../../../components/ui/Card.vue'
import Button from '../../../components/ui/Button.vue'
import Alert from '../../../components/ui/Alert.vue'
import CsvDropzone from '../components/CsvDropzone.vue'
import UploadItem from '../components/UploadItem.vue'

const router = useRouter()
const csvUploadStore = useCsvUploadStore()
const authStore = useAuthStore()

const showUploadForm = ref(false)
const selectedFile = ref<File | null>(null)
const uploadSuccess = ref(false)
const uploadError = ref<string | null>(null)

// Check if user has secretary role
const hasSecretaryRole = computed(() => {
  return authStore.hasRole('SECRETAIRE')
})

// Uploads organized by status
const pendingUploads = computed(() => csvUploadStore.pendingUploads)
const completedUploads = computed(() => csvUploadStore.completedUploads)
const failedUploads = computed(() => csvUploadStore.failedUploads)

// Loading state
const isLoading = computed(() => csvUploadStore.loading)
const isUploading = computed(() => csvUploadStore.uploading)

// Error state
const storeError = computed(() => csvUploadStore.error)

// Fetch uploads on component mount
onMounted(async () => {
  if (!hasSecretaryRole.value) {
    // Redirect to home if user doesn't have secretary role
    router.push('/')
    return
  }

  await csvUploadStore.fetchUploads()
})

// Handle file selection from dropzone
const handleFileSelected = (file: File) => {
  selectedFile.value = file
}

// Handle upload button click
const handleUpload = async () => {
  if (!selectedFile.value) return

  uploadSuccess.value = false
  uploadError.value = null

  try {
    const result = await csvUploadStore.uploadCsvFile(selectedFile.value)

    if (result.success) {
      uploadSuccess.value = true
      selectedFile.value = null
      showUploadForm.value = false
    } else {
      uploadError.value = result.message
    }
  } catch (error: any) {
    uploadError.value = error.message || 'An error occurred during upload'
  }
}

// View upload details
const viewUploadDetails = (id: string) => {
  router.push(`/csv-uploads/${id}`)
}

// Delete upload
const deleteUpload = async (id: string) => {
  if (confirm('Are you sure you want to delete this upload? This action cannot be undone.')) {
    await csvUploadStore.deleteUpload(id)
  }
}

// Toggle upload form visibility
const toggleUploadForm = () => {
  showUploadForm.value = !showUploadForm.value
  if (!showUploadForm.value) {
    selectedFile.value = null
    uploadError.value = null
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">CSV Upload</h1>
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Upload CSV files to import match data into the system
      </p>
    </div>

    <!-- Role check warning -->
    <Alert v-if="!hasSecretaryRole" variant="error" title="Access Denied">
      You don't have permission to access this page. Only users with the Secretary role can upload
      CSV files.
    </Alert>

    <template v-else>
      <!-- Success message -->
      <Alert
        v-if="uploadSuccess"
        variant="success"
        title="Upload Successful"
        dismissible
        @dismiss="uploadSuccess = false"
      >
        Your CSV file has been uploaded successfully and is being processed.
      </Alert>

      <!-- Store error message -->
      <Alert v-if="storeError" variant="error" dismissible @dismiss="csvUploadStore.error = null">
        {{ storeError }}
      </Alert>

      <!-- Upload button or form -->
      <div class="mb-8">
        <Button v-if="!showUploadForm" variant="primary" size="lg" @click="toggleUploadForm">
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload CSV File
          </span>
        </Button>

        <Card v-else>
          <div class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Upload CSV File</h2>

            <Alert v-if="uploadError" variant="error" dismissible @dismiss="uploadError = null">
              {{ uploadError }}
            </Alert>

            <CsvDropzone
              accept=".csv,text/csv"
              :disabled="isUploading"
              @file-selected="handleFileSelected"
            />

            <div class="flex justify-end space-x-3">
              <Button variant="secondary" @click="toggleUploadForm" :disabled="isUploading">
                Cancel
              </Button>

              <Button
                variant="primary"
                :disabled="!selectedFile || isUploading"
                @click="handleUpload"
              >
                <span v-if="isUploading">Uploading...</span>
                <span v-else>Upload</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Uploads list -->
      <div class="space-y-8">
        <!-- Loading indicator -->
        <div v-if="isLoading && !csvUploadStore.hasUploads" class="py-8 text-center">
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
          <p class="mt-2 text-gray-600 dark:text-gray-400">Loading uploads...</p>
        </div>

        <!-- No uploads message -->
        <div v-else-if="!csvUploadStore.hasUploads" class="py-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 text-gray-400 mx-auto"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">No uploads yet</h3>
          <p class="mt-1 text-gray-600 dark:text-gray-400">Upload a CSV file to get started.</p>
        </div>

        <!-- Processing uploads -->
        <div v-if="pendingUploads.length > 0" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Processing</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UploadItem
              v-for="upload in pendingUploads"
              :key="upload.id"
              :upload="upload"
              @view="viewUploadDetails"
              @delete="deleteUpload"
            />
          </div>
        </div>

        <!-- Completed uploads -->
        <div v-if="completedUploads.length > 0" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Completed</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UploadItem
              v-for="upload in completedUploads"
              :key="upload.id"
              :upload="upload"
              @view="viewUploadDetails"
              @delete="deleteUpload"
            />
          </div>
        </div>

        <!-- Failed uploads -->
        <div v-if="failedUploads.length > 0" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Failed</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UploadItem
              v-for="upload in failedUploads"
              :key="upload.id"
              :upload="upload"
              @view="viewUploadDetails"
              @delete="deleteUpload"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
