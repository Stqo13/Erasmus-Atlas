<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl, { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { api } from '../lib/api'

const mapEl = ref<HTMLDivElement | null>(null)
let map: Map
let markers: maplibregl.Marker[] = []

const selected = ref<any | null>(null)
const loading = ref(false)
const error = ref('')

async function fetchAndRender() {
  if (!map) return
  loading.value = true
  error.value = ''
  try {
    const b = map.getBounds()
    const params = {
      minLng: b.getWest(),
      minLat: b.getSouth(),
      maxLng: b.getEast(),
      maxLat: b.getNorth(),
      limit: 200
    }
    const { data } = await api.get('/posts', { params })

// clear old
for (const m of markers) m.remove()
markers = []

for (const cluster of data.items || []) {
  if (cluster.lng == null || cluster.lat == null) continue

  const el = document.createElement('div')
  el.className = 'ea-marker'

  if (Array.isArray(cluster.posts) && cluster.posts.length > 1) {
    el.innerText = String(cluster.posts.length)
    el.style.color = 'white'
    el.style.fontSize = '10px'
    el.style.fontWeight = '600'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
  }

  const m = new maplibregl.Marker({ element: el })
    .setLngLat([cluster.lng, cluster.lat])
    .addTo(map)

  m.getElement().addEventListener('click', () => {
    selected.value = cluster
  })

  markers.push(m)
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to load posts'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapEl.value as HTMLDivElement,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [2.0, 48.85], 
    zoom: 4
  })
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

  map.on('load', fetchAndRender)

  let timer: number | undefined
  map.on('moveend', () => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(fetchAndRender, 80)
  })
})

onBeforeUnmount(() => {
  for (const m of markers) m.remove()
  markers = []
  map?.remove()
})
</script>

<template>
  <div class="ea-map-layout">
    <div ref="mapEl" class="ea-map"></div>

    <aside class="ea-side">
      <h2>Map</h2>
      <p v-if="loading">Loading…</p>
      <p v-if="error" class="ea-err">{{ error }}</p>
      <p v-if="!loading && !error && !selected" class="ea-muted">Click a marker to view details.</p>

      <div v-if="selected" class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
  <div class="text-sm uppercase tracking-wide text-slate-400">Posts at this location</div>

  <div v-for="p in selected.posts" :key="p.id" class="bg-white rounded-lg border border-slate-100 p-2">
    <h3 class="font-semibold text-slate-800 text-sm">{{ p.title }}</h3>
    <p class="text-xs text-slate-500 mt-1">{{ p.body }}</p>
    <p v-if="p.topics?.length" class="flex flex-wrap gap-1 mt-2">
      <span
        v-for="t in p.topics"
        :key="t"
        class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xxs text-[10px]"
      >
        {{ t }}
      </span>
    </p>
  </div>

  <p class="text-xs text-slate-400">
    {{ selected.posts.length }} post(s) here.
  </p>

  <button
    class="mt-2 inline-flex items-center rounded-lg bg-slate-900 text-white text-sm px-3 py-1.5 hover:bg-slate-700"
    @click="selected = null"
  >
    Close
  </button>
</div>
    </aside>
  </div>
</template>

<style>
.ea-map-layout { display: grid; grid-template-columns: 1fr 360px; height: calc(100vh - 56px); }
.ea-map { width: 100%; height: 100%; }
.ea-side { padding: 12px; background: #fff; border-left: 1px solid #e5e7eb; overflow: auto; }
.ea-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
.ea-title { font-weight: 700; margin-bottom: 4px; }
.ea-body { font-size: 14px; color: #475569; }
.ea-geo { font-size: 12px; color: #6b7280; margin-top: 4px; }
.ea-muted { color: #6b7280; font-size: 14px; }
.ea-err { color: #b91c1c; background: #fee2e2; padding: 6px 8px; border-radius: 8px; }
.ea-btn { background: #334155; color:#fff; border:none; border-radius:8px; padding:6px 10px; cursor:pointer; }
.ea-btn:hover { background: #475569; }

.ea-marker {
  width: 10px; height: 10px;
  background: #2563eb;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0,0,0,.2);
}
@media (max-width: 900px) {
  .ea-map-layout { grid-template-columns: 1fr; }
  .ea-side { height: 40vh; border-left: none; border-top: 1px solid #e5e7eb; }
}
</style>