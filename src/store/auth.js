import { reactive } from 'vue'
import { API } from './api.js'

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

export const auth = reactive({
  token: null,
  user: null,

  get loggedIn() {
    return this.token !== null && this.user !== null
  },

  get userId() {
    return this.user?.id || null
  }
})

// 初始化：从 localStorage 恢复
const session = loadSession()
if (session) {
  auth.token = session.token
  auth.user = session.user
}

export async function login(username, password) {
  const res = await fetch(`${API.auth}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json()

  if (data.ok) {
    auth.token = data.data.token
    auth.user = data.data.user
    saveSession(data.data.token, data.data.user)
    return { ok: true, message: data.message }
  }

  return { ok: false, message: data.message || '登录失败' }
}

export async function register(username, password, nickname) {
  const res = await fetch(`${API.auth}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, nickname })
  })

  const data = await res.json()

  if (data.ok) {
    auth.token = data.data.token
    auth.user = data.data.user
    saveSession(data.data.token, data.data.user)
    return { ok: true, message: data.message }
  }

  return { ok: false, message: data.message || '注册失败' }
}

export function logout() {
  auth.token = null
  auth.user = null
  clearStorage()
}

// ========== 好友相关 API ==========

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.token}`
  }
}

export async function searchUsers(keyword) {
  const res = await fetch(`${API.friends}/search?q=${encodeURIComponent(keyword)}`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function sendFriendRequest(userId) {
  const res = await fetch(`${API.friends}/request`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId })
  })
  return res.json()
}

export async function handleFriendRequest(relationId, action) {
  const res = await fetch(`${API.friends}/request/${relationId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ action })
  })
  return res.json()
}

export async function getFriendList() {
  const res = await fetch(`${API.friends}/list`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function getIncomingRequests() {
  const res = await fetch(`${API.friends}/requests/incoming`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function getSentRequests() {
  const res = await fetch(`${API.friends}/requests/sent`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function removeFriend(friendId) {
  const res = await fetch(`${API.friends}/${friendId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  return res.json()
}

export async function cancelRequest(relationId) {
  const res = await fetch(`${API.friends}/request/${relationId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  return res.json()
}
