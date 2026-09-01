<script setup lang="ts">
import { NSelect } from 'naive-ui'

interface EditableItem { content: string; sort_order: number }
interface EditableEntry {
  project_id: string
  work_type_id: string
  status: number
  custom_status: string | null
  note: string
  include_in_weekly: boolean
  sort_order: number
  items: EditableItem[]
}

const route = useRoute()
const dailyLogStore = useDailyLogStore()
const projectStore = useProjectStore()
const workTypeStore = useWorkTypeStore()
const { projects } = storeToRefs(projectStore)
const { workTypes } = storeToRefs(workTypeStore)
const entries = ref<EditableEntry[]>([])
const logDate = ref<string | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const savedMessage = ref('')
const recordId = computed(() => String(route.params.uuid))

const projectOptions = computed(() => projects.value.map((project) => ({ label: project.name, value: project.id })))
const workTypeOptions = computed(() => workTypes.value.map((workType) => ({ label: workType.name, value: workType.id })))
const statusOptions = [
  { label: '未開始', value: 0 },
  { label: '進行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已阻塞', value: 3 },
  { label: '自訂狀態', value: 4 },
]

function toEditableEntries(log: DailyLog): EditableEntry[] {
  return log.entries.map((entry, index) => ({
    project_id: entry.project_id || entry.project?.id || '',
    work_type_id: entry.work_type_id || entry.work_type?.id || '',
    status: entry.status,
    custom_status: entry.custom_status,
    note: entry.note || '',
    include_in_weekly: entry.include_in_weekly,
    sort_order: entry.sort_order ?? index,
    items: (entry.items || []).map((item, itemIndex) => ({ content: item.content, sort_order: item.sort_order ?? itemIndex })),
  }))
}

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [log] = await Promise.all([
      dailyLogStore.fetchDailyLogById(recordId.value),
      projectStore.fetchProjects(),
      workTypeStore.fetchWorkTypes(),
    ])
    logDate.value = log.log_date
    entries.value = toEditableEntries(log)
  } catch {
    errorMessage.value = '載入日誌失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

function addEntry() {
  entries.value.push({ project_id: '', work_type_id: '', status: 1, custom_status: null, note: '', include_in_weekly: true, sort_order: entries.value.length, items: [{ content: '', sort_order: 0 }] })
}
function removeEntry(index: number) { if (entries.value.length > 1) entries.value.splice(index, 1) }
function addItem(entry: EditableEntry) { entry.items.push({ content: '', sort_order: entry.items.length }) }
function removeItem(entry: EditableEntry, index: number) { if (entry.items.length > 1) entry.items.splice(index, 1) }

async function saveDailyLog() {
  isSaving.value = true
  errorMessage.value = ''
  savedMessage.value = ''
  try {
    const log = await dailyLogStore.updateDailyLog(recordId.value, { log_date: logDate.value, entries: entries.value })
    entries.value = toEditableEntries(log)
    savedMessage.value = '日誌已儲存。'
  } catch {
    errorMessage.value = '儲存失敗，請稍後再試。'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="page-wrap daily-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <div class="topbar-meta">
        <span class="page-eyebrow">編輯日誌</span>
        <span v-if="savedMessage" class="save-status">{{ savedMessage }}</span>
      </div>
    </header>
    <div v-if="isLoading" class="empty-setting">正在載入每日紀錄……</div>
    <div v-else-if="errorMessage && !entries.length" class="setting-error">{{ errorMessage }}</div>
    <form v-else class="daily-form" @submit.prevent="saveDailyLog">
      <div class="form-toolbar">
        <label class="date-field">
          <span>紀錄日期</span>
          <AppDatePicker v-model:formatted-value="logDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" />
        </label>
        <div class="save-area">
          <span v-if="errorMessage" class="error-status">{{ errorMessage }}</span>
          <button class="button button-primary" type="submit" :disabled="isSaving">{{ isSaving ? '儲存中…' : '儲存日誌' }}</button>
        </div>
      </div>
      <article v-for="(entry, index) in entries" :key="index" class="entry-card">
        <div class="entry-heading">
          <h2>工作項目 {{ index + 1 }}</h2>
          <button class="remove-button" type="button" @click="removeEntry(index)">移除項目</button>
        </div>
        <div class="field-grid">
          <label class="form-field"><span>專案</span><ClientOnly><NSelect v-model:value="entry.project_id" :options="projectOptions" placeholder="請選擇專案" /></ClientOnly></label>
          <label class="form-field"><span>工作類型</span><ClientOnly><NSelect v-model:value="entry.work_type_id" :options="workTypeOptions" placeholder="請選擇工作類型" /></ClientOnly></label>
          <label class="form-field"><span>目前狀態</span><ClientOnly><NSelect v-model:value="entry.status" :options="statusOptions" /></ClientOnly></label>
        </div>
        <div class="items-block">
          <div v-for="(item, itemIndex) in entry.items" :key="itemIndex" class="work-item-row">
            <input v-model="item.content" class="text-input" placeholder="請輸入工作內容" required />
            <button class="icon-button" type="button" aria-label="移除工作內容" @click="removeItem(entry, itemIndex)">×</button>
          </div>
          <button class="text-button" type="button" @click="addItem(entry)">新增工作內容</button>
        </div>
        <label class="form-field"><span>備註</span><textarea v-model="entry.note" class="text-input textarea-input" placeholder="補充這項工作的說明" /></label>
        <label class="check-field"><input v-model="entry.include_in_weekly" type="checkbox" /><span>納入週報</span></label>
      </article>
      <button class="add-entry-button" type="button" @click="addEntry">新增工作項目</button>
    </form>
  </div>
</template>
