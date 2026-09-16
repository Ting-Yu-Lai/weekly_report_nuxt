<script setup lang="ts">
const workflow = [
  { title: '記錄工作', description: '留下今天完成的工作內容。', to: '/daily-logs/create', action: '開始記錄' },
  { title: '代辦項目', description: '記下尚未完成、需要追蹤的工作。', to: '/pending-items', action: '查看代辦項目' },
  { title: '整理週報', description: '把每日紀錄整理成週報。', to: '/weekly-reports/history', action: '查看週報' },
]
</script>

<template>
  <div class="page-wrap home-page home-page-clean">
    <main>
      <section class="home-intro" aria-labelledby="home-title">
        <p class="section-kicker">Daily work log / Weekly report</p>
        <h1>工作日誌</h1>
        <p>快速記錄每天的工作，並整理成可回顧的週報。</p>
        <div class="hero-actions">
          <NuxtLink to="/daily-logs/create" class="button button-primary">新增日誌</NuxtLink>
          <NuxtLink to="/weekly-reports/history" class="button button-secondary">查看週報</NuxtLink>
        </div>
      </section>

      <section class="home-workflow" aria-labelledby="workflow-title">
        <div class="home-section-heading">
          <div>
            <p class="section-kicker">How it works</p>
            <h2>工作項目</h2>
          </div>
        </div>

        <div class="workflow-grid">
          <NuxtLink v-for="item in workflow" :key="item.title" :to="item.to" class="workflow-card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <span class="workflow-action">{{ item.action }} <span aria-hidden="true">→</span></span>
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

