<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { HomeOutline } from '@vicons/ionicons5'
</script>

<template>
  <NuxtLink to="/" class="topbar-home-link" aria-label="回首頁" title="回首頁">
    <NIcon size="19" aria-hidden="true"><HomeOutline /></NIcon>
  </NuxtLink>
</template>
