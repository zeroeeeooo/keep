<template>
  <div class="keep-page">
    <header class="keep-header">
      <router-link to="/home" class="back-btn">
        <span class="back-arrow">←</span>
        <span class="back-text">返回首页</span>
      </router-link>
      <span class="header-title">KEEPro</span>
      <span class="header-spacer"></span>
    </header>
    <iframe
      ref="keepFrame"
      src="/keep.html"
      class="keep-iframe"
      title="Keep 运动打卡截图生成器"
      @load="onFrameLoad"
    ></iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const keepFrame = ref(null)

function onFrameLoad() {
  // iframe 加载完成后无需额外处理
  console.log('Keep 页面已加载')
}
</script>

<style scoped>
.keep-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.keep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: #26c99a;
  color: #fff;
  flex-shrink: 0;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  cursor: pointer;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.back-arrow {
  font-size: 18px;
}

.back-text {
  font-weight: 500;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
}

.header-spacer {
  width: 100px;
}

.keep-iframe {
  flex: 1;
  width: 100%;
  border: none;
}
</style>