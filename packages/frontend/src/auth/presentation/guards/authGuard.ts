import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../../store/authStore'

/**
 * Authentication guard for Vue Router
 * Ensures user is authenticated before accessing protected routes
 */
export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

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

  if (!authStore.isAuthenticated) {
    // Redirect to login page with return URL
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}

/**
 * Redirect authenticated users away from auth pages
 */
export const redirectIfAuthenticated = async (
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

  if (authStore.isAuthenticated) {
    // Redirect to home or the requested page
    const redirectPath = to.query.redirect?.toString() || '/'
    next(redirectPath)
  } else {
    next()
  }
}
