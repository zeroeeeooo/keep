<template>
  <div class="batch-panel">
    <h4 class="section-title">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="vertical-align:-2px;margin-right:4px">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/>
      </svg>
      批量生成截图
    </h4>

    <div class="batch-row">
      <label>生成数量：</label>
      <input v-model.number="params.count" type="number" min="1" max="100" class="input-xs" />
      <span class="hint">(1~100)</span>
    </div>

    <div class="batch-row">
      <label>日期范围：</label>
      <input v-model="params.dateStart" type="date" class="input-date" />
      <span>~</span>
      <input v-model="params.dateEnd" type="date" class="input-date" />
    </div>

    <div class="batch-row">
      <label>时间范围：</label>
      <input v-model="params.timeStart" type="time" class="input-date" />
      <span>~</span>
      <input v-model="params.timeEnd" type="time" class="input-date" />
    </div>

    <div class="batch-row">
      <label>天气模式：</label>
      <select v-model="params.weatherMode" class="select-sm">
        <option value="fixed">固定天气</option>
        <option value="random">随机天气</option>
      </select>
      <select v-if="params.weatherMode === 'fixed'" v-model="params.fixedWeather" class="select-sm">
        <option value="晴">晴</option>
        <option value="多云">多云</option>
        <option value="阴天">阴天</option>
      </select>
    </div>

    <div class="batch-row">
      <label>温度范围：</label>
      <input v-model.number="params.tempMin" type="number" class="input-xs" />
      <span>~</span>
      <input v-model.number="params.tempMax" type="number" class="input-xs" />
      <span>℃</span>
    </div>

    <div class="batch-row">
      <label>湿度范围：</label>
      <input v-model.number="params.humiMin" type="number" class="input-xs" />
      <span>~</span>
      <input v-model.number="params.humiMax" type="number" class="input-xs" />
      <span>%</span>
    </div>

    <div class="batch-row">
      <label>公里范围：</label>
      <input v-model.number="params.kmMin" type="number" step="0.1" class="input-xs" />
      <span>~</span>
      <input v-model.number="params.kmMax" type="number" step="0.1" class="input-xs" />
    </div>

    <div class="batch-row">
      <label>配速范围：</label>
      <input v-model.number="params.speedMin" type="number" step="0.1" class="input-xs" />
      <span>~</span>
      <input v-model.number="params.speedMax" type="number" step="0.1" class="input-xs" />
    </div>

    <div class="batch-actions">
      <button class="btn-sm" @click="startBatch" :disabled="running">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="vertical-align:-2px;margin-right:2px">
          <path d="M2 12l4-4M8 6l2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M4.5 9.5L2 12l2.5-2.5z" fill="currentColor" opacity="0.3"/>
          <path d="M10.5 3.5a4 4 0 00-5.66 0L3 5.34A2 2 0 003 8l3 3a2 2 0 002.66 0l1.84-1.84A4 4 0 0010.5 3.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        </svg>
        开始批量生成</button>
      <button v-if="running" class="btn-sm-ghost" @click="cancelBatch">取消</button>
    </div>

    <div v-if="batchMessage" class="batch-message">{{ batchMessage }}</div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const emit = defineEmits(['generate'])

const now = new Date()
const todayStr = now.toISOString().split('T')[0]
const sevenDaysAgo = new Date(now)
sevenDaysAgo.setDate(now.getDate() - 6)
const startStr = sevenDaysAgo.toISOString().split('T')[0]

const params = reactive({
  count: 7,
  dateStart: startStr,
  dateEnd: todayStr,
  timeStart: '07:00',
  timeEnd: '09:00',
  weatherMode: 'fixed',
  fixedWeather: '晴',
  tempMin: -5,
  tempMax: 30,
  humiMin: 20,
  humiMax: 90,
  kmMin: 2.2,
  kmMax: 3.9,
  speedMin: 4.3,
  speedMax: 5.2
})

const running = ref(false)
const batchMessage = ref('')

async function startBatch() {
  if (running.value) return
  running.value = true
  batchMessage.value = '正在批量生成...'
  // 父组件的 handleBatchGenerate 会自行管理状态和消息
  emit('generate', { ...params })
}

function cancelBatch() {
  batchMessage.value = '正在取消...'
  emit('cancel')
}

// 暴露给父组件的方法
function setMessage(msg) {
  batchMessage.value = msg
}
function setRunning(val) {
  running.value = val
}

defineExpose({ setMessage, setRunning })
</script>

<style scoped>
.batch-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary, #26c99a);
  margin: 0 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-light, #e8edf2);
}

.batch-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  flex-wrap: wrap;
}

.batch-row label {
  min-width: 60px;
  color: var(--text-secondary, #5a6577);
  flex-shrink: 0;
}

.input-xs {
  width: 56px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  outline: none;
  font-family: inherit;
}
.input-xs:focus {
  border-color: var(--color-primary, #26c99a);
}

.input-date {
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  font-family: inherit;
}

.select-sm {
  height: 28px;
  padding: 0 6px;
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  font-family: inherit;
}

.hint {
  font-size: 11px;
  color: var(--text-tertiary, #949eae);
}

.batch-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-sm {
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 4px;
  background: var(--color-primary, #26c99a);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.btn-sm:hover { opacity: 0.85; }
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-sm-ghost {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 4px;
  background: transparent;
  color: var(--color-error, #e74c3c);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}

.batch-message {
  padding: 8px 12px;
  border-radius: 4px;
  background: var(--color-primary-light, #f0faf6);
  color: var(--color-primary, #26c99a);
  font-size: 12px;
  text-align: center;
}
</style>
