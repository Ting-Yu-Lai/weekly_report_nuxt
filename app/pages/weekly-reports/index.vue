<script setup lang="ts">
const weeklyReportStore = useWeeklyReportStore()

const today = new Date()
const dayOfWeek = today.getDay() || 7
const monday = new Date(today)
monday.setDate(today.getDate() - dayOfWeek + 1)
const sunday = new Date(monday)
sunday.setDate(monday.getDate() + 6)

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

const startDate = ref(toDateInputValue(monday))
const endDate = ref(toDateInputValue(sunday))
const isCreating = ref(false)
const errorMessage = ref('')

async function createWeeklyReport() {
  errorMessage.value = ''

  if (endDate.value < startDate.value) {
    errorMessage.value = '結束日期不可早於開始日期。'
    return
  }

  isCreating.value = true

  try {
    const report = await weeklyReportStore.createReport(
      startDate.value,
      endDate.value,
    )

    await navigateTo(`/weekly-reports/${report.id}`)
  } catch (error: any) {
    errorMessage.value = '建立週報失敗，請稍後再試。'
    console.error(error)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div class="page-wrap weekly-report-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">新增週報</span>
    </header>

    <section class="page-intro compact-intro">
      <p class="section-kicker">COLLECT THE WEEK</p>
      <h1>新增週報</h1>
      <p>請依照頁面提示完成操作。</p>
    </section>

    <section class="panel weekly-range-panel">
      <div class="panel-heading">
        <h2>工作項目</h2>
        <span class="panel-caption">DATE RANGE</span>
      </div>

      <div class="weekly-range-fields">
        <label class="form-field">
          <span>開始日期</span>
          <AppDatePicker v-model:formatted-value="startDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" />
        </label>
        <span class="range-arrow" aria-hidden="true">→</span>
        <label class="form-field">
          <span>結束日期</span>
          <AppDatePicker v-model:formatted-value="endDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" />
        </label>
      </div>

      <p v-if="errorMessage" class="setting-error">{{ errorMessage }}</p>
      <NuxtLink v-if="errorMessage" to="/weekly-reports/history" class="text-button weekly-history-link">
        查看週報歷史
      </NuxtLink>

      <button class="weekly-create-button button button-primary" type="button" :disabled="isCreating" @click="createWeeklyReport">
        {{ isCreating ? '新增中…' : '新增週報' }}
      </button>
    </section>
  </div>
</template>

