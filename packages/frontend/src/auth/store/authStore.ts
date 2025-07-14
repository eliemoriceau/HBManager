import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthService } from '../application/AuthService'
import { ApiUserRepository } from '../infrastructure/ApiUserRepository'
import type { User, UserCredentials, UserRegistrationData } from '@/auth/domain'

// Create repository and service instances
const userRepository = new ApiUserRepository()
const authService = new AuthService(userRepository)

/**
 * Authentication store using Pinia
 * Serves as a presentation layer state management for the Authentication bounded context
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return !!user.value && authService.isAuthenticated()
  })

  const fullName = computed(() => {
    if (!user.value) return ''
    // Le modèle User n'a plus les propriétés firstName et lastName
    return user.value.email
  })

  const hasRole = computed(() => {
    return (role: string) => user.value?.roles.includes(role as any) || false
  })

  // Actions
  async function login(credentials: UserCredentials) {
    loading.value = true
    error.value = null

    try {
      const result = await authService.login(credentials)
      user.value = result.user
    } catch (err: any) {
      error.value = err.message || 'Failed to login'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData: UserRegistrationData) {
    loading.value = true
    error.value = null

    try {
      const result = await authService.register(userData)
      user.value = result.user
    } catch (err: any) {
      error.value = err.message || 'Failed to register'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true

    try {
      await authService.logout()
      user.value = null
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!authService.isAuthenticated()) {
      user.value = null
      return
    }

    loading.value = true

    try {
      user.value = await authService.getCurrentUser()
    } catch (err) {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function refreshToken() {
    if (!authService.isAuthenticated()) {
      return
    }

    try {
      const result = await authService.refreshToken()
      user.value = result.user
    } catch (err) {
      // If refresh fails, logout user
      await logout()
    }
  }

  // Initialize store by fetching current user
  fetchCurrentUser()

  return {
    // State
    user,
    loading,
    error,

    // Getters
    isAuthenticated,
    fullName,
    hasRole,

    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshToken,
  }
})
