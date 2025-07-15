<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/authStore'
import AppCard from '../../../presentation/components/ui/AppCard.vue'
import AppInput from '../../../presentation/components/ui/AppInput.vue'
import AppButton from '../../../presentation/components/ui/AppButton.vue'
import AppAlert from '../../../presentation/components/ui/AppAlert.vue'
import type { UserRegistrationData } from '@/auth/domain'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const registrationData = reactive<UserRegistrationData>({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
})

// Additional form fields
const confirmPassword = ref('')

// Validation state
const validationErrors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
})

const formError = ref('')
const isSubmitting = ref(false)

// Validate form
const validateForm = (): boolean => {
  let isValid = true

  // Reset validation errors
  Object.keys(validationErrors).forEach((key) => {
    validationErrors[key as keyof typeof validationErrors] = ''
  })
  formError.value = ''

  // Validate email
  if (!registrationData.email) {
    validationErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
    validationErrors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Validate first name
  if (!registrationData.firstName) {
    validationErrors.firstName = 'First name is required'
    isValid = false
  }

  // Validate last name
  if (!registrationData.lastName) {
    validationErrors.lastName = 'Last name is required'
    isValid = false
  }

  // Validate password
  if (!registrationData.password) {
    validationErrors.password = 'Password is required'
    isValid = false
  } else if (registrationData.password.length < 8) {
    validationErrors.password = 'Password must be at least 8 characters long'
    isValid = false
  }

  // Validate confirm password
  if (!confirmPassword.value) {
    validationErrors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (confirmPassword.value !== registrationData.password) {
    validationErrors.confirmPassword = 'Passwords do not match'
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
    await authStore.register(registrationData)
    router.push('/') // Redirect to home page after successful registration
  } catch (error: any) {
    formError.value = error.message || 'An error occurred during registration. Please try again.'
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
        <h2 class="mt-2 text-xl text-gray-600 dark:text-gray-400">Create your account</h2>
      </div>

      <AppCard>
        <AppAlert v-if="formError" variant="error" dismissible @dismiss="formError = ''">
          {{ formError }}
        </AppAlert>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppInput
              v-model="registrationData.firstName"
              label="First Name"
              placeholder="John"
              :error="validationErrors.firstName"
              required
            />

            <AppInput
              v-model="registrationData.lastName"
              label="Last Name"
              placeholder="Doe"
              :error="validationErrors.lastName"
              required
            />
          </div>

          <AppInput
            v-model="registrationData.email"
            label="Email Address"
            type="email"
            placeholder="your-email@example.com"
            :error="validationErrors.email"
            required
          />

          <AppInput
            v-model="registrationData.password"
            label="Password"
            type="password"
            placeholder="••••••••"
            :error="validationErrors.password"
            required
          />

          <AppInput
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            :error="validationErrors.confirmPassword"
            required
          />

          <div class="flex items-center">
            <UCheckbox
              id="terms"
              name="terms"
              required
              label="I agree to the Terms of Service and Privacy Policy"
            />
          </div>

          <AppButton type="submit" variant="primary" size="lg" :disabled="isSubmitting" block>
            {{ isSubmitting ? 'Creating account...' : 'Create account' }}
          </AppButton>

          <div class="text-center mt-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
              <UButton variant="link" to="/login" class="font-medium"> Sign in </UButton>
            </p>
          </div>
        </form>
      </AppCard>
    </div>
  </div>
</template>
