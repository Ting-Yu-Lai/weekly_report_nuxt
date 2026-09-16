<script setup lang="ts">
const route = useRoute()
const weeklyReportStore = useWeeklyReportStore()
const { report, preview } = storeToRefs(weeklyReportStore)

const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const copyMessage = ref('')
const savedMessage = ref('')
const weeklySummary = ref('')
const reportContent = ref('')
const reportId = computed(() => String(route.params.id))

function getItems(entry: DailyLogEntry) {
  return entry.items || []
}

function buildMarkdown() {
  if (!preview.value) return ''

  const lines = [`# ${preview.value.week_start} 至 ${preview.value.week_end}`, '']

  for (const dailyLog of preview.value.daily_logs) {
    lines.push(`## ${dailyLog.log_date}`)

    for (const entry of dailyLog.entries) {
      const projectName = entry.project?.name || '未指定專案'
      const workTypeName = entry.work_type?.name || '未指定類型'
      lines.push(`### ${projectName}｜${workTypeName}`)

      for (const item of getItems(entry)) {
        lines.push(`- ${item.content}`)
      }

      lines.push('')
    }
  }

  return lines.join('\n').trim()
}

function buildLineText() {
  if (!preview.value) return ''

  const lines = [`週報 ${preview.value.week_start} 至 ${preview.value.week_end}`, '']

  for (const dailyLog of preview.value.daily_logs) {
    lines.push(`${dailyLog.log_date}`)

    for (const entry of dailyLog.entries) {
      const projectName = entry.project?.name || '未指定專案'
      const workTypeName = entry.work_type?.name || '未指定類型'
      lines.push(`${projectName} / ${workTypeName}`)

      for (const item of getItems(entry)) {
        lines.push(`- ${item.content}`)
      }

      lines.push('')
    }
  }

  return lines.join('\n').trim()
}

async function copyText(content: string, label: string) {
  if (!content) return

  try {
    await navigator.clipboard.writeText(content)
    copyMessage.value = `${label}已複製`
  } catch {
    copyMessage.value = '複製失敗，請檢查瀏覽器權限。'
  }

  window.setTimeout(() => {
    copyMessage.value = ''
  }, 2400)
}

async function saveReport() {
  isSaving.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    await weeklyReportStore.updateReport(reportId.value, {
      content: reportContent.value,
      weekly_summary: weeklySummary.value.trim() || null,
    })
    savedMessage.value = '週報已儲存。'
  } catch {
    errorMessage.value = '儲存週報失敗，請稍後再試。'
  } finally {
    isSaving.value = false
  }
}

async function loadReport() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await weeklyReportStore.fetchReportById(reportId.value)
    await weeklyReportStore.fetchPreview(
      weeklyReportStore.report!.week_start,
      weeklyReportStore.report!.week_end,
    )
    weeklySummary.value = weeklyReportStore.report!.weekly_summary || ''
    reportContent.value = weeklyReportStore.report!.content || buildMarkdown()
  } catch {
    errorMessage.value = '載入週報失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadReport)
</script>

<template>
  <div class="page-wrap weekly-report-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <div class="topbar-meta">
        <span class="page-eyebrow">編輯週報</span>
        <span v-if="report" class="date-chip">{{ report.week_start }} 至 {{ report.week_end }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="empty-setting">正在載入週報……</div>
    <div v-else-if="errorMessage" class="setting-error">{{ errorMessage }}</div>

    <template v-else-if="report && preview">
      <section class="weekly-report-heading">
        <p class="section-kicker">03 / WEEKLY REPORT</p>
        <h1>編輯週報</h1>
        <p>
          {{ report.week_start }} 至 {{ report.week_end }}
          <span>週報內容</span>
        </p>
      </section>

      <section class="weekly-report-sheet">
        <div class="sheet-toolbar">
          <div>
            <span>週報內容</span>
            <span class="sheet-heading-caption">Markdown 編輯器</span>
          </div>
          <button
            type="button"
            class="button button-secondary button-small"
            @click="copyText(reportContent, 'Markdown')"
          >
            複製 Markdown
          </button>
          <button
            type="button"
            class="button button-primary button-small"
            :disabled="isSaving"
            @click="saveReport"
          >
            {{ isSaving ? '儲存中…' : '儲存週報' }}
          </button>
        </div>

        <div class="weekly-callout">
          <span class="weekly-callout-mark">i</span>
          <span>本週摘要</span>
        </div>

        <textarea
          v-model="reportContent"
          class="weekly-editor"
          aria-label="週報內容"
        />

        <div class="weekly-section">
          <label class="form-field">
            <span>LINE 文字</span>
            <textarea
              v-model="weeklySummary"
              class="text-input textarea-input weekly-summary-input"
              placeholder="請輸入本週心得"
            />
          </label>
        </div>

        <div class="weekly-copy-bar">
          <span>工作紀錄</span>
          <button
            type="button"
            class="button button-primary"
            @click="copyText(buildLineText(), 'LINE')"
          >
            複製 LINE 文字
          </button>
        </div>

        <p v-if="copyMessage" class="copy-status" role="status">{{ copyMessage }}</p>
        <p v-if="savedMessage" class="copy-status" role="status">{{ savedMessage }}</p>
      </section>
    </template>
  </div>
</template>

