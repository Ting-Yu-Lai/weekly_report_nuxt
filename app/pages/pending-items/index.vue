<script setup lang="ts">
import { NIcon, NSelect } from 'naive-ui'
import { TrashBinOutline } from '@vicons/ionicons5'

const pendingItemStore = usePendingItemStore()
const projectStore = useProjectStore()
const { items } = storeToRefs(pendingItemStore)
const { projects } = storeToRefs(projectStore)

const statusFilter = ref('')
const projectFilter = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const statusOptions = [
  { label: '全部代辦項目', value: '' },
  { label: 'Pending', value: '0' },
  { label: '已完成', value: '1' },
]
const projectOptions = computed(() => [
  { label: '全部專案', value: '' },
  ...projects.value.map((project) => ({ label: project.name, value: project.id })),
])

async function loadItems() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await pendingItemStore.fetchPendingItems({
      status: statusFilter.value === '' ? undefined : Number(statusFilter.value),
      project_id: projectFilter.value || undefined,
    })
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

async function loadProjects() {
  try {
    await projectStore.fetchProjects({ is_active: true })
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  }
}

async function toggleStatus(item: PendingItem) {
  try {
    await pendingItemStore.updatePendingItemStatus(item.id, item.status === 0 ? 1 : 0)
    await loadItems()
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  }
}

async function deleteItem(item: PendingItem) {
  if (!window.confirm(`確定要刪除「${item.title}」嗎？`)) return

  try {
    await pendingItemStore.deletePendingItem(item.id)
    await loadItems()
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  }
}

function formatDate(date: string | null) {
  return date ? date.slice(0, 10).replaceAll('-', '/') : ''
}

onMounted(() => {
  loadProjects()
  loadItems()
})
</script>

<template>
  <div class="page-wrap pending-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">代辦項目</span>
    </header>

    <section class="page-intro compact-intro page-intro-with-action">
      <div>
        <p class="section-kicker">代辦項目</p>
        <h1>代辦項目</h1>
        <p>管理尚未完成、需要持續追蹤的工作。</p>
      </div>
      <NuxtLink to="/pending-items/create" class="button button-primary">新增代辦項目</NuxtLink>
    </section>

    <section class="panel pending-filter-panel">
      <label class="form-field">
        <span>狀態</span>
        <ClientOnly>
          <NSelect v-model:value="statusFilter" class="filter-select" :options="statusOptions" />
        </ClientOnly>
      </label>
      <label class="form-field">
        <span>專案</span>
        <ClientOnly>
          <NSelect v-model:value="projectFilter" class="filter-select" :options="projectOptions" />
        </ClientOnly>
      </label>
      <button class="button button-secondary" type="button" @click="loadItems">套用篩選</button>
    </section>

    <section class="content-section pending-content-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">PENDING BOARD</p>
          <h2>代辦項目清單</h2>
        </div>
        <span class="muted-label">{{ items.length }} 筆</span>
      </div>

      <p v-if="errorMessage" class="setting-error">{{ errorMessage }}</p>
      <div v-if="isLoading" class="empty-setting">正在載入代辦項目……</div>
      <div v-else-if="!items.length" class="panel pending-empty">
        目前沒有代辦項目。
      </div>
      <div v-else class="pending-list">
        <article v-for="item in items" :key="item.id" class="pending-card" :class="{ resolved: item.status === 1 }">
          <div class="pending-card-main">
            <div class="pending-card-meta">
              <span class="pending-status" :class="item.status === 0 ? 'is-pending' : 'is-resolved'">
                {{ item.status === 0 ? '待處理' : '已完成' }}
              </span>
              <span v-if="item.project" class="tag tag-blue">{{ item.project.name }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p v-if="item.content">{{ item.content }}</p>
            <small>建立於 {{ formatDate(item.created_at) }}</small>
          </div>
          <div class="pending-card-actions">
            <button type="button" class="button button-small" @click="toggleStatus(item)">
              {{ item.status === 0 ? '標記為完成' : '改回待處理' }}
            </button>
            <NuxtLink :to="`/pending-items/${item.id}`" class="button button-secondary">編輯</NuxtLink>
            <button class="delete-button" type="button" aria-label="刪除代辦項目" @click="deleteItem(item)">
              <NIcon size="18"><TrashBinOutline /></NIcon>
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>




