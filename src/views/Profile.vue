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
        <UserAvatar :name="displayName" size="xl" />
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
      <div v-if="friendsList.length > 0" class="friend-preview card">
        <div class="preview-header">
          <span class="preview-title">我的好友 <span class="preview-count">({{ friendCount }})</span></span>
          <router-link to="/friends" class="preview-link">查看全部 →</router-link>
        </div>
        <div
          v-for="friend in friendsList.slice(0, 5)"
          :key="friend.id"
          class="friend-row"
        >
          <UserAvatar :name="friend.nickname || friend.username" size="sm" />
          <span class="friend-name">{{ friend.nickname || friend.username }}</span>
        </div>
        <router-link v-if="friendsList.length > 5" to="/friends" class="friend-more">
          还有 {{ friendsList.length - 5 }} 位好友…
        </router-link>
      </div>

      <!-- Empty Friends -->
      <div v-else class="empty-friends-card card" @click="$router.push('/friends')" tabindex="0" role="button">
        <EmptyState
          title="还没有好友"
          description="去搜索添加好友吧"
        >
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
import { useAuthStore } from '../stores/authStore.js'
import { useFriendsStore } from '../stores/friendsStore.js'
import UserAvatar from '../components/UserAvatar.vue'
import EmptyState from '../components/EmptyState.vue'

const auth = useAuthStore()
const friends = useFriendsStore()

const friendCount = ref(0)
const incomingCount = ref(0)
const sentCount = ref(0)

const friendsList = computed(() => friends.friends)

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
  await Promise.all([
    friends.loadFriends(),
    friends.loadRequests()
  ])
  friendCount.value = friends.friends.length
  incomingCount.value = friends.incomingRequests.length
  sentCount.value = friends.sentRequests.length
}

onMounted(loadStats)
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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

/* Empty Friends Card */
.empty-friends-card {
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
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
