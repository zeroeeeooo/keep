<template>
  <div class="cork-page">
    <PageHeader title="随手一记" backTo="/home" />

    <div class="cork-board">
      <!-- 分段控制器 -->
      <div class="cork-tabs">
        <button :class="['cork-tab', { active: filter === 'all' }]" @click="filter = 'all'">全部</button>
        <button :class="['cork-tab', { active: filter === 'mine' }]" @click="filter = 'mine'">我的话题</button>
        <div class="cork-tab-indicator" :style="{ left: filter === 'all' ? '4px' : '50%' }"></div>
      </div>

      <!-- Toast -->
      <Transition name="toast">
        <div v-if="toast.show" :class="['cork-toast', 'cork-toast-' + toast.type]">{{ toast.message }}</div>
      </Transition>

      <!-- 便利贴墙 -->
      <div class="cork-wall" v-if="displayTopics.length > 0">
        <StickyNote
          v-for="topic in displayTopics"
          :key="topic.id"
          :authorName="topic.nickname || topic.username"
          :content="topic.content"
          :tags="topic.tags || []"
          :isFriend="topic.user_id !== auth.userId"
          :hasImage="topic.files && topic.files.length > 0"
          :files="topic.files || []"
          :replyCount="topic.reply_count || 0"
          :createdAt="topic.created_at"
          :rotation="topic.rotation || '0deg'"
          @click="openTopic(topic)"
        />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="cork-empty">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
          <rect x="10" y="8" width="28" height="32" rx="2" stroke="#8b6b4a" stroke-width="1.5"/>
          <circle cx="24" cy="8" r="6" fill="#c0c0c0" stroke="#999" stroke-width="1"/>
        </svg>
        <p>墙上还没有便利贴</p>
        <p class="cork-empty-hint">点击下方按钮创建第一个话题</p>
      </div>

      <!-- 加载中骨架 -->
      <div v-else class="cork-wall">
        <div v-for="i in 4" :key="i" class="sticky-skeleton" :style="{ animationDelay: i * 100 + 'ms' }">
          <div class="skel-pin"></div>
          <div class="skel-avatar"></div>
          <div class="skel-line" style="width:80%"></div>
          <div class="skel-line" style="width:60%"></div>
        </div>
      </div>
    </div>

    <!-- 创建话题浮动按钮 -->
    <button class="cork-fab" @click="showCreateSheet = true" title="创建新话题">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 底部创建 Sheet -->
    <Transition name="sheet">
      <div v-if="showCreateSheet" class="sheet-overlay" @click.self="showCreateSheet = false">
        <div class="create-sheet">
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">📌 贴上便利贴</h3>
          <div class="sheet-sticky-preview">
            <textarea
              v-model="newContent"
              class="sheet-textarea"
              placeholder="写点什么…"
              rows="3"
              ref="textareaRef"
              @keydown.enter.exact="submitTopic"
            ></textarea>
          </div>
          <div v-if="newFiles.length" class="sheet-files">
            <div v-for="(f, i) in newFiles" :key="i" class="sheet-file">
              <span>{{ f.name }}</span>
              <button @click="newFiles.splice(i, 1)">✕</button>
            </div>
          </div>
          <div class="sheet-actions">
            <label class="sheet-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <input type="file" multiple accept="image/*,.pdf" style="display:none" @change="onFileSelect" />
            </label>
            <button class="sheet-submit" :disabled="!newContent.trim()" @click="submitTopic">
              📌 贴上墙
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { useTopicStore } from '../stores/topicStore.js'
import { useToast } from '../composables/useToast.js'
import PageHeader from '../components/PageHeader.vue'
import StickyNote from '../components/StickyNote.vue'

const router = useRouter()
const auth = useAuthStore()
const topicStore = useTopicStore()
const { toast, showToast } = useToast()
const { useToast: _, ...toastRest } = useToast()

const filter = ref('all')
const loading = ref(false)
const showCreateSheet = ref(false)
const newContent = ref('')
const newFiles = ref([])
const textareaRef = ref(null)

const displayTopics = computed(() => {
  return filter.value === 'mine' ? topicStore.myTopics : topicStore.allTopics
})

watch(filter, async (val) => {
  if (val === 'mine') {
    await topicStore.loadMyTopics()
  } else {
    await topicStore.loadTopics()
  }
})

onMounted(async () => {
  loading.value = true
  await topicStore.loadTopics()
  loading.value = false
})

function openTopic(topic) {
  router.push(`/board/${topic.id}`)
}

function onFileSelect(e) {
  for (const f of Array.from(e.target.files)) {
    newFiles.value.push(f)
  }
  e.target.value = ''
}

async function submitTopic() {
  if (!newContent.value.trim()) return
  const res = await topicStore.createTopic({
    content: newContent.value.trim(),
    files: newFiles.value
  })
  if (res.ok) {
    showToast('已贴在墙上！', 'success')
    showCreateSheet.value = false
    newContent.value = ''
    newFiles.value = []
    await topicStore.loadTopics()
  } else {
    showToast(res.message || '发布失败', 'error')
  }
}
</script>

<style scoped>
.cork-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ===== Cork Board Background ===== */
.cork-board {
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
  position: relative;
}

[data-theme="dark"] .cork-board {
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

/* ===== Tabs ===== */
.cork-tabs {
  display: flex;
  position: relative;
  gap: 0;
  margin-bottom: 16px;
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
  padding: 3px;
  backdrop-filter: blur(8px);
}
.cork-tab {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}
.cork-tab.active {
  color: #5a3a1a;
  background: rgba(255,255,255,0.9);
}

[data-theme="dark"] .cork-tab.active {
  color: #e8dcc8;
  background: rgba(255,255,255,0.12);
}

/* ===== Toast ===== */
.cork-toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  color: #fff;
}
.cork-toast-success { background: var(--color-success); }
.cork-toast-error { background: var(--color-error); }

.toast-enter-active { transition: all 0.25s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-16px); }

/* ===== Sticky Wall (Masonry) ===== */
.cork-wall {
  column-count: 2;
  column-gap: 16px;
}

/* ===== Empty State ===== */
.cork-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  color: rgba(255,255,255,0.6);
}
.cork-empty p {
  font-size: 15px;
  margin-top: 8px;
}
.cork-empty-hint {
  font-size: 12px !important;
  opacity: 0.6;
  margin-top: 4px !important;
}

/* ===== Skeleton ===== */
.sticky-skeleton {
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  break-inside: avoid;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
.skel-pin {
  width: 16px; height: 16px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  margin: 0 auto 12px;
}
.skel-avatar {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  margin-bottom: 8px;
}
.skel-line {
  height: 10px;
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
  margin-bottom: 6px;
}

/* ===== FAB Button ===== */
.cork-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(38,201,154,0.35);
  transition: all 0.2s ease;
  z-index: 50;
}
.cork-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(38,201,154,0.45);
}
.cork-fab:active {
  transform: scale(0.95);
}

/* ===== Create Sheet ===== */
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.create-sheet {
  width: 100%;
  max-width: 500px;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  padding: 16px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sheet-handle {
  width: 36px; height: 4px;
  background: var(--border-light);
  border-radius: 2px;
  margin: 0 auto 8px;
}
.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.sheet-sticky-preview {
  background: #fef68a;
  border-radius: 3px;
  padding: 14px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
}
.sheet-textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  font-family: 'KaiTi', 'STKaiti', '楷体', cursive;
  color: #5a4a2a;
  outline: none;
  resize: none;
  line-height: 1.6;
  min-height: 60px;
}
.sheet-textarea::placeholder {
  color: #d4c48a;
}

[data-theme="dark"] .sheet-sticky-preview {
  background: #5a4a2a;
}
[data-theme="dark"] .sheet-textarea {
  color: #fef68a;
}
[data-theme="dark"] .sheet-textarea::placeholder {
  color: #8a7a6a;
}

.sheet-files {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sheet-file {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--color-primary-light);
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-primary);
}
.sheet-file button {
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
  font-size: 12px;
}
.sheet-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sheet-btn {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  color: var(--text-tertiary);
  border-radius: 6px;
  transition: all 0.15s;
}
.sheet-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.sheet-submit {
  height: 40px;
  padding: 0 28px;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.sheet-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.sheet-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sheet transition */
.sheet-enter-active { transition: all 0.3s ease-out; }
.sheet-leave-active { transition: all 0.2s ease-in; }
.sheet-enter-from { opacity: 0; }
.sheet-leave-to { opacity: 0; }
.sheet-enter-active .create-sheet { transform: translateY(0); }
.sheet-enter-from .create-sheet { transform: translateY(100%); }
.sheet-leave-to .create-sheet { transform: translateY(100%); }
</style>
