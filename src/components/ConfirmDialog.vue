<template>
  <Transition name="fade">
    <div v-if="visible" class="confirm-dialog-overlay" @click.self="onCancel">
      <div class="confirm-dialog-card">
        <div class="confirm-dialog-header">
          <slot name="title">
            <span class="confirm-dialog-title">{{ title }}</span>
          </slot>
        </div>
        <div class="confirm-dialog-body">
          <slot>
            <p class="confirm-dialog-message">{{ message }}</p>
          </slot>
        </div>
        <div class="confirm-dialog-actions">
          <button class="btn-ghost" @click="onCancel">{{ cancelText }}</button>
          <button :class="['confirm-btn', { 'confirm-btn-danger': danger }]" @click="onConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定要执行此操作吗？' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

function onConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function onCancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 24px;
}

.confirm-dialog-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 360px;
  overflow: hidden;
}

.confirm-dialog-header {
  padding: 20px 20px 0;
}

.confirm-dialog-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.confirm-dialog-body {
  padding: 12px 20px 20px;
}

.confirm-dialog-message {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.5;
}

.confirm-dialog-actions {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
  justify-content: flex-end;
}

.confirm-btn {
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: background var(--transition-fast);
  font-family: var(--font-sans);
}
.confirm-btn:hover {
  background: var(--color-primary-hover);
}

.confirm-btn-danger {
  background: var(--color-error);
}
.confirm-btn-danger:hover {
  background: #c0392b;
}

.btn-ghost {
  height: 36px;
  padding: 0 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
}
.btn-ghost:hover {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
