<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import Card from '../../../components/ui/Card.vue'
import Input from '../../../components/ui/Input.vue'
import Button from '../../../components/ui/Button.vue'
import Alert from '../../../components/ui/Alert.vue'
import { UserCredentials } from '../../domain/model/User'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const credentials = reactive<UserCredentials>({
  email: '',
  password: '',
})

// Validation state
const validationErrors = reactive({
  email: '',
  password: '',
})

const formError = ref('')
const isSubmitting = ref(false)

// Validate form
const validateForm = (): boolean => {
  let isValid = true

  // Reset validation errors
  validationErrors.email = ''
  validationErrors.password = ''
  formError.value = ''

  // Validate email
  if (!credentials.email) {
    validationErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    validationErrors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Validate password
  if (!credentials.password) {
    validationErrors.password = 'Password is required'
    isValid = false
  }

  return isValid
}

// Submit form
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await authStore.login(credentials)
    router.push('/') // Redirect to home page after successful login
  } catch (error: any) {
    formError.value = error.message || 'An error occurred during login. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Handball Manager</h1>
        <h2 class="mt-2 text-xl text-gray-600 dark:text-gray-400">Sign in to your account</h2>
      </div>

      <Card>
        <Alert v-if="formError" variant="error" dismissible @dismiss="formError = ''">
          {{ formError }}
        </Alert>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <Input
            v-model="credentials.email"
            label="Email Address"
            type="email"
            placeholder="your-email@example.com"
            :error="validationErrors.email"
            required
          />

          <Input
            v-model="credentials.password"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="validationErrors.password"
            required
          />

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Forgot your password?
              </a>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" :disabled="isSubmitting" class="w-full">
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </Button>

          <div class="text-center mt-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?
              <router-link
                to="/register"
                class="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
              >
                Create an account
              </router-link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>
