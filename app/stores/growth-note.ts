import { defineStore } from 'pinia'

export interface GrowthNoteProject {
  id: string
  name: string
}

export interface GrowthNote {
  id: string
  project_id: string | null
  project?: GrowthNoteProject | null
  note_date: string
  content: string
  created_at: string | null
  updated_at: string | null
}

interface GrowthNoteResponse {
  success: number
  message: string
  data: GrowthNote | GrowthNote[] | null
}

export const useGrowthNoteStore = defineStore('growth-note-store', {
  state: () => ({
    notes: [] as GrowthNote[],
  }),

  actions: {
    async fetchGrowthNotes(params?: {
      start_date?: string
      end_date?: string
      project_id?: string
    }) {
      const response = await useNuxtApp().$axios.get<GrowthNoteResponse>(
        '/api/growth-notes',
        { params },
      )

      const data = response.data.data
      this.notes = Array.isArray(data) ? data : []
      return this.notes
    },

    async createGrowthNote(data: {
      project_id: string | null
      note_date: string
      content: string
    }) {
      const response = await useNuxtApp().$axios.post<GrowthNoteResponse>(
        '/api/growth-notes',
        data,
      )

      return response.data.data as GrowthNote
    },

    async updateGrowthNote(
      id: string,
      data: Partial<Pick<GrowthNote, 'project_id' | 'note_date' | 'content'>>,
    ) {
      const response = await useNuxtApp().$axios.patch<GrowthNoteResponse>(
        `/api/growth-notes/${id}`,
        data,
      )

      return response.data.data as GrowthNote
    },

    async deleteGrowthNote(id: string) {
      await useNuxtApp().$axios.delete(`/api/growth-notes/${id}`)
    },
  },
})
