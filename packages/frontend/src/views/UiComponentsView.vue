<script setup lang="ts">
import { ref } from 'vue'
import Button from '../components/ui/Button.vue'
import Card from '../components/ui/Card.vue'
import Badge from '../components/ui/Badge.vue'
import Input from '../components/ui/Input.vue'
import Alert from '../components/ui/Alert.vue'

const showAlert = ref(true)
const dismissAlert = () => {
  showAlert.value = false
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
      UI Components with Tailwind CSS v4
    </h1>

    <div class="space-y-12">
      <!-- Buttons Section -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Buttons</h2>
        <Card>
          <div class="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
          </div>

          <div class="mt-6 flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <div class="mt-6">
            <Button disabled>Disabled Button</Button>
          </div>
        </Card>
      </section>

      <!-- Badges Section -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Badges</h2>
        <Card>
          <div class="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>

          <div class="mt-6 flex flex-wrap gap-4">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </Card>
      </section>

      <!-- Inputs Section -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Inputs</h2>
        <Card>
          <Input label="Default Input" placeholder="Enter some text" />
          <Input label="Required Input" placeholder="This field is required" required />
          <Input label="Disabled Input" placeholder="This field is disabled" disabled />
          <Input label="Password Input" type="password" placeholder="Enter your password" />
          <Input
            label="Input with Error"
            placeholder="This has an error"
            error="This field is invalid"
          />
        </Card>
      </section>

      <!-- Alerts Section -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Alerts</h2>
        <div class="space-y-4">
          <Alert v-if="showAlert" title="Info Alert" dismissible @dismiss="dismissAlert">
            This is an informational alert. You can dismiss it by clicking the X.
          </Alert>

          <Alert variant="success" title="Success Alert">
            This is a success alert. Your changes have been saved successfully.
          </Alert>

          <Alert variant="warning" title="Warning Alert">
            This is a warning alert. Be careful with this action.
          </Alert>

          <Alert variant="error" title="Error Alert">
            This is an error alert. Something went wrong. Please try again.
          </Alert>
        </div>
      </section>

      <!-- Cards Section -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Cards</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Basic Card" subtitle="A simple card component">
            <p class="text-gray-700 dark:text-gray-300">
              This is a basic card with a title and subtitle.
            </p>
          </Card>

          <Card title="Card with Footer">
            <p class="text-gray-700 dark:text-gray-300">
              This card has a footer section with buttons.
            </p>

            <template #footer>
              <div class="flex justify-end space-x-2">
                <Button variant="secondary" size="sm">Cancel</Button>
                <Button size="sm">Submit</Button>
              </div>
            </template>
          </Card>
        </div>
      </section>
    </div>
  </div>
</template>
