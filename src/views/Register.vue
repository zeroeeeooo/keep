<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <div class="register-logo">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="#26c99a"/>
            <path d="M14 28c0-6 4-10 8-12l2 2c-3 2-6 5-6 10h-4z" fill="#fff"/>
            <path d="M18 30c0-5 3-8 6-10l1 2c-2 2-4 5-4 8h-3z" fill="#fff" opacity="0.8"/>
            <path d="M24 18l3-3 8 8-3 3-8-8z" fill="#fff"/>
            <path d="M28 14l4-4 2 2-4 4-2-2z" fill="#fff" opacity="0.6"/>
          </svg>
        </div>
        <h1 class="register-title">注册账号</h1>
        <p class="register-subtitle">创建你的 KEEPro 账号</p>
      </div>

      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-field">
          <label class="field-label" for="username">用户名</label>
          <input
            id="username"
            v-model.trim="form.username"
            type="text"
            class="input"
            placeholder="2-20 个字符"
            autocomplete="username"
            autofocus
          />
        </div>

        <div class="form-field">
          <label class="field-label" for="nickname">昵称（可选）</label>
          <input
            id="nickname"
            v-model.trim="form.nickname"
            type="text"
            class="input"
            placeholder="显示名称，不填则使用用户名"
            autocomplete="name"
          />
        </div>

        <div class="form-field">
          <label class="field-label" for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            placeholder="至少 6 位"
            autocomplete="new-password"
          />
        </div>

        <div class="form-field">
          <label class="field-label" for="confirmPwd">确认密码</label>
          <input
            id="confirmPwd"
            v-model="form.confirmPwd"
            type="password"
            class="input"
            placeholder="再次输入"
            autocomplete="new-password"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary register-submit" :disabled="!canSubmit">
          {{ loading ? '注册中…' : '注册' }}
        </button>
      </form>

      <div class="register-footer">
        <span class="footer-text">已有账号？</span>
        <router-link to="/login" class="link-inline">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../store/auth.js'

const router = useRouter()

const form = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPwd: ''
})

const loading = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() => {
  return form.username && form.password && form.confirmPwd
})

function handleRegister() {
  if (!canSubmit.value) return
  errorMsg.value = ''

  if (form.username.length < 2 || form.username.length > 20) {
    errorMsg.value = '用户名长度需要在 2-20 个字符之间'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = '密码长度不能少于 6 位'
    return
  }

  if (form.password !== form.confirmPwd) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  loading.value = true

  register(form.username, form.password, form.nickname || undefined)
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
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
}
.register-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(38, 201, 154, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 80%, rgba(38, 201, 154, 0.04) 0%, transparent 60%);
}

.register-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 40px 32px 32px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.register-header {
  text-align: center;
  margin-bottom: 28px;
}

.register-logo {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

.register-title {
  font-size: 24px;
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  letter-spacing: 1px;
}

.register-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: 4px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.register-form .input {
  height: 44px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
}

.error-msg {
  font-size: var(--text-sm);
  color: var(--color-error);
  text-align: center;
}

.register-submit {
  width: 100%;
  height: 48px;
  font-size: var(--text-md);
  letter-spacing: 4px;
  margin-top: 4px;
}

.register-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

.footer-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.link-inline {
  color: var(--text-link);
  font-weight: var(--weight-semibold);
  margin-left: 4px;
}
.link-inline:hover {
  text-decoration: underline;
}
</style>
