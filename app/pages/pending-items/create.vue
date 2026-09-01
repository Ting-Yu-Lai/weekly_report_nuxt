<script setup lang="ts">
const pendingItemStore = usePendingItemStore()
const isSaving = ref(false)
const errorMessage = ref('')

async function createItem(data: {
  project_id: string | null
  title: string
  content: string | null
}) {
  isSaving.value = true
  errorMessage.value = ''

  try {
    const item = await pendingItemStore.createPendingItem(data)
    await navigateTo(`/pending-items/${item.id}`)
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="page-wrap pending-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">新增代辦項目</span>
    </header>

    <section class="page-intro compact-intro">
      <p>請依照頁面提示完成操作。</p>
      <h1>新增代辦項目</h1>
      <p>請依照頁面提示完成操作。</p>
    </section>

    <section class="panel pending-single-panel">
      <PendingItemsPendingItemForm
        submit-label="儲存"
        :is-saving="isSaving"
        @submit="createItem"
      />
      <p v-if="errorMessage" class="setting-error">{{ errorMessage }}</p>
    </section>
  </div>
</template>

