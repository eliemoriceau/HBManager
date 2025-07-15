<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'success', 'warning'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  disabled: Boolean,
  loading: Boolean,
  block: Boolean,
  type: {
    type: String,
    default: 'button'
  }
})

// Mapping des variantes du projet vers les variantes NuxtUI
const variantMap = {
  primary: 'primary',
  secondary: 'gray',
  danger: 'red',
  success: 'green',
  warning: 'yellow'
}
</script>

<template>
  <UButton
    :color="variantMap[variant]"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :type="type"
  >
    <slot />
  </UButton>
</template>