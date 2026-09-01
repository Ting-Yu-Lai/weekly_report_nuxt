<script setup lang="ts">
import { NIcon, NSelect } from 'naive-ui'
import { AddOutline, TrashBinOutline } from '@vicons/ionicons5'

interface WorkItem {
  content: string
  sort_order: number
}

interface LogEntry {
  project_id: string
  work_type_id: string
  status: number
  custom_status: string | null
  note: string
  include_in_weekly: boolean
  sort_order: number
  items: WorkItem[]
}

const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)
const workTypeStore = useWorkTypeStore()
const { workTypes } = storeToRefs(workTypeStore)
const dailyLogStore = useDailyLogStore()
const { $axios } = useNuxtApp()
const logDate = ref(getLocalDate())
const isCheckingToday = ref(true)
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const errorMessage = ref('')
const optionsError = ref('')
const projectOptions = computed(() => projects.value.map((project) => ({
  label: project.name,
  value: project.id,
})))
const workTypeOptions = computed(() => workTypes.value.map((workType) => ({
  label: workType.name,
  value: workType.id,
})))
const statusOptions = [
  { label: '未開始', value: 0 },
  { label: '進行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '卡住', value: 3 },
]

const entries = ref<LogEntry[]>([
  {
    project_id: '',
    work_type_id: '',
    status: 1,
    custom_status: null,
    note: '',
    include_in_weekly: true,
    sort_order: 0,
    items: [{ content: '', sort_order: 0 }],
  },
])

function getLocalDate() {
  const now = new Date()
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)

  return localNow.toISOString().slice(0, 10)
}

async function redirectToTodayIfExists() {
  try {
    await dailyLogStore.fetchDailyLogs()
    const todayLog = dailyLogStore.dailyLogs.find((log) => log.log_date === logDate.value)

    if (todayLog) {
      await navigateTo(`/daily-logs/${todayLog.id}`)
    }
  } catch (error) {
    optionsError.value = '無法確認今天是否已有日誌，請稍後再試。'
    console.error(error)
  } finally {
    isCheckingToday.value = false
  }
}

async function loadOptions() {
  optionsError.value = ''

  try {
    await Promise.all([
      projectStore.fetchProjects(),
      workTypeStore.fetchWorkTypes(),
    ])
  } catch (error) {
    optionsError.value = '選項載入失敗，請確認 API 已啟動。'
    console.error(error)
  }
}

onMounted(async () => {
  await redirectToTodayIfExists()

  if (!isCheckingToday.value) {
    await loadOptions()
  }
})

function addEntry() {
  entries.value.push({
    project_id: '',
    work_type_id: '',
    status: 1,
    custom_status: null,
    note: '',
    include_in_weekly: true,
    sort_order: entries.value.length,
    items: [{ content: '', sort_order: 0 }],
  })
}

function removeEntry(index: number) {
  if (entries.value.length === 1) return
  entries.value.splice(index, 1)
}

function addItem(entry: LogEntry) {
  entry.items.push({ content: '', sort_order: entry.items.length })
}

function removeItem(entry: LogEntry, index: number) {
  if (entry.items.length === 1) return
  entry.items.splice(index, 1)
}

function validateEntries() {
  const hasInvalidEntry = entries.value.some((entry) => {
    return !entry.project_id
      || !entry.work_type_id
      || entry.items.some((item) => !item.content.trim())
  })

  if (hasInvalidEntry) {
    errorMessage.value = '請選擇專案、工作類型，並填寫工作內容。'
    return false
  }

  return true
}

async function saveDailyLog() {
  saveState.value = 'saving'
  errorMessage.value = ''

  if (!validateEntries()) {
    saveState.value = 'error'
    return
  }

  try {
    await $axios.post('/api/daily-logs', {
      log_date: logDate.value,
      entries: entries.value,
    })
    saveState.value = 'saved'
  } catch (error) {
    saveState.value = 'error'
    errorMessage.value = '操作失敗，請稍後再試。'
    console.error(error)
  }
}
</script>

<template>
  <div class="page-wrap daily-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">新增日誌</span>
    </header>

    <section class="page-intro">
      <h1>新增日誌</h1>
    </section>

    <div v-if="isCheckingToday" class="empty-setting">正在確認今天的日誌……</div>

    <form v-else class="daily-form" @submit.prevent="saveDailyLog">
      <div class="form-toolbar">
        <label class="date-field">
          <span>紀錄日期</span>
          <AppDatePicker v-model:formatted-value="logDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" />
        </label>
        <div class="save-area">
          <span v-if="saveState === 'saved'" class="save-status">日誌已儲存。</span>
          <span v-if="saveState === 'error'" class="error-status">{{ errorMessage }}</span>
          <button class="button button-primary" type="submit" :disabled="saveState === 'saving'">
            {{ saveState === 'saving' ? '儲存中…' : '儲存每日紀錄' }}
          </button>
        </div>
      </div>

      <article v-for="(entry, index) in entries" :key="index" class="entry-card">
        <div class="entry-heading">
          <div>
            <span class="entry-mark">{{ String(index + 1).padStart(2, '0') }}</span>
            <h2>工作項目</h2>
          </div>
          <button
            class="remove-button"
            type="button"
            :disabled="entries.length === 1"
            @click="removeEntry(index)"
          >
            移除項目
          </button>
        </div>

        <div class="field-grid">
          <p v-if="optionsError" class="setting-error form-field-wide">{{ optionsError }}</p>
          <label class="form-field">
            <span>專案</span>
<ClientOnly>
  <NSelect v-model:value="entry.project_id" :options="projectOptions" placeholder="選擇專案" />
</ClientOnly>
          </label>
          <label class="form-field">
            <span>工作類型</span>
<ClientOnly>
  <NSelect v-model:value="entry.work_type_id" :options="workTypeOptions" placeholder="選擇類型" />
</ClientOnly>
          </label>
          <label class="form-field">
            <span>目前狀態</span>
<ClientOnly>
  <NSelect v-model:value="entry.status" :options="statusOptions" />
</ClientOnly>
          </label>
        </div>

        <div class="items-block">
          <span class="subheading">工作內容</span>
          <div v-for="(item, itemIndex) in entry.items" :key="itemIndex" class="work-item-row">
            <span class="bullet">•</span>
            <input v-model="item.content" class="text-input" placeholder="例如：完成登入流程調整" required />
            <button class="icon-button" type="button" aria-label="刪除工作內容" @click="removeItem(entry, itemIndex)">
              <NIcon size="18"><TrashBinOutline /></NIcon>
            </button>
          </div>
          <button class="add-item-button" type="button" @click="addItem(entry)">
            <NIcon size="16"><AddOutline /></NIcon>
            <span>新增工作內容</span>
          </button>
        </div>

        <div class="field-grid detail-grid">
          <label class="form-field form-field-wide">
            <span>備註</span>
            <textarea v-model="entry.note" class="text-input textarea-input" placeholder="請輸入內容" />
          </label>
          <label class="check-field">
            <input v-model="entry.include_in_weekly" type="checkbox" />
            <span>納入週報</span>
          </label>
        </div>
      </article>

      <button class="add-entry-button" type="button" @click="addEntry">新增工作項目</button>

      <label class="personal-note">
        <span>今日其他備註</span>
        <textarea class="text-input textarea-input" placeholder="今天的其他備註" />
      </label>
    </form>
  </div>
</template>




