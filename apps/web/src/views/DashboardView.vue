<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { api } from '../lib/api'

type TopicRow = { topic: string; count: number }
type MonthPoint = { month: string; count: number }

const loading = ref(true)
const error = ref('')
const total = ref(0)
const topics = ref<TopicRow[]>([])
const series = ref<MonthPoint[]>([])
const insights = ref<string[]>([])

const country = ref<string>('') // optional filter

async function load() {
  loading.value = true; error.value = ''
  try {
    const { data } = await api.get('/analytics/overview', { params: { country: country.value || undefined } })
    total.value   = data.total
    topics.value  = data.topics || []
    series.value  = data.series || []
    insights.value = data.insights || []

    // render charts
    renderBar()
    renderLine()
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'Failed to load analytics'
  } finally {
    loading.value = false
  }
}

let barEl: HTMLDivElement | null = null
let lineEl: HTMLDivElement | null = null
let barChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null

function renderBar() {
  if (!barEl) barEl = document.getElementById('topicBar') as HTMLDivElement
  if (!barEl) return
  if (!barChart) barChart = echarts.init(barEl)
  const names = topics.value.map(t => t.topic)
  const counts = topics.value.map(t => t.count)
  barChart.setOption({
    animation: true,
    tooltip: {},
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 20 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: counts }]
  })
}

function renderLine() {
  if (!lineEl) lineEl = document.getElementById('postLine') as HTMLDivElement
  if (!lineEl) return
  if (!lineChart) lineChart = echarts.init(lineEl)
  const months = series.value.map(p => p.month)
  const counts = series.value.map(p => p.count)
  lineChart.setOption({
    animation: true,
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: counts, smooth: true }]
  })
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-end gap-3">
      <div>
        <h1 class="text-2xl font-bold text-ink">Analytics</h1>
        <p class="text-ink/60 text-sm">Activity and topics from seeded posts</p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <select v-model="country" class="input !h-9 !py-1 !px-2 w-[160px]">
          <option value="">All countries</option>
          <!-- You can hardcode a few popular ISO-2s or fetch /countries later -->
          <option value="ES">ES</option>
          <option value="IT">IT</option>
          <option value="FR">FR</option>
          <option value="DE">DE</option>
        </select>
        <button class="btn btn-primary" @click="load">Apply</button>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <div class="card">
        <div class="text-xs text-ink/60">Total posts</div>
        <div class="text-3xl font-bold text-ink mt-1">{{ total }}</div>
      </div>

      <div class="card md:col-span-2">
        <div class="text-sm font-semibold text-ink mb-2">Top topics</div>
        <div id="topicBar" class="h-64"></div>
      </div>

      <div class="card md:col-span-3">
        <div class="text-sm font-semibold text-ink mb-2">Monthly activity</div>
        <div id="postLine" class="h-72"></div>
      </div>

      <div class="card md:col-span-3">
        <div class="text-sm font-semibold text-ink mb-2">Insights</div>
        <ul class="list-disc list-inside text-ink/80 space-y-1">
          <li v-for="i in insights" :key="i">{{ i }}</li>
        </ul>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-ink/60">Loading…</div>
    <div v-if="error" class="text-sm text-danger">{{ error }}</div>
  </div>
</template>