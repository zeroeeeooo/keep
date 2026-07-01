/**
 * 认证相关 API
 */
import { API_HOST, api } from './index.js'

const BASE = API_HOST + '/api/auth'

export const authApi = {
  login(username, password) {
    return api.post(`${BASE}/login`, { username, password })
  },

  register(username, password, nickname) {
    return api.post(`${BASE}/register`, { username, password, nickname })
  },

  me() {
    return api.get(`${BASE}/me`)
  },

  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.upload(`${BASE}/avatar`, formData)
  }
}
