<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const posts = ref<any[]>([])

onMounted(async () => {
  try {
    const { data } = await axios.get('http://127.0.0.1:8080/posts')
    posts.value = data.items
  } catch (e) {
    console.error('API error', e)
  }
})
</script>

<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-4">Erasmus Atlas — Posts</h1>
    <div v-if="!posts.length" class="text-gray-600">No posts found</div>
    <ul v-else class="space-y-2">
      <li
        v-for="p in posts"
        :key="p.id"
        class="border rounded p-3"
      >
        <h2 class="font-semibold">{{ p.title }}</h2>
        <p class="text-sm text-gray-700">{{ p.body }}</p>
        <p v-if="p.lng && p.lat" class="text-xs text-gray-500">
          [{{ p.lng.toFixed(2) }}, {{ p.lat.toFixed(2) }}]
        </p>
      </li>
    </ul>
  </main>
</template>

<style>
body {
  font-family: system-ui, sans-serif;
  background: #f8fafc;
  margin: 0;
}
</style>
