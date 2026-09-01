<script setup lang="ts">
import { NSelect } from 'naive-ui'

const props = defineProps<{
  initialItem?: PendingItem | null
  submitLabel: string
  isSaving: boolean
}>()

const emit = defineEmits<{
  submit: [data: { project_id: string | null; title: string; content: string | null }]
}>()

const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)
const projectId = ref(props.initialItem?.project_id || '')
const title = ref(props.initialItem?.title || '')
const content = ref(props.initialItem?.content || '')
const formError = ref('')
const projectError = ref('')
const isLoadingProjects = ref(false)
const projectOptions = computed(() => [
  { label: '不指定專案', value: '' },
  ...projects.value.map((project) => ({ label: project.name, value: project.id })),
])

watch(() => props.initialItem, (item) => {
  projectId.value = item?.project_id || ''
  title.value = item?.title || ''
  content.value = item?.content || ''
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

function submitForm() {
  formError.value = '請填寫必要欄位。'

  if (!title.value.trim()) {
    formError.value = '請填寫必要欄位。'
    return
  }

  emit('submit', {
    project_id: projectId.value || null,
    title: title.value.trim(),
    content: content.value.trim() || null,
  })
}

onMounted(loadProjects)
</script>

<template>
  <form class="pending-item-form" @submit.prevent="submitForm">
    <label class="form-field">
      <span>代辦項目標題</span>
      <input
        v-model="title"
        class="text-input"
        type="text"
        maxlength="150"
        placeholder="請輸入代辦項目標題"
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
      <span>詳細內容</span>
      <textarea
        v-model="content"
        class="text-input textarea-input pending-item-editor"
        placeholder="請輸入詳細內容"
      />
    </label>

    <p v-if="formError" class="setting-error">{{ formError }}</p>
    <button class="button button-primary" type="submit" :disabled="isSaving">
      {{ isSaving ? '儲存中…' : submitLabel }}
    </button>
  </form>
</template>



