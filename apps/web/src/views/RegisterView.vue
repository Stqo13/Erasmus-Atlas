<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const auth = useAuth()
const router = useRouter()
const note = ref('')
const err = ref('')

async function submit() {
  err.value = ''; note.value = ''
  const ok = await auth.register(name.value, email.value, password.value)
  if (ok) {
    note.value = 'Account created! Redirecting…'
    router.push('/home')
  } else {
    err.value = auth.error || 'Registration failed'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto space-y-4">
    <h1 class="text-2xl font-bold text-ink">Create account</h1>
    <form class="card space-y-3" @submit.prevent="submit">
      <div>
        <label class="text-sm">Name</label>
        <input v-model="name" class="input" required />
      </div>
      <div>
        <label class="text-sm">Email</label>
        <input v-model="email" type="email" class="input" required />
      </div>
      <div>
        <label class="text-sm">Password</label>
        <input v-model="password" type="password" class="input" required />
      </div>
      <button class="btn btn-primary w-full" :disabled="auth.loading">
        {{ auth.loading ? 'Creating…' : 'Create account' }}
      </button>
      <p v-if="note" class="text-green-600 text-sm">{{ note }}</p>
      <p v-if="err" class="text-danger text-sm">{{ err }}</p>
    </form>
  </div>
</template>