<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import Badge from '../../../components/ui/Badge.vue'

const authStore = useAuthStore()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const fullName = computed(() => authStore.fullName)
const userRole = computed(() => {
  const roles = authStore.user?.roles || []
  return roles.length > 0 ? roles[0] : 'USER'
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
  isOpen.value = false
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Remove click outside listener
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      @click.stop="toggleDropdown"
      class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full py-1 pl-1 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div
        class="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-semibold"
      >
        {{ fullName.charAt(0) }}
      </div>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ fullName }}</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
    >
      <!-- User info -->
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ fullName }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ authStore.user?.email }}</p>
        <div class="mt-1">
          <Badge :variant="userRole === 'ADMIN' ? 'primary' : 'secondary'" size="sm">
            {{ userRole }}
          </Badge>
        </div>
      </div>

      <!-- Menu items -->
      <router-link
        to="/profile"
        class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="isOpen = false"
      >
        Your Profile
      </router-link>

      <router-link
        to="/settings"
        class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="isOpen = false"
      >
        Settings
      </router-link>

      <button
        @click="logout"
        class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Sign out
      </button>
    </div>
  </div>
</template>
