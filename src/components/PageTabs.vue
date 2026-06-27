<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab', { active: modelValue === tab.key }]"
      @click="$emit('update:modelValue', tab.key)"
    >
      <svg v-if="tab.icon" width="16" height="16" viewBox="0 0 16 16" fill="none" v-html="tab.icon" />
      <span>{{ tab.label }}</span>
      <span v-if="tab.badge !== undefined" :class="['tab-badge', { primary: tab.badgePrimary }]">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, default: '' }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs {
  display: flex;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
  padding: 0 8px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border: none;
  background: none;
  font-size: var(--text-base);
  color: var(--text-tertiary);
  cursor: pointer;
  position: relative;
  transition: color var(--transition-fast);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
}
.tab:hover {
  color: var(--text-secondary);
}
.tab.active {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px 1px 0 0;
}

.tab-badge {
  font-size: 11px;
  background: var(--color-error);
  color: var(--text-inverse);
  border-radius: 10px;
  padding: 1px 7px;
  font-weight: var(--weight-semibold);
  line-height: 1.4;
}
.tab-badge.primary {
  background: var(--color-primary);
}
</style>
