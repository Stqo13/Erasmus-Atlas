<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../lib/api'
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()

const title = ref('')
const body = ref('')
const lat = ref<number | null>(40.4168)   // Madrid default
const lng = ref<number | null>(-3.7038)
const message = ref('')

async function submit() {
  message.value = ''
  try {
    if (!auth.token) { message.value = 'Please login first.'; return }
    const payload: any = { title: title.value, body: body.value }
    if (lat.value != null && lng.value != null) {
      payload.lat = lat.value; payload.lng = lng.value
    }
    const { data } = await api.post('/posts', payload)
    message.value = `Post created: ${data.id}`
    title.value = ''; body.value = ''
    router.push('/posts')
  } catch (e: any) {
    message.value = e?.response?.data?.error || 'Failed to create post'
    console.error(e)
  }
}
</script>

<template>
  <div class="container">
    <h1>Submit Post</h1>
    <div class="card" style="max-width:640px">
      <label>Title</label>
      <input v-model="title" placeholder="Your title" />
      <label>Body</label>
      <textarea v-model="body" rows="4" placeholder="Share your tip/story"></textarea>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px">
        <div>
          <label>Latitude</label>
          <input v-model.number="lat" type="number" step="0.0001" />
        </div>
        <div>
          <label>Longitude</label>
          <input v-model.number="lng" type="number" step="0.0001" />
        </div>
      </div>
      <div style="margin-top:12px">
        <button @click="submit">Create</button>
        <span v-if="message" style="margin-left:8px">{{ message }}</span>
      </div>
    </div>
  </div>
</template>
