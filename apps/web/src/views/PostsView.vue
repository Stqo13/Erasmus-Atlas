<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '../lib/api'
import { topicColor } from '../lib/topicColors'

const posts = ref<any[]>([])
const loading = ref(true)
const error = ref('')

async function loadPosts() {
  loading.value = true
  error.value = ''
  try {
    // Call the grouped endpoint but without bbox, so you get recent groups
    const { data } = await api.get('/posts', { params: { limit: 100 } })
    const groups = Array.isArray(data?.items) ? data.items : []

    // Flatten: attach group lat/lng to each inner post
    posts.value = groups.flatMap((g: any) => {
      const lat = g?.lat ?? null
      const lng = g?.lng ?? null
      const arr = Array.isArray(g?.posts) ? g.posts : []
      return arr.map((p: any) => ({
        ...p,
        lat,
        lng,
      }))
    })
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

onMounted(loadPosts)

function fmtCoord(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : ''
}
function chipColor(t?: string) {
  return topicColor(t)
}
</script>

<template>
  <main class="max-w-5xl mx-auto px-6 py-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">Posts</h1>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="!posts.length" class="text-gray-500">No posts yet.</div>

    <div v-else class="grid gap-4">
      <article v-for="p in posts" :key="p.id" class="card hover:shadow-md transition">
        <h2 class="font-semibold text-lg text-gray-800">{{ p.title }}</h2>
        <p class="text-gray-600 text-sm mt-1">{{ p.body }}</p>

        <div v-if="p.topics?.length" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="t in p.topics"
            :key="t"
            class="px-2 py-0.5 rounded-full text-xxs text-[10px] text-white"
            :style="{ backgroundColor: chipColor(t) }"
          >
            {{ t }}
          </span>
        </div>

        <p v-if="p.lat != null && p.lng != null" class="text-xs text-gray-400 mt-2">
          🌍 [{{ fmtCoord(p.lat) }}, {{ fmtCoord(p.lng) }}]
        </p>
      </article>
    </div>
  </main>
</template>
