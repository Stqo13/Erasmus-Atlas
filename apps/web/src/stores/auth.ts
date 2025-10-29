import { defineStore } from 'pinia'
import { api } from '../lib/api'

type User = { id: string; name: string; email: string } | null

export const useAuth = defineStore('auth', {
  state: () => ({
    token: (localStorage.getItem('token') || '') as string,
    user: null as User,
    loading: false as boolean,
    error: '' as string,
  }),
  actions: {
    setSession(token: string, user: User) {
      this.token = token; this.user = user || null
      if (token) localStorage.setItem('token', token)
      else localStorage.removeItem('token')
    },
    async register(name: string, email: string, password: string) {
      this.loading = true; this.error = ''
      try {
        const { data } = await api.post('/auth/register', { name, email, password })
        this.setSession(data.token, data.user)
        return true
      } catch (e: any) {
        this.error = e?.response?.data?.error || 'Registration failed'
        return false
      } finally { this.loading = false }
    },
    async login(email: string, password: string) {
      this.loading = true; this.error = ''
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.setSession(data.token, data.user)
        return true
      } catch (e: any) {
        this.error = e?.response?.data?.error || 'Login failed'
        return false
      } finally { this.loading = false }
    },
    logout() {
      this.setSession('', null)
    }
  },
})