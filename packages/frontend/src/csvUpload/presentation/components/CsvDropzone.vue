<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '../../../components/ui/Button.vue'

const props = defineProps<{
  accept?: string
  maxFileSize?: number // in bytes
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const error = ref<string | null>(null)

const defaultAccept = '.csv,text/csv'
const defaultMaxFileSize = 10 * 1024 * 1024 // 10MB

const acceptedFileTypes = computed(() => props.accept || defaultAccept)
const maxFileSize = computed(() => props.maxFileSize || defaultMaxFileSize)
const isDisabled = computed(() => props.disabled || false)

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

const displayedFileSize = computed(() => {
  if (!file.value) return ''
  return formatFileSize(file.value.size)
})

// Handle file selection
const handleFileSelect = (selectedFile: File | null) => {
  error.value = null

  if (!selectedFile) {
    file.value = null
    return
  }

  // Validate file type
  const validTypes = acceptedFileTypes.value.split(',')
  let isValidType = false

  for (const type of validTypes) {
    if (type.startsWith('.')) {
      // Check file extension
      if (selectedFile.name.toLowerCase().endsWith(type.toLowerCase())) {
        isValidType = true
        break
      }
    } else {
      // Check MIME type
      if (selectedFile.type === type) {
        isValidType = true
        break
      }
    }
  }

  if (!isValidType) {
    error.value = 'Invalid file type. Please upload a CSV file.'
    return
  }

  // Validate file size
  if (selectedFile.size > maxFileSize.value) {
    error.value = `File size exceeds the maximum limit of ${formatFileSize(maxFileSize.value)}.`
    return
  }

  // Set the file
  file.value = selectedFile

  // Emit event
  emit('file-selected', selectedFile)
}

// Handle file input change
const onFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFile = input.files?.[0] || null
  handleFileSelect(selectedFile)
}

// Handle browse button click
const onBrowseClick = () => {
  if (isDisabled.value) return
  fileInput.value?.click()
}

// Handle drop
const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (isDisabled.value) return

  const droppedFile = event.dataTransfer?.files[0] || null
  handleFileSelect(droppedFile)
}

// Handle drag events
const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (!isDisabled.value) {
    isDragging.value = true
  }
}

const onDragLeave = () => {
  isDragging.value = false
}

// Clear selected file
const clearFile = () => {
  file.value = null
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div>
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptedFileTypes"
      class="hidden"
      @change="onFileInputChange"
    />

    <!-- Dropzone UI -->
    <div
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        error ? 'border-red-300 dark:border-red-700' : '',
      ]"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="onBrowseClick"
    >
      <div v-if="file" class="space-y-2">
        <div class="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15l3 3 3-3"></path>
            <path d="M12 12v6"></path>
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-800 dark:text-gray-200">{{ file.name }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ displayedFileSize }}</p>
        </div>
        <Button variant="secondary" size="sm" @click.stop="clearFile" :disabled="isDisabled">
          Change File
        </Button>
      </div>

      <div v-else class="space-y-2">
        <div class="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>

        <div>
          <p class="font-medium text-gray-800 dark:text-gray-200">
            Drag and drop your CSV file here
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">or click to browse</p>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400">
          Maximum file size: {{ formatFileSize(maxFileSize) }}
        </p>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>
