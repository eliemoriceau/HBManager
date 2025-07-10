<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <div v-if="title || subtitle" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 v-if="title" class="text-xl font-semibold text-gray-800 dark:text-white">{{ title }}</h3>
      <p v-if="subtitle" class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
    </div>
    
    <div class="p-6">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
      <slot name="footer"></slot>
    </div>
  </div>
</template>