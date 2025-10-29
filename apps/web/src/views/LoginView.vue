<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'
const email = ref('demo@example.com')
const password = ref('secret123')
const auth = useAuth()
const router = useRouter()
async function submit(){
  const ok = await auth.login(email.value, password.value)
  if (ok) router.push('/posts')
}
</script>

<template>
  <div class="container">
    <h1>Login</h1>
    <div class="card" style="max-width:480px">
      <label>Email</label>
      <input v-model="email" type="email" />
      <label>Password</label>
      <input v-model="password" type="password" />
      <div style="margin-top:12px; display:flex; gap:8px">
        <button @click="submit" :disabled="auth.loading">Login</button>
        <span v-if="auth.error" style="color:#b91c1c">{{ auth.error }}</span>
      </div>
    </div>
  </div>
</template>
