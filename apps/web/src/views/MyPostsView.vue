<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../lib/api'
import { useToast } from '../stores/toast'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()

const items = ref<any[]>([])
const page = ref(1)
const limit = 20
const total = ref(0)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true; error.value = ''
  try {
    const { data } = await api.get('/me/posts', { params: { page: page.value, limit } })
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to load'
  } finally { loading.value = false }
}

function editPost(id: string) {
  router.push(`/posts/${id}/edit`)
}

async function deletePost(id: string) {
  if (!confirm('Delete this post?')) return
  try {
    await api.delete(`/posts/${id}`)
    toast.success('Deleted')
    load()
  } catch (e: any) {
    toast.error(e?.response?.data?.error || 'Delete failed')
  }
}

onMounted(load)
</script>

<template>
  <main class="max-w-4xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">My Posts</h1>

    <div v-if="loading">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <ul v-else class="space-y-3">
      <li v-for="p in items" :key="p.id" class="border rounded-xl p-4 flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold">{{ p.title }}</h3>
          <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ p.body }}</p>
          <div class="text-xs text-slate-500 mt-2">
            <span v-if="p.city_name">{{ p.city_name }} ({{ p.country_iso2 }}) • </span>
            <span v-if="p.lat != null && p.lng != null">[{{ Number(p.lat).toFixed(2) }}, {{ Number(p.lng).toFixed(2) }}] • </span>
            <span>{{ new Date(p.created_at).toLocaleDateString() }}</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="t in (p.topics || [])" :key="t" class="text-xs bg-slate-100 px-2 py-0.5 rounded">{{ t }}</span>
          </div>
        </div>

        <div class="shrink-0 flex items-center gap-2">
          <button class="btn btn-outline" @click="editPost(p.id)">Edit</button>
          <button class="btn btn-ghost text-red-600" @click="deletePost(p.id)">Delete</button>
        </div>
      </li>
    </ul>

    <div v-if="total > limit" class="mt-4 flex items-center justify-between">
      <button class="btn btn-ghost" :disabled="page===1" @click="page--; load()">Prev</button>
      <div class="text-sm text-slate-500">Page {{ page }}</div>
      <button class="btn btn-ghost" :disabled="page*limit>=total" @click="page++; load()">Next</button>
    </div>
  </main>
</template>