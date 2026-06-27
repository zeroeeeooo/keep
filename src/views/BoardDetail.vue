<template>
  <div class="detail-page">
    <header class="detail-header">
      <button class="detail-back" @click="$router.back()">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <span class="detail-title">{{ topic?.content?.slice(0, 12) || '话题' }}{{ topic?.content?.length > 12 ? '...' : '' }}</span>
      <button v-if="topic?.user_id === auth.userId" class="detail-more" @click="handleDelete">删除</button>
      <span v-else class="detail-spacer"></span>
    </header>

    <div class="cork-board-detail">
      <!-- 置顶话题便利贴 -->
      <div v-if="topic" class="topic-pinned">
        <div class="pinned-sticky">
          <div class="pinned-header">
            <UserAvatar :name="topic.nickname || topic.username" size="md" />
            <div class="pinned-info">
              <span class="pinned-author">{{ topic.nickname || topic.username }}</span>
              <span class="pinned-time">{{ formatTime(topic.created_at) }}</span>
            </div>
          </div>
          <p class="pinned-content">{{ topic.content }}</p>
          <div v-if="topic.files && topic.files.length" class="pinned-files">
            <img v-for="(f, i) in topic.files" :key="i" :src="f" class="pinned-img" loading="lazy" />
          </div>
        </div>
      </div>

      <div v-if="topic" class="topic-divider">
        <span>{{ replyCount }} 条回复 · {{ formatTime(topic.created_at) }}</span>
      </div>

      <!-- 回复列表 -->
      <div class="reply-wall">
        <div
          v-for="(reply, index) in replies"
          :key="reply.id"
          :class="['reply-bubble', { 'reply-mine': reply.user_id === auth.userId }]"
          :style="{ animationDelay: index * 50 + 'ms' }"
        >
          <div class="reply-inner">
            <div class="reply-author">
              <UserAvatar :name="reply.nickname || reply.username" size="sm" />
              <span class="reply-name">{{ reply.nickname || reply.username }}</span>
              <span class="reply-time">{{ formatTime(reply.created_at) }}</span>
            </div>
            <p class="reply-text">{{ reply.content }}</p>
            <div v-if="reply.files && reply.files.length" class="reply-files">
              <img v-for="(f, fi) in reply.files" :key="fi" :src="f" class="reply-img" loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空回复 -->
      <div v-if="replies.length === 0 && !loading" class="reply-empty">
        <p>还没有回复，来写下第一条吧</p>
      </div>
    </div>

    <!-- 底部输入栏 -->
    <div class="reply-input-bar">
      <div class="reply-input-wrap">
        <textarea
          v-model="replyContent"
          class="reply-input"
          placeholder="✍️ 写回复..."
          rows="1"
          @input="autoResize"
          @keydown.enter.exact="sendReply"
        ></textarea>
        <button class="reply-send" :disabled="!replyContent.trim()" @click="sendReply">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { useTopicStore } from '../stores/topicStore.js'
import UserAvatar from '../components/UserAvatar.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const topicStore = useTopicStore()

const topic = ref(null)
const replies = ref([])
const replyContent = ref('')
const loading = ref(false)
const replyCount = computed(() => replies.value.length)

onMounted(async () => {
  loading.value = true
  const res = await topicStore.loadTopic(route.params.id)
  if (res.ok) {
    topic.value = res.data.topic
    const replyRes = await topicStore.loadReplies(route.params.id)
    if (replyRes.ok) {
      replies.value = topicStore.replies
    }
  } else {
    router.back()
  }
  loading.value = false
})

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 172800000) return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function autoResize(e) {
  e.target.style.height = 'auto'
  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
}

async function sendReply() {
  if (!replyContent.value.trim() || !topic.value) return
  const res = await topicStore.createReply(topic.value.id, {
    content: replyContent.value.trim()
  })
  if (res.ok) {
    replyContent.value = ''
    await topicStore.loadReplies(topic.value.id)
    replies.value = topicStore.replies
    // 刷新话题列表的回复数
    topicStore.loadTopics()
  }
}

async function handleDelete() {
  if (!topic.value) return
  const res = await topicStore.deleteTopic(topic.value.id)
  if (res.ok) {
    router.push('/board')
  }
}
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ===== Header ===== */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 48px;
  background: rgba(196, 154, 108, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.detail-back {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.15s;
}
.detail-back:hover { background: rgba(0,0,0,0.1); }
.detail-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}
.detail-more {
  border: none;
  background: none;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  font-family: inherit;
}
.detail-more:hover { background: rgba(0,0,0,0.1); color: #e74c3c; }
.detail-spacer { width: 60px; }

[data-theme="dark"] .detail-header {
  background: rgba(92, 61, 46, 0.95);
}

/* ===== Cork Board Background ===== */
.cork-board-detail {
  flex: 1;
  background-color: #c49a6c;
  background-image:
    radial-gradient(ellipse at 20% 50%, #b8895a 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, #d4a86a 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, #b08050 0%, transparent 50%),
    repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(139, 90, 43, 0.04) 2px, rgba(139, 90, 43, 0.04) 4px
    ),
    repeating-linear-gradient(
      90deg, transparent, transparent 3px,
      rgba(139, 90, 43, 0.03) 3px, rgba(139, 90, 43, 0.03) 6px
    );
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

[data-theme="dark"] .cork-board-detail {
  background-color: #5c3d2e;
  background-image:
    radial-gradient(ellipse at 20% 50%, #4d3225 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, #6b4a38 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, #4a2e20 0%, transparent 50%),
    repeating-linear-gradient(
      0deg, transparent, transparent 2px,
      rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px
    ),
    repeating-linear-gradient(
      90deg, transparent, transparent 3px,
      rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px
    );
}

/* ===== Pinned Topic ===== */
.topic-pinned {
  flex-shrink: 0;
}
.pinned-sticky {
  background: #fef68a;
  border-radius: 3px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  position: relative;
}
.pinned-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.pinned-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.pinned-author {
  font-size: 14px;
  font-weight: 600;
  color: #5a4a2a;
}
.pinned-time {
  font-size: 11px;
  color: #8a7a5a;
}
.pinned-content {
  font-size: 14px;
  line-height: 1.6;
  color: #5a4a2a;
  font-family: 'KaiTi', 'STKaiti', '楷体', cursive;
  margin: 0;
  white-space: pre-wrap;
}
.pinned-files {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: 8px;
}
.pinned-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 2px;
}
[data-theme="dark"] .pinned-content { color: #fef68a; }

[data-theme="dark"] .pinned-sticky {
  background: #5a4a2a;
}
[data-theme="dark"] .pinned-author,
[data-theme="dark"] .pinned-content {
  color: #e8dcc8;
}
[data-theme="dark"] .pinned-time {
  color: #a89880;
}

.topic-divider {
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,0.6);
  padding: 4px 0;
  flex-shrink: 0;
}

/* ===== Reply Bubbles ===== */
.reply-wall {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.reply-bubble {
  animation: replyFadeIn 0.3s ease-out both;
}
@keyframes replyFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.reply-inner {
  background: rgba(255,255,255,0.92);
  border-radius: 4px;
  padding: 12px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  max-width: 85%;
}

.reply-mine .reply-inner {
  margin-left: auto;
  background: #fef68a;
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.reply-name {
  font-size: 12px;
  font-weight: 600;
  color: #5a4a2a;
}
.reply-time {
  font-size: 10px;
  color: #8a7a5a;
  margin-left: auto;
}
.reply-text {
  font-size: 14px;
  line-height: 1.5;
  color: #3a2a1a;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.reply-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.reply-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

[data-theme="dark"] .reply-inner {
  background: rgba(255,255,255,0.08);
}
[data-theme="dark"] .reply-mine .reply-inner {
  background: #5a4a2a;
}
[data-theme="dark"] .reply-name,
[data-theme="dark"] .reply-text {
  color: #e8dcc8;
}
[data-theme="dark"] .reply-time {
  color: #a89880;
}

.reply-empty {
  text-align: center;
  padding: 24px;
  color: rgba(255,255,255,0.5);
  font-size: 13px;
}

/* ===== Input Bar ===== */
.reply-input-bar {
  flex-shrink: 0;
  padding: 8px 12px 12px;
  background: rgba(196, 154, 108, 0.95);
  backdrop-filter: blur(8px);
}
.reply-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: rgba(255,255,255,0.9);
  border-radius: 12px;
  padding: 6px 6px 6px 14px;
}
.reply-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  resize: none;
  max-height: 120px;
  line-height: 1.4;
  color: #3a2a1a;
}
.reply-input::placeholder { color: #a89880; }
.reply-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.reply-send:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.reply-send:disabled {
  opacity: 0.4;
}

[data-theme="dark"] .reply-input-bar {
  background: rgba(92, 61, 46, 0.95);
}
[data-theme="dark"] .reply-input-wrap {
  background: rgba(255,255,255,0.1);
}
[data-theme="dark"] .reply-input {
  color: #e8dcc8;
}
[data-theme="dark"] .reply-input::placeholder {
  color: #8a7a6a;
}
</style>
