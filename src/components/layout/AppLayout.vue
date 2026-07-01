<template>
  <div class="app-layout">
    <!-- Backdrop (for sidebar overlay) -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="app-layout-backdrop"
        @click="$emit('update:sidebarOpen', false)"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <AppSidebar
      :open="sidebarOpen"
      :displayName="displayName"
      :displayTag="displayTag"
      :avatarSrc="avatarSrc"
      :items="navItems"
      @close="$emit('update:sidebarOpen', false)"
    />

    <!-- Main content -->
    <div :class="['app-layout-main', { 'app-layout-main--padded': padded }]">
      <slot />
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  sidebarOpen: { type: Boolean, default: false },
  displayName: { type: String, default: '用户' },
  displayTag: { type: String, default: '' },
  avatarSrc: { type: String, default: null },
  padded: { type: Boolean, default: true },
  navItems: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:sidebarOpen'])
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
}

.app-layout-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 90;
}

.app-layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.app-layout-main--padded {
  padding: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
