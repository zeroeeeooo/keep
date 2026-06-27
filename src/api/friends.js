/**
 * 好友相关 API
 */
import { API_HOST, api } from './index.js'

const BASE = API_HOST + '/api/friends'

export const friendsApi = {
  search(keyword) {
    return api.get(`${BASE}/search?q=${encodeURIComponent(keyword)}`)
  },

  sendRequest(userId) {
    return api.post(`${BASE}/request`, { userId })
  },

  handleRequest(relationId, action) {
    return api.put(`${BASE}/request/${relationId}`, { action })
  },

  getList() {
    return api.get(`${BASE}/list`)
  },

  getIncomingRequests() {
    return api.get(`${BASE}/requests/incoming`)
  },

  getSentRequests() {
    return api.get(`${BASE}/requests/sent`)
  },

  remove(friendId) {
    return api.delete(`${BASE}/${friendId}`)
  },

  cancelRequest(relationId) {
    return api.delete(`${BASE}/request/${relationId}`)
  }
}
