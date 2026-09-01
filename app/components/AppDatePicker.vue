<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <ClientOnly>
    <NDatePicker v-bind="$attrs" />
  </ClientOnly>
</template>
