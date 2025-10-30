<script setup lang="ts">
import { useAuth } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
const auth = useAuth()
const router = useRouter()
const route = useRoute()

function go(path: string) {
  router.push(path)
}
function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <header class="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200/80 dark:border-slate-800">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 gap-4">
      <div class="flex items-center gap-3">
        <span
          class="text-xl font-semibold text-blue-600 dark:text-blue-400 cursor-pointer"
          @click="go('/')"
        >
          Erasmus Atlas
        </span>
        <div class="flex gap-1">
          <button
            class="px-3 py-1.5 rounded-lg text-sm"
            :class="isActive('/') ? 'bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'"
            @click="go('/')"
          >
            Home
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm"
            :class="isActive('/map') ? 'bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'"
            @click="go('/map')"
          >
            Map
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm"
            :class="isActive('/posts') ? 'bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'"
            @click="go('/posts')"
          >
            Posts
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="!auth.token">
          <button class="btn btn-primary" @click="go('/login')">Login</button>
          <button class="btn btn-outline" @click="go('/register')">Register</button>
        </template>
        <template v-else>
          <span class="text-sm text-slate-500 dark:text-slate-300">Hi, {{ auth.user?.name || 'user' }}</span>
          <button class="btn btn-primary" @click="go('/submit')">Submit</button>
          <button class="btn btn-outline" @click="auth.logout()">Logout</button>
        </template>
      </div>
    </div>
  </header>
</template>
