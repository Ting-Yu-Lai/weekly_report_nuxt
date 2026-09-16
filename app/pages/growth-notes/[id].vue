<script setup lang="ts">
const route = useRoute()
const growthNoteStore = useGrowthNoteStore()
const { notes } = storeToRefs(growthNoteStore)
const note = ref<GrowthNote | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const savedMessage = ref('')
const noteId = computed(() => String(route.params.id))

async function loadNote() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const cachedNote = notes.value.find((item) => item.id === noteId.value)

    if (cachedNote) {
      note.value = cachedNote
      return
    }

    const response = await useNuxtApp().$axios.get<{ data: GrowthNote }>(
      `/api/growth-notes/${noteId.value}`,
    )
    note.value = response.data.data
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

async function updateNote(data: {
  project_id: string | null
  note_date: string
  content: string
}) {
  isSaving.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    note.value = await growthNoteStore.updateGrowthNote(noteId.value, data)
    savedMessage.value = '資料已儲存。'
  } catch {
    errorMessage.value = '儲存失敗，請確認欄位內容與網路連線後再試。'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadNote)
</script>

<template>
  <div class="page-wrap growth-note-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <div class="topbar-meta">
        <span class="page-eyebrow">編輯筆記</span>
        <span v-if="savedMessage" class="save-status" aria-live="polite">{{ savedMessage }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="empty-setting" aria-live="polite">正在載入成長筆記……</div>
    <div v-else-if="errorMessage && !note" class="setting-error" role="alert">{{ errorMessage }}</div>

    <template v-else-if="note">
      <section class="page-intro compact-intro">
        <p class="section-kicker">04 / NOTE DETAIL</p>
        <h1>編輯筆記</h1>
        <p>{{ note.note_date }} · {{ note.project?.name || '未指定專案' }}</p>
      </section>

      <section class="panel growth-note-single-panel">
        <GrowthNotesGrowthNoteForm
          :initial-note="note"
          submit-label="儲存"
          :is-saving="isSaving"
          @submit="updateNote"
        />
        <p v-if="errorMessage" class="setting-error" role="alert">{{ errorMessage }}</p>
      </section>
    </template>
  </div>
</template>

