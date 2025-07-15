<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  }
})

// Mapping des variantes du projet vers les variantes NuxtUI
const variantMap = {
  default: 'gray',
  primary: 'primary',
  secondary: 'purple',
  success: 'green',
  danger: 'red',
  warning: 'yellow',
  info: 'blue'
}
</script>

<template>
  <UBadge
    :color="variantMap[variant]"
    :size="size"
  >
    <slot />
  </UBadge>
</template>