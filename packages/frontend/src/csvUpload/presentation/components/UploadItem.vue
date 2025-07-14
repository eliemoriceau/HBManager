<script setup lang="ts">
import { computed } from 'vue'
import { CsvUpload, CsvUploadStatus } from '../../domain/model/CsvUpload'
import Badge from '../../../components/ui/Badge.vue'
import Button from '../../../components/ui/Button.vue'

const props = defineProps<{
  upload: CsvUpload
}>()

const emit = defineEmits<{
  (e: 'view', id: string): void
  (e: 'delete', id: string): void
}>()

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
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const displayedFileSize = computed(() => formatFileSize(props.upload.size))
const uploadDate = computed(() => formatDate(props.upload.createdAt))
const processedDate = computed(() =>
  props.upload.processedAt ? formatDate(props.upload.processedAt) : 'N/A',
)

const statusVariant = computed(() => {
  switch (props.upload.status) {
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

const statusLabel = computed(() => {
  switch (props.upload.status) {
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

const canView = computed(() => {
  return (
    props.upload.status === CsvUploadStatus.COMPLETED ||
    props.upload.status === CsvUploadStatus.FAILED
  )
})

const handleView = () => {
  if (canView.value) {
    emit('view', props.upload.id)
  }
}

const handleDelete = () => {
  emit('delete', props.upload.id)
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <div class="p-4">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate max-w-xs">
            {{ upload.originalName }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ displayedFileSize }} • Uploaded on {{ uploadDate }}
          </p>
        </div>

        <Badge :variant="statusVariant">
          {{ statusLabel }}
        </Badge>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-500 dark:text-gray-400">File ID</p>
          <p class="font-medium text-gray-900 dark:text-white">
            {{ upload.id.substring(0, 8) }}...
          </p>
        </div>

        <div>
          <p class="text-gray-500 dark:text-gray-400">Processed At</p>
          <p class="font-medium text-gray-900 dark:text-white">{{ processedDate }}</p>
        </div>
      </div>

      <div class="mt-4 flex justify-end space-x-2">
        <Button variant="secondary" size="sm" :disabled="!canView" @click="handleView">
          View Details
        </Button>

        <Button variant="danger" size="sm" @click="handleDelete"> Delete </Button>
      </div>
    </div>
  </div>
</template>
