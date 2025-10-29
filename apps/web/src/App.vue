<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <NavBar />
  <router-view />
</template>

<style>
body { margin: 0; font-family: system-ui, sans-serif; background:#f8fafc; }
button { background:#334155; color:white; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; }
button:hover { background:#475569; }
input, textarea { padding:8px; border:1px solid #e5e7eb; border-radius:8px; width:100%; }
label { font-weight:600; display:block; margin-top:12px; margin-bottom:6px; }
.container { max-width: 920px; margin: 16px auto; padding: 0 16px; }
.card { background:white; border:1px solid #e5e7eb; border-radius:10px; padding:12px; }
</style>
