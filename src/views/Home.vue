<template>
  <div class="home">
    <header class="home-header">
      <div class="home-header-left">
        <button class="menu-btn" @click="sidebarOpen = !sidebarOpen" :title="sidebarOpen ? '收起侧边栏' : '展开侧边栏'">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
        <span class="home-title">工具集</span>
      </div>
      <div class="home-header-right">
        <span class="user-badge">{{ auth.user?.nickname }}</span>
        <button class="btn-ghost logout-btn" @click="handleLogout">退出</button>
      </div>
    </header>

    <div class="home-body">
      <!-- Backdrop -->
      <Transition name="fade">
        <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false"></div>
      </Transition>

      <!-- Sidebar (overlay) -->
      <Transition name="sidebar-slide">
        <aside v-if="sidebarOpen" class="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-user">
              <div class="sidebar-avatar">{{ (auth.user?.nickname || auth.user?.username || '?').charAt(0) }}</div>
              <div class="sidebar-user-info">
                <span class="sidebar-username">{{ auth.user?.nickname }}</span>
                <span class="sidebar-usertag">@{{ auth.user?.username }}</span>
              </div>
            </div>
            <button class="sidebar-close" @click="sidebarOpen = false">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <nav class="sidebar-nav">
            <div class="sidebar-section-title">导航</div>
            <router-link to="/notes" class="sidebar-item" @click="sidebarOpen = false">
              <svg class="si" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 3h8l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 3v4h4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M6 9h6M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>随手一记</span>
            </router-link>
            <router-link to="/profile" class="sidebar-item" @click="sidebarOpen = false">
              <svg class="si" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M2.5 16c0-3.5 2.5-6 6.5-6s6.5 2.5 6.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>个人主页</span>
            </router-link>
            <router-link to="/friends" class="sidebar-item" @click="sidebarOpen = false">
              <svg class="si" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="7" cy="5.5" r="3" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="13" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M1.5 16c0-3.3 2.2-5 5.5-5s5.5 1.7 5.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M11 14c0-2.5 1.8-3.8 4-3.8s4 1.3 4 3.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="translate(-2,-1)"/>
              </svg>
              <span>好友管理</span>
            </router-link>
          </nav>
        </aside>
      </Transition>

      <main class="content-area">
        <div class="tool-list">
          <div class="tool-card" @click="$router.push('/keepimage')" tabindex="0" role="button">
            <div class="tool-card-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13.5" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
                <path d="M8 18c0-5 3.5-8.5 7-10l1.5 1.5C14 11.5 11.5 14 11.5 18H8z" fill="currentColor" opacity="0.9"/>
                <path d="M11 19.5c0-4 2.5-6.5 5-8l1 1.5c-1.5 1.5-3 4-3 6.5h-3z" fill="currentColor" opacity="0.6"/>
                <path d="M18 10l3-3 5 5-3 3-5-5z" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
            <div class="tool-card-body">
              <div class="tool-card-name">KEE<span class="highlight">Pro</span></div>
              <div class="tool-card-desc">Keep 运动打卡截图生成器</div>
            </div>
            <svg class="tool-card-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="tool-card" @click="$router.push('/notes')" tabindex="0" role="button">
            <div class="tool-card-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="3" width="20" height="22" rx="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M9 10h10M9 15h8M9 20h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="tool-card-body">
              <div class="tool-card-name">随手一记</div>
              <div class="tool-card-desc">发布文字、图片、PDF，与好友分享动态</div>
            </div>
            <svg class="tool-card-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, logout } from '../store/auth.js'

const router = useRouter()
const sidebarOpen = ref(false)

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-lg);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.home-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.menu-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.home-title {
  font-size: 17px;
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.user-badge {
  font-size: var(--text-sm);
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 5px 14px;
  border-radius: var(--radius-sm);
  font-weight: var(--weight-semibold);
}

.logout-btn {
  height: 34px;
  padding: 0 14px;
  font-size: var(--text-sm);
}

.home-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* Sidebar Backdrop */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 90;
}

/* Sidebar (overlay) */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: var(--bg-card);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-avatar {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), #1a9a75);
  color: var(--text-inverse);
  font-size: 17px;
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-user-info {
  display: flex;
  flex-direction: column;
}

.sidebar-username {
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.sidebar-usertag {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.sidebar-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.sidebar-close:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.sidebar-nav {
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-section-title {
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 12px;
  margin-bottom: 6px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  transition: all var(--transition-fast);
}
.sidebar-item:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
  text-decoration: none;
}
.sidebar-item.router-link-exact-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.sidebar-item .si {
  flex-shrink: 0;
}

/* Sidebar slide transition */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.2s ease;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

/* Backdrop fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Content */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: var(--content-max-width);
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
}
.tool-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-primary);
  transform: translateX(4px);
}
.tool-card:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-border);
}

.tool-card-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.tool-card-body {
  flex: 1;
  min-width: 0;
}

.tool-card-name {
  font-size: 20px;
  font-weight: var(--weight-black);
  color: var(--text-primary);
  letter-spacing: 1px;
  font-family: var(--font-display);
  line-height: 1.3;
}

.highlight {
  color: var(--color-primary);
}

.tool-card-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.tool-card-arrow {
  color: var(--border-hover);
  flex-shrink: 0;
  transition: color var(--transition-fast);
}
.tool-card:hover .tool-card-arrow {
  color: var(--color-primary);
}
</style>
