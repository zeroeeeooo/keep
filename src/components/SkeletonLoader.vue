<template>
  <div class="skeleton-wrapper">
    <div v-for="i in count" :key="i" class="skeleton-card-item">
      <div class="skeleton-row">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-lines">
          <div class="skeleton skeleton-text" style="width:40%"></div>
          <div class="skeleton skeleton-text" style="width:25%"></div>
        </div>
      </div>
      <div class="skeleton skeleton-text" style="margin-top:12px"></div>
      <div class="skeleton skeleton-text" style="width:75%"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 }
})
</script>

<style scoped>
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skeleton-card-item {
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
}
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.skeleton-lines {
  flex: 1;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.skeleton {
  background: var(--border-light);
  border-radius: 6px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.skeleton-text { height: 14px; margin-bottom: 8px; }
.skeleton-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
</style>
