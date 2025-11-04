<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const email = ref('demo@demo.com')
const password = ref('secret123')
const auth = useAuth()
const router = useRouter()
const route = useRoute()

const note = ref('')
const err = ref('')

async function submit() {
  err.value = ''; note.value = ''
  const ok = await auth.login(email.value, password.value)
  if (ok) {
    note.value = 'Welcome back!'
    const next = (route.query.next as string) || '/map'
    router.push(next)
  } else {
    err.value = auth.error || 'Login failed'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto space-y-4">
    <h1 class="text-2xl font-bold text-ink">Log in</h1>
    <form class="card space-y-3" @submit.prevent="submit">
      <div>
        <label class="text-sm">Email</label>
        <input v-model="email" type="email" class="input" required />
      </div>
      <div>
        <label class="text-sm">Password</label>
        <input v-model="password" type="password" class="input" required />
      </div>
      <button class="btn btn-primary w-full" :disabled="auth.loading">
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
      </button>
      <p v-if="note" class="text-green-600 text-sm">{{ note }}</p>
      <p v-if="err" class="text-danger text-sm">{{ err }}</p>
      <p class="text-xs text-ink/60">
        No account? <router-link to="/register" class="text-plum underline">Create one</router-link>.
      </p>
    </form>
  </div>
</template>