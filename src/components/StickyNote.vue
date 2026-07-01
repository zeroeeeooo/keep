<template>
  <div
    :class="['sticky-note', noteColorClass]"
    :style="noteStyle"
    @click="$emit('click')"
    tabindex="0"
    role="button"
    @keydown.enter="$emit('click')"
  >
    <PushPin :color="pinColor" :size="18" :rotate="rotation" />
    <div class="sticky-header">
      <UserAvatar :name="authorName" size="sm" :friend="isFriend" />
      <div class="sticky-meta">
        <span class="sticky-author">{{ authorName }}</span>
        <span class="sticky-time">{{ formattedTime }}</span>
      </div>
    </div>
    <p class="sticky-content">{{ content }}</p>
    <div v-if="normalizedFiles.length" class="sticky-files">
      <template v-for="(f, i) in normalizedFiles" :key="i">
        <img v-if="isImageUrl(f.url)" :src="f.url" class="sticky-file-img" loading="lazy" @click.stop.prevent="$emit('preview', f.url)" />
        <a v-else :href="f.url" class="sticky-pdf-link" target="_blank" :download="f.name" @click.stop>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M4 3h7l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3"/>
            <path d="M11 3v4h4" stroke="currentColor" stroke-width="1.3"/>
          </svg>
          <span class="sticky-pdf-name">{{ f.name }}</span>
        </a>
      </template>
    </div>
    <div class="sticky-footer">
      <span v-if="tags && tags.length" class="sticky-tag">{{ tags[0] }}</span>
      <span class="sticky-stats">💬 {{ replyCount }}</span>
      <span v-if="likeCount" class="sticky-stats">❤️ {{ likeCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import UserAvatar from './UserAvatar.vue'
import PushPin from './PushPin.vue'

const props = defineProps({
  authorName: { type: String, default: '?' },
  content: { type: String, default: '' },
  files: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  isFriend: { type: Boolean, default: false },
  hasImage: { type: Boolean, default: false },
  replyCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  createdAt: { type: [String, Number], default: null },
  rotation: { type: String, default: '0deg' }
})

defineEmits(['click', 'preview'])

/** 标准化文件数组：兼容旧格式（字符串路径）和新格式（{url, name} 对象） */
const normalizedFiles = computed(() => {
  return (props.files || []).map(f => {
    if (typeof f === 'string') return { url: f, name: f.split('/').pop() }
    return f
  })
})

const noteColorClass = computed(() => {
  if (props.isFriend) return 'note-blue'
  if (props.hasImage) return 'note-pink'
  return 'note-yellow'
})

const pinColor = computed(() => {
  if (props.isFriend) return 'blue'
  if (props.hasImage) return 'silver'
  return 'gold'
})

const noteStyle = computed(() => ({
  transform: `rotate(${props.rotation})`
}))

const formattedTime = computed(() => {
  if (!props.createdAt) return ''
  const d = new Date(props.createdAt)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 172800000) return '昨天'
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
})

function isImageUrl(path) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path)
}
</script>

<style scoped>
.sticky-note {
  position: relative;
  padding: 18px 16px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
  break-inside: avoid;
  margin-bottom: 16px;
  outline: none;
  box-shadow:
    0 2px 6px rgba(0,0,0,0.08),
    0 1px 2px rgba(0,0,0,0.04);
  min-height: 100px;
}
.sticky-note:hover {
  box-shadow:
    0 6px 20px rgba(0,0,0,0.12),
    0 3px 6px rgba(0,0,0,0.08);
  transform: rotate(0deg) translateY(-3px) !important;
}
.sticky-note:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

/* Classic Sticky Note Solid Colors */
.note-yellow { background: #fef68a; color: #5a4a2a; }
.note-blue   { background: #bbdefb; color: #1a3a5a; }
.note-pink   { background: #f8bbd0; color: #5a2a3a; }
.note-green  { background: #c8e6c9; color: #1a4a2a; }
.note-orange { background: #ffe0b2; color: #5a3a1a; }
.note-purple { background: #e1bee7; color: #3a2a4a; }

[data-theme="dark"] .note-yellow { background: #5a4a2a; color: #fef68a; }
[data-theme="dark"] .note-blue   { background: #1a3a5a; color: #bbdefb; }
[data-theme="dark"] .note-pink   { background: #5a2a3a; color: #f8bbd0; }
[data-theme="dark"] .note-green  { background: #1a4a2a; color: #c8e6c9; }
[data-theme="dark"] .note-orange { background: #5a3a1a; color: #ffe0b2; }
[data-theme="dark"] .note-purple { background: #3a2a4a; color: #e1bee7; }

/* PushPin position */
.sticky-note .pushpin {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.sticky-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.sticky-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sticky-author {
  font-size: 13px;
  font-weight: 600;
}

.sticky-time {
  font-size: 10px;
  opacity: 0.6;
}

.sticky-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'KaiTi', 'STKaiti', '楷体', cursive;
  margin: 0;
}

.sticky-files {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 4px;
}
.sticky-file-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.15s;
  background: rgba(0,0,0,0.05);
}
.sticky-file-img:hover {
  opacity: 0.8;
}

.sticky-pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0,0,0,0.06);
  border-radius: 4px;
  color: inherit;
  text-decoration: none;
  font-size: 11px;
  grid-column: 1 / -1;
  cursor: pointer;
}
.sticky-pdf-link:hover {
  background: rgba(0,0,0,0.12);
}
.sticky-pdf-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticky-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

.sticky-tag {
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(0,0,0,0.08);
  font-size: 10px;
}

.sticky-stats {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Dark mode */
[data-theme="dark"] .note-yellow {
  background: linear-gradient(180deg, #5a4a2a, #4a3a1a);
  color: #e8dcc8;
}
[data-theme="dark"] .note-blue {
  background: linear-gradient(180deg, #2a3a5a, #1a2a4a);
  color: #c8d8e8;
}
[data-theme="dark"] .note-pink {
  background: linear-gradient(180deg, #5a2a3a, #4a1a2a);
  color: #e8c8d0;
}
</style>
