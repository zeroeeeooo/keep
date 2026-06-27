<template>
  <div id="vue-app">
    <router-view v-slot="{ Component, route }">
      <keep-alive include="Notes">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// 初始化主题（从 localStorage 恢复）
onMounted(() => {
  const theme = localStorage.getItem('keep_theme') || 'light'
  document.documentElement.setAttribute('data-theme', theme)
})
</script>

<style>
/* ===== Keep 页面字体 ===== */
@font-face {
  font-family: 'keeprun';
  src: url('/DINCond-Bold.otf') format('opentype');
  font-display: swap;
}
@font-face {
  font-family: 'STKAITI';
  src: url('/STKAITI.TTF') format('truetype');
  font-display: swap;
}

/* ===== Design Tokens: Light ===== */
:root,
[data-theme="light"] {
  --color-primary: #26c99a;
  --color-primary-hover: #1fb089;
  --color-primary-active: #1a9a75;
  --color-primary-light: #f0faf6;
  --color-primary-border: rgba(38, 201, 154, 0.25);

  --bg-page: #f5f7fa;
  --bg-card: #ffffff;
  --bg-card-hover: #f8fafc;
  --bg-elevated: #ffffff;
  --bg-input: #fafafa;

  --border-light: #e8edf2;
  --border-hover: #d0d7de;
  --border-focus: var(--color-primary);

  --text-primary: #1a1a2e;
  --text-secondary: #5a6577;
  --text-tertiary: #949eae;
  --text-placeholder: #bcc4d0;
  --text-inverse: #ffffff;
  --text-link: var(--color-primary);

  --color-success: #26c99a;
  --color-error: #e74c3c;
  --color-warning: #f0a030;
  --color-info: #5b8def;

  --space-xs: 4px; --space-sm: 8px; --space-md: 16px; --space-lg: 24px; --space-xl: 32px; --space-2xl: 40px;

  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  --font-display: 'DINCond-Bold', 'Arial Black', var(--font-sans);
  --text-xs: 11px; --text-sm: 13px; --text-base: 14px; --text-md: 15px; --text-lg: 18px; --text-xl: 22px; --text-2xl: 26px;
  --weight-normal: 400; --weight-medium: 500; --weight-semibold: 600; --weight-bold: 700; --weight-black: 900;

  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 16px; --radius-full: 50%;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.08);
  --shadow-primary: 0 4px 16px rgba(38,201,154,0.2);

  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;

  --header-height: 56px;
  --sidebar-width: 240px;
  --content-max-width: 600px;
}

/* ===== Design Tokens: Dark ===== */
[data-theme="dark"] {
  --color-primary: #2ed8a5;
  --color-primary-hover: #26c99a;
  --color-primary-active: #1fb089;
  --color-primary-light: rgba(46, 216, 165, 0.1);
  --color-primary-border: rgba(46, 216, 165, 0.25);

  --bg-page: #0f1117;
  --bg-card: #1a1d27;
  --bg-card-hover: #22263a;
  --bg-elevated: #22263a;
  --bg-input: #12141d;

  --border-light: #2a2e3d;
  --border-hover: #3a3f52;
  --border-focus: var(--color-primary);

  --text-primary: #e8ecf4;
  --text-secondary: #98a0b8;
  --text-tertiary: #6b7394;
  --text-placeholder: #3f4560;
  --text-inverse: #0f1117;
  --text-link: var(--color-primary);

  --color-success: #2ed8a5;
  --color-error: #f05a5a;
  --color-warning: #f0a030;
  --color-info: #6b8cff;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.3);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.4);
  --shadow-primary: 0 4px 16px rgba(46,216,165,0.15);
}

/* ===== Global Reset ===== */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm, 4px);
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-page);
  line-height: 1.5;
  transition: background var(--transition-base), color var(--transition-base);
}

#vue-app {
  width: 100%;
  min-height: 100vh;
}

a {
  color: var(--text-link);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* ===== Shared Component Styles ===== */

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
}
.card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  color: var(--text-primary);
  background: var(--bg-input);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
  font-family: var(--font-sans);
}
.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-border);
  background: var(--bg-card);
}
.input::placeholder {
  color: var(--text-placeholder);
}

.btn-primary {
  height: 46px;
  padding: 0 24px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--text-inverse);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  letter-spacing: 2px;
  cursor: pointer;
  transition: background var(--transition-fast), transform 0.1s ease;
  font-family: var(--font-sans);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}
.btn-primary:disabled {
  background: var(--text-placeholder);
  cursor: not-allowed;
  opacity: 0.6;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-ghost:hover {
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.btn-danger {
  height: 36px;
  padding: 0 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-error);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-danger:hover {
  border-color: var(--color-error);
  background: rgba(240, 90, 90, 0.08);
}

/* Header bar (shared across sub-pages) */
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

.page-header-back {
  display: flex;
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

.page-header-spacer {
  width: 90px;
}

/* Page body wrapper */
.page-body {
  flex: 1;
  padding: var(--space-lg);
  max-width: 500px;
  margin: 0 auto;
  overflow-y: auto;
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  padding: 2px 8px;
  border-radius: 10px;
  line-height: 1.4;
}
.badge-danger {
  background: var(--color-error);
  color: var(--text-inverse);
}
.badge-primary {
  background: var(--color-primary);
  color: var(--text-inverse);
}

/* Toast */
.toast-container {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}

.toast {
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  box-shadow: var(--shadow-lg);
  color: var(--text-inverse);
}
.toast-success { background: var(--color-success); }
.toast-error { background: var(--color-error); }
.toast-info { background: var(--text-primary); }

.toast-enter-active { transition: all 0.25s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-16px); }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--text-tertiary);
  font-size: var(--text-base);
  gap: 8px;
}
.empty-state .icon {
  font-size: 32px;
  margin-bottom: 4px;
}

/* ===== Page Transition ===== */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== Skeleton Loading ===== */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.skeleton {
  background: var(--border-light);
  border-radius: var(--radius-sm);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.skeleton-text {
  height: 14px;
  margin-bottom: 8px;
  width: 100%;
}
.skeleton-text:last-child {
  width: 60%;
}
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}
.skeleton-card {
  height: 120px;
  border-radius: var(--radius-lg);
}

</style>
