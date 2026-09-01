import { defineStore } from 'pinia'

export interface WeeklyReport {
  id: string
  week_start: string
  week_end: string
  status: number
  content: string
  weekly_summary: string | null
  exported_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface WeeklyReportPreview {
  week_start: string
  week_end: string
  days_count: number
  daily_logs: DailyLog[]
}

interface WeeklyReportPreviewResponse {
  success: number
  message: string
  data: WeeklyReportPreview
}

interface WeeklyReportResponse {
  success: number
  message: string
  data: WeeklyReport
}

interface WeeklyReportHistoryResponse {
  success: number
  message: string
  data: WeeklyReport[]
}

export const useWeeklyReportStore = defineStore('weekly-report-store', {
  state: () => ({
    preview: null as WeeklyReportPreview | null,
    report: null as WeeklyReport | null,
    reports: [] as WeeklyReport[],
  }),

  actions: {
    async fetchHistory(params?: {
      start_date?: string
      end_date?: string
      status?: number
    }) {
      const response = await useNuxtApp().$axios.get<WeeklyReportHistoryResponse>(
        '/api/weekly-reports/history',
        { params },
      )

      this.reports = response.data.data
      return this.reports
    },

    async fetchPreview(startDate: string, endDate: string) {
      const response = await useNuxtApp().$axios.get<WeeklyReportPreviewResponse>(
        '/api/weekly-reports',
        { params: { start_date: startDate, end_date: endDate } },
      )

      this.preview = response.data.data
      return this.preview
    },

    async createReport(startDate: string, endDate: string) {
      const response = await useNuxtApp().$axios.post<WeeklyReportResponse>(
        '/api/weekly-reports',
        { start_date: startDate, end_date: endDate },
      )

      this.report = response.data.data
      return this.report
    },

    async fetchReportById(id: string) {
      const response = await useNuxtApp().$axios.get<WeeklyReportResponse>(
        `/api/weekly-reports/${id}`,
      )

      this.report = response.data.data
      return this.report
    },

    async updateReport(id: string, data: { content: string; weekly_summary: string | null }) {
      const response = await useNuxtApp().$axios.patch<WeeklyReportResponse>(
        `/api/weekly-reports/${id}`,
        data,
      )

      this.report = response.data.data
      return this.report
    },

    async deleteReport(id: string) {
      await useNuxtApp().$axios.delete(`/api/weekly-reports/${id}`)
      this.reports = this.reports.filter((report) => report.id !== id)
    },
  },
})
