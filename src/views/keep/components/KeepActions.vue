<template>
  <div class="keep-actions">
    <div class="action-buttons">
      <button class="btn-action btn-primary" @click="$emit('download')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v8M4 7l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        <span>下载图片</span>
      </button>
      <button class="btn-action btn-ghost" @click="$emit('preview')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>预览图片</span>
      </button>
      <button class="btn-action btn-ghost" @click="$emit('refresh-track')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8a6 6 0 0111.33-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M14 8a6 6 0 01-11.33 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9 1l2 4-4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 15l-2-4 4-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>更新路径</span>
      </button>
      <button class="btn-action btn-save" @click="$emit('save-settings')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 2h7l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 2v4h4" stroke="currentColor" stroke-width="1.5"/>
          <rect x="5" y="9" width="6" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <path d="M5 11h6" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span>永存设置</span>
      </button>
      <button class="btn-action btn-reset" @click="$emit('reset')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8a6 6 0 0111.33-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M14 8a6 6 0 01-11.33 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9 1l2 4-4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>重置</span>
      </button>
    </div>

    <div class="message-box" v-if="message" ref="msgRef">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' }
})

defineEmits(['download', 'preview', 'refresh-track', 'save-settings', 'reset'])

const msgRef = ref(null)

watch(() => props.message, (val) => {
  if (val && msgRef.value) {
    msgRef.value.style.display = 'block'
    setTimeout(() => {
      if (msgRef.value) msgRef.value.style.display = 'none'
    }, 3000)
  }
})
</script>

<style scoped>
.keep-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.btn-action {
  height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  will-change: transform;
}
.btn-action:active {
  transform: scale(0.97);
}

.btn-primary {
  border: none;
  background: var(--color-primary, #26c99a);
  color: #fff;
}
.btn-primary:hover { background: var(--color-primary-hover, #1fb089); }

.btn-ghost {
  border: 1px solid var(--border-light, #e8edf2);
  background: transparent;
  color: var(--text-secondary, #5a6577);
}
.btn-ghost:hover {
  border-color: var(--color-primary, #26c99a);
  color: var(--color-primary, #26c99a);
}

.btn-save {
  border: 1px solid var(--color-primary, #26c99a);
  background: var(--color-primary-light, #f0faf6);
  color: var(--color-primary, #26c99a);
}
.btn-save:hover {
  background: var(--color-primary, #26c99a);
  color: #fff;
}

.btn-reset {
  border: 1px solid var(--border-light, #e8edf2);
  background: transparent;
  color: var(--color-error, #e74c3c);
}
.btn-reset:hover {
  border-color: var(--color-error, #e74c3c);
  background: rgba(231, 76, 60, 0.06);
}

.message-box {
  padding: 10px 16px;
  border-radius: 6px;
  background: var(--color-primary-light, #f0faf6);
  color: var(--color-primary, #26c99a);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  white-space: pre-line;
  text-align: center;
}
</style>
