<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const props = defineProps<{ placeholder?: string, type?: string }>()
</script>

<template>
  <input v-model="model" :type="props.type || 'text'" :placeholder="props.placeholder" class="input" />
</template>
