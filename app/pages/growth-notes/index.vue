<script setup lang="ts">
import { NIcon, NSelect } from 'naive-ui'
import { TrashBinOutline } from '@vicons/ionicons5'

const growthNoteStore = useGrowthNoteStore()
const projectStore = useProjectStore()
const { notes } = storeToRefs(growthNoteStore)
const { projects } = storeToRefs(projectStore)

const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)
const projectFilter = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
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

async function deleteNote(note: GrowthNote) {
  if (!window.confirm(`確定要刪除「${note.content.slice(0, 20)}」嗎？`)) return

  try {
    await growthNoteStore.deleteGrowthNote(note.id)
    await loadNotes()
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  }
}

function formatNoteDate(date: string) {
  const today = new Date().toISOString().slice(0, 10)
  return date === today ? '今天' : date.slice(5).replace('-', '/')
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
      <button class="button button-secondary">操作</button>
    </section>

    <section class="content-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">NOTE HISTORY</p>
          <h2>工作項目</h2>
        </div>
        <span class="muted-label">{{ notes.length }} 筆</span>
      </div>

      <p v-if="errorMessage" class="setting-error">{{ errorMessage }}</p>
      <div v-if="isLoading" class="empty-setting">正在載入成長筆記……</div>
      <div v-else-if="!notes.length" class="panel growth-note-empty">
        目前沒有成長筆記。
      </div>
      <div v-else class="growth-note-list">
        <article v-for="note in notes" :key="note.id" class="growth-note-card">
          <div class="growth-note-card-head">
            <time>{{ formatNoteDate(note.note_date) }}</time>
            <span v-if="note.project" class="tag tag-blue">{{ note.project.name }}</span>
          </div>
          <p>{{ note.content }}</p>
          <div class="growth-note-actions">
            <NuxtLink to="/" class="text-button">返回</NuxtLink>
            <button class="delete-button" type="button" aria-label="刪除筆記" @click="deleteNote(note)">
              <NIcon size="18"><TrashBinOutline /></NIcon>
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>




