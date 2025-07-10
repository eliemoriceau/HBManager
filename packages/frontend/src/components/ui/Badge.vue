<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
}>()

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1'
}
</script>

<template>
  <span 
    :class="[
      'inline-flex items-center font-medium rounded-full',
      variantClasses[variant || 'default'],
      sizeClasses[size || 'md']
    ]"
  >
    <slot></slot>
  </span>
</template>