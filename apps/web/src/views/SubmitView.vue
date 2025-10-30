<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../lib/api'
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()

const title = ref('')
const body = ref('')
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)
const message = ref('')

async function submit() {
  message.value = ''
  if (!auth.token) return (message.value = 'Please login first.')

  try {
    const { data } = await api.post('/posts', {
      title: title.value,
      body: body.value,
      lat: lat.value,
      lng: lng.value,
    })
    message.value = `✅ Post created: ${data.id}`
    router.push('/map')
  } catch (e: any) {
    message.value = `❌ ${e?.response?.data?.error || 'Failed to create post'}`
  }
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-6 py-6">
    <h1 class="text-2xl font-bold mb-4">Create a Post</h1>

    <form class="card grid gap-4" @submit.prevent="submit">
      <div>
        <label class="font-medium">Title</label>
        <input v-model="title" class="input" placeholder="Title" />
      </div>

      <div>
        <label class="font-medium">Body</label>
        <textarea v-model="body" class="input" rows="4" placeholder="Share your story"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="font-medium">Latitude</label>
          <input v-model.number="lat" type="number" class="input" />
        </div>
        <div>
          <label class="font-medium">Longitude</label>
          <input v-model.number="lng" type="number" class="input" />
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-full">Submit</button>
      <p class="text-sm text-gray-600">{{ message }}</p>
    </form>
  </main>
</template>
