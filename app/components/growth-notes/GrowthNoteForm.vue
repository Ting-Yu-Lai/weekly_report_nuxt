<script setup lang="ts">
import { NSelect } from 'naive-ui'

const props = defineProps<{
  initialNote?: GrowthNote | null
  submitLabel: string
  isSaving: boolean
}>()

const emit = defineEmits<{
  submit: [data: { project_id: string | null; note_date: string; content: string }]
}>()

function getLocalDateKey() {
  const date = new Date()
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

const today = getLocalDateKey()
const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)
const noteDate = ref<string | null>(props.initialNote?.note_date || today)
const projectId = ref(props.initialNote?.project_id || '')
const content = ref(props.initialNote?.content || '')
const formError = ref('')
const dateError = ref('')
const contentError = ref('')
const projectError = ref('')
const isLoadingProjects = ref(false)
const projectOptions = computed(() => [
  { label: '不指定專案', value: '' },
  ...projects.value.map((project) => ({ label: project.name, value: project.id })),
])

watch(() => props.initialNote, (note) => {
  noteDate.value = note?.note_date || today
  projectId.value = note?.project_id || ''
  content.value = note?.content || ''
})

async function loadProjects() {
  isLoadingProjects.value = true
  projectError.value = ''

  try {
    await projectStore.fetchProjects({ is_active: true })
  } catch {
    projectError.value = '專案載入失敗，請稍後再試。'
  } finally {
    isLoadingProjects.value = false
  }
}

onMounted(loadProjects)

function submitForm() {
  formError.value = ''
  dateError.value = ''
  contentError.value = ''

  if (!noteDate.value) {
    dateError.value = '請選擇日期。'
  }

  if (!content.value.trim()) {
    contentError.value = '請輸入筆記內容。'
  }

  if (dateError.value || contentError.value) {
    return
  }

  emit('submit', {
    project_id: projectId.value || null,
    note_date: noteDate.value,
    content: content.value.trim(),
  })
}
</script>

<template>
  <form class="growth-note-form" @submit.prevent="submitForm">
    <label class="form-field">
      <span>日期 <small>必填</small></span>
      <AppDatePicker
        v-model:formatted-value="noteDate"
        id="growth-note-date"
        name="note_date"
        class="app-date-picker"
        type="date"
        value-format="yyyy-MM-dd"
        clearable
        required
      />
      <small v-if="dateError" class="field-error" role="alert">{{ dateError }}</small>
    </label>

    <label class="form-field">
      <span>專案 <small>選填</small></span>
      <ClientOnly>
        <NSelect v-model:value="projectId" :options="projectOptions" :disabled="isLoadingProjects" />
      </ClientOnly>
      <small v-if="projectError" class="setting-error">{{ projectError }}</small>
    </label>

    <label class="form-field">
      <span>筆記內容 <small>必填</small></span>
      <textarea
        v-model="content"
        id="growth-note-content"
        name="content"
        class="text-input textarea-input growth-note-editor"
        placeholder="記錄今天學到什麼、遇到什麼問題，以及下一步…"
        minlength="1"
        maxlength="5000"
        required
      />
      <div class="field-hint-row">
        <small v-if="contentError" class="field-error" role="alert">{{ contentError }}</small>
        <small class="character-count">{{ content.length }} / 5000</small>
      </div>
    </label>

    <p v-if="formError" class="setting-error" role="alert">{{ formError }}</p>
    <button class="button button-primary" type="submit" :disabled="isSaving">
      {{ isSaving ? '儲存中…' : submitLabel }}
    </button>
  </form>
</template>



