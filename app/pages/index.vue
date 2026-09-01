<script setup lang="ts">
const today = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(new Date())

const workflow = [
  { number: '01', title: '記錄工作', description: '留下今天完成的工作內容。', to: '/daily-logs/create', action: '開始記錄' },
  { number: '02', title: '代辦項目', description: '記下尚未完成、需要追蹤的工作。', to: '/pending-items', action: '查看代辦項目' },
  { number: '03', title: '整理週報', description: '把每日紀錄整理成週報。', to: '/weekly-reports', action: '查看週報' },
]
</script>

<template>
  <div class="page-wrap home-page home-page-clean">
    <header class="topbar home-topbar">
      <NuxtLink to="/" class="topbar-brand">工作日誌</NuxtLink>
      <span class="page-eyebrow">{{ today }}</span>
    </header>
    
    <main>
      <section class="home-intro" aria-labelledby="home-title">
        <p class="section-kicker">Daily work log / Weekly report</p>
        <h1>工作日誌</h1>
        <p>請依照頁面提示完成操作。</p>
        <div class="hero-actions">
          <NuxtLink to="/daily-logs/create" class="button button-primary">新增日誌</NuxtLink>
          <NuxtLink to="/weekly-reports" class="button button-secondary">查看週報</NuxtLink>
        </div>
      </section>

      <section class="home-workflow" aria-labelledby="workflow-title">
        <div class="home-section-heading">
          <div>
            <p class="section-kicker">How it works</p>
            <h2>工作項目</h2>
          </div>
          <p>請依照頁面提示完成操作。</p>
        </div>

        <div class="workflow-grid">
          <NuxtLink v-for="item in workflow" :key="item.number" :to="item.to" class="workflow-card">
            <span class="workflow-number">{{ item.number }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <span class="workflow-action">{{ item.action }} <span aria-hidden="true">→</span></span>
          </NuxtLink>
        </div>
      </section>

      <section class="home-note" aria-label="使用提示">
        <span class="home-note-mark" aria-hidden="true">i</span>
        <p>請依照頁面提示完成操作。</p>
      </section>
    </main>
  </div>
</template>

