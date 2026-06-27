/**
 * authStore — 认证状态管理 (Pinia)
 *
 * 替换 store/auth.js
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth.js'

const STORAGE_KEY = 'keep_auth_token'
const USER_KEY = 'keep_auth_user'

function loadSession() {
  try {
    const token = localStorage.getItem(STORAGE_KEY)
    const user = localStorage.getItem(USER_KEY)
    if (token && user) {
      return { token, user: JSON.parse(user) }
    }
  } catch {
    clearStorage()
  }
  return null
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(USER_KEY)
}

function saveSession(token, user) {
  localStorage.setItem(STORAGE_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const useAuthStore = defineStore('auth', () => {
  // ---- State ----
  const session = loadSession()
  const token = ref(session?.token || null)
  const user = ref(session?.user || null)

  // ---- Getters ----
  const loggedIn = computed(() => token.value !== null && user.value !== null)
  const userId = computed(() => user.value?.id || null)

  // ---- Actions ----
  async function login(username, password) {
    const data = await authApi.login(username, password)
    if (data.ok) {
      token.value = data.data.token
      user.value = data.data.user
      saveSession(data.data.token, data.data.user)
      return { ok: true, message: data.message }
    }
    return { ok: false, message: data.message || '登录失败' }
  }

  async function register(username, password, nickname) {
    const data = await authApi.register(username, password, nickname)
    if (data.ok) {
      token.value = data.data.token
      user.value = data.data.user
      saveSession(data.data.token, data.data.user)
      return { ok: true, message: data.message }
    }
    return { ok: false, message: data.message || '注册失败' }
  }

  function logout() {
    token.value = null
    user.value = null
    clearStorage()
  }

  return {
    // state
    token,
    user,
    // getters
    loggedIn,
    userId,
    // actions
    login,
    register,
    logout
  }
})
