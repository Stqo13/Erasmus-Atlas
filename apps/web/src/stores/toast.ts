import { defineStore } from 'pinia'

export type Toast = {
  id: number
  message: string
  type?: 'success' | 'error' | 'info'
  timeout?: number
}

let counter = 1

export const useToast = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),
  actions: {
    show(message: string, type: Toast['type'] = 'info', timeout = 3500) {
      const id = counter++
      this.toasts.push({ id, message, type, timeout })
      setTimeout(() => this.remove(id), timeout)
    },
    remove(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    success(msg: string) {
      this.show(msg, 'success')
    },
    error(msg: string) {
      this.show(msg, 'error', 5000)
    },
  },
})
