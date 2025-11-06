<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuth } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const isActive = (p: string) => route.path === p || route.path.startsWith(p + '/')

/* Topbar user menu */
const menuOpen = ref(false)
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function closeMenu() {
  menuOpen.value = false
}
function onLogout() {
  auth.logout()
  closeMenu()
  router.push('/')
}

/* Mobile sidebar */
const mobileOpen = ref(false)
function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}
function closeMobile() {
  mobileOpen.value = false
}

/* Close dropdown on escape / outside click */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    menuOpen.value = false
    mobileOpen.value = false
  }
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="min-h-screen grid md:grid-cols-[260px_1fr]">
    <!-- Sidebar (desktop) -->
    <aside class="hidden md:flex flex-col bg-white border-r border-ink/10">
      <div class="px-5 py-4 border-b border-ink/10">
        <RouterLink to="/" class="inline-flex items-center gap-2">
          <span class="w-9 h-9 rounded-xl2 bg-plum/10 grid place-items-center text-plum font-bold">EA</span>
          <div class="leading-tight">
            <div class="text-base font-semibold text-ink">Erasmus Atlas</div>
            <div class="text-xs text-ink/50">Explore • Compare • Share</div>
          </div>
        </RouterLink>
      </div>

      <nav class="p-3 space-y-1">
        <RouterLink to="/" class="block rounded-xl2 px-3 py-2 text-sm"
          :class="isActive('/') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'">Home</RouterLink>

        <RouterLink to="/map" class="block rounded-xl2 px-3 py-2 text-sm"
          :class="isActive('/map') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'">Map</RouterLink>

        <RouterLink to="/posts" class="block rounded-xl2 px-3 py-2 text-sm"
          :class="isActive('/posts') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'">Posts</RouterLink>

        <RouterLink to="/dashboard" class="block rounded-xl2 px-3 py-2 text-sm"
          :class="isActive('/dashboard') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'">Dashboard</RouterLink>

        <RouterLink to="/submit" class="block rounded-xl2 px-3 py-2 text-sm"
          :class="isActive('/submit') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'">Submit</RouterLink>
      </nav>

      <div class="mt-auto p-4">
        <div class="card bg-sand/40 border-sand/50">
          <div class="text-xs text-ink/70">
            Tip: Filter the map by topic to discover hotspots. 🎯
          </div>
        </div>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex flex-col min-h-screen">
      <!-- Topbar -->
      <header class="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-ink/10">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <!-- Mobile: open sidebar -->
          <button class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl2 border border-ink/15 bg-white hover:bg-surface-100"
                  @click="toggleMobile">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          </button>

          <!-- Brand (mobile only) -->
          <RouterLink to="/" class="md:hidden inline-flex items-center gap-2">
            <span class="w-8 h-8 rounded-xl2 bg-plum/10 grid place-items-center text-plum font-bold">EA</span>
            <span class="text-sm font-semibold text-ink">Erasmus Atlas</span>
          </RouterLink>

          <!-- Right side -->
          <div class="ml-auto flex items-center gap-2 relative">
            <!-- Logged out -->
            <template v-if="!auth.token">
              <RouterLink to="/login" class="btn btn-outline">Log in</RouterLink>
              <RouterLink to="/register" class="btn btn-primary">Sign up</RouterLink>
            </template>

            <!-- Logged in -->
            <template v-else>
              <RouterLink to="/submit" class="btn btn-primary hidden sm:inline-flex">Create post</RouterLink>

              <button class="inline-flex items-center gap-2 px-3 py-2 rounded-xl2 border border-ink/15 bg-white hover:bg-surface-100 relative"
                      @click="toggleMenu">
                <span class="w-6 h-6 rounded-full bg-plum/20 grid place-items-center text-plum text-xs">
                  {{ (auth.user?.name || auth.user?.email || 'U').slice(0,1).toUpperCase() }}
                </span>
                <span class="text-sm text-ink/80 max-w-[150px] truncate">
                  {{ auth.user?.name || auth.user?.email }}
                </span>
                <svg width="14" height="14" viewBox="0 0 20 20" class="text-ink/60">
                  <path d="M5 7l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <!-- Dropdown -->
              <div v-if="menuOpen"
                   class="absolute right-0 top-full mt-2 w-52 bg-white border border-ink/10 rounded-xl2 shadow-card p-1"
                   @click.outside="closeMenu">
                <RouterLink to="/submit" class="block px-3 py-2 rounded-lg text-sm hover:bg-surface-100">Create post</RouterLink>
                <RouterLink to="/me/posts" class="block px-3 py-2 rounded-lg text-sm hover:bg-surface-100">My posts</RouterLink>
                <button class="w-full text-left px-3 py-2 rounded-lg text-sm text-danger hover:bg-surface-100"
                        @click="onLogout">
                  Log out
                </button>
              </div>
            </template>
          </div>
        </div>
      </header>

      <!-- Router outlet -->
      <main class="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile drawer sidebar -->
    <transition name="fade">
      <div v-if="mobileOpen" class="fixed inset-0 z-30 bg-black/30" @click="closeMobile"></div>
    </transition>
    <transition name="slide">
      <aside v-if="mobileOpen" class="fixed z-40 inset-y-0 left-0 w-72 bg-white border-r border-ink/10 p-4 space-y-4">
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="inline-flex items-center gap-2" @click="closeMobile">
            <span class="w-8 h-8 rounded-xl2 bg-plum/10 grid place-items-center text-plum font-bold">EA</span>
            <span class="text-sm font-semibold text-ink">Erasmus Atlas</span>
          </RouterLink>
          <button class="w-9 h-9 grid place-items-center rounded-xl2 border border-ink/15" @click="closeMobile">
            ✕
          </button>
        </div>

        <nav class="space-y-1">
          <RouterLink to="/" class="block rounded-xl2 px-3 py-2 text-sm"
            :class="isActive('/') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'"
            @click="closeMobile">Home</RouterLink>

          <RouterLink to="/map" class="block rounded-xl2 px-3 py-2 text-sm"
            :class="isActive('/map') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'"
            @click="closeMobile">Map</RouterLink>

          <RouterLink to="/posts" class="block rounded-xl2 px-3 py-2 text-sm"
            :class="isActive('/posts') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'"
            @click="closeMobile">Posts</RouterLink>

          <RouterLink to="/dashboard" class="block rounded-xl2 px-3 py-2 text-sm"
            :class="isActive('/dashboard') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'"
            @click="closeMobile">Dashboard</RouterLink>

          <RouterLink to="/submit" class="block rounded-xl2 px-3 py-2 text-sm"
            :class="isActive('/submit') ? 'bg-surface-200 text-ink font-medium' : 'text-ink/70 hover:bg-surface-100'"
            @click="closeMobile">Submit</RouterLink>
        </nav>

        <div class="mt-4">
          <template v-if="!auth.token">
            <RouterLink to="/login" class="btn btn-outline w-full" @click="closeMobile">Log in</RouterLink>
            <RouterLink to="/register" class="btn btn-primary w-full mt-2" @click="closeMobile">Sign up</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/submit" class="btn btn-primary w-full" @click="closeMobile">Create post</RouterLink>
            <button class="btn btn-outline w-full mt-2" @click="onLogout">Log out</button>
          </template>
        </div>
      </aside>
    </transition>
  </div>
</template>

<style scoped>
/* simple transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform .2s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>