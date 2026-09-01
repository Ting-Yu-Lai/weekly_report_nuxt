import { defineStore } from 'pinia'

export interface PendingItemProject {
  id: string
  name: string
}

export interface PendingItem {
  id: string
  project_id: string | null
  project?: PendingItemProject | null
  title: string
  content: string | null
  status: number
  status_label: 'pending' | 'resolved'
  resolved_at: string | null
  created_at: string | null
  updated_at: string | null
}

interface PendingItemResponse {
  success: number
  message: string
  data: PendingItem | PendingItem[] | null
}

export const usePendingItemStore = defineStore('pending-item-store', {
  state: () => ({
    items: [] as PendingItem[],
  }),

  actions: {
    async fetchPendingItems(params?: { status?: number; project_id?: string }) {
      const response = await useNuxtApp().$axios.get<PendingItemResponse>(
        '/api/pending-items',
        { params },
      )

      const data = response.data.data
      this.items = Array.isArray(data) ? data : []
      return this.items
    },

    async createPendingItem(data: {
      project_id: string | null
      title: string
      content: string | null
    }) {
      const response = await useNuxtApp().$axios.post<PendingItemResponse>(
        '/api/pending-items',
        data,
      )

      return response.data.data as PendingItem
    },

    async fetchPendingItemById(id: string) {
      const response = await useNuxtApp().$axios.get<PendingItemResponse>(
        `/api/pending-items/${id}`,
      )

      return response.data.data as PendingItem
    },

    async updatePendingItem(
      id: string,
      data: Partial<Pick<PendingItem, 'project_id' | 'title' | 'content' | 'status'>>,
    ) {
      const response = await useNuxtApp().$axios.patch<PendingItemResponse>(
        `/api/pending-items/${id}`,
        data,
      )

      return response.data.data as PendingItem
    },

    async updatePendingItemStatus(id: string, status: number) {
      const response = await useNuxtApp().$axios.patch<PendingItemResponse>(
        `/api/pending-items/${id}/status`,
        { status },
      )

      return response.data.data as PendingItem
    },

    async deletePendingItem(id: string) {
      await useNuxtApp().$axios.delete(`/api/pending-items/${id}`)
    },
  },
})
