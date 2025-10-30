<script setup lang="ts">
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
      <h1
        class="text-xl font-semibold text-blue-600 cursor-pointer"
        @click="go('/posts')"
      >
        Erasmus Atlas
      </h1>

      <nav class="flex items-center gap-3">
        <button class="btn btn-outline" @click="go('/')">Home</button>
        <button class="btn btn-outline" @click="go('/map')">Map</button>
        <button class="btn btn-outline" @click="go('/posts')">Posts</button>

        <template v-if="!auth.token">
          <button class="btn btn-primary" @click="go('/login')">Login</button>
          <button class="btn btn-outline" @click="go('/register')">Register</button>
        </template>

        <template v-else>
          <button class="btn btn-primary" @click="go('/submit')">Submit</button>
          <button class="btn btn-outline" @click="auth.logout()">Logout</button>
        </template>
      </nav>
    </div>
  </header>
</template>
