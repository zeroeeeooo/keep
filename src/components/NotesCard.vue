<template>
  <div :class="['note-card', { 'note-card--friend': friend }]">
    <!-- Top row: avatar + name + time -->
    <div class="note-top">
      <UserAvatar :name="authorName" size="md" :friend="friend" />
      <div class="note-info">
        <span class="note-name">{{ authorName }}</span>
        <span class="note-time">{{ formattedTime }}</span>
      </div>
    </div>

    <!-- Content area (inset shadow) -->
    <div v-if="content" class="note-content">
      <div class="md-body" v-html="renderedContent"></div>
    </div>

    <!-- Files grid (3 columns) -->
    <div v-if="normalizedFiles.length" class="note-files">
      <a
        v-for="(f, i) in normalizedFiles"
        :key="i"
        :href="f.url"
        class="file-item"
        :class="{ 'file-item--image': isImageUrl(f.url) }"
        :download="isImageUrl(f.url) ? undefined : f.name"
        target="_blank"
      >
        <template v-if="isImageUrl(f.url)">
          <img :src="f.url" class="file-img" loading="lazy" @click.prevent="$emit('preview', f.url)" />
        </template>
        <template v-else>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 3h7l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3"/>
            <path d="M11 3v4h4" stroke="currentColor" stroke-width="1.3"/>
          </svg>
          <span class="file-name">{{ f.name }}</span>
        </template>
      </a>
    </div>

    <!-- Delete button — bottom right, hover reveal -->
    <button
      v-if="showDelete"
      class="note-delete"
      @click="$emit('delete')"
      title="删除"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import UserAvatar from './UserAvatar.vue'
import { renderMarkdown } from '../utils/markdown.js'

const props = defineProps({
  authorName: { type: String, default: '?' },
  content: { type: String, default: '' },
  files: { type: Array, default: () => [] },
  friend: { type: Boolean, default: false },
  showDelete: { type: Boolean, default: false },
  createdAt: { type: [String, Number], default: null }
})

defineEmits(['delete', 'preview'])

const renderedContent = computed(() => renderMarkdown(props.content))

/** 标准化文件数组：兼容旧格式（字符串路径）和新格式（{url, name} 对象） */
const normalizedFiles = computed(() => {
  return (props.files || []).map(f => {
    if (typeof f === 'string') return { url: f, name: f.split('/').pop() }
    return f
  })
})

function isImageUrl(path) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(path)
}

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
</script>

<style scoped>
/* ===== Card Container ===== */
.note-card {
  padding: 18px 18px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: all 0.25s ease;
  position: relative;
  box-shadow:
    0 1px 3px rgba(0,0,0,0.03),
    0 4px 12px rgba(0,0,0,0.04);
}
.note-card:hover {
  border-color: var(--border-hover);
  box-shadow:
    0 2px 8px rgba(0,0,0,0.05),
    0 8px 28px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

/* Friend variant */
.note-card--friend {
  background: linear-gradient(135deg, rgba(91,141,239,0.02), rgba(124,108,240,0.03));
  border-color: rgba(91,141,239,0.12);
}
.note-card--friend:hover {
  border-color: rgba(91,141,239,0.25);
}

/* ===== Top Row ===== */
.note-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.note-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.note-name {
  font-size: var(--text-md, 15px);
  font-weight: var(--weight-semibold, 600);
  color: var(--text-primary);
}

.note-time {
  font-size: var(--text-xs, 11px);
  color: var(--text-tertiary);
}

/* ===== Content Area (inset relief) ===== */
.note-content {
  background: var(--bg-card-hover);
  padding: 14px 16px;
  border-radius: var(--radius-md, 10px);
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 12px;
  box-shadow:
    inset 0 1px 2px rgba(0,0,0,0.04);
}
.note-content :deep(.md-body) {
  word-break: break-word;
}
.note-content :deep(.md-body) p {
  margin: 0 0 8px;
  white-space: pre-wrap;
}
.note-content :deep(.md-body) p:last-child {
  margin-bottom: 0;
}
.note-content :deep(.md-body) ul,
.note-content :deep(.md-body) ol {
  margin: 4px 0;
  padding-left: 20px;
}
.note-content :deep(.md-body) li {
  margin-bottom: 2px;
}
.note-content :deep(.md-body) code {
  background: rgba(0,0,0,0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
.note-content :deep(.md-body) pre {
  background: rgba(0,0,0,0.06);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}
.note-content :deep(.md-body) pre code {
  background: none;
  padding: 0;
}
.note-content :deep(.md-body) blockquote {
  border-left: 3px solid var(--color-primary);
  margin: 8px 0;
  padding: 4px 12px;
  color: var(--text-secondary);
  background: rgba(0,0,0,0.02);
  border-radius: 0 4px 4px 0;
}
.note-content :deep(.md-body) a {
  color: var(--color-primary);
  text-decoration: underline;
}
.note-content :deep(.md-body) h1,
.note-content :deep(.md-body) h2,
.note-content :deep(.md-body) h3,
.note-content :deep(.md-body) h4 {
  margin: 12px 0 6px;
  line-height: 1.4;
}
.note-content :deep(.md-body) img {
  max-width: 100%;
  border-radius: 6px;
  margin: 8px 0;
}
.note-content :deep(.md-body) hr {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 12px 0;
}
.note-content :deep(.md-body) table {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
  font-size: 0.9em;
  font-family: system-ui, -apple-system, sans-serif;
}
.note-content :deep(.md-body) th,
.note-content :deep(.md-body) td {
  border: 1px solid var(--border-light);
  padding: 6px 10px;
  text-align: left;
}
.note-content :deep(.md-body) th {
  background: rgba(0,0,0,0.03);
  font-weight: 600;
}
.note-content :deep(.md-body) td {
  background: rgba(255,255,255,0.4);
}

/* ===== Files Grid (3 columns) ===== */
.note-files {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 4px;
}

.file-item {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: var(--radius-sm, 6px);
  overflow: hidden;
  transition: transform 0.2s ease;
}
.file-item:hover {
  transform: scale(1.05);
}

.file-item--image {
  aspect-ratio: 1;
  border: 1px solid var(--border-light);
}

.file-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

/* Non-image file link */
.file-item:not(.file-item--image) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: var(--text-xs, 11px);
  grid-column: 1 / -1;
}
.file-item:not(.file-item--image):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Delete Button (bottom right, hover reveal) ===== */
.note-delete {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: var(--radius-sm, 6px);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}
.note-card:hover .note-delete,
.note-delete:focus-visible {
  opacity: 1;
}
.note-delete:hover {
  background: rgba(231, 76, 60, 0.08);
  color: var(--color-error);
}
.note-delete:focus-visible {
  opacity: 1;
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
