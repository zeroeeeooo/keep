/**
 * notesStore — 笔记状态管理 (Pinia)
 *
 * 替换 store/notes.js
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notesApi } from '../api/notes.js'

export const useNotesStore = defineStore('notes', () => {
  // ---- State ----
  const allNotes = ref([])
  const myNotes = ref([])
  const loading = ref(false)

  // ---- Actions ----
  async function loadNotes(page = 1, pageSize = 50) {
    loading.value = true
    try {
      const res = await notesApi.list(page, pageSize)
      if (res.ok) allNotes.value = res.data.notes
    } catch (e) {
      console.error('loadNotes error:', e)
    }
    loading.value = false
  }

  async function loadMyNotes(page = 1, pageSize = 50) {
    try {
      const res = await notesApi.mine(page, pageSize)
      if (res.ok) myNotes.value = res.data.notes
    } catch (e) {
      console.error('loadMyNotes error:', e)
    }
  }

  async function createNote({ content, files }) {
    try {
      const res = await notesApi.create({ content, files })
      if (res.ok) {
        const note = res.data.note
        allNotes.value.unshift(note)
        myNotes.value.unshift(note)
        // 后台刷新完整数据
        loadNotes()
        loadMyNotes()
      }
      return res
    } catch {
      return { ok: false, message: '网络错误' }
    }
  }

  async function deleteNote(noteId) {
    try {
      const res = await notesApi.remove(noteId)
      if (res.ok) {
        allNotes.value = allNotes.value.filter(n => n.id !== noteId)
        myNotes.value = myNotes.value.filter(n => n.id !== noteId)
      }
      return res
    } catch {
      return { ok: false, message: '网络错误' }
    }
  }

  return {
    // state
    allNotes,
    myNotes,
    loading,
    // actions
    loadNotes,
    loadMyNotes,
    createNote,
    deleteNote
  }
})
