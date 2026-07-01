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
        <UserAvatar :name="authorName" size="md" :src="auth.user?.avatar" />
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
              <button class="preview-remove" @click="removeFile(i)">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
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

      <div class="notes-list">
        <EmptyState
          v-if="displayNotes.length === 0"
          title="还没有笔记"
          description="发布你的第一条动态，与好友分享"
        >
          <template #illustration>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <rect x="16" y="10" width="40" height="50" rx="5" stroke="var(--color-primary)" stroke-width="1.6" opacity="0.25"/>
              <path d="M26 24h20M26 32h16M26 40h14" stroke="var(--color-primary)" stroke-width="1.5" stroke-linecap="round" opacity="0.2"/>
              <circle cx="52" cy="20" r="10" fill="var(--color-primary-light)" stroke="var(--color-primary)" stroke-width="1.5"/>
              <path d="M48 20h8M52 16v8" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="18" cy="48" r="4" fill="var(--color-primary)" opacity="0.1"/>
              <circle cx="54" cy="52" r="3" fill="var(--color-primary)" opacity="0.08"/>
            </svg>
          </template>
          <template #action>
            <button class="empty-cta" @click="focusCompose">写点什么</button>
          </template>
        </EmptyState>

        <div
          v-for="(note, index) in displayNotes"
          :key="note.id"
          class="note-item"
          :style="{ animationDelay: index * 50 + 'ms' }"
        >
          <NotesCard
            :authorName="note.nickname || note.username"
            :avatarSrc="note.avatar"
            :content="note.content"
            :files="note.files"
            :friend="note.user_id !== auth.userId"
            :showDelete="note.user_id === auth.userId"
            :createdAt="note.created_at"
            @delete="handleDelete(note.id)"
            @preview="openImage"
          />
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
import { ref, computed, onActivated } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { useNotesStore } from '../stores/notesStore.js'
import { useToast } from '../composables/useToast.js'
import EmptyState from '../components/EmptyState.vue'
import UserAvatar from '../components/UserAvatar.vue'
import NotesCard from '../components/NotesCard.vue'

const { toast, showToast } = useToast()
const auth = useAuthStore()
const notes = useNotesStore()

const authorName = computed(() => auth.user?.nickname || auth.user?.username || '?')

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
  const res = await notes.createNote({
    content: composeContent.value.trim(),
    files: selectedFiles.value
  })
  if (res.ok) {
    showToast('发布成功', 'success')
    composeContent.value = ''
    selectedFiles.value = []
    previews.value = []
  } else {
    showToast(res.message || '网络错误', 'error')
  }
  posting.value = false
}

// ---- Notes list ----
const filter = ref('all')

const displayNotes = computed(() => {
  return filter.value === 'mine' ? notes.myNotes : notes.allNotes
})

// ---- Delete ----
async function handleDelete(noteId) {
  const res = await notes.deleteNote(noteId)
  if (res.ok) {
    showToast('已删除', 'info')
  } else {
    showToast(res.message || '网络错误', 'error')
  }
}

// ---- Image preview ----
const imagePreview = ref(null)
function openImage(src) { imagePreview.value = src }

function focusCompose() {
  const textarea = document.querySelector('.compose-input')
  if (textarea) textarea.focus()
}

onActivated(() => {
  notes.loadNotes()
  notes.loadMyNotes()
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

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  height: var(--header-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.page-header-back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-md);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  cursor: pointer;
}
.page-header-back:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  text-decoration: none;
}
.page-header-back .arrow {
  font-size: 18px;
  line-height: 1;
}

.page-header-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.page-header-spacer {
  width: 90px;
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

/* ===== Note List Animation ===== */
.note-item {
  animation: noteFadeIn 0.3s ease-out both;
}

@keyframes noteFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.empty-cta {
  margin-top: 20px;
  height: 40px;
  padding: 0 28px;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: var(--text-inverse);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
}
.empty-cta:hover {
  background: var(--color-primary-hover);
}
</style>
