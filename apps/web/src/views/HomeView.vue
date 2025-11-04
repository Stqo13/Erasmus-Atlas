<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../lib/api'
import { useAuth } from '../stores/auth'

const auth = useAuth()

type TopicRow = { topic: string; count: number }
type Post = {
  id: string
  title: string
  body: string
  city_name?: string
  country_iso2?: string
  created_at?: string
  topics?: string[]
}

const loading = ref(true)
const error = ref('')
const totalPosts = ref(0)
const topTopics = ref<TopicRow[]>([])
const recentPosts = ref<Post[]>([])

async function load() {
  loading.value = true; error.value = ''
  try {
    const [{ data: ov }, { data: posts }] = await Promise.all([
      api.get('/analytics/overview'),
      api.get('/posts', { params: { limit: 5 } }),
    ])
    totalPosts.value = ov?.total ?? 0
    topTopics.value = (ov?.topics ?? []).slice(0, 5)
    recentPosts.value = posts?.items ?? []
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function since(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString()
}
</script>

<template>
  <div class="space-y-8">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-xl2 border border-ink/10 bg-surface-100 shadow-card p-6">
      <div class="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-ink">Erasmus Atlas</h1>
          <p class="mt-2 text-ink/70">
            Compare experiences, explore the map, and share tips with students across Europe.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <RouterLink to="/map" class="btn btn-primary">Explore Map</RouterLink>
            <RouterLink v-if="auth.token" to="/submit" class="btn btn-outline">Share a Post</RouterLink>
            <RouterLink v-else to="/register" class="btn btn-outline">Create Account</RouterLink>
          </div>
        </div>

        <!-- Soft brand panel -->
        <div class="rounded-xl2 bg-gradient-to-br from-rose/40 to-accent-blue/30 p-4 border border-ink/10">
          <div class="grid grid-cols-3 gap-3">
            <div class="card text-center">
              <div class="text-xs text-ink/60">Total posts</div>
              <div class="text-2xl font-bold text-ink mt-1">{{ totalPosts }}</div>
            </div>
            <div class="card text-center">
              <div class="text-xs text-ink/60">Top topic</div>
              <div class="text-lg font-semibold text-ink mt-1">
                {{ topTopics[0]?.topic || '—' }}
              </div>
            </div>
            <div class="card text-center">
              <div class="text-xs text-ink/60">You</div>
              <div class="text-lg font-semibold text-ink mt-1">
                {{ auth.user?.name || 'Guest' }}
              </div>
            </div>
          </div>
          <p class="text-xs text-ink/60 mt-3">
            Data updates as new posts arrive. Dive deeper in the <RouterLink to="/dashboard" class="text-plum underline">dashboard</RouterLink>.
          </p>
        </div>
      </div>
    </section>

    <!-- Content grid -->
    <section class="grid lg:grid-cols-3 gap-6">
      <!-- Left: Recent posts -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-ink">Recent posts</h2>
          <RouterLink to="/posts" class="text-plum text-sm underline">View all</RouterLink>
        </div>

        <div v-if="loading" class="card">Loading…</div>
        <div v-else-if="error" class="card text-danger">{{ error }}</div>
        <div v-else-if="recentPosts.length === 0" class="card">No posts yet — be the first to <RouterLink to="/submit" class="text-plum underline">share</RouterLink>!</div>

        <div v-else class="space-y-3">
          <article v-for="p in recentPosts" :key="p.id" class="card hover:translate-y-[-2px] transition-transform">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl2 bg-plum/15 text-plum grid place-items-center font-bold">
                {{ (p.topics?.[0] || 'P').slice(0,1).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-ink font-semibold truncate">{{ p.title }}</h3>
                <p class="text-ink/70 text-sm line-clamp-2 mt-0.5">{{ p.body }}</p>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/60">
                  <span v-if="p.city_name">{{ p.city_name }} <span v-if="p.country_iso2">({{ p.country_iso2 }})</span></span>
                  <span v-if="p.created_at">• {{ since(p.created_at) }}</span>
                  <span v-for="t in (p.topics || [])" :key="t" class="chip bg-surface-50 border border-ink/10">{{ t }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Right: Quick links / Top topics -->
      <aside class="space-y-4">
        <div class="card">
          <h3 class="text-sm font-semibold text-ink mb-2">Jump in</h3>
          <div class="grid gap-2">
            <RouterLink to="/map" class="btn btn-outline w-full">Open Map</RouterLink>
            <RouterLink to="/dashboard" class="btn btn-outline w-full">View Analytics</RouterLink>
            <RouterLink v-if="auth.token" to="/submit" class="btn btn-primary w-full">Create Post</RouterLink>
            <RouterLink v-else to="/login" class="btn btn-primary w-full">Log in</RouterLink>
          </div>
        </div>

        <div class="card">
          <h3 class="text-sm font-semibold text-ink mb-2">Top topics</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="t in topTopics" :key="t.topic" class="chip bg-surface-50 border border-ink/10">
              {{ t.topic }} • {{ t.count }}
            </span>
          </div>
        </div>

        <div class="card">
          <h3 class="text-sm font-semibold text-ink mb-2">Tips</h3>
          <ul class="list-disc list-inside text-ink/70 text-sm space-y-1">
            <li>Use the topic filter on the map to find hotspots.</li>
            <li>Posts cluster by city; click a marker to see all posts there.</li>
            <li>Check the dashboard to spot monthly trends.</li>
          </ul>
        </div>
      </aside>
    </section>
  </div>
</template>
