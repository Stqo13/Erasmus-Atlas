<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../lib/api'
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '../stores/toast'

const auth = useAuth()
const router = useRouter()
const toast = useToast()

const title = ref('')
const body = ref('')
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)
const cities = ref<any[]>([])
const selectedCityId = ref<string>('')

onMounted(async () => {
  const { data } = await api.get('/cities')
  cities.value = data.items || []
})

async function submit() {
  if (!auth.token) {
    toast.error('Please login first.')
    router.push('/login')
    return
  }

  const payload: any = {
    title: title.value,
    body: body.value,
  }

  if (selectedCityId.value) {
    payload.cityId = selectedCityId.value
  } else if (lat.value != null && lng.value != null) {
    payload.lat = lat.value
    payload.lng = lng.value
  }

  try {
    await api.post('/posts', payload)
    toast.success('Post created ✅')
    router.push('/map')
  } catch (e: any) {
    toast.error(e?.response?.data?.error || 'Failed to create post')
  }
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-6 py-6 space-y-4">
    <h1 class="text-2xl font-bold">Create a post</h1>

    <form class="card space-y-4" @submit.prevent="submit">
      <div>
        <label class="font-medium">Title</label>
        <input v-model="title" class="input" required />
      </div>

      <div>
        <label class="font-medium">Body</label>
        <textarea v-model="body" class="input" rows="4" required></textarea>
      </div>

      <div>
        <label class="font-medium">Location</label>
        <select v-model="selectedCityId" class="input">
          <option value="">-- choose a city --</option>
          <option v-for="c in cities" :key="c.id" :value="c.id">
            {{ c.name }} ({{ c.country_iso2 }})
          </option>
        </select>
        <p class="text-xs text-slate-400 mt-1">Or set exact coordinates below.</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-medium text-sm">Latitude (optional)</label>
          <input v-model.number="lat" type="number" class="input" step="0.0001" />
        </div>
        <div>
          <label class="font-medium text-sm">Longitude (optional)</label>
          <input v-model.number="lng" type="number" class="input" step="0.0001" />
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-full">
        Submit
      </button>
    </form>
  </main>
</template>
