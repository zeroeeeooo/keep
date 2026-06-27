<template>
  <div class="keep-form">
    <div class="form-section">
      <h4 class="section-title">用户信息</h4>

      <div class="field-row">
        <label>用户名：</label>
        <input v-model="form.username" @input="$emit('update')" type="text" class="input-sm" />
      </div>

      <div class="field-row">
        <label>标题：</label>
        <span class="label-hint">Keep•</span>
        <input v-model="form.keepTitle" @input="$emit('update')" type="text" class="input-sm" />
      </div>

      <div class="field-row">
        <label>头像：</label>
        <button class="btn-sm" @click="$refs.portraitInput.click()">选择图片</button>
        <button class="btn-sm-ghost" @click="$emit('reset-portrait')">恢复默认</button>
        <input ref="portraitInput" type="file" accept="image/*" style="display:none" @change="onPortraitSelect" />
      </div>
    </div>

    <div class="form-section">
      <h4 class="section-title">运动数据</h4>

      <div class="field-row">
        <label>公里：</label>
        <input v-model.number="form.miles" @input="$emit('update')" type="number" step="0.01" class="input-sm" />
      </div>

      <div class="field-row range-row">
        <label class="label-sm">范围：</label>
        <input v-model.number="form.kmMin" @input="$emit('update')" type="number" step="0.1" class="input-xs" />
        <span>~</span>
        <input v-model.number="form.kmMax" @input="$emit('update')" type="number" step="0.1" class="input-xs" />
      </div>

      <div class="field-row">
        <label>配速：</label>
        <input v-model.number="form.speeds" @input="$emit('update')" type="number" step="0.01" class="input-sm" />
      </div>

      <div class="field-row range-row">
        <label class="label-sm">范围：</label>
        <input v-model.number="form.speedMin" @input="$emit('update')" type="number" step="0.01" class="input-xs" />
        <span>~</span>
        <input v-model.number="form.speedMax" @input="$emit('update')" type="number" step="0.01" class="input-xs" />
      </div>

      <button class="btn-sm" @click="randomKmAndSpeed">随机公里/配速</button>
    </div>

    <div class="form-section">
      <h4 class="section-title">日期与时间</h4>

      <div class="field-row time-row">
        <input v-model.number="form.year" type="number" class="input-xs" />
        <span>年</span>
        <input v-model.number="form.month" type="number" min="1" max="12" class="input-xs" />
        <span>月</span>
        <input v-model.number="form.day" type="number" min="1" max="31" class="input-xs" />
        <span>日</span>
      </div>
      <div class="field-row time-row">
        <input v-model.number="form.hour" type="number" min="0" max="23" class="input-xs" />
        <span>时</span>
        <input v-model.number="form.minute" type="number" min="0" max="59" class="input-xs" />
        <span>分</span>
      </div>
    </div>

    <div class="form-section">
      <h4 class="section-title">天气</h4>

      <div class="field-row">
        <label>天气：</label>
        <select v-model="form.weatherType" @change="$emit('update')" class="select-sm">
          <option value="晴">晴</option>
          <option value="多云">多云</option>
          <option value="阴天">阴天</option>
        </select>
      </div>

      <div class="field-row">
        <label>温度：</label>
        <input v-model.number="form.temperature" type="number" class="input-xs" />
        <span>℃</span>
      </div>

      <div class="field-row">
        <label>湿度：</label>
        <input v-model.number="form.humidity" type="number" class="input-xs" />
        <span>%</span>
      </div>

      <div class="field-row">
        <label>AMap Key：</label>
        <input v-model="form.amapKey" type="text" class="input-sm" style="flex:1" placeholder="高德地图API Key" />
      </div>
      <button class="btn-sm" :disabled="!form.amapKey" @click="$emit('fetch-weather')">更新天气</button>
    </div>

    <div class="form-section">
      <h4 class="section-title">背景与轨迹</h4>

      <div class="field-row">
        <label>背景：</label>
        <select class="select-sm" v-model="selectedPreset" @change="$emit('preset-change', selectedPreset)">
          <option value="南体育场">南体育场</option>
          <option value="军工操场">军工操场</option>
          <option value="北体育场">北体育场</option>
        </select>
      </div>

      <div class="field-row">
        <label>自定义背景：</label>
        <button class="btn-sm" @click="$refs.bgInput.click()">选择图片</button>
        <button class="btn-sm-ghost" @click="$emit('reset-bg')">恢复默认</button>
        <input ref="bgInput" type="file" accept="image/*" style="display:none" @change="onBgSelect" />
      </div>

      <div class="field-row">
        <button class="btn-sm" @click="$emit('draw-track')">绘制轨迹</button>
      </div>

      <label class="checkbox-row">
        <input type="checkbox" v-model="form.autoDraw" @change="$emit('update')" />
        <span>加载时自动绘制路径</span>
      </label>

      <label class="checkbox-row">
        <input type="checkbox" v-model="form.colorChange" @change="onColorChange" />
        <span>路径变色</span>
      </label>

      <template v-if="form.colorChange">
        <div class="field-row">
          <label>变色概率：</label>
          <input v-model.number="form.bsProb" type="number" step="0.01" class="input-xs" />
        </div>
        <div class="field-row">
          <label>变色步长：</label>
          <input v-model.number="form.bsRangeMin" type="number" class="input-xs" />
          <span>~</span>
          <input v-model.number="form.bsRangeMax" type="number" class="input-xs" />
        </div>
      </template>
    </div>

    <div class="form-section">
      <h4 class="section-title">输出设置</h4>
      <div class="field-row">
        <label>图片宽度：</label>
        <input v-model.number="form.savePicWidth" type="number" class="input-sm" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  initialPreset: { type: String, default: '南体育场' }
})

const emit = defineEmits([
  'update',
  'reset-portrait',
  'reset-bg',
  'draw-track',
  'fetch-weather',
  'portrait-select',
  'bg-select',
  'random-km',
  'preset-change'
])

const selectedPreset = ref(props.initialPreset)

function onPortraitSelect(e) {
  const file = e.target.files?.[0]
  if (file) emit('portrait-select', file)
  e.target.value = ''
}

function onBgSelect(e) {
  const file = e.target.files?.[0]
  if (file) emit('bg-select', file)
  e.target.value = ''
}

function onColorChange() {
  emit('update')
}

function randomKmAndSpeed() {
  emit('random-km')
  emit('update')
}
</script>

<style scoped>
.keep-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  padding: 4px 0;
}

.form-section {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: var(--radius-md, 8px);
  padding: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary, #26c99a);
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-light, #e8edf2);
}

.field-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.field-row label {
  font-size: 12px;
  color: var(--text-secondary, #5a6577);
  min-width: 65px;
  flex-shrink: 0;
}

.label-sm {
  min-width: 40px !important;
  font-size: 11px !important;
}

.label-hint {
  font-size: 12px;
  color: var(--text-tertiary, #949eae);
}

.input-sm, .select-sm {
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  background: var(--bg-input, #fafafa);
  font-family: inherit;
}
.input-sm:focus, .select-sm:focus {
  border-color: var(--color-primary, #26c99a);
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
  background: var(--bg-input, #fafafa);
  font-family: inherit;
}
.input-xs:focus {
  border-color: var(--color-primary, #26c99a);
}

.select-sm {
  min-width: 80px;
}

.btn-sm {
  height: 30px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background: var(--color-primary, #26c99a);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.btn-sm:hover { opacity: 0.85; }
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-sm-ghost {
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary, #5a6577);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.btn-sm-ghost:hover {
  border-color: var(--color-primary, #26c99a);
  color: var(--color-primary, #26c99a);
}

.range-row {
  padding-left: 65px;
}

.time-row {
  gap: 4px;
}
.time-row span {
  font-size: 12px;
  color: var(--text-tertiary, #949eae);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #5a6577);
  cursor: pointer;
  margin-bottom: 4px;
}
.checkbox-row input {
  width: 14px;
  height: 14px;
}
</style>
