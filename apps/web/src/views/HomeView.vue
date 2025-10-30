<template>
  <main class="max-w-6xl mx-auto px-6 py-10">
    <div class="grid gap-6 md:grid-cols-[1.3fr,0.7fr]">
      <section class="space-y-4">
        <h1 class="text-3xl font-bold text-slate-900">
          Erasmus Atlas
        </h1>
        <p class="text-slate-600 max-w-2xl">
          Explore Erasmus experiences across Europe: see student tips on the map, compare cities, and share your own stay.
        </p>
        <div class="flex gap-3">
          <router-link
            to="/map"
            class="btn btn-primary"
          >
            Open map
          </router-link>
          <router-link
            to="/posts"
            class="btn btn-outline"
          >
            Browse posts
          </router-link>
        </div>

        <div class="grid gap-3 md:grid-cols-3 pt-4">
          <div class="card">
            <p class="text-xs text-slate-400 uppercase mb-1">Live</p>
            <p class="text-2xl font-semibold">Map</p>
            <p class="text-xs text-slate-500 mt-1">See where people posted lately.</p>
          </div>
          <div class="card">
            <p class="text-xs text-slate-400 uppercase mb-1">Share</p>
            <p class="text-2xl font-semibold">Submit</p>
            <p class="text-xs text-slate-500 mt-1">Add your own Erasmus story.</p>
          </div>
          <div class="card">
            <p class="text-xs text-slate-400 uppercase mb-1">Soon</p>
            <p class="text-2xl font-semibold">Dashboard</p>
            <p class="text-xs text-slate-500 mt-1">Compare countries & cities.</p>
          </div>
        </div>
      </section>

      <aside class="space-y-3">
        <div class="card">
          <h2 class="font-semibold mb-2">What can I do here?</h2>
          <ul class="space-y-1 text-sm text-slate-600">
            <li>• View Erasmus posts on a map</li>
            <li>• Filter by area (soon: by category/sentiment)</li>
            <li>• Submit your own post with location</li>
          </ul>
        </div>
        <div class="card">
          <h2 class="font-semibold mb-2">Next up</h2>
          <p class="text-sm text-slate-600">Analytics dashboard, AI insights, moderation queue.</p>
        </div>
      </aside>
    </div>
  </main>
</template>
