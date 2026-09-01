import { defineStore } from 'pinia'

export interface WorkType {
  id: string
  name: string
  is_active: boolean
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

interface WorkTypeResponse {
  success: number
  message: string
  data: WorkType | WorkType[]
}

export const useWorkTypeStore = defineStore('work-type-store', {
  state: () => ({
    workTypes: [] as WorkType[],
  }),

  actions: {
    async fetchWorkTypes(params?: { is_active?: boolean }) {
      const response = await useNuxtApp().$axios.get<WorkTypeResponse>('/api/work-types', {
        params,
      })

      const data = response.data.data
      this.workTypes = Array.isArray(data) ? data : [data]
    },

    async fetchCreateWorkType(data: Pick<WorkType, 'name'>) {
      await useNuxtApp().$axios.post<WorkTypeResponse>('/api/work-types', data)
      await this.fetchWorkTypes()
    },

    async fetchDeleteWorkType(id: string) {
      await useNuxtApp().$axios.delete(`/api/work-types/${id}`)
      await this.fetchWorkTypes()
    },
  },
})
