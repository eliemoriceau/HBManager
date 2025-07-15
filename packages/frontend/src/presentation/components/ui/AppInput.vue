<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  error: String,
  required: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (value: string | number) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <UFormGroup :label="label" :required="required" :error="error">
    <UInput
      :model-value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :disabled="disabled"
      :state="error ? 'error' : undefined"
      @update:model-value="handleInput"
    />
  </UFormGroup>
</template>