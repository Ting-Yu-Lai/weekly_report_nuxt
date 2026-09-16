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

      const note = response.data.data as GrowthNote
      this.notes = [note, ...this.notes]
      return note
    },

    async updateGrowthNote(
      id: string,
      data: Partial<Pick<GrowthNote, 'project_id' | 'note_date' | 'content'>>,
    ) {
      const response = await useNuxtApp().$axios.patch<GrowthNoteResponse>(
        `/api/growth-notes/${id}`,
        data,
      )

      const note = response.data.data as GrowthNote
      this.replaceNoteInList(note)
      return note
    },

    async deleteGrowthNote(id: string) {
      await useNuxtApp().$axios.delete(`/api/growth-notes/${id}`)
      this.removeNoteFromList(id)
    },

    replaceNoteInList(note: GrowthNote) {
      const index = this.notes.findIndex((item) => item.id === note.id)

      if (index === -1) {
        this.notes = [note, ...this.notes]
        return
      }

      this.notes[index] = note
      this.notes = [...this.notes].sort((left, right) => {
        const dateDifference = right.note_date.localeCompare(left.note_date)
        return dateDifference || (right.updated_at || '').localeCompare(left.updated_at || '')
      })
    },

    removeNoteFromList(id: string) {
      this.notes = this.notes.filter((note) => note.id !== id)
    },
  },
})
