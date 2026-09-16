<script setup lang="ts">
import { NIcon, NSelect } from 'naive-ui'
import { ChevronBackOutline, ChevronForwardOutline, TrashBinOutline } from '@vicons/ionicons5'

const weeklyReportStore = useWeeklyReportStore()
const { reports } = storeToRefs(weeklyReportStore)

const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)
const status = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const pageSize = 5
const statusOptions = [
  { label: '全部週報', value: '' },
  { label: '草稿', value: '0' },
  { label: '已匯出', value: '1' },
]

async function loadHistory() {
  isLoading.value = true
  errorMessage.value = ''
  currentPage.value = 1

  try {
    await weeklyReportStore.fetchHistory({
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined,
      status: status.value === '' ? undefined : Number(status.value),
    })
  } catch {
    errorMessage.value = '載入週報歷史失敗，請確認日期區間後再試。'
  } finally {
    isLoading.value = false
  }
}

async function deleteReport(report: WeeklyReport) {
  if (!window.confirm(`確定要刪除 ${report.week_start} 至 ${report.week_end} 的週報嗎？`)) return

  try {
    await weeklyReportStore.deleteReport(report.id)
  } catch {
    errorMessage.value = '刪除週報失敗，請稍後再試。'
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(reports.value.length / pageSize)))
const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return reports.value.slice(start, start + pageSize)
})

watch(totalPages, (pageCount) => {
  if (currentPage.value > pageCount) currentPage.value = pageCount
})

function openReport(reportId: string) {
  navigateTo(`/weekly-reports/${reportId}`)
}

function handleReportKeydown(event: KeyboardEvent, reportId: string) {
  if (event.key !== 'Enter' && event.key !== ' ') return

  event.preventDefault()
  openReport(reportId)
}

onMounted(loadHistory)
</script>

<template>
  <div class="page-wrap weekly-report-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">週報列表</span>
    </header>

    <section class="page-intro compact-intro page-intro-with-action">
      <div>
        <p class="section-kicker">PAST REPORTS</p>
        <h1>週報歷史</h1>
        <p>查看與管理過去建立的週報。</p>
      </div>
      <NuxtLink to="/weekly-reports" class="button button-primary">新增週報</NuxtLink>
    </section>

    <section class="panel filter-panel weekly-history-filter">
      <label class="form-field">
        <span>開始日期</span>
        <AppDatePicker v-model:formatted-value="startDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" clearable />
      </label>
      <label class="form-field">
        <span>結束日期</span>
        <AppDatePicker v-model:formatted-value="endDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" clearable />
      </label>
      <label class="form-field">
        <span>狀態</span>
        <ClientOnly>
          <NSelect v-model:value="status" class="filter-select" :options="statusOptions" />
        </ClientOnly>
      </label>
      <button
        class="button button-secondary"
        type="button"
        :disabled="isLoading"
        @click="loadHistory"
      >
        {{ isLoading ? '篩選中…' : '篩選' }}
      </button>
    </section>

    <div v-if="isLoading" class="empty-setting">正在載入週報歷史……</div>
    <div v-else-if="errorMessage" class="setting-error">{{ errorMessage }}</div>
    <div v-else-if="reports.length === 0" class="empty-setting">目前沒有週報資料。</div>
    <section v-else class="record-list history-list">
      <article
        v-for="report in pagedReports"
        :key="report.id"
        class="record-row clickable-record-row"
        role="link"
        tabindex="0"
        @click="openReport(report.id)"
        @keydown="handleReportKeydown($event, report.id)"
      >
        <time>{{ report.week_start }}<br />至 {{ report.week_end }}</time>
        <div>
          <h3>{{ report.week_start }} 至 {{ report.week_end }}</h3>
          <p class="weekly-history-preview">
            {{ report.weekly_summary || report.content || '尚未填寫週報內容' }}
          </p>
        </div>
        <div class="weekly-history-actions">
          <button
            class="delete-button"
            type="button"
            aria-label="刪除週報"
            @click.stop="deleteReport(report)"
          >
            <NIcon size="18"><TrashBinOutline /></NIcon>
          </button>
        </div>
      </article>
    </section>

    <nav
      v-if="!isLoading && !errorMessage && reports.length > pageSize"
      class="pagination"
      aria-label="週報歷史分頁"
    >
      <button
        type="button"
        class="button button-secondary button-small"
        :disabled="currentPage === 1"
        aria-label="上一頁"
        title="上一頁"
        @click="currentPage--"
      >
        <NIcon size="17"><ChevronBackOutline /></NIcon>
      </button>
      <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
      <button
        type="button"
        class="button button-secondary button-small"
        :disabled="currentPage === totalPages"
        aria-label="下一頁"
        title="下一頁"
        @click="currentPage++"
      >
        <NIcon size="17"><ChevronForwardOutline /></NIcon>
      </button>
    </nav>
  </div>
</template>




