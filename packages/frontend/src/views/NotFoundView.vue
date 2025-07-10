<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
    <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
    <h2 class="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Page Not Found</h2>
    <p class="text-xl text-gray-600 dark:text-gray-400 max-w-md mb-8">
      The page you are looking for doesn't exist or has been moved.
    </p>

    <div class="flex flex-col sm:flex-row gap-4">
      <Button variant="secondary" size="lg" @click="goBack"> Go Back </Button>
      <Button variant="primary" size="lg" @click="goHome"> Go Home </Button>
    </div>
  </div>
</template>
