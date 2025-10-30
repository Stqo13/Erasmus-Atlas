<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../lib/api'

const posts = ref<any[]>([])
const loading = ref(true)
const error = ref('')
onMounted(async () => {
  try {
    const { data } = await api.get('/posts')
    posts.value = data.items || []
  } catch (e: any) {
    error.value = e?.message || 'Failed to load posts'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="max-w-5xl mx-auto px-6 py-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">Posts</h1>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="!posts.length" class="text-gray-500">No posts yet.</div>

    <div class="grid gap-4">
      <article
        v-for="p in posts"
        :key="p.id"
        class="card hover:shadow-md transition"
      >
        <h2 class="font-semibold text-lg text-gray-800">{{ p.title }}</h2>
        <p class="text-gray-600 text-sm mt-1">{{ p.body }}</p>
        <p v-if="p.lat && p.lng" class="text-xs text-gray-400 mt-2">
          🌍 [{{ p.lat.toFixed(2) }}, {{ p.lng.toFixed(2) }}]
        </p>
      </article>
    </div>
  </main>
</template>
