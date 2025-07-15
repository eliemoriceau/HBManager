<script setup lang="ts">
defineProps({
  title: String,
  subtitle: String,
  padded: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <UCard :ui="{ body: { padding: padded ? 'p-4' : 'p-0' } }">
    <template v-if="title" #header>
      <div>
        <h3 class="text-lg font-medium">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
      </div>
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </UCard>
</template>