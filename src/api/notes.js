/**
 * 笔记相关 API
 */
import { API_HOST, api } from './index.js'

const BASE = API_HOST + '/api/notes'

export const notesApi = {
  /**
   * 创建笔记（支持文件上传）
   */
  create({ content, files }) {
    const formData = new FormData()
    formData.append('content', content || '')
    if (files && files.length) {
      for (const file of files) {
        formData.append('files', file)
      }
    }
    return api.upload(BASE, formData)
  },

  /**
   * 获取全部笔记（自己的 + 好友的）
   */
  list(page = 1, pageSize = 50) {
    return api.get(`${BASE}?page=${page}&pageSize=${pageSize}`)
  },

  /**
   * 获取自己的笔记
   */
  mine(page = 1, pageSize = 50) {
    return api.get(`${BASE}/mine?page=${page}&pageSize=${pageSize}`)
  },

  /**
   * 删除笔记
   */
  remove(noteId) {
    return api.delete(`${BASE}/${noteId}`)
  }
}
