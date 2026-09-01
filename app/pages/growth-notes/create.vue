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
    await navigateTo(`/growth-notes/${note.id}`)
  } catch {
    errorMessage.value = '操作失敗，請稍後再試。'
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
      <p>請依照頁面提示完成操作。</p>
      <h1>新增筆記</h1>
      <p>請依照頁面提示完成操作。</p>
    </section>

    <section class="panel growth-note-single-panel">
      <GrowthNotesGrowthNoteForm
        submit-label="儲存"
        :is-saving="isSaving"
        @submit="createNote"
      />
      <p v-if="errorMessage" class="setting-error">{{ errorMessage }}</p>
    </section>
  </div>
</template>

