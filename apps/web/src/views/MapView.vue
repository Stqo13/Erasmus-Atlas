<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl, { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { api } from '../lib/api'
import { TOPICS } from '../lib/topics'
import { colorForTopics, DEFAULT_MARKER, TOPIC_COLORS } from '../lib/topicColors'

type ClusterItem = {
  lat: number | null
  lng: number | null
  posts: Array<{
    id: string
    title: string
    body: string
    topics?: string[]
    city_id?: string
    created_at?: string
  }>
}

const mapContainerId = 'ea-map'
let map: Map | null = null
let markers: maplibregl.Marker[] = []

// UI state
const loading = ref(false)
const error = ref('')
const selected = ref<ClusterItem | null>(null)
const currentTopic = ref<string>('')       // dropdown filter
const itemsCount = ref(0)                  // rendered marker groups count

function clearMarkers() {
  for (const m of markers) m.remove()
  markers = []
}

async function fetchAndRender() {
  if (!map) return
  loading.value = true
  error.value = ''
  try {
    const b = map.getBounds()
    const params: any = {
      minLng: b.getWest(),
      minLat: b.getSouth(),
      maxLng: b.getEast(),
      maxLat: b.getNorth(),
      limit: 200,
    }
    if (currentTopic.value) params.topic = currentTopic.value

    const { data } = await api.get('/posts', { params })

    clearMarkers()

    const items: ClusterItem[] = Array.isArray(data?.items) ? data.items : []
    itemsCount.value = items.length

    for (const cluster of items) {
      if (cluster.lng == null || cluster.lat == null) continue

      const el = document.createElement('div') as HTMLDivElement
      el.className = 'ea-marker'

      const first = Array.isArray(cluster.posts) ? cluster.posts[0] : undefined
      const markerColor = colorForTopics(first?.topics) ?? DEFAULT_MARKER
      el.style.backgroundColor = markerColor
      el.style.cursor = 'pointer'

      // if there are multiple posts here, show a small count
      if (Array.isArray(cluster.posts) && cluster.posts.length > 1) {
        el.innerText = String(cluster.posts.length)
        el.style.color = '#fff'
        el.style.fontSize = '10px'
        el.style.fontWeight = '600'
        el.style.display = 'flex'
        el.style.alignItems = 'center'
        el.style.justifyContent = 'center'
        el.style.width = '18px'
        el.style.height = '18px'
      }

      const m = new maplibregl.Marker({ element: el })
        .setLngLat([cluster.lng, cluster.lat])
        .addTo(map)

      m.getElement().addEventListener('click', () => {
        selected.value = cluster
      })

      markers.push(m)
    }

    // if nothing to show, clear any stale selection
    if (itemsCount.value === 0) selected.value = null
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainerId,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [10, 50], // Europe-ish
    zoom: 4,
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

  map.on('load', fetchAndRender)
  map.on('moveend', fetchAndRender)
})

onBeforeUnmount(() => {
  clearMarkers()
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="flex h-[calc(100vh-72px)]"> <!-- subtract header height -->
    <!-- Map -->
    <div :id="mapContainerId" class="flex-1"></div>

    <!-- Sidebar -->
    <aside class="w-[360px] bg-white border-l border-ink/10 p-4 space-y-4 overflow-y-auto">
      <!-- Header with topic filter -->
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-lg font-semibold text-ink">Posts on map</h2>
        <select
          v-model="currentTopic"
          @change="fetchAndRender"
          class="input !py-1 !px-2 !h-8 !text-xs w-[160px]"
        >
          <option value="">All topics</option>
          <option v-for="t in TOPICS" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <!-- Tiny legend -->
      <div class="flex flex-wrap gap-2 text-xs text-ink/70">
        <span v-for="(hex, name) in TOPIC_COLORS" :key="name" class="inline-flex items-center gap-1">
          <span class="inline-block w-3 h-3 rounded-full" :style="{ backgroundColor: hex as string }"></span>
          {{ name }}
        </span>
      </div>

      <!-- Status / empty state -->
      <div v-if="loading" class="text-sm text-ink/60">Loading…</div>
      <div v-else-if="error" class="text-sm text-danger">{{ error }}</div>
      <div
        v-else-if="currentTopic && itemsCount === 0"
        class="rounded-xl2 border border-ink/10 bg-surface-100 p-3 text-sm text-ink/70"
      >
        No posts for <span class="font-semibold">{{ currentTopic }}</span> in this area.
        Try panning/zooming the map or choose a different topic.
      </div>
      <p v-else-if="!selected && itemsCount > 0" class="text-sm text-ink/60">
        Click a marker to view the posts at that location.
      </p>

      <!-- Selected cluster -->
      <div
        v-if="selected"
        class="bg-surface-50 border border-ink/10 rounded-xl2 p-3 space-y-3"
      >
        <div class="text-xs uppercase tracking-wide text-ink/50">
          Posts at this location
        </div>
        <div
          v-for="p in selected.posts"
          :key="p.id"
          class="bg-white rounded-xl2 border border-ink/10 p-2"
        >
          <h3 class="font-semibold text-ink text-sm">{{ p.title }}</h3>
          <p class="text-xs text-ink/60 mt-1">{{ p.body }}</p>

          <div v-if="p.topics?.length" class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="t in p.topics"
              :key="t"
              class="px-2 py-0.5 rounded-full text-xxs text-[10px] text-white"
              :style="{ backgroundColor: (TOPIC_COLORS as any)[t] || '#64748b' }"
            >
              {{ t }}
            </span>
          </div>
        </div>

        <button
          class="mt-2 btn btn-outline w-full"
          @click="selected = null"
        >
          Close
        </button>
      </div>
    </aside>
  </div>
</template>
