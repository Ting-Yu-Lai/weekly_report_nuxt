interface DataImportResponse {
  success: number
  message: string
  data: { counts: Record<string, number> } | null
}

export function useDataTransfer() {
  const axios = useNuxtApp().$axios

  async function exportData() {
    const response = await axios.get<Blob>('/api/data/export', { responseType: 'blob' })
    const contentDisposition = response.headers['content-disposition'] as string | undefined
    const filename = contentDisposition?.match(/filename="?([^";]+)"?/)?.[1]
      ?? `weekly-report-backup-${new Date().toISOString().slice(0, 10)}.json`
    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function importData(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post<DataImportResponse>('/api/data/import', formData)
    return response.data
  }

  return { exportData, importData }
}
