<template>
  <div
    :class="['user-avatar', sizeClass, { 'avatar-friend': friend }]"
    :style="!src ? gradientStyle : undefined"
  >
    <img v-if="src" :src="src" :alt="name" class="avatar-img" />
    <span v-else>{{ initial }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '?' },
  size: { type: String, default: 'md' },
  friend: { type: Boolean, default: false },
  gradient: { type: String, default: null },
  src: { type: String, default: null }
})

const initial = computed(() => (props.name || '?').charAt(0))

const sizeClass = computed(() => `avatar-${props.size}`)

const gradientStyle = computed(() => {
  if (props.gradient) return { background: props.gradient }
  return null
})
</script>

<style scoped>
.user-avatar {
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), #1a9a75);
  color: var(--text-inverse);
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-friend {
  background: linear-gradient(135deg, #5b8def, #7c6cf0);
}

/* Sizes */
.avatar-sm {
  width: 28px;
  height: 28px;
  font-size: 12px;
}
.avatar-md {
  width: 36px;
  height: 36px;
  font-size: 14px;
}
.avatar-lg {
  width: 42px;
  height: 42px;
  font-size: 17px;
}
.avatar-xl {
  width: 68px;
  height: 68px;
  font-size: 28px;
}
</style>
