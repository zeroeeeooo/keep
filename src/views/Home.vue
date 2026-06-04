<template>
  <div class="home">
    <header class="top-bar">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen" :title="sidebarOpen ? '收起侧边栏' : '展开侧边栏'">
        <span class="menu-icon">☰</span>
      </button>
      <span class="page-title">工具集</span>
    </header>

    <div class="body-wrapper">
      <transition name="slide">
        <aside v-if="sidebarOpen" class="sidebar">
          <!-- 预留侧边栏内容 -->
          <div class="sidebar-placeholder">导航菜单</div>
        </aside>
      </transition>

      <main class="content-area">
        <div class="tool-list">
          <!-- 工具卡片行：每个工具占一行 -->
          <div class="tool-card" @click="$router.push('/keepimage')">
            <span class="tool-icon">🏃</span>
            <span class="tool-name">KEE<span class="highlight">Pro</span></span>
            <span class="tool-desc">Keep 运动打卡截图生成器</span>
            <span class="tool-arrow">→</span>
          </div>

          <!-- 未来工具卡片将添加在这里 -->
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sidebarOpen = ref(false)
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 页眉 */
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
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
  border-radius: 6px;
  font-size: 18px;
  color: #555;
  transition: background 0.2s;
}

.menu-btn:hover {
  background: #f0f0f0;
}

.menu-icon {
  line-height: 1;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 主体布局 */
.body-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 隐藏式侧边栏 */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 16px;
  overflow-y: auto;
}

.sidebar-placeholder {
  color: #bbb;
  font-size: 14px;
}

/* 侧边栏滑入滑出动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  width: 0 !important;
  padding-left: 0;
  padding-right: 0;
  opacity: 0;
}

/* 内容区域 */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 工具卡片列表 */
.tool-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-card:hover {
  border-color: #26c99a;
  box-shadow: 0 2px 12px rgba(38, 201, 154, 0.12);
  transform: translateX(4px);
}

.tool-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.tool-name {
  font-size: 18px;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: 1px;
  font-family: 'DINCond-Bold', 'Arial Black', sans-serif;
  flex-shrink: 0;
}

.highlight {
  color: #26c99a;
}

.tool-desc {
  font-size: 13px;
  color: #999;
  flex: 1;
}

.tool-arrow {
  font-size: 18px;
  color: #ccc;
  flex-shrink: 0;
}

.tool-card:hover .tool-arrow {
  color: #26c99a;
}
</style>