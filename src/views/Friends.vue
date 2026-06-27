<template>
  <div class="friends-page">
    <header class="page-header">
      <router-link to="/home" class="page-header-back">
        <span class="arrow">←</span>
        <span>返回首页</span>
      </router-link>
      <span class="page-header-title">好友管理</span>
      <span class="page-header-spacer"></span>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'search' }]"
        @click="activeTab = 'search'"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        搜索
      </button>
      <button
        :class="['tab', { active: activeTab === 'requests' }]"
        @click="activeTab = 'requests'"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        请求
        <span v-if="friends.incomingRequests.length" class="tab-badge">{{ friends.incomingRequests.length }}</span>
      </button>
      <button
        :class="['tab', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="11.5" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M1 14c0-3 2-4.5 5-4.5s5 1.5 5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9.5 12.5c0-2.5 1.5-3.5 3.5-3.5s3.5 1 3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="translate(-1,-.5)"/>
        </svg>
        好友
        <span v-if="friends.friends.length" class="tab-badge primary">{{ friends.friends.length }}</span>
      </button>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', 'toast-' + toast.type]">{{ toast.message }}</div>
    </Transition>

    <div class="tab-body">
      <!-- ===== Search ===== -->
      <div v-show="activeTab === 'search'" class="search-panel">
        <div class="search-bar-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12.5 12.5l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="输入用户名搜索…"
            @input="onSearch"
          />
          <span v-if="searching" class="search-spinner">···</span>
        </div>

        <div v-if="searchQuery && !searching" class="search-results">
          <EmptyState
            v-if="friends.searchResults.length === 0 && searchQuery"
            title="未找到用户"
            description="没有匹配的用户名，试试其他关键词"
          >
            <template #illustration>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="26" cy="22" r="10" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2"/>
                <circle cx="44" cy="24" r="8" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2"/>
                <path d="M8 50c0-6 4.5-9 11-9s11 3 11 9" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
                <path d="M35 47c0-5 3-7 7.5-7s7.5 2 7.5 7" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
              </svg>
            </template>
          </EmptyState>
          <div
            v-for="user in friends.searchResults"
            :key="user.id"
            class="user-row"
          >
            <div class="user-avatar">{{ getInitial(user) }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.nickname || user.username }}</div>
              <div class="user-tag">@{{ user.username }}</div>
            </div>

            <button
              v-if="user.friend_status === 'none'"
              class="btn-add"
              @click="addFriend(user)"
            >添加好友</button>

            <span v-else-if="user.friend_status === 'sent'" class="user-status sent">
              已发送
              <button class="user-action-link" @click="cancelSent(user.relation_id, user)">撤回</button>
            </span>

            <div v-else-if="user.friend_status === 'pending'" class="user-actions">
              <button class="btn-accept" @click="acceptSearchRequest(user.relation_id, user)">接受</button>
              <button class="btn-decline" @click="rejectSearchRequest(user.relation_id, user)">拒绝</button>
            </div>

            <span v-else-if="user.friend_status === 'friend'" class="user-status friend">已添加</span>
          </div>
        </div>
      </div>

      <!-- ===== Requests ===== -->
      <div v-show="activeTab === 'requests'" class="requests-panel">
        <div class="section-title">收到的好友请求</div>
        <EmptyState
          v-if="friends.incomingRequests.length === 0"
          title="暂无收到的好友请求"
          description="当其他用户向你发送好友请求时，会显示在这里"
        >
          <template #illustration>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <path d="M20 24h24M32 16v24" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.15" stroke-linecap="round"/>
              <circle cx="32" cy="28" r="12" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2"/>
              <path d="M32 22v12M26 28h12" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.3" stroke-linecap="round"/>
            </svg>
          </template>
        </EmptyState>
        <div
          v-for="req in friends.incomingRequests"
          :key="req.id"
          class="user-row"
        >
          <div class="user-avatar">{{ getInitial(req) }}</div>
          <div class="user-info">
            <div class="user-name">{{ req.nickname || req.username }}</div>
            <div class="user-tag">@{{ req.username }}</div>
          </div>
          <div class="user-actions">
            <button class="btn-accept" @click="acceptRequest(req.relation_id)">接受</button>
            <button class="btn-decline" @click="rejectRequest(req.relation_id)">拒绝</button>
          </div>
        </div>

        <div class="section-title" style="margin-top: 24px;">已发送的请求</div>
        <EmptyState
          v-if="friends.sentRequests.length === 0"
          title="暂无已发送的请求"
          description="你发送的好友请求会显示在这里"
        >
          <template #illustration>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <path d="M24 40l8-16 8 16" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M28 36h8" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
              <path d="M32 18v10" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.15" stroke-linecap="round"/>
            </svg>
          </template>
        </EmptyState>
        <div
          v-for="req in friends.sentRequests"
          :key="req.id"
          class="user-row"
        >
          <div class="user-avatar">{{ getInitial(req) }}</div>
          <div class="user-info">
            <div class="user-name">{{ req.nickname || req.username }}</div>
            <div class="user-tag">@{{ req.username }}</div>
          </div>
          <button class="btn-cancel" @click="cancelSent(req.relation_id)">撤回</button>
        </div>
      </div>

      <!-- ===== Friend List ===== -->
      <div v-show="activeTab === 'list'" class="list-panel">
        <EmptyState
          v-if="friends.friends.length === 0"
          title="还没有好友"
          description="去搜索页面找到其他用户并添加好友吧"
          actionText="去搜索"
          @action="activeTab = 'search'"
        >
          <template #illustration>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="24" cy="22" r="10" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2"/>
              <circle cx="44" cy="24" r="8" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2"/>
              <path d="M6 52c0-6 4.5-9 11-9s11 3 11 9" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
              <path d="M35 49c0-5 3-7 7.5-7s7.5 2 7.5 7" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.2" stroke-linecap="round"/>
              <path d="M40 32l8 8M48 32l-8 8" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.25" stroke-linecap="round"/>
            </svg>
          </template>
        </EmptyState>
        <div
          v-for="friend in friends.friends"
          :key="friend.id"
          class="user-row"
        >
          <div class="user-avatar">{{ getInitial(friend) }}</div>
          <div class="user-info">
            <div class="user-name">{{ friend.nickname || friend.username }}</div>
            <div class="user-tag">@{{ friend.username }}</div>
            <div class="user-meta">成为好友：{{ formatDate(friend.friend_since) }}</div>
          </div>
          <button class="btn-remove" @click="removeFriend(friend)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFriendsStore } from '../stores/friendsStore.js'
import { useToast } from '../composables/useToast.js'
import EmptyState from '../components/EmptyState.vue'

const { toast, showToast } = useToast()
const friends = useFriendsStore()

const activeTab = ref('search')
const searchQuery = ref('')
const searching = ref(false)

// ---- Search ----
let searchTimer = null

function onSearch() {
  clearTimeout(searchTimer)
  if (!searchQuery.value.trim()) {
    friends.searchResults = []
    return
  }
  searching.value = true
  searchTimer = setTimeout(async () => {
    const res = await friends.searchUsers(searchQuery.value.trim())
    if (!res.ok && res.message) {
      showToast(res.message, 'error')
    }
    searching.value = false
  }, 300)
}

function getInitial(user) {
  const name = user.nickname || user.username || '?'
  return name.charAt(0)
}

// ---- Add Friend ----
async function addFriend(user) {
  const res = await friends.sendFriendRequest(user.id)
  if (res.ok) {
    showToast(res.message, 'success')
    user.friend_status = 'sent'
  } else {
    showToast(res.message || '网络错误', 'error')
  }
}

// ---- Handle Requests ----
async function acceptRequest(relationId) {
  const res = await friends.handleRequest(relationId, 'accept')
  if (res.ok) {
    showToast(res.message, 'success')
    friends.loadRequests()
    friends.loadFriends()
  } else {
    showToast(res.message || '网络错误', 'error')
  }
}

async function rejectRequest(relationId) {
  const res = await friends.handleRequest(relationId, 'reject')
  if (res.ok) {
    showToast(res.message, 'info')
    friends.loadRequests()
  } else {
    showToast(res.message || '网络错误', 'error')
  }
}

async function acceptSearchRequest(relationId, user) {
  const res = await friends.handleRequest(relationId, 'accept')
  if (res.ok) {
    showToast(res.message, 'success')
    user.friend_status = 'friend'
    friends.loadRequests()
    friends.loadFriends()
  } else {
    showToast(res.message, 'error')
  }
}

async function rejectSearchRequest(relationId, user) {
  const res = await friends.handleRequest(relationId, 'reject')
  if (res.ok) {
    showToast(res.message, 'info')
    friends.searchResults = friends.searchResults.filter(u => u.id !== user.id)
    friends.loadRequests()
  } else {
    showToast(res.message, 'error')
  }
}

// ---- Cancel Sent ----
async function cancelSent(relationId, user) {
  const res = await friends.cancelSent(relationId)
  if (res.ok) {
    showToast(res.message, 'info')
    friends.sentRequests = friends.sentRequests.filter(r => r.relation_id !== relationId)
    if (user) {
      user.friend_status = 'none'
    }
  } else {
    showToast(res.message || '网络错误', 'error')
  }
}

// ---- Remove Friend ----
async function removeFriend(friend) {
  const res = await friends.removeFriend(friend.id)
  if (res.ok) {
    showToast(res.message, 'info')
    friends.friends = friends.friends.filter(f => f.id !== friend.id)
  } else {
    showToast(res.message || '网络错误', 'error')
  }
}

// ---- Data Loading ----
function formatDate(dateStr) {
  if (!dateStr) return '未知'
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN')
  } catch {
    return dateStr
  }
}

onMounted(() => {
  friends.loadFriends()
  friends.loadRequests()
})
</script>

<style scoped>
.friends-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Page Header */
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

/* Tabs */
.tabs {
  display: flex;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
  padding: 0 8px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border: none;
  background: none;
  font-size: var(--text-base);
  color: var(--text-tertiary);
  cursor: pointer;
  position: relative;
  transition: color var(--transition-fast);
  font-family: var(--font-sans);
  font-weight: var(--weight-medium);
}
.tab:hover {
  color: var(--text-secondary);
}
.tab.active {
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px 1px 0 0;
}

.tab-badge {
  font-size: 11px;
  background: var(--color-error);
  color: var(--text-inverse);
  border-radius: 10px;
  padding: 1px 7px;
  font-weight: var(--weight-semibold);
  line-height: 1.4;
}
.tab-badge.primary {
  background: var(--color-primary);
}

/* Tab Body */
.tab-body {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  overflow-y: auto;
}

.search-panel,
.requests-panel,
.list-panel {
  max-width: 500px;
  margin: 0 auto;
}

.search-bar-wrap {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 46px;
  padding: 0 40px 0 42px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-md);
  color: var(--text-primary);
  outline: none;
  background: var(--bg-card);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  font-family: var(--font-sans);
}
.search-input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-border);
}
.search-input::placeholder {
  color: var(--text-placeholder);
}

.search-spinner {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 18px;
  letter-spacing: 2px;
}

/* User Row */
.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  transition: border-color var(--transition-fast);
}
.user-row:hover {
  border-color: var(--border-hover);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), #1a9a75);
  color: var(--text-inverse);
  font-size: 16px;
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-name {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.user-tag {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.user-meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 1px;
}

/* Buttons */
.btn-add {
  height: 34px;
  padding: 0 16px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
  white-space: nowrap;
}
.btn-add:hover {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.btn-accept {
  height: 32px;
  padding: 0 14px;
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
.btn-accept:hover {
  background: var(--color-primary-hover);
}

.btn-decline {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
  white-space: nowrap;
}
.btn-decline:hover {
  border-color: var(--color-error);
  color: var(--color-error);
}

.btn-cancel {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
  white-space: nowrap;
}
.btn-cancel:hover {
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.btn-remove {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-error);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-sans);
  white-space: nowrap;
}
.btn-remove:hover {
  border-color: var(--color-error);
  background: #fef5f5;
}

/* User Status Labels */
.user-status {
  font-size: var(--text-xs);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: var(--weight-medium);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.user-status.sent {
  background: #f0f2f5;
  color: var(--text-tertiary);
}
.user-status.friend {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.user-action-link {
  border: none;
  background: none;
  color: var(--color-error);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: 0 0 0 4px;
  text-decoration: underline;
  font-family: var(--font-sans);
}

.user-actions {
  display: flex;
  gap: 6px;
}

/* Section Title */
.section-title {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  margin-bottom: 10px;
  padding: 0 2px;
}

/* Toast */
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
</style>
