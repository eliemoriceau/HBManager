<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const input = ref(props.modelValue || '')

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  input.value = target.value
  emit('update:modelValue', target.value)
}

const inputType = computed(() => props.type || 'text')
</script>

<template>
  <div class="mb-4">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <input
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @input="updateValue"
      :class="[
        'w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500',
        disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
      ]"
    />

    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>
