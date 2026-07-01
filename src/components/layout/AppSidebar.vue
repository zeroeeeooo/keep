<template>
  <Transition name="sidebar-slide">
    <aside v-if="open" class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-user">
          <UserAvatar :name="displayName" size="lg" :src="avatarSrc" />
          <div class="sidebar-user-info">
            <span class="sidebar-username">{{ displayName }}</span>
            <span v-if="displayTag" class="sidebar-usertag">@{{ displayTag }}</span>
          </div>
        </div>
        <button class="sidebar-close" @click="$emit('close')" title="收起侧边栏">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-title">导航</div>
        <router-link
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="sidebar-item"
          @click="$emit('close')"
        >
          <svg v-if="item.icon" class="si" width="18" height="18" viewBox="0 0 18 18" fill="none" v-html="item.icon" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Spacer -->
      <div class="sidebar-spacer"></div>

      <!-- 暗黑模式切换 -->
      <div class="sidebar-theme">
        <button class="theme-btn" @click="toggleTheme">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 10A6.5 6.5 0 116 2.5a6.5 6.5 0 007.5 7.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <span>{{ isDark ? '亮色模式' : '暗黑模式' }}</span>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserAvatar from '../UserAvatar.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  displayName: { type: String, default: '用户' },
  displayTag: { type: String, default: '' },
  avatarSrc: { type: String, default: null },
  items: { type: Array, default: () => [] }
})

defineEmits(['close'])

const isDark = ref(false)

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('keep_theme', next)
  isDark.value = next === 'dark'
}

onMounted(() => {
  const theme = localStorage.getItem('keep_theme') || 'light'
  isDark.value = theme === 'dark'
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  border-right: 1px solid var(--border-light);
}

[data-theme="dark"] .sidebar {
  background: rgba(26,29,39,0.92);
}

.sidebar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
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
  flex-shrink: 0;
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

/* Spacer pushes theme toggle to bottom */
.sidebar-spacer {
  flex: 1;
}

/* Theme toggle at bottom */
.sidebar-theme {
  padding: 4px 12px 16px;
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}
.theme-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}
.theme-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}
.theme-btn svg {
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
</style>
