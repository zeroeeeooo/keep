<template>
  <header :class="['page-header', { 'page-header-borderless': borderless }]">
    <div class="page-header-left">
      <slot name="left">
        <router-link v-if="backTo" :to="backTo" class="page-header-back">
          <span class="arrow">←</span>
          <span>{{ backText }}</span>
        </router-link>
      </slot>
    </div>

    <div class="page-header-center">
      <slot name="title">
        <span v-if="title" class="page-header-title">{{ title }}</span>
      </slot>
    </div>

    <div class="page-header-right">
      <slot name="right" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  backTo: { type: [String, Object], default: null },
  backText: { type: String, default: '返回首页' },
  borderless: { type: Boolean, default: false }
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  height: var(--header-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.page-header-borderless {
  border-bottom: none;
}

.page-header-left {
  display: flex;
  align-items: center;
  min-width: 90px;
}

.page-header-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 90px;
}

.page-header-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-md);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  cursor: pointer;
}
.page-header-back:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  text-decoration: none;
}
.page-header-back .arrow {
  font-size: 18px;
  line-height: 1;
}

.page-header-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}
</style>
