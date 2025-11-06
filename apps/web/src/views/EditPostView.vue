<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../lib/api'
import { useToast } from '../stores/toast'
import { TOPICS } from '../lib/topics'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const id = route.params.id as string
const title = ref('')
const body = ref('')
const topics = ref<string[]>([])
const cities = ref<any[]>([])
const cityId = ref<string | null>(null)
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true; error.value = ''
  try {
    const [postRes, citiesRes] = await Promise.all([
      api.get(`/me/posts/${id}`),
      api.get('/cities')
    ])
    const p = postRes.data
    title.value = p.title
    body.value = p.body
    topics.value = p.topics || []
    cityId.value = p.city_id || null
    lat.value = p.lat ?? null
    lng.value = p.lng ?? null
    cities.value = citiesRes.data.items || []
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to load'
  } finally { loading.value = false }
}

async function save() {
  try {
    await api.put(`/posts/${id}`, {
      title: title.value,
      body: body.value,
      topics: topics.value,
      cityId: cityId.value,
      lat: lat.value ?? undefined,
      lng: lng.value ?? undefined,
    })
    toast.success('Saved')
    router.push('/me/posts')
  } catch (e: any) {
    toast.error(e?.response?.data?.error || 'Save failed')
  }
}

onMounted(load)
</script>

<template>
  <main class="max-w-3xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold">Edit Post</h1>
    <div v-if="loading">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>

    <form v-else class="card space-y-4" @submit.prevent="save">
      <div>
        <label class="font-medium">Title</label>
        <input v-model="title" class="input" required />
      </div>

      <div>
        <label class="font-medium">Body</label>
        <textarea v-model="body" class="input" rows="5" required></textarea>
      </div>

      <div>
        <label class="font-medium">Topics</label>
        <div class="flex flex-wrap gap-2 mt-2">
          <label v-for="t in TOPICS" :key="t"
                 class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm"
                 :class="topics.includes(t) ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-300 text-slate-700'">
            <input type="checkbox" class="accent-blue-600" :value="t" v-model="topics" />
            {{ t }}
          </label>
        </div>
      </div>

      <div>
        <label class="font-medium">City</label>
        <select v-model="cityId" class="input">
          <option :value="null">— none —</option>
          <option v-for="c in cities" :key="c.id" :value="c.id">
            {{ c.name }} ({{ c.country_iso2 }})
          </option>
        </select>
        <p class="text-xs text-slate-500 mt-1">Or override with exact coordinates below.</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-medium text-sm">Latitude</label>
          <input v-model.number="lat" type="number" class="input" step="0.0001" />
        </div>
        <div>
          <label class="font-medium text-sm">Longitude</label>
          <input v-model.number="lng" type="number" class="input" step="0.0001" />
        </div>
      </div>

      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary">Save</button>
        <router-link to="/me/posts" class="btn btn-ghost">Cancel</router-link>
      </div>
    </form>
  </main>
</template>