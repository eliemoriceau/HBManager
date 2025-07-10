<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './auth/store/authStore'
import HelloWorld from './components/HelloWorld.vue'
import UserMenu from './auth/presentation/components/UserMenu.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center mb-4 md:mb-0">
            <img alt="Vue logo" class="h-10 w-10 mr-3" src="@/assets/logo.svg" />
            <HelloWorld msg="Handball Manager" />
          </div>

          <div class="flex items-center">
            <nav class="flex space-x-6 mr-6">
              <RouterLink
                to="/"
                class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                Home
              </RouterLink>
              <RouterLink
                to="/about"
                class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                About
              </RouterLink>
              <RouterLink
                to="/ui-components"
                class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                UI Components
              </RouterLink>
            </nav>

            <!-- Authentication -->
            <template v-if="isAuthenticated">
              <UserMenu />
            </template>
            <template v-else>
              <div class="flex space-x-3">
                <RouterLink
                  to="/login"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Login
                </RouterLink>
                <RouterLink
                  to="/register"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Register
                </RouterLink>
              </div>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>
