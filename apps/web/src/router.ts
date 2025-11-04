// apps/web/src/router.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PostsView from './views/PostsView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import SubmitView from './views/SubmitView.vue'
import MapView from './views/MapView.vue'
import { useAuth } from './stores/auth'   // 👈 add this

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/posts', component: PostsView },
    { path: '/map', component: MapView },
    { path: '/login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/submit', component: SubmitView, meta: { requiresAuth: true } },

    { path: '/:pathMatch(.*)*', component: HomeView }, // or a NotFound view
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuth()

  // block protected pages when logged out
  if (to.meta?.requiresAuth && !auth.token) {
    return { path: '/login', query: { next: to.fullPath } }
  }

  // block auth pages when already logged in
  if (to.meta?.guestOnly && auth.token) {
    return { path: '/map' }
  }

  return true
})
