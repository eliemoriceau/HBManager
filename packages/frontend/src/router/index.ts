import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { redirectIfAuthenticated, requireAuth } from '../auth/presentation/guards/authGuard'
import { requireSecretaryRole } from '../csvUpload/presentation/guards/secretaryGuard'

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
    // CSV Upload routes (require SECRETAIRE role)
    {
      path: '/csv-uploads',
      name: 'csv-uploads',
      component: () => import('../csvUpload/presentation/views/CsvUploadView.vue'),
      beforeEnter: requireSecretaryRole,
      meta: { requiresAuth: true },
    },
    {
      path: '/csv-uploads/:id',
      name: 'csv-upload-details',
      component: () => import('../csvUpload/presentation/views/CsvUploadDetailsView.vue'),
      beforeEnter: requireSecretaryRole,
      meta: { requiresAuth: true },
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
