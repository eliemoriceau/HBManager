import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { redirectIfAuthenticated, requireAuth } from '../auth/presentation/guards/authGuard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/ui-components',
      name: 'ui-components',
      component: () => import('../views/UiComponentsView.vue'),
    },
    // Authentication routes
    {
      path: '/login',
      name: 'login',
      component: () => import('../auth/presentation/views/LoginView.vue'),
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../auth/presentation/views/RegisterView.vue'),
      beforeEnter: redirectIfAuthenticated,
    },
    // 404 Not Found route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// Global navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Route requires authentication
    await requireAuth(to, from, next)
  } else {
    // Route doesn't require authentication
    next()
  }
})

export default router
