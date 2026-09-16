<script setup lang="ts">
import { NIcon } from 'naive-ui'
import {
  CalendarOutline,
  CheckmarkDoneOutline,
  DocumentTextOutline,
  HomeOutline,
  SettingsOutline,
  SparklesOutline,
} from '@vicons/ionicons5'

const route = useRoute()

const navigation = [
  { label: '首頁', caption: 'Home', to: '/', icon: HomeOutline },
  { label: '工作日誌', caption: '日誌列表', to: '/daily-logs', icon: CalendarOutline },
  { label: '代辦項目', caption: 'Follow-ups', to: '/pending-items', icon: CheckmarkDoneOutline },
  { label: '週報', caption: 'Weekly report', to: '/weekly-reports/history', icon: DocumentTextOutline },
  { label: '成長筆記', caption: 'Growth notes', to: '/growth-notes', icon: SparklesOutline },
  { label: '設定', caption: 'Workspace', to: '/settings', icon: SettingsOutline },
]
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand-block">
        <span class="brand-kicker">DevLog / local</span>
      </div>

      <nav class="side-nav" aria-label="主要導覽">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="side-link"
          :class="{ active: route.path === item.to || route.path.startsWith(`${item.to}/`) }"
        >
          <span class="side-icon" aria-hidden="true">
            <NIcon size="18"><component :is="item.icon" /></NIcon>
          </span>
          <span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.caption }}</small>
          </span>
        </NuxtLink>
      </nav>

      <div class="sidebar-note">
        <span class="sync-dot" aria-hidden="true" />
        <span>工作日誌</span>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>
