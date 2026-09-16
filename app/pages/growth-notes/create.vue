<script setup lang="ts">
const growthNoteStore = useGrowthNoteStore()
const isSaving = ref(false)
const errorMessage = ref('')

async function createNote(data: {
  project_id: string | null
  note_date: string
  content: string
}) {
  isSaving.value = true
  errorMessage.value = ''

  try {
    const note = await growthNoteStore.createGrowthNote(data)
    await navigateTo('/growth-notes')
  } catch {
    errorMessage.value = '新增失敗，請確認欄位內容與網路連線後再試。'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="page-wrap growth-note-page">
    <header class="topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">新增筆記</span>
    </header>

    <section class="page-intro compact-intro">
      <p class="section-kicker">NEW NOTE</p>
      <h1>新增筆記</h1>
      <p>把今天學到的內容、遇到的問題與下一步留下來。</p>
    </section>

    <section class="panel growth-note-single-panel">
      <GrowthNotesGrowthNoteForm
        submit-label="儲存"
        :is-saving="isSaving"
        @submit="createNote"
      />
      <p v-if="errorMessage" class="setting-error" role="alert">{{ errorMessage }}</p>
    </section>
  </div>
</template>

