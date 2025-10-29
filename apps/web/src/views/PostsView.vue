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
    error.value = e?.message || 'Failed to load'
  } finally { loading.value = false }
})
</script>

<template>
  <div class="container">
    <h1>Posts</h1>
    <div v-if="loading">Loading…</div>
    <div v-else-if="error" class="card" style="color:#b91c1c; background:#fee2e2">{{ error }}</div>
    <div v-else-if="!posts.length" class="card">No posts yet.</div>
    <ul v-else style="list-style:none; padding:0; display:grid; gap:8px">
      <li v-for="p in posts" :key="p.id" class="card">
        <div style="font-weight:600">{{ p.title }}</div>
        <div style="font-size:14px; color:#475569">{{ p.body }}</div>
        <div v-if="p.lng != null && p.lat != null" style="font-size:12px; color:#6b7280; margin-top:4px">
          [{{ Number(p.lng).toFixed(3) }}, {{ Number(p.lat).toFixed(3) }}]
        </div>
      </li>
    </ul>
  </div>
</template>
