import { useAuthStore } from '@/auth/store/authStore.ts'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

/**
 * Guard to ensure user has SECRETAIRE role
 * This is used to protect routes that should only be accessible to secretaries
 */
export const requireSecretaryRole = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()

  // Wait for auth check to complete if needed
  if (authStore.loading) {
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve(null)
        }
      })
    })
  }

  // Check if user is authenticated and has SECRETAIRE role
  if (!authStore.isAuthenticated || !authStore.hasRole('SECRETAIRE')) {
    // If not authenticated, redirect to login with return URL
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    } else {
      // If authenticated but doesn't have SECRETAIRE role, redirect to home
      next({ path: '/' })
    }
  } else {
    // User is authenticated and has SECRETAIRE role, proceed
    next()
  }
}
