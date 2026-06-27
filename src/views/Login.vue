<template>
  <AuthCard subtitle="Keep 运动打卡截图生成器">
    <template #title>
      KEE<span class="highlight">Pro</span>
    </template>

    <form class="auth-form" @submit.prevent="handleLogin">
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

      <button type="submit" class="btn-primary auth-submit" :disabled="!canSubmit">
        {{ loading ? '登录中…' : '登录' }}
      </button>
    </form>

    <template #footer>
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
    </template>
  </AuthCard>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import AuthCard from '../components/layout/AuthCard.vue'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() => form.username && form.password)

async function handleLogin() {
  if (!canSubmit.value) return
  loading.value = true
  errorMsg.value = ''

  const result = await auth.login(form.username, form.password)
  if (result.ok) {
    router.push('/home')
  } else {
    errorMsg.value = result.message
  }
  loading.value = false
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
.highlight {
  color: var(--color-primary);
}

.register-hint {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.guest-entry {
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
  margin-top: 14px;
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

.demo-hint {
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
  margin-top: 12px;
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
