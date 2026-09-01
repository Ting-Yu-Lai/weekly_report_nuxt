import { defineStore } from 'pinia'

export interface DailyLogItem {
  id?: string
  content: string
  sort_order: number
}

export interface DailyLogEntry {
  id?: string
  project_id?: string
  work_type_id?: string
  project?: { id: string; name: string }
  work_type?: { id: string; name: string }
  status: number
  custom_status: string | null
  note: string | null
  include_in_weekly: boolean
  sort_order: number
  items?: DailyLogItem[]
}

export interface DailyLog {
  id: string
  log_date: string
  entries: DailyLogEntry[]
  created_at: string | null
  updated_at: string | null
}

interface DailyLogResponse {
  success: number
  message: string
  data: DailyLog | DailyLog[]
}

export const useDailyLogStore = defineStore('daily-log-store', {
  state: () => ({
    dailyLogs: [] as DailyLog[],
  }),

  actions: {
    async fetchDailyLogs() {
      const response = await useNuxtApp().$axios.get<DailyLogResponse>('/api/daily-logs')
      const data = response.data.data

      this.dailyLogs = Array.isArray(data) ? data : [data]
    },

    async fetchDailyLogById(id: string) {
      const response = await useNuxtApp().$axios.get<DailyLogResponse>(
        `/api/daily-logs/${id}`,
      )

      return response.data.data as DailyLog
    },

    async updateDailyLog(id: string, data: {
      log_date: string
      entries: Omit<DailyLogEntry, 'id' | 'project' | 'work_type'>[]
    }) {
      const response = await useNuxtApp().$axios.patch<DailyLogResponse>(
        `/api/daily-logs/${id}`,
        data,
      )

      return response.data.data as DailyLog
    },
  },
})
