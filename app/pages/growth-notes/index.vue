<script setup lang="ts">
import { NIcon, NSelect } from 'naive-ui'
import { CreateOutline, TrashBinOutline } from '@vicons/ionicons5'

const growthNoteStore = useGrowthNoteStore()
const projectStore = useProjectStore()
const { notes } = storeToRefs(growthNoteStore)
const { projects } = storeToRefs(projectStore)

const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)
const projectFilter = ref('')
const isLoading = ref(false)
const isApplyingFilters = ref(false)
const deletingId = ref<string | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const noteToDelete = ref<GrowthNote | null>(null)
const projectOptions = computed(() => [
  { label: '全部專案', value: '' },
  ...projects.value.map((project) => ({ label: project.name, value: project.id })),
])

async function loadNotes() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await growthNoteStore.fetchGrowthNotes({
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined,
      project_id: projectFilter.value || undefined,
    })
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

async function applyFilters() {
  isApplyingFilters.value = true

  try {
    await loadNotes()
  } finally {
    isApplyingFilters.value = false
  }
}

function clearFilters() {
  startDate.value = null
  endDate.value = null
  projectFilter.value = ''
  applyFilters()
}

async function deleteNote(note: GrowthNote) {
  noteToDelete.value = note
}

async function confirmDelete() {
  if (!noteToDelete.value) return

  const note = noteToDelete.value
  deletingId.value = note.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await growthNoteStore.deleteGrowthNote(note.id)
    successMessage.value = '筆記已刪除。'
    noteToDelete.value = null
  } catch {
    errorMessage.value = '刪除失敗，請確認網路連線後再試。'
  } finally {
    deletingId.value = null
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${date}T00:00:00`))
}

function formatNoteDate(date: string) {
  const now = new Date()
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return date === today ? '今天' : formatDate(date)
}

onMounted(() => {
  loadProjects()
  loadNotes()
})

async function loadProjects() {
  try {
    await projectStore.fetchProjects({ is_active: true })
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  }
}
</script>

<template>
  <div class="page-wrap growth-note-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">成長筆記</span>
    </header>

    <section class="page-intro compact-intro page-intro-with-action">
      <div>
        <p>請依照頁面提示完成操作。</p>
        <h1>成長筆記</h1>
        <p>記錄值得保留的學習與工作心得。</p>
      </div>
      <NuxtLink to="/growth-notes/create" class="button button-primary">新增筆記</NuxtLink>
    </section>

    <section class="panel filter-panel growth-note-filter">
      <label class="form-field">
        <span>開始日期</span>
        <AppDatePicker v-model:formatted-value="startDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" clearable />
      </label>
      <label class="form-field">
        <span>結束日期</span>
        <AppDatePicker v-model:formatted-value="endDate" class="app-date-picker" type="date" value-format="yyyy-MM-dd" clearable />
      </label>
      <label class="form-field">
        <span>專案</span>
        <ClientOnly>
          <NSelect v-model:value="projectFilter" class="filter-select" :options="projectOptions" />
        </ClientOnly>
      </label>
      <div class="growth-note-filter-actions">
        <button class="button button-secondary" type="button" :disabled="isApplyingFilters" @click="applyFilters">
          {{ isApplyingFilters ? '篩選中…' : '篩選' }}
        </button>
        <button class="text-button" type="button" @click="clearFilters">清除</button>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">NOTE HISTORY</p>
          <h2>工作項目</h2>
        </div>
        <span class="muted-label">{{ notes.length }} 筆</span>
      </div>

      <p v-if="errorMessage" class="setting-error" role="alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="save-status" aria-live="polite">{{ successMessage }}</p>
      <div v-if="isLoading" class="empty-setting" aria-live="polite">正在載入成長筆記……</div>
      <div v-else-if="!notes.length" class="panel growth-note-empty">
        <strong>{{ startDate || endDate || projectFilter ? '找不到符合條件的筆記' : '目前沒有成長筆記' }}</strong>
        <p>{{ startDate || endDate || projectFilter ? '請調整篩選條件，或清除篩選後再試。' : '先新增一筆，留下今天值得保留的學習與工作心得。' }}</p>
        <button v-if="startDate || endDate || projectFilter" class="button button-secondary" type="button" @click="clearFilters">清除篩選</button>
      </div>
      <div v-else class="growth-note-list">
        <article v-for="note in notes" :key="note.id" class="growth-note-card">
          <div class="growth-note-card-main">
            <div class="growth-note-card-head">
              <time :datetime="note.note_date">{{ formatNoteDate(note.note_date) }}</time>
              <span v-if="note.project" class="tag tag-blue">{{ note.project.name }}</span>
            </div>
            <p class="growth-note-excerpt">{{ note.content }}</p>
          </div>
          <div class="growth-note-actions">
            <NuxtLink :to="`/growth-notes/${note.id}`" class="icon-button edit-button" aria-label="編輯筆記">
              <NIcon size="18"><CreateOutline /></NIcon>
            </NuxtLink>
            <button class="delete-button" type="button" aria-label="刪除筆記" :disabled="deletingId === note.id" @click="deleteNote(note)">
              <NIcon size="18"><TrashBinOutline /></NIcon>
            </button>
          </div>
        </article>
      </div>
    </section>

    <div v-if="noteToDelete" class="dialog-backdrop" role="presentation" @click.self="noteToDelete = null">
      <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-note-title">
        <p class="section-kicker">DELETE NOTE</p>
        <h2 id="delete-note-title">確定要刪除這筆筆記嗎？</h2>
        <p class="confirm-dialog-meta">
          {{ formatDate(noteToDelete.note_date) }} · {{ noteToDelete.project?.name || '未指定專案' }}
        </p>
        <p class="confirm-dialog-content">{{ noteToDelete.content }}</p>
        <div class="confirm-dialog-actions">
          <button class="button button-secondary" type="button" :disabled="deletingId !== null" @click="noteToDelete = null">取消</button>
          <button class="button button-danger" type="button" :disabled="deletingId !== null" @click="confirmDelete">
            {{ deletingId !== null ? '刪除中…' : '刪除筆記' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>




