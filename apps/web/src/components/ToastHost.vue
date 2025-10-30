<script setup lang="ts">
import { useToast } from '../stores/toast'
const toastStore = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 space-y-3 z-50">
    <div
      v-for="t in toastStore.toasts"
      :key="t.id"
      class="min-w-[220px] max-w-sm rounded-xl px-4 py-3 shadow-lg border text-sm flex items-start gap-2"
      :class="{
        'bg-white border-slate-200 text-slate-900': !t.type,
        'bg-emerald-50 border-emerald-200 text-emerald-800': t.type === 'success',
        'bg-red-50 border-red-200 text-red-800': t.type === 'error',
        'bg-slate-50 border-slate-200 text-slate-800': t.type === 'info',
      }"
    >
      <span class="mt-0.5">
        {{ t.message }}
      </span>
      <button
        class="ml-auto text-xs text-slate-500 hover:text-slate-900"
        @click="toastStore.remove(t.id)"
      >
        ✕
      </button>
    </div>
  </div>
</template>
