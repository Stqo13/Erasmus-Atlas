// apps/web/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './assets/theme.css'
import { useAuth } from './stores/auth'

declare global {
  interface Window { __EA_APP_MOUNTED__?: boolean }
}

if (!window.__EA_APP_MOUNTED__) {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.mount('#app')
  window.__EA_APP_MOUNTED__ = true

  const auth = useAuth()
  auth.hydrate().catch(() => {})
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.__EA_APP_MOUNTED__ = false
  })
}
