<script setup lang="ts"></script>

<template>
  <section class="grid md:grid-cols-2 gap-6 items-center">
    <div class="space-y-4">
      <h1 class="text-3xl md:text-4xl font-bold">Discover Erasmus experiences across Europe</h1>
      <p class="text-ink/70">
        Compare satisfaction, housing, nightlife and more. Browse the map, read posts, and share your tips.
      </p>
      <div class="flex gap-3">
        <RouterLink to="/map" class="btn btn-primary">Explore the map</RouterLink>
        <RouterLink to="/submit" class="btn btn-outline">Share a post</RouterLink>
      </div>
    </div>
    <div class="card bg-gradient-to-br from-sky/40 via-rose/30 to-sand/50">
      <div class="text-ink/70 text-sm">
        Live demo cards or a mini screenshot/illustration can sit here.
      </div>
    </div>
  </section>
</template>
