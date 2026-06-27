<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div v-if="showLogo" class="auth-logo">
          <slot name="logo">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="12" fill="#26c99a"/>
              <path d="M14 28c0-6 4-10 8-12l2 2c-3 2-6 5-6 10h-4z" fill="#fff"/>
              <path d="M18 30c0-5 3-8 6-10l1 2c-2 2-4 5-4 8h-3z" fill="#fff" opacity="0.8"/>
              <path d="M24 18l3-3 8 8-3 3-8-8z" fill="#fff"/>
              <path d="M28 14l4-4 2 2-4 4-2-2z" fill="#fff" opacity="0.6"/>
            </svg>
          </slot>
        </div>
        <h1 class="auth-title">
          <slot name="title">
            <span v-html="title"></span>
          </slot>
        </h1>
        <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>
      </div>

      <slot />

      <div class="auth-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showLogo: { type: Boolean, default: true }
})
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
}
.auth-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(38, 201, 154, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 80%, rgba(38, 201, 154, 0.04) 0%, transparent 60%);
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 40px 32px 32px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-logo {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

.auth-title {
  font-size: 24px;
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: 1px;
}

.auth-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: 4px;
}

.auth-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

/* Shared form field styles */
:global(.form-field) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:global(.field-label) {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}

:global(.error-msg) {
  font-size: var(--text-sm);
  color: var(--color-error);
  text-align: center;
}

:global(.auth-form) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:global(.auth-submit) {
  width: 100%;
  height: 48px;
  font-size: var(--text-md);
  letter-spacing: 4px;
  margin-top: 4px;
}

:global(.auth-form .input) {
  height: 44px;
  padding: 0 14px;
  border-radius: var(--radius-md);
}

:global(.link-inline) {
  color: var(--text-link);
  font-weight: var(--weight-semibold);
  margin-left: 4px;
}
:global(.link-inline:hover) {
  text-decoration: underline;
}
</style>
