<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
    <h1 class="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">{{ msg }}</h1>
    <h3 class="text-xl text-gray-700 dark:text-gray-300">
      You've successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">Vue 3</a> +
      <span class="text-teal-600 dark:text-teal-400 font-medium">Tailwind CSS v4</span>. What's next?
    </h3>
  </div>
</template>