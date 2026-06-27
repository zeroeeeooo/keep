<template>
  <div class="empty-state-wrapper">
    <div class="empty-illustration">
      <slot name="illustration">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="1.5" opacity="0.1"/>
          <circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="1.5" opacity="0.15"/>
          <path d="M32 20v24M20 32h24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.2"/>
        </svg>
      </slot>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <slot name="action">
      <button v-if="actionText" class="empty-action" @click="$emit('action')">
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无内容' },
  description: { type: String, default: '' },
  actionText: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-illustration {
  color: var(--text-tertiary);
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: var(--text-lg, 18px);
  font-weight: var(--weight-semibold, 600);
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.empty-description {
  font-size: var(--text-sm, 13px);
  color: var(--text-tertiary);
  line-height: 1.5;
  max-width: 240px;
}

.empty-action {
  margin-top: 20px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary);
  color: var(--text-inverse);
  font-size: var(--text-sm, 13px);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
}
.empty-action:hover {
  background: var(--color-primary-hover);
}
</style>
