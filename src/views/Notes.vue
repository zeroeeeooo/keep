<template>
  <div class="notes-page">
    <header class="page-header">
      <router-link to="/home" class="page-header-back">
        <span class="arrow">←</span>
        <span>返回首页</span>
      </router-link>
      <span class="page-header-title">随手一记</span>
      <span class="page-header-spacer"></span>
    </header>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', 'toast-' + toast.type]">{{ toast.message }}</div>
    </Transition>

    <div class="notes-body">
      <!-- 发布框 -->
      <div class="compose-card">
        <div class="compose-avatar">{{ (auth.user?.nickname || auth.user?.username || '?').charAt(0) }}</div>
        <div class="compose-main">
          <textarea
            v-model="composeContent"
            class="compose-input"
            placeholder="写点什么…"
            rows="3"
            @input="autoResize"
          ></textarea>
          <div v-if="previews.length" class="preview-list">
            <div v-for="(p, i) in previews" :key="i" class="preview-item">
              <span class="preview-name">{{ p.name }}</span>
              <button class="preview-remove" @click="removeFile(i)">✕</button>
            </div>
          </div>
          <div class="compose-actions">
            <label class="upload-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <span>附件</span>
              <input type="file" multiple accept="image/*,.pdf" @change="onFileSelect" />
            </label>
            <span class="file-hint">图片 / PDF</span>
            <button class="post-btn" :disabled="!canPost || posting" @click="submitNote">
              {{ posting ? '发布中…' : '发布' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 过滤标签 -->
      <div class="filter-tabs">
        <button :class="['filter-tab', { active: filter === 'all' }]" @click="filter = 'all'">全部</button>
        <button :class="['filter-tab', { active: filter === 'mine' }]" @click="filter = 'mine'">我的</button>
      </div>

      <!-- 笔记列表 -->
      <div v-if="displayNotes.length === 0" class="empty-state">
        <span class="empty-icon">📝</span>
        <span>暂无随手一记</span>
      </div>

      <div v-for="note in displayNotes" :key="note.id" :class="['note-card', { 'note-friend': note.user_id !== auth.userId }]">
        <div class="note-header">
          <div :class="['note-avatar', { 'avatar-friend': note.user_id !== auth.userId }]">{{ (note.nickname || note.username).charAt(0) }}</div>
          <div class="note-meta">
            <div class="note-author-row">
              <span class="note-author">{{ note.nickname || note.username }}</span>
              <span v-if="note.user_id !== auth.userId" class="friend-badge">好友</span>
            </div>
            <span class="note-time">{{ formatTime(note.created_at) }}</span>
          </div>
          <button
            v-if="note.user_id === auth.userId"
            class="note-delete"
            @click="handleDelete(note.id)"
            title="删除"
          >✕</button>
        </div>

        <p v-if="note.content" class="note-content" v-text="note.content"></p>

        <div v-if="note.files && note.files.length" class="note-files">
          <a
            v-for="(f, i) in note.files"
            :key="i"
            :href="f"
            :class="['file-link', { 'file-image': isImage(f) }]"
            :download="isImage(f) ? undefined : f.split('/').pop()"
            target="_blank"
          >
            <template v-if="isImage(f)">
              <img :src="f" class="file-img" loading="lazy" @click.prevent="openImage(f)" />
            </template>
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3"/>
                <path d="M9 2v4h4" stroke="currentColor" stroke-width="1.3"/>
              </svg>
              <span>{{ f.split('/').pop() }}</span>
            </template>
          </a>
        </div>
      </div>

      <!-- 图片预览弹窗 -->
      <Transition name="fade">
        <div v-if="imagePreview" class="image-overlay" @click="imagePreview = null">
          <img :src="imagePreview" class="image-full" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onActivated, onUnmounted } from 'vue'
import { auth } from '../store/auth.js'
import { createNote, getNotes, getMyNotes, deleteNote } from '../store/notes.js'

// ---- Toast ----
const toast = reactive({ show: false, message: '', type: 'info' })
let toastTimer = null
function showToast(message, type = 'info') {
  clearTimeout(toastTimer)
  toast.show = true
  toast.message = message
  toast.type = type
  toastTimer = setTimeout(() => { toast.show = false }, 2500)
}
onUnmounted(() => clearTimeout(toastTimer))

// ---- Compose ----
const composeContent = ref('')
const selectedFiles = ref([])
const previews = ref([])
const posting = ref(false)

const canPost = computed(() => composeContent.value.trim() || selectedFiles.value.length)

function autoResize(e) {
  e.target.style.height = 'auto'
  e.target.style.height = e.target.scrollHeight + 'px'
}

function onFileSelect(e) {
  const files = Array.from(e.target.files)
  for (const f of files) {
    if (f.size > 20 * 1024 * 1024) {
      showToast(`${f.name} 超过 20MB 限制`, 'error')
      continue
    }
    selectedFiles.value.push(f)
    previews.value.push({ name: f.name })
  }
  e.target.value = ''
}

function removeFile(i) {
  selectedFiles.value.splice(i, 1)
  previews.value.splice(i, 1)
}

async function submitNote() {
  if (!canPost.value || posting.value) return
  posting.value = true
  try {
    const res = await createNote({
      content: composeContent.value.trim(),
      files: selectedFiles.value
    })
    if (res.ok) {
      showToast('发布成功', 'success')
      // 立即追加到列表顶部
      const note = res.data.note
      allNotes.value.unshift(note)
      myNotes.value.unshift(note)
      // 清空输入
      composeContent.value = ''
      selectedFiles.value = []
      previews.value = []
      // 后台刷新完整数据
      loadNotes()
      loadMyNotes()
    } else {
      showToast(res.message, 'error')
    }
  } catch {
    showToast('网络错误', 'error')
  }
  posting.value = false
}

// ---- Notes list ----
const filter = ref('all')
const allNotes = ref([])
const myNotes = ref([])

const displayNotes = computed(() => {
  return filter.value === 'mine' ? myNotes.value : allNotes.value
})

async function loadNotes() {
  try {
    const res = await getNotes()
    if (res.ok) allNotes.value = res.data.notes
  } catch (e) { console.error('loadNotes error:', e) }
}

async function loadMyNotes() {
  try {
    const res = await getMyNotes()
    if (res.ok) myNotes.value = res.data.notes
  } catch (e) { console.error('loadMyNotes error:', e) }
}

// ---- Delete ----
async function handleDelete(noteId) {
  try {
    const res = await deleteNote(noteId)
    if (res.ok) {
      showToast('已删除', 'info')
      allNotes.value = allNotes.value.filter(n => n.id !== noteId)
      myNotes.value = myNotes.value.filter(n => n.id !== noteId)
    } else {
      showToast(res.message, 'error')
    }
  } catch {
    showToast('网络错误', 'error')
  }
}

// ---- Image preview ----
const imagePreview = ref(null)
function openImage(src) { imagePreview.value = src }

function isImage(path) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path)
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 172800000) return '昨天'
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

onActivated(() => {
  loadNotes()
  loadMyNotes()
})
</script>

<style scoped>
.notes-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.notes-body {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  max-width: 560px;
  margin: 0 auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== Compose Card ===== */
.compose-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
}

.compose-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), #1a9a75);
  color: var(--text-inverse);
  font-size: 14px;
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.compose-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compose-input {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: var(--text-base);
  font-family: var(--font-sans);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 60px;
  background: transparent;
}
.compose-input::placeholder {
  color: var(--text-placeholder);
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--color-primary);
}

.preview-remove {
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  line-height: 1;
  opacity: 0.6;
}
.preview-remove:hover { opacity: 1; }

.compose-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.upload-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.upload-btn input[type="file"] {
  display: none;
}

.file-hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  flex: 1;
}

.post-btn {
  padding: 7px 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--text-inverse);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: background var(--transition-fast);
  font-family: var(--font-sans);
  white-space: nowrap;
}
.post-btn:hover:not(:disabled) { background: var(--color-primary-hover); }
.post-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== Filter Tabs ===== */
.filter-tabs {
  display: flex;
  gap: 4px;
  padding: 2px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  width: fit-content;
}

.filter-tab {
  padding: 6px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
}
.filter-tab.active {
  background: var(--color-primary);
  color: var(--text-inverse);
}
.filter-tab:hover:not(.active) {
  color: var(--text-secondary);
}

/* ===== Note Card ===== */
.note-card {
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast);
}
.note-card:hover {
  border-color: var(--border-hover);
}

.note-friend {
  background: rgba(91, 141, 239, 0.03);
  border-color: rgba(91, 141, 239, 0.12);
}
.note-friend:hover {
  border-color: rgba(91, 141, 239, 0.25);
}

.note-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.note-avatar {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), #1a9a75);
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-friend {
  background: linear-gradient(135deg, #5b8def, #7c6cf0);
}

.note-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.note-author-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.note-author {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.friend-badge {
  font-size: 10px;
  font-weight: var(--weight-semibold);
  color: #5b8def;
  background: rgba(91, 141, 239, 0.1);
  padding: 1px 7px;
  border-radius: 10px;
  line-height: 1.4;
  letter-spacing: 0.3px;
}

.note-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.note-delete {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.note-delete:hover {
  background: #fef5f5;
  color: var(--color-error);
}

.note-content {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ===== Files ===== */
.note-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.file-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.file-image {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: border-color var(--transition-fast);
}
.file-image:hover {
  border-color: var(--color-primary);
}

.file-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

.file-link:not(.file-image) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.file-link:not(.file-image):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ===== Image Preview Overlay ===== */
.image-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  cursor: pointer;
}

.image-full {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

/* ===== Toast ===== */
.toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  box-shadow: var(--shadow-lg);
  color: var(--text-inverse);
}
.toast-success { background: var(--color-success); }
.toast-error   { background: var(--color-error); }
.toast-info    { background: var(--text-primary); }

.toast-enter-active { transition: all 0.25s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.toast-leave-to   { opacity: 0; transform: translateX(-50%) translateY(-16px); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
