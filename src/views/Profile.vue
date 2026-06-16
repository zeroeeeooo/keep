<template>
  <div class="profile-page">
    <header class="page-header">
      <router-link to="/home" class="page-header-back">
        <span class="arrow">←</span>
        <span>返回首页</span>
      </router-link>
      <span class="page-header-title">个人主页</span>
      <span class="page-header-spacer"></span>
    </header>

    <div class="profile-body">
      <!-- Profile Card -->
      <div class="profile-card card">
        <div class="profile-avatar">{{ displayName.charAt(0) }}</div>
        <h2 class="profile-nickname">{{ displayName }}</h2>
        <p class="profile-username">@{{ auth.user?.username }}</p>
        <p class="profile-join">注册时间：{{ formattedDate }}</p>
      </div>

      <!-- Stats -->
      <div class="stats-card card">
        <div class="stat">
          <span class="stat-value">{{ friendCount }}</span>
          <span class="stat-label">好友</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">{{ incomingCount }}</span>
          <span class="stat-label">待处理</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">{{ sentCount }}</span>
          <span class="stat-label">已发送</span>
        </div>
      </div>

      <!-- Friend Preview -->
      <div v-if="friends.length > 0" class="friend-preview card">
        <div class="preview-header">
          <span class="preview-title">我的好友 <span class="preview-count">({{ friendCount }})</span></span>
          <router-link to="/friends" class="preview-link">查看全部 →</router-link>
        </div>
        <div
          v-for="friend in friends.slice(0, 5)"
          :key="friend.id"
          class="friend-row"
        >
          <div class="friend-avatar">{{ (friend.nickname || friend.username).charAt(0) }}</div>
          <span class="friend-name">{{ friend.nickname || friend.username }}</span>
        </div>
        <router-link v-if="friends.length > 5" to="/friends" class="friend-more">
          还有 {{ friends.length - 5 }} 位好友…
        </router-link>
      </div>

      <!-- Empty Friends -->
      <div v-else class="empty-friends card" @click="$router.push('/friends')" tabindex="0" role="button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="empty-icon">
          <circle cx="9" cy="7.5" r="4" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="17" cy="7.5" r="3.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M14.5 19c0-3 2-4.5 5-4.5s5 1.5 5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="translate(-2,-1)"/>
        </svg>
        <span>暂无好友，去添加</span>
        <span class="empty-arrow">→</span>
      </div>

      <!-- Actions -->
      <div class="actions-card card">
        <button class="action-link" @click="$router.push('/friends')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="7" cy="5.5" r="3" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="13" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M1.5 16c0-3.3 2.2-5 5.5-5s5.5 1.7 5.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M11 14c0-2.5 1.8-3.8 4-3.8s4 1.3 4 3.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="translate(-2,-1)"/>
          </svg>
          <span>好友管理</span>
          <span class="action-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth } from '../store/auth.js'
import { getFriendList, getIncomingRequests, getSentRequests } from '../store/auth.js'

const friendCount = ref(0)
const incomingCount = ref(0)
const sentCount = ref(0)
const friends = ref([])

const displayName = computed(() => auth.user?.nickname || auth.user?.username || '用户')

const formattedDate = computed(() => {
  if (!auth.user?.created_at) return '未知'
  try {
    return new Date(auth.user.created_at).toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    })
  } catch {
    return auth.user.created_at
  }
})

async function loadStats() {
  const [friendsRes, incomingRes, sentRes] = await Promise.all([
    getFriendList(),
    getIncomingRequests(),
    getSentRequests()
  ])
  if (friendsRes.ok) {
    friends.value = friendsRes.data.friends
    friendCount.value = friendsRes.data.friends.length
  }
  if (incomingRes.ok) incomingCount.value = incomingRes.data.requests.length
  if (sentRes.ok) sentCount.value = sentRes.data.requests.length
}

onMounted(loadStats)
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.profile-body {
  flex: 1;
  padding: var(--space-lg);
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

/* Profile Card */
.profile-card {
  padding: 36px 24px 28px;
  text-align: center;
}

.profile-avatar {
  width: 68px;
  height: 68px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), #1a9a75);
  color: var(--text-inverse);
  font-size: 28px;
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  box-shadow: 0 4px 16px rgba(38, 201, 154, 0.25);
}

.profile-nickname {
  font-size: 22px;
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.profile-username {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.profile-join {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Stats */
.stats-card {
  padding: 22px 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: var(--weight-black);
  color: var(--color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border-light);
}

/* Friend Preview */
.friend-preview {
  padding: 16px 16px 8px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.preview-count {
  color: var(--text-tertiary);
  font-weight: var(--weight-normal);
}

.preview-link {
  font-size: var(--text-sm);
  color: var(--text-link);
}
.preview-link:hover {
  text-decoration: underline;
}

.friend-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-top: 1px solid var(--border-light);
}

.friend-avatar {
  width: 32px;
  height: 32px;
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
}
.friend-more:hover {
  color: var(--text-link);
  text-decoration: none;
}

/* Empty Friends */
.empty-friends {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 24px;
  color: var(--text-tertiary);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
}
.empty-friends:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.empty-friends:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-border);
}

.empty-icon {
  opacity: 0.5;
}

.empty-arrow {
  font-size: 16px;
  margin-left: 4px;
}

/* Actions */
.actions-card {
  overflow: hidden;
}

.action-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--text-md);
  color: var(--text-primary);
  transition: background var(--transition-fast);
  font-family: var(--font-sans);
}
.action-link:hover {
  background: var(--bg-card-hover);
}
.action-link svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.action-arrow {
  margin-left: auto;
  color: var(--border-hover);
  font-size: 16px;
}
.action-link:hover .action-arrow {
  color: var(--color-primary);
}
</style>
