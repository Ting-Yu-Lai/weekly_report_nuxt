<script setup lang="ts">
import { NIcon, NSelect } from 'naive-ui'
import { ChevronBackOutline, ChevronForwardOutline } from '@vicons/ionicons5'

const dailyLogStore = useDailyLogStore()
const { dailyLogs } = storeToRefs(dailyLogStore)
const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)
const workTypeStore = useWorkTypeStore()
const { workTypes } = storeToRefs(workTypeStore)
const isLoading = ref(false)
const errorMessage = ref('')
const today = new Date().toISOString().slice(0, 10)
const filterDate = ref<string | null>(null)
const filterProjectId = ref('')
const filterWorkTypeId = ref('')
const currentPage = ref(1)
const pageSize = 5
const projectOptions = computed(() => [
  { label: '全部專案', value: '' },
  ...projects.value.map((project) => ({ label: project.name, value: project.id })),
])
const workTypeOptions = computed(() => [
  { label: '全部類型', value: '' },
  ...workTypes.value.map((workType) => ({ label: workType.name, value: workType.id })),
])

async function loadDailyLogs() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await Promise.all([
      dailyLogStore.fetchDailyLogs(),
      projectStore.fetchProjects(),
      workTypeStore.fetchWorkTypes(),
    ])
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDailyLogs)

const filteredDailyLogs = computed(() => {
  return dailyLogs.value.filter((dailyLog) => {
    if (filterDate.value && dailyLog.log_date !== filterDate.value) return false

    return dailyLog.entries.some((entry) => {
      const projectMatches = !filterProjectId.value
        || entry.project?.id === filterProjectId.value
      const workTypeMatches = !filterWorkTypeId.value
        || entry.work_type?.id === filterWorkTypeId.value

      return projectMatches && workTypeMatches
    })
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDailyLogs.value.length / pageSize)))
const pagedDailyLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredDailyLogs.value.slice(start, start + pageSize)
})

watch([filterDate, filterProjectId, filterWorkTypeId], () => {
  currentPage.value = 1
})

watch(totalPages, (pageCount) => {
  if (currentPage.value > pageCount) currentPage.value = pageCount
})

function resetFilters() {
  filterDate.value = null
  filterProjectId.value = ''
  filterWorkTypeId.value = ''
}

function formatRecordDate(date: string) {
  if (date === today) return '今天'

  return date.slice(5).replace('-', '/')
}

function getRecordPreview(dailyLog: DailyLog) {
  const firstEntry = dailyLog.entries[0]
  const firstItem = firstEntry?.items?.[0]?.content

  return firstItem || firstEntry?.note || '尚無工作內容'
}

function getRecordTitle(dailyLog: DailyLog) {
  const firstEntry = dailyLog.entries[0]

  return firstEntry?.project?.name || '每日工作紀錄'
}
</script>

<template>
  <div class="page-wrap">
    <header class="topbar">
      <AppHomeLink />
      <span class="page-eyebrow">日誌列表</span>
    </header>

    <section class="page-intro compact-intro page-intro-with-action">
      <div>
        <p class="section-kicker">TRACE YOUR WORK</p>
        <h1>工作日誌</h1>
        <p>請依照頁面提示完成操作。</p>
      </div>
      <NuxtLink to="/daily-logs/create" class="button button-primary">新增日誌</NuxtLink>
    </section>

    <div v-if="isLoading" class="empty-setting">正在載入每日紀錄……</div>
    <div v-else-if="errorMessage" class="setting-error">{{ errorMessage }}</div>
    <section v-else class="filter-panel panel">
      <label class="form-field">
        <span>日期</span>
        <AppDatePicker v-model:formatted-value="filterDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" clearable />
      </label>
      <label class="form-field">
        <span>專案</span>
        <ClientOnly>
          <NSelect v-model:value="filterProjectId" class="filter-select" :options="projectOptions" />
        </ClientOnly>
      </label>
      <label class="form-field">
        <span>工作類型</span>
        <ClientOnly>
          <NSelect v-model:value="filterWorkTypeId" class="filter-select" :options="workTypeOptions" />
        </ClientOnly>
      </label>
      <button class="button button-secondary">操作</button>
    </section>

    <div v-if="!isLoading && !errorMessage && dailyLogs.length === 0" class="empty-setting">
      目前沒有每日紀錄。
    </div>
    <div v-else-if="!isLoading && !errorMessage && filteredDailyLogs.length === 0" class="empty-setting">
      沒有符合篩選條件的紀錄。
    </div>
    <section v-else-if="!isLoading && !errorMessage" class="record-list history-list">
      <NuxtLink
        v-for="dailyLog in pagedDailyLogs"
        :key="dailyLog.id"
        :to="`/daily-logs/${dailyLog.id}`"
        class="record-row"
      >
        <time>{{ formatRecordDate(dailyLog.log_date) }}</time>
        <div>
          <h3>{{ getRecordTitle(dailyLog) }}</h3>
          <p>{{ getRecordPreview(dailyLog) }}</p>
        </div>
        <span class="text-button">查看 <span>→</span></span>
      </NuxtLink>
    </section>

    <nav
      v-if="!isLoading && !errorMessage && filteredDailyLogs.length > pageSize"
      class="pagination"
      aria-label="日誌列表分頁"
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




