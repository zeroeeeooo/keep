<template>
  <div class="keep-page">
    <header class="keep-header">
      <router-link v-if="auth.loggedIn" to="/home" class="keep-back">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回首页</span>
      </router-link>
      <span v-else class="keep-back-placeholder"></span>

      <span class="keep-title-text">KEE<span class="keep-highlight">Pro</span></span>

      <div class="keep-right">
        <router-link v-if="!auth.loggedIn" to="/login" class="login-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 14.5c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <span>登录</span>
        </router-link>
      </div>
    </header>
    <iframe
      ref="keepFrame"
      src="/keep.html"
      class="keep-iframe"
      title="Keep 运动打卡截图生成器"
      @load="onFrameLoad"
    ></iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../store/auth.js'

const keepFrame = ref(null)

function onFrameLoad() {
  console.log('Keep 页面已加载')
}
</script>

<style scoped>
.keep-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
}

.keep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  height: 48px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
  z-index: 10;
}

.keep-back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}
.keep-back:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  text-decoration: none;
}

.keep-back-placeholder {
  width: 90px;
}

.keep-title-text {
  font-size: var(--text-lg);
  font-weight: var(--weight-black);
  letter-spacing: 2px;
  font-family: var(--font-display);
  color: var(--text-primary);
}

.keep-highlight {
  color: var(--color-primary);
}

.keep-right {
  width: 90px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.login-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}
.login-link:hover {
  background: var(--bg-card-hover);
  color: var(--color-primary);
  text-decoration: none;
}
.login-link svg {
  flex-shrink: 0;
}

.keep-spacer {
  width: 90px;
}

.keep-iframe {
  flex: 1;
  width: 100%;
  border: none;
}
</style>
