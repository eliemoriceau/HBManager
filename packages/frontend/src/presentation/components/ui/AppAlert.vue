<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value: string) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: String,
  dismissible: Boolean
})

const emit = defineEmits(['dismiss'])

// Mapping des variantes du projet vers les variantes NuxtUI
const variantMap = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger'
}
</script>

<template>
  <UAlert
    :type="variantMap[variant]"
    :title="title"
    :closable="dismissible"
    @close="emit('dismiss')"
  >
    <slot />
  </UAlert>
</template>