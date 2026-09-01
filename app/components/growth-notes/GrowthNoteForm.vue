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

const today = new Date().toISOString().slice(0, 10)
const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)
const noteDate = ref<string | null>(props.initialNote?.note_date || today)
const projectId = ref(props.initialNote?.project_id || '')
const content = ref(props.initialNote?.content || '')
const formError = ref('')
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
  formError.value = '請填寫必要欄位。'

  if (!noteDate.value || !content.value.trim()) {
    formError.value = '請填寫必要欄位。'
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
      <span>日期</span>
      <AppDatePicker
        v-model:formatted-value="noteDate"
        class="app-date-picker"
        type="date"
        value-format="yyyy-MM-dd"
        clearable
        required
      />
    </label>

    <label class="form-field">
      <span>專案</span>
<ClientOnly>
  <NSelect v-model:value="projectId" :options="projectOptions" :disabled="isLoadingProjects" />
</ClientOnly>
      <small v-if="projectError" class="setting-error">{{ projectError }}</small>
    </label>

    <label class="form-field">
      <span>筆記內容</span>
      <textarea
        v-model="content"
        class="text-input textarea-input growth-note-editor"
        placeholder="請輸入內容"
        required
      />
    </label>

    <p v-if="formError" class="setting-error">{{ formError }}</p>
    <button class="button button-primary" type="submit" :disabled="isSaving">
      {{ isSaving ? '儲存中…' : submitLabel }}
    </button>
  </form>
</template>



