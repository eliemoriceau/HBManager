<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import AppCard from '../../../presentation/components/ui/AppCard.vue'
import AppInput from '../../../presentation/components/ui/AppInput.vue'
import AppButton from '../../../presentation/components/ui/AppButton.vue'
import AppAlert from '../../../presentation/components/ui/AppAlert.vue'
import type { UserCredentials } from '@/auth/domain'

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
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">Handball Manager</h1>
        <h2 class="mt-2 text-xl text-gray-600 dark:text-gray-400">Sign in to your account</h2>
      </div>

      <AppCard>
        <AppAlert v-if="formError" variant="error" dismissible @dismiss="formError = ''">
          {{ formError }}
        </AppAlert>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <AppInput
            v-model="credentials.email"
            label="Email Address"
            type="email"
            placeholder="your-email@example.com"
            :error="validationErrors.email"
            required
          />

          <AppInput
            v-model="credentials.password"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="validationErrors.password"
            required
          />

          <div class="flex items-center justify-between">
            <UCheckbox name="remember-me" label="Remember me" />

            <UButton variant="link" to="#" size="xs"> Forgot your password? </UButton>
          </div>

          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            :disabled="isSubmitting"
            :loading="isSubmitting"
            block
          >
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </AppButton>

          <div class="text-center mt-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?
              <UButton variant="link" to="/register" class="font-medium">
                Create an account
              </UButton>
            </p>
          </div>
        </form>
      </AppCard>
    </div>
  </div>
</template>
