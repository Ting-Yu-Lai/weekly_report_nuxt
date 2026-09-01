<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { TrashBinOutline } from '@vicons/ionicons5'

const projectStore = useProjectStore()
const { projects } = storeToRefs(projectStore)
const workTypeStore = useWorkTypeStore()
const { workTypes: apiWorkTypes } = storeToRefs(workTypeStore)

const isLoading = ref(false)
const errorMessage = ref('')

const projectInput = ref('')
const workTypeInput = ref('')
const workTypes = ref<string[]>([])
const savedMessage = ref('')
const projectError = ref('')
const workTypeError = ref('')
const dataTransfer = useDataTransfer()
const importInput = ref<HTMLInputElement | null>(null)

async function loadProjects() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await projectStore.fetchProjects()
  } catch {
    errorMessage.value = '專案清單載入失敗，請確認 Laravel API 是否正常。'
  } finally {
    isLoading.value = false
  }
}

async function loadWorkTypes() {
  try {
    await workTypeStore.fetchWorkTypes()
    workTypes.value = apiWorkTypes.value.map((workType) => workType.name)
  } catch {
    workTypeError.value = '載入工作類型失敗，請確認 Laravel API 是否正常。'
  }
}

onMounted(() => {
  loadProjects()
  loadWorkTypes()
})

async function addProject() {
  const name = projectInput.value.trim()
  projectError.value = ''

  if (!name) {
    projectError.value = '請輸入專案名稱。'
    return
  }
  if (projects.value.some((project) => project.name === name)) {
    projectError.value = '已有相同名稱的專案。'
    return
  }

  try {
    await projectStore.fetchCreateProject({ name, description: null })
    projectInput.value = ''
    savedMessage.value = '專案已新增。'
  } catch {
    projectError.value = '專案載入失敗，請稍後再試。'
  }
}

async function addWorkType() {
  const name = workTypeInput.value.trim()
  workTypeError.value = ''

  if (!name) {
    workTypeError.value = '請輸入工作類型名稱。'
    return
  }
  if (workTypes.value.includes(name)) {
    workTypeError.value = '已有相同名稱的工作類型。'
    return
  }

  try {
    await workTypeStore.fetchCreateWorkType({ name })
    workTypeInput.value = ''
    savedMessage.value = '工作類型已新增。'
  } catch {
    workTypeError.value = '工作類型新增失敗，請稍後再試。'
  }
}

async function toggleProject(project: Project) {
  try {
    await projectStore.fetchUpdateProjectActive(project.id, {
      is_active: !project.is_active,
    })
    savedMessage.value = `已${project.is_active ? '停用' : '啟用'}專案。`
  } catch {
    projectError.value = '專案載入失敗，請稍後再試。'
  }
}

async function deleteProject(project: Project) {
  if (!window.confirm(`確定要刪除「${project.name}」嗎？`)) return

  try {
    await projectStore.fetchDeleteProject(project.id)
    savedMessage.value = '專案已刪除。'
  } catch {
    projectError.value = '專案載入失敗，請稍後再試。'
  }
}

async function exportJson() {
  try {
    await dataTransfer.exportData()
    savedMessage.value = '資料已匯出。'
  } catch {
    savedMessage.value = '資料匯出失敗，請確認 Laravel API 是否正常。'
  }
}

function chooseImportFile() {
  importInput.value?.click()
}

async function importJson(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return
  if (!window.confirm('匯入資料會覆寫目前的 SQLite 資料，確定要繼續嗎？')) return

  try {
    await dataTransfer.importData(file)
    await Promise.all([projectStore.fetchProjects(), workTypeStore.fetchWorkTypes()])
    workTypes.value = apiWorkTypes.value.map((workType) => workType.name)
    savedMessage.value = '資料已匯入。'
  } catch (error) {
    savedMessage.value = error instanceof Error
      ? error.message
      : '匯入資料失敗，請稍後再試。'
  }
}
</script>

<template>
  <div class="page-wrap">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <div class="topbar-meta">
        <span class="page-eyebrow">設定</span>
        <span v-if="savedMessage" class="save-status">{{ savedMessage }}</span>
      </div>
    </header>

    <section class="page-intro compact-intro">
      <p>管理日誌使用的專案、工作類型，以及資料備份。</p>
      <h1>系統設定</h1>
      <p>變更會立即套用到新增日誌與週報。</p>
    </section>

    <section class="settings-grid">
      <article class="panel setting-panel setting-wide project-panel">
        <div class="panel-heading">
          <h2>專案管理</h2>
          <span class="panel-caption">{{ projects.filter((project) => project.is_active).length }} 個啟用專案</span>
        </div>
        <p class="panel-help">專案會出現在日誌、待辦事項與成長筆記的選單中。停用後不會出現在新增資料的選單，但既有紀錄仍會保留。</p>

        <div v-if="isLoading" class="empty-setting">正在載入專案清單……</div>
        <div v-else-if="errorMessage" class="setting-error">{{ errorMessage }}</div>
        <div v-if="projects.length === 0" class="empty-setting">目前沒有專案。</div>
        <div v-else class="project-list">
          <div v-for="project in projects" :key="project.id" class="project-row" :class="{ inactive: !project.is_active }">
            <span class="project-status" :class="project.is_active ? 'is-active' : 'is-inactive'">
              <span aria-hidden="true">{{ project.is_active ? '●' : '○' }}</span>
              {{ project.is_active ? '啟用中' : '已停用' }}
            </span>
            <strong>{{ project.name }}</strong>
            <span class="project-description">{{ project.description || '尚未填寫專案說明' }}</span>
            <div class="project-actions">
              <button class="status-toggle" type="button" :aria-pressed="project.is_active" @click="toggleProject(project)">
                {{ project.is_active ? '停用專案' : '啟用專案' }}
              </button>
              <button class="delete-button" type="button" aria-label="刪除專案" @click="deleteProject(project)">
                <NIcon size="18"><TrashBinOutline /></NIcon>
              </button>
            </div>
          </div>
        </div>

        <p v-if="projectError" class="setting-error">{{ projectError }}</p>
        <form class="inline-form" @submit.prevent="addProject">
          <input v-model="projectInput" class="text-input" placeholder="例如：產品改版" aria-label="專案名稱" />
          <button class="button button-secondary" type="submit">新增專案</button>
        </form>
      </article>

      <article class="panel setting-panel setting-wide">
        <div class="panel-heading">
          <h2>工作類型</h2>
          <span>分類標籤</span>
        </div>
        <p class="panel-help">工作類型會用來分類每日工作內容，例如「開發」、「會議」或「文件整理」。</p>
        <div class="tag-list">
          <span v-for="workType in workTypes" :key="workType" class="tag tag-green">{{ workType }}</span>
        </div>
        <p v-if="workTypeError" class="setting-error">{{ workTypeError }}</p>
        <form class="inline-form" @submit.prevent="addWorkType">
          <input v-model="workTypeInput" class="text-input" placeholder="例如：開發" aria-label="工作類型名稱" />
          <button class="button button-secondary" type="submit">新增工作類型</button>
        </form>
      </article>

      <article class="panel setting-panel setting-wide">
        <div class="panel-heading">
          <h2>資料備份</h2>
          <span>資料備份</span>
        </div>
        <p class="panel-help">匯出會下載目前所有工作資料的 JSON 備份；匯入會覆寫目前資料，請先確認檔案內容。</p>
        <div class="setting-actions">
          <input
            ref="importInput"
            class="visually-hidden"
            type="file"
            accept="application/json,.json"
            @change="importJson"
          />
          <button class="button button-secondary" type="button" @click="exportJson">匯出資料</button>
          <button class="button button-secondary" type="button" @click="chooseImportFile">匯入資料</button>
        </div>
      </article>

      <article class="panel setting-panel setting-wide api-key-panel">
        <div class="panel-heading">
          <div><h2>Gemini API Key</h2></div>
          <span>API 設定</span>
        </div>
        <p class="panel-help">目前尚未啟用 Gemini API Key 儲存功能。</p>
        <div class="key-row">
          <input class="text-input" type="password" placeholder="尚未設定" aria-label="Gemini API Key" disabled />
          <button class="button button-secondary" type="button" disabled>尚未啟用</button>
        </div>
      </article>
    </section>
  </div>
</template>

