<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="#26c99a"/>
            <path d="M14 28c0-6 4-10 8-12l2 2c-3 2-6 5-6 10h-4z" fill="#fff"/>
            <path d="M18 30c0-5 3-8 6-10l1 2c-2 2-4 5-4 8h-3z" fill="#fff" opacity="0.8"/>
            <path d="M24 18l3-3 8 8-3 3-8-8z" fill="#fff"/>
            <path d="M28 14l4-4 2 2-4 4-2-2z" fill="#fff" opacity="0.6"/>
          </svg>
        </div>
        <h1 class="login-title">KEE<span class="highlight">Pro</span></h1>
        <p class="login-subtitle">Keep 运动打卡截图生成器</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-field">
          <label class="field-label" for="username">用户名</label>
          <input
            id="username"
            v-model.trim="form.username"
            type="text"
            class="input"
            placeholder="请输入用户名"
            autocomplete="username"
            autofocus
          />
        </div>

        <div class="form-field">
          <label class="field-label" for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary login-submit" :disabled="!canSubmit">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>

      <div class="login-footer">
        <div class="register-hint">
          <span>还没有账号？</span>
          <router-link to="/register" class="link-inline">立即注册</router-link>
        </div>
        <div class="guest-entry">
          <router-link to="/keepimage" class="guest-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M2 14.5c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            游客体验
          </router-link>
        </div>
        <div class="demo-hint">
          <button class="demo-chip" @click="fillAccount('admin')">
            demo: admin / 123456
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../store/auth.js'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() => form.username && form.password)

function handleLogin() {
  if (!canSubmit.value) return
  loading.value = true
  errorMsg.value = ''

  login(form.username, form.password)
    .then((result) => {
      if (result.ok) {
        router.push('/home')
      } else {
        errorMsg.value = result.message
        loading.value = false
      }
    })
    .catch(() => {
      errorMsg.value = '网络错误，请检查服务器是否运行'
      loading.value = false
    })
}

function fillAccount(name) {
  if (name === 'admin') {
    form.username = 'admin'
    form.password = '123456'
  }
  errorMsg.value = ''
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
}
.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(38, 201, 154, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 80%, rgba(38, 201, 154, 0.04) 0%, transparent 60%);
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 40px 32px 32px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.login-title {
  font-size: 26px;
  font-weight: var(--weight-black);
  color: var(--text-primary);
  letter-spacing: 2px;
  font-family: var(--font-display);
}

.highlight {
  color: var(--color-primary);
}

.login-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: 6px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}

.login-form .input {
  height: 46px;
  padding: 0 16px;
  border-radius: var(--radius-md);
}

.error-msg {
  font-size: var(--text-sm);
  color: var(--color-error);
  text-align: center;
  margin: -8px 0;
}

.login-submit {
  width: 100%;
  height: 48px;
  font-size: var(--text-md);
  letter-spacing: 4px;
  margin-top: 4px;
}

.login-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.register-hint {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.guest-entry {
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
}

.guest-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  text-decoration: none;
  font-weight: var(--weight-medium);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}
.guest-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
  text-decoration: none;
}

.link-inline {
  color: var(--text-link);
  font-weight: var(--weight-semibold);
  margin-left: 4px;
}
.link-inline:hover {
  text-decoration: underline;
}

.demo-hint {
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
}

.demo-chip {
  font-size: var(--text-xs);
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
}
.demo-chip:hover {
  background: #ddf4eb;
  border-color: var(--color-primary);
}
</style>
