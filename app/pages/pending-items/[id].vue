<script setup lang="ts">
const route = useRoute()
const pendingItemStore = usePendingItemStore()
const item = ref<PendingItem | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const savedMessage = ref('')
const itemId = computed(() => String(route.params.id))

async function loadItem() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    item.value = await pendingItemStore.fetchPendingItemById(itemId.value)
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  } finally {
    isLoading.value = false
  }
}

async function updateItem(data: {
  project_id: string | null
  title: string
  content: string | null
}) {
  isSaving.value = true
  errorMessage.value = ''
  savedMessage.value = ''

  try {
    item.value = await pendingItemStore.updatePendingItem(itemId.value, data)
    savedMessage.value = '資料已儲存。'
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  } finally {
    isSaving.value = false
  }
}

async function toggleStatus() {
  if (!item.value) return

  try {
    item.value = await pendingItemStore.updatePendingItemStatus(
      item.value.id,
      item.value.status === 0 ? 1 : 0,
    )
    savedMessage.value = item.value.status === 1 ? '已標記完成。' : '已改回待處理。'
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  }
}

onMounted(loadItem)
</script>

<template>
  <div class="page-wrap pending-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <div class="topbar-meta">
      <span class="page-eyebrow">編輯代辦項目</span>
        <span v-if="savedMessage" class="save-status">{{ savedMessage }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="empty-setting">正在載入代辦項目……</div>
    <div v-else-if="errorMessage && !item" class="setting-error">{{ errorMessage }}</div>

    <template v-else-if="item">
      <section class="page-intro compact-intro page-intro-with-action">
        <div>
          <p class="section-kicker">代辦項目</p>
          <h1>編輯代辦項目</h1>
          <p>{{ item.status === 0 ? '目前尚未完成' : '這項工作已完成' }}</p>
        </div>
        <NuxtLink to="/pending-items" class="text-button">返回代辦項目列表</NuxtLink>
      </section>

      <section class="panel pending-single-panel">
        <div class="pending-detail-status">
          <span class="pending-status" :class="item.status === 0 ? 'is-pending' : 'is-resolved'">
            {{ item.status === 0 ? '目前尚未完成' : '此事項已完成' }}
          </span>
          <button type="button" class="button button-secondary" @click="toggleStatus">
            {{ item.status === 0 ? '標記為完成' : '改回待處理' }}
          </button>
        </div>
        <PendingItemsPendingItemForm
          :initial-item="item"
          submit-label="儲存"
          :is-saving="isSaving"
          @submit="updateItem"
        />
        <p v-if="errorMessage" class="setting-error">{{ errorMessage }}</p>
      </section>
    </template>
  </div>
</template>

