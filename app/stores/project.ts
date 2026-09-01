import { defineStore } from 'pinia'

export interface Project {
  id: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

interface ProjectResponse {
  success: number
  message: string
  data: Project | Project[]
}

export const useProjectStore = defineStore('project-store', {
  state: () => ({
    projects: [] as Project[],
  }),

  actions: {
    async fetchProjects(params?: { is_active?: boolean }) {
      const response = await useNuxtApp().$axios.get<ProjectResponse>('/api/projects', {
        params: params?.is_active === undefined
          ? undefined
          : { is_active: params.is_active ? 1 : 0 },
      })

      const data = response.data.data
      this.projects = Array.isArray(data) ? data : data ? [data] : []
    },

    async fetchCreateProject(data: Pick<Project, 'name' | 'description'>) {
      await useNuxtApp().$axios.post<ProjectResponse>('/api/projects', data)
      await this.fetchProjects()
    },

    async fetchUpdateProjectActive(id: string, data: { is_active: boolean }) {
      await useNuxtApp().$axios.patch<ProjectResponse>(
        `/api/projects/${id}/active`,
        data,
      )
      await this.fetchProjects()
    },

    async fetchDeleteProject(id: string) {
      await useNuxtApp().$axios.delete(`/api/projects/${id}`)
      await this.fetchProjects()
    },
  },
})
