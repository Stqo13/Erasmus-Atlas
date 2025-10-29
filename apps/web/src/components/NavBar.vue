<script setup lang="ts">
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'
const auth = useAuth()
const router = useRouter()
function go(path: string){ router.push(path) }
</script>

<template>
  <nav style="display:flex; gap:12px; align-items:center; padding:12px; background:#0f172a; color:#fff">
    <strong style="cursor:pointer" @click="go('/posts')">Erasmus Atlas</strong>
    <span style="flex:1"></span>
    <button @click="go('/map')">Map</button>
    <button v-if="!auth.token" @click="go('/login')">Login</button>
    <button v-if="!auth.token" @click="go('/register')">Register</button>
    <button v-if="auth.token" @click="go('/submit')">Submit</button>
    <button v-if="auth.token" @click="auth.logout()">Logout</button>
  </nav>
</template>
