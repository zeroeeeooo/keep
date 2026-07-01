<template>
  <div class="profile-page">
    <!-- Hero 装饰区 -->
    <div class="profile-hero">
      <div class="hero-blob hero-blob-1"></div>
      <div class="hero-blob hero-blob-2"></div>
      <div class="hero-blob hero-blob-3"></div>
      <div class="hero-grid"></div>
    </div>

    <!-- Header -->
    <header class="page-header">
      <router-link to="/home" class="page-header-back">
        <span class="arrow">←</span>
        <span>返回</span>
      </router-link>
      <span class="page-header-title">个人主页</span>
      <span class="page-header-spacer"></span>
    </header>

    <div class="profile-body">
      <!-- Toast -->
      <Transition name="toast">
        <div v-if="toast.show" :class="['toast', 'toast-' + toast.type]">{{ toast.message }}</div>
      </Transition>

      <!-- ===== Profile Card ===== -->
      <div class="profile-card card stagger-item">
        <div class="avatar-section">
          <div class="avatar-ring">
            <UserAvatar :name="displayName" :src="avatarUrl" size="xl" />
          </div>
          <button class="avatar-edit-btn" title="修改头像" :disabled="uploading" @click="triggerFileSelect">
            <svg v-if="!uploading" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 1.5l2 2L5 11l-2.5.5L3 9l7.5-7.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
              <path d="M9 3l2 2" stroke="currentColor" stroke-width="1.3"/>
            </svg>
            <span v-else class="avatar-edit-spinner"></span>
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            class="avatar-file-input"
            @change="onFileChange"
          />
        </div>
        <h2 class="profile-nickname">{{ displayName }}</h2>
        <p class="profile-username">@{{ auth.user?.username }}</p>
        <p class="profile-bio">{{ userBio }}</p>
      </div>

      <!-- ===== Stats Grid ===== -->
      <div class="stats-grid stagger-item">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <div class="stat-icon" :style="{ background: s.iconBg }">
            <span v-html="s.icon"></span>
          </div>
          <div class="stat-info">
            <span class="stat-value" :ref="el => { if (el) statRefs[s.key] = el }">0</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- ===== Recent Activity ===== -->
      <div v-if="recentActivity.length > 0" class="activity-card card stagger-item">
        <div class="card-header">
          <span class="card-title">最近动态</span>
          <svg class="card-title-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="activity-list">
          <div
            v-for="item in recentActivity"
            :key="item.id + item.type"
            class="activity-row"
            @click="$router.push(item.link)"
          >
            <div class="activity-icon" :class="item.type">
              <span v-html="item.type === 'note' ? noteIcon : topicIcon"></span>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ item.text }}</p>
              <span class="activity-time">{{ item.timeAgo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Friend Preview ===== -->
      <div v-if="friendsList.length > 0" class="friend-preview card stagger-item">
        <div class="card-header">
          <span class="card-title">
            我的好友
            <span class="card-title-count">({{ friendCount }})</span>
          </span>
          <router-link to="/friends" class="card-link">查看全部 →</router-link>
        </div>
        <div
          v-for="friend in friendsList.slice(0, 5)"
          :key="friend.id"
          class="friend-row"
        >
          <UserAvatar :name="friend.nickname || friend.username" :src="friend.avatar" size="sm" :friend="true" />
          <span class="friend-name">{{ friend.nickname || friend.username }}</span>
        </div>
        <router-link
          v-if="friendsList.length > 5"
          to="/friends"
          class="friend-more"
        >
          还有 {{ friendsList.length - 5 }} 位好友…
        </router-link>
      </div>

      <!-- Empty Friends -->
      <div
        v-else
        class="empty-friends-card card stagger-item"
        @click="$router.push('/friends')"
        tabindex="0"
        role="button"
      >
        <EmptyState title="还没有好友" description="去搜索添加好友吧">
          <template #illustration>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="20" cy="18" r="8" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2"/>
              <circle cx="38" cy="20" r="6" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2"/>
              <path d="M6 44c0-5 3.5-7.5 9-7.5s9 2.5 9 7.5" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
              <path d="M31 42c0-4 2.5-6 6-6s6 2 6 6" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
            </svg>
          </template>
          <template #action>
            <span class="empty-friends-link">去添加 →</span>
          </template>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { useFriendsStore } from '../stores/friendsStore.js'
import { useNotesStore } from '../stores/notesStore.js'
import { useTopicStore } from '../stores/topicStore.js'
import UserAvatar from '../components/UserAvatar.vue'
import EmptyState from '../components/EmptyState.vue'

const auth = useAuthStore()
const friends = useFriendsStore()
const notesStore = useNotesStore()
const topicStore = useTopicStore()

// ---- Data ----
const friendCount = ref(0)
const topicCount = ref(0)
const uploading = ref(false)
const avatarKey = ref(Date.now())
const toast = ref({ show: false, message: '', type: '' })

const statRefs = {}

const friendsList = computed(() => friends.friends)

const displayName = computed(() => auth.user?.nickname || auth.user?.username || '用户')

const avatarUrl = computed(() => {
  return auth.user?.avatar ? auth.user.avatar + '?t=' + avatarKey.value : null
})

const userBio = computed(() => {
  return ''
})

// ---- Avatar Upload ----
const fileInput = ref(null)

function triggerFileSelect() {
  if (uploading.value) return
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // 校验文件类型
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) {
    showToast('仅支持 JPG/PNG/GIF/WebP 格式', 'error')
    return
  }

  uploading.value = true
  showToast('上传中…', 'info')

  auth.updateAvatar(file).then(res => {
    uploading.value = false
    if (res.ok) {
      avatarKey.value = Date.now()
      showToast('头像更新成功', 'success')
    } else {
      showToast(res.message || '上传失败', 'error')
    }
  }).catch(() => {
    uploading.value = false
    showToast('上传失败，请重试', 'error')
  })

  // 清空 input 以便重复选择同一文件
  e.target.value = ''
}

function showToast(message, type = 'info') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// ---- Stats ----
const stats = computed(() => [
  { key: 'friends', label: '好友', icon: friendsIcon, iconBg: 'linear-gradient(135deg, #5b8def, #7c6cf0)', value: friendCount.value },
  { key: 'topics', label: '话题', icon: topicsIcon, iconBg: 'linear-gradient(135deg, #e74c3c, #c0392b)', value: topicCount.value },
])

// ---- Recent Activity ----
const recentActivity = computed(() => {
  const items = []
  // 添加笔记
  for (const n of notesStore.myNotes.slice(0, 10)) {
    items.push({
      id: n.id,
      type: 'note',
      text: n.content ? n.content.slice(0, 60) + (n.content.length > 60 ? '…' : '') : '一条笔记',
      timeAgo: timeAgo(n.created_at),
      link: '/notes',
      sortTime: new Date(n.created_at).getTime()
    })
  }
  // 添加话题
  for (const t of topicStore.myTopics.slice(0, 10)) {
    items.push({
      id: t.id,
      type: 'topic',
      text: t.content ? t.content.slice(0, 60) + (t.content.length > 60 ? '…' : '') : '一个话题',
      timeAgo: timeAgo(t.created_at),
      link: `/board/${t.id}`,
      sortTime: new Date(t.created_at).getTime()
    })
  }
  items.sort((a, b) => b.sortTime - a.sortTime)
  return items.slice(0, 5)
})

// ---- Helpers ----
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} 天前`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} 周前`
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// ---- Counter Animation ----
function animateCounters() {
  const targets = [
    { key: 'friends', value: friendCount.value },
    { key: 'topics', value: topicCount.value },
  ]
  targets.forEach(({ key, value }) => {
    const el = statRefs[key]
    if (!el || value === 0) {
      if (el) el.textContent = value
      return
    }
    const duration = 800
    const steps = Math.min(value, 60)
    const stepDuration = duration / steps
    let current = 0
    const increment = value / steps
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        el.textContent = value
        clearInterval(timer)
      } else {
        el.textContent = Math.floor(current)
      }
    }, stepDuration)
  })
}

// ---- Stagger Entry Animation ----
function animateEntry() {
  const items = document.querySelectorAll('.stagger-item')
  items.forEach((el, i) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
    setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 100 + i * 120)
  })
}

// ---- Load Data ----
async function loadStats() {
  await Promise.all([
    friends.loadFriends(),
    friends.loadRequests(),
    notesStore.loadMyNotes(),
    topicStore.loadMyTopics(),
  ])
  friendCount.value = friends.friends.length
  topicCount.value = topicStore.myTopics.length

  await nextTick()
  animateCounters()
  animateEntry()
}

onMounted(loadStats)

// ---- SVG Icons ----
const friendsIcon = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="5.5" r="3" stroke="#fff" stroke-width="1.5"/><circle cx="13" cy="5.5" r="2.5" stroke="#fff" stroke-width="1.5"/><path d="M1.5 16c0-3.3 2.2-5 5.5-5s5.5 1.7 5.5 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M11 14c0-2.5 1.8-3.8 4-3.8s4 1.3 4 3.8" stroke="#fff" stroke-width="1.5" stroke-linecap="round" transform="translate(-2,-1)"/></svg>'
const topicsIcon = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="12" rx="1.5" stroke="#fff" stroke-width="1.5"/><path d="M10 3v2M7 3v2M13 3v2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M6 10l3 3 5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const noteIcon = '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 3.5h12a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1v-11a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 7h7M6.5 10h7M6.5 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
const topicIcon = '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M10 3v2M7 3v2M13 3v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 10l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
</script>

<style scoped>
/* ===== Layout ===== */
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background: var(--bg-page);
}

/* ===== Hero Decoration ===== */
.profile-hero {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.12;
}

.hero-blob-1 {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  top: -120px;
  right: -80px;
  animation: blobFloat 8s ease-in-out infinite alternate;
}

.hero-blob-2 {
  width: 300px;
  height: 300px;
  background: #5b8def;
  top: -60px;
  left: -60px;
  animation: blobFloat 10s ease-in-out infinite alternate-reverse;
}

.hero-blob-3 {
  width: 200px;
  height: 200px;
  background: #a855f7;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  animation: blobFloat 12s ease-in-out infinite alternate;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

@keyframes blobFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -20px) scale(1.1); }
}

/* ===== Header ===== */
.page-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  height: var(--header-height);
  background: transparent;
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
  transition: background var(--transition-fast), color var(--transition-fast);
  cursor: pointer;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
}
.page-header-back:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  text-decoration: none;
}

.page-header-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.page-header-spacer {
  width: 82px;
}

/* ===== Body ===== */
.profile-body {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 0 var(--space-lg) var(--space-xl);
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

/* ===== Profile Card ===== */
.profile-card {
  padding: 36px 24px 28px;
  text-align: center;
  border: none;
  margin-top: -20px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}

[data-theme="dark"] .profile-card {
  background: rgba(26, 29, 39, 0.85);
  border-color: rgba(255,255,255,0.06);
}

.avatar-section {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.avatar-ring {
  border-radius: var(--radius-full);
  padding: 3px;
  background: linear-gradient(135deg, var(--color-primary), #5b8def, #a855f7);
  background-size: 200% 200%;
  animation: avatarGlow 3s ease-in-out infinite alternate;
  box-shadow: 0 0 20px rgba(38, 201, 154, 0.25);
}

@keyframes avatarGlow {
  0% { background-position: 0% 50%; box-shadow: 0 0 20px rgba(38, 201, 154, 0.25); }
  100% { background-position: 100% 50%; box-shadow: 0 0 30px rgba(91, 141, 239, 0.3); }
}

.avatar-edit-btn {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: 2px solid var(--bg-card);
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.avatar-edit-btn:hover {
  transform: scale(1.1);
  background: var(--color-primary-hover);
}

.profile-nickname {
  font-size: 24px;
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.profile-username {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.profile-bio {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 12px;
  min-height: 1em;
}

/* ===== Stats Grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.stat-value {
  font-size: 20px;
  font-weight: var(--weight-black);
  color: var(--text-primary);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* ===== Card Shared ===== */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.card-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-title-icon {
  color: var(--text-tertiary);
}

.card-title-count {
  color: var(--text-tertiary);
  font-weight: var(--weight-normal);
}

.card-link {
  font-size: var(--text-sm);
  color: var(--text-link);
  text-decoration: none;
  flex-shrink: 0;
}
.card-link:hover {
  text-decoration: underline;
}

/* ===== Recent Activity ===== */
.activity-card {
  padding: 16px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.activity-row:hover {
  background: var(--bg-card-hover);
}

.activity-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.activity-icon.note {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.activity-icon.topic {
  color: var(--color-warning);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* ===== Friend Preview ===== */
.friend-preview {
  padding: 16px 16px 8px;
}

.friend-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-top: 1px solid var(--border-light);
}

.friend-name {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.friend-more {
  display: block;
  text-align: center;
  padding: 10px 0;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  text-decoration: none;
}
.friend-more:hover {
  color: var(--text-link);
  text-decoration: none;
}

/* ===== Empty Friends ===== */
.empty-friends-card {
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
  padding: 16px;
}
.empty-friends-card:hover {
  border-color: var(--color-primary);
}
.empty-friends-card:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-border);
}

.empty-friends-link {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}

/* ===== Toast ===== */
.toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  z-index: 200;
  pointer-events: none;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
}
.toast-success {
  background: var(--color-primary);
  color: #fff;
}
.toast-error {
  background: var(--color-error);
  color: #fff;
}
.toast-info {
  background: var(--text-primary);
  color: var(--text-inverse);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}

/* ===== Avatar ===== */
.avatar-file-input {
  display: none;
}

.avatar-edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.avatar-edit-spinner {
  display: block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== Entry Animation ===== */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

/* ===== Dark Theme Overrides ===== */
[data-theme="dark"] .page-header-back {
  background: rgba(26, 29, 39, 0.6);
}

[data-theme="dark"] .hero-blob {
  opacity: 0.08;
}
</style>
