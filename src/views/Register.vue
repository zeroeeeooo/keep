<template>
  <AuthCard
    title="注册账号"
    subtitle="创建你的 KEEPro 账号"
  >
    <form class="auth-form" @submit.prevent="handleRegister">
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

      <button type="submit" class="btn-primary auth-submit" :disabled="!canSubmit">
        {{ loading ? '注册中…' : '注册' }}
      </button>
    </form>

    <template #footer>
      <span class="footer-text">已有账号？</span>
      <router-link to="/login" class="link-inline">去登录</router-link>
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
  nickname: '',
  password: '',
  confirmPwd: ''
})

const loading = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() => {
  return form.username && form.password && form.confirmPwd
})

async function handleRegister() {
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

  const result = await auth.register(form.username, form.password, form.nickname || undefined)
  if (result.ok) {
    router.push('/home')
  } else {
    errorMsg.value = result.message
  }
  loading.value = false
}
</script>

<style scoped>
.footer-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
}
</style>
