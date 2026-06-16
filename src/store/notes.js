import { auth } from './auth.js'
import { API } from './api.js'

function authHeaders() {
  return {
    'Authorization': `Bearer ${auth.token}`
  }
}

// 创建笔记（支持文件上传）
export async function createNote({ content, files }) {
  const formData = new FormData()
  formData.append('content', content || '')
  if (files && files.length) {
    for (const file of files) {
      formData.append('files', file)
    }
  }

  const res = await fetch(API.notes, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${auth.token}` },
    body: formData
  })
  return res.json()
}

// 获取笔记列表（自己的 + 好友的）
export async function getNotes(page = 1, pageSize = 50) {
  const res = await fetch(`${API.notes}?page=${page}&pageSize=${pageSize}`, {
    headers: authHeaders()
  })
  return res.json()
}

// 获取自己的笔记
export async function getMyNotes(page = 1, pageSize = 50) {
  const res = await fetch(`${API.notes}/mine?page=${page}&pageSize=${pageSize}`, {
    headers: authHeaders()
  })
  return res.json()
}

// 删除笔记
export async function deleteNote(noteId) {
  const res = await fetch(`${API.notes}/${noteId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  return res.json()
}
