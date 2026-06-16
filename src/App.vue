<template>
  <div id="vue-app">
    <router-view v-slot="{ Component }">
      <keep-alive include="Notes">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
</script>

<style>
/* ===== Design Tokens ===== */
:root {
  /* Brand */
  --color-primary: #26c99a;
  --color-primary-hover: #1fb089;
  --color-primary-active: #1a9a75;
  --color-primary-light: #f0faf6;
  --color-primary-border: rgba(38, 201, 154, 0.25);

  /* Surfaces */
  --bg-page: #f5f7fa;
  --bg-card: #ffffff;
  --bg-card-hover: #f8fafc;
  --bg-elevated: #ffffff;
  --bg-input: #fafafa;

  /* Borders */
  --border-light: #e8edf2;
  --border-hover: #d0d7de;
  --border-focus: var(--color-primary);

  /* Text */
  --text-primary: #1a1a2e;
  --text-secondary: #5a6577;
  --text-tertiary: #949eae;
  --text-placeholder: #bcc4d0;
  --text-inverse: #ffffff;
  --text-link: var(--color-primary);

  /* Feedback */
  --color-success: #26c99a;
  --color-error: #e74c3c;
  --color-warning: #f0a030;
  --color-info: #5b8def;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 40px;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  --font-display: 'DINCond-Bold', 'Arial Black', var(--font-sans);

  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-md: 15px;
  --text-lg: 18px;
  --text-xl: 22px;
  --text-2xl: 26px;

  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-black: 900;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 16px;
  --radius-full: 50%;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.08);
  --shadow-primary: 0 4px 16px rgba(38, 201, 154, 0.2);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;

  /* Layout */
  --header-height: 56px;
  --sidebar-width: 240px;
  --content-max-width: 600px;
}

/* ===== Global Reset ===== */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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

/* Card */
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

/* Input */
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

/* Button - Primary */
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

/* Button - Ghost */
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

/* Button - Danger */
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
  background: #fef5f5;
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
</style>