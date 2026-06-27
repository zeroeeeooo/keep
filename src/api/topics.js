/**
 * 话题相关 API
 */
import { API_HOST, api } from './index.js'

const BASE = API_HOST + '/api/topics'

export const topicApi = {
  list(page = 1, pageSize = 50) {
    return api.get(`${BASE}?page=${page}&pageSize=${pageSize}`)
  },
  mine(page = 1, pageSize = 50) {
    return api.get(`${BASE}/mine?page=${page}&pageSize=${pageSize}`)
  },
  get(id) {
    return api.get(`${BASE}/${id}`)
  },
  create({ content, files, tags, visibility }) {
    const formData = new FormData()
    formData.append('content', content || '')
    if (files && files.length) {
      for (const f of files) formData.append('files', f)
    }
    if (tags) formData.append('tags', JSON.stringify(tags))
    if (visibility) formData.append('visibility', visibility)
    return api.upload(BASE, formData)
  },
  remove(id) {
    return api.delete(`${BASE}/${id}`)
  }
}

export const replyApi = {
  list(topicId, page = 1, pageSize = 50) {
    return api.get(`${BASE}/${topicId}/replies?page=${page}&pageSize=${pageSize}`)
  },
  create(topicId, { content, files }) {
    const formData = new FormData()
    formData.append('content', content || '')
    if (files && files.length) {
      for (const f of files) formData.append('files', f)
    }
    return api.upload(`${BASE}/${topicId}/replies`, formData)
  },
  remove(replyId) {
    return api.delete(`${API_HOST}/api/replies/${replyId}`)
  }
}
