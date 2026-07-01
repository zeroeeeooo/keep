<template>
  <div class="keep-page">
    <header class="keep-header">
      <router-link v-if="loggedIn" to="/home" class="keep-back">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回首页</span>
      </router-link>
      <span v-else class="keep-spacer"></span>

      <span class="keep-title-text">KEE<span class="keep-highlight">Pro</span></span>

      <div class="keep-right">
        <router-link v-if="!loggedIn" to="/login" class="login-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 14.5c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <span>登录</span>
        </router-link>
      </div>
    </header>

    <div class="keep-body">
      <!-- 左侧：预览区域 -->
      <div class="keep-preview-area">
        <KeepCanvas
          :form="keep.form"
          :milesDisplay="keep.computedData.value.milesDisplay"
          :speedDisplay="keep.computedData.value.speedDisplay"
          :costTime="keep.computedData.value.costTime"
          :calorie="keep.computedData.value.calorie"
          :dateDisplay="keep.computedData.value.dateDisplay"
          :timeDisplay="keep.computedData.value.timeDisplay"
          :tempDisplay="keep.computedData.value.tempDisplay"
          :humiDisplay="keep.computedData.value.humiDisplay"
          :portraitSrc="portraitSrc"
          :bgSrc="bgSrc"
          :weatherIcon="weatherIcon"
        />
      </div>

      <!-- 右侧：控制面板 -->
      <div class="keep-controls">
        <KeepActions
          :message="message"
          @download="handleDownload"
          @preview="handlePreview"
          @refresh-track="handleRefreshTrack"
          @save-settings="handleSaveSettings"
          @reset="handleReset"
        />
        <KeepForm
          :form="keep.form"
          :initialPreset="selectedBgPreset.value"
          @update="handleUpdate"
          @reset-portrait="handleResetPortrait"
          @reset-bg="handleResetBg"
          @draw-track="handleDrawTrack"
          @fetch-weather="handleFetchWeather"
          @portrait-select="handlePortraitSelect"
          @bg-select="handleBgSelect"
          @random-km="keep.randomKmAndSpeed"
          @preset-change="handlePresetChange"
        />

        <!-- 批量生成 -->
        <div class="form-section">
          <KeepBatchPanel
            :form="keep.form"
            @generate="handleBatchGenerate"
          />
        </div>
      </div>
    </div>

    <!-- 全屏预览 -->
    <KeepPreview
      :visible="showPreview"
      :dataUrl="previewDataUrl"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/authStore.js'
import { useKeepData } from './composables/useKeepData.js'
import { drawTrackOnBg, loadLocalTrackData } from './composables/useKeepDraw.js'
import KeepCanvas from './components/KeepCanvas.vue'
import KeepForm from './components/KeepForm.vue'
import KeepActions from './components/KeepActions.vue'
import KeepBatchPanel from './components/KeepBatchPanel.vue'
import KeepPreview from './components/KeepPreview.vue'

// 图片导入 (Vite 静态资源，自动添加内容哈希)
import defaultPortrait from '../../assets/images/default_portrait.png'
import weather1 from '../../assets/images/weather1.png'
import weather2 from '../../assets/images/weather2.png'
import weather3 from '../../assets/images/weather3.png'
import bg1_1 from '../../assets/images/bg1_1.png'
import bg1_empty2 from '../../assets/images/bg1_empty2.png'
import bg2_empty from '../../assets/images/bg2_empty.png'
import bg3_empty from '../../assets/images/bg3_empty.png'

const auth = useAuthStore()
const loggedIn = computed(() => auth.loggedIn)

const keep = useKeepData()

const message = ref('')
const showPreview = ref(false)
const previewDataUrl = ref('')

// 图片源 (Vue 响应式绑定会自动更新 KeepCanvas)
const portraitSrc = ref(defaultPortrait)
const bgSrc = ref('')         // 当前显示的背景（可能包含轨迹）
const originalBgSrc = ref('') // 纯背景（不含轨迹），用于重绘轨迹时作为底图
const weatherIcon = ref(weather1)

// 预设背景映射 (bg = 显示用, empty = 绘制轨迹用底图)
const bgPresets = {
  '南体育场': { bg: bg1_1, empty: bg1_empty2 },
  '军工操场': { bg: bg2_empty, empty: bg2_empty },
  '北体育场': { bg: bg3_empty, empty: bg3_empty }
}
const selectedBgPreset = ref('南体育场')

// 初始化
onMounted(async () => {
  await keep.loadSavedData()
  initWeatherIcon()
  // 设置初始背景（已有预设路径，不自动绘制轨迹）
  const preset = bgPresets[selectedBgPreset.value]
  const initBg = (preset?.bg) || ''
  originalBgSrc.value = initBg
  bgSrc.value = initBg
})

function initWeatherIcon() {
  const map = { '晴': weather1, '多云': weather2, '阴天': weather3 }
  weatherIcon.value = map[keep.form.weatherType] || weather1
}

// 天气类型变化时自动更新图标
watch(() => keep.form.weatherType, initWeatherIcon)

function showMessage(msg) {
  message.value = msg
  setTimeout(() => { message.value = '' }, 3000)
}

// ---- 表单更新（无需手动操作，Vue 自动响应式更新模板）----
function handleUpdate() {
  // Vue 的响应式系统会自动更新 KeepCanvas 模板
  // 此函数保留作为 @update 事件的回调
}

// ---- 头像 ----
async function handlePortraitSelect(file) {
  const dataUrl = await keep.fileToBase64(file)
  portraitSrc.value = dataUrl
  keep.images.portrait = dataUrl
}

function handleResetPortrait() {
  portraitSrc.value = defaultPortrait
  keep.images.portrait = ''
}

// ---- 背景 ----
async function handleBgSelect(file) {
  const dataUrl = await keep.fileToBase64(file)
  originalBgSrc.value = dataUrl
  bgSrc.value = dataUrl
  keep.images.bgImg = dataUrl
}

function handleResetBg() {
  const preset = bgPresets[selectedBgPreset.value]
  const cleanBg = preset?.bg || ''
  originalBgSrc.value = cleanBg
  bgSrc.value = cleanBg
  keep.images.bgImg = ''
}

// 切换背景预设
function handlePresetChange(presetName) {
  selectedBgPreset.value = presetName
  const preset = bgPresets[presetName]
  if (preset) {
    originalBgSrc.value = preset.bg
    bgSrc.value = preset.bg
  }
}

// ---- 天气 ----
async function handleFetchWeather() {
  const key = keep.form.amapKey
  if (!key) { showMessage('请先输入高德地图API Key'); return }
  try {
    const weather = await loadAMapWeather(key)
    keep.form.temperature = parseInt(weather.temperature)
    keep.form.humidity = parseInt(weather.humidity)
    keep.form.weatherType = weather.weather
    weatherIcon.value = weather.weatherImage
    showMessage(`天气更新成功！${weather.weather} ${weather.temperature}℃ ${weather.humidity}%`)
  } catch (err) {
    showMessage('天气获取失败：' + err.message)
  }
}

function loadAMapWeather(apiKey) {
  return new Promise((resolve, reject) => {
    if (!apiKey) { reject(new Error('请提供高德地图API Key')); return }
    const url = `https://restapi.amap.com/v3/weather/weatherInfo?city=230100&key=${apiKey}`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.status !== '1' || !data.lives || !data.lives.length) throw new Error('天气数据格式错误')
        const info = data.lives[0]
        let img = weather3
        if (info.weather === '晴') img = weather1
        else if (info.weather === '多云') img = weather2
        resolve({ temperature: info.temperature, humidity: info.humidity, weather: info.weather, weatherImage: img })
      })
      .catch(reject)
  })
}

// ---- 轨迹绘制 ----
async function drawTrack() {
  // 有预设空底图时用空底图（避免在已有路径上重叠绘制）
  const preset = bgPresets[selectedBgPreset.value]
  const drawBg = (preset?.empty) || originalBgSrc.value
  if (!drawBg) {
    showMessage('请先设置背景图片')
    return
  }
  try {
    showMessage('正在绘制轨迹...')
    const dataUrl = await drawTrackOnBg(drawBg, {
      width: 360,
      height: 719,
      lineWidth: 5,
      colorChange: keep.form.colorChange,
      bsProb: keep.form.bsProb,
      bsRangeMin: keep.form.bsRangeMin,
      bsRangeMax: keep.form.bsRangeMax
    })
    bgSrc.value = dataUrl
    keep.images.bgImg = dataUrl
    showMessage('轨迹绘制完成！')
  } catch (err) {
    console.error('[track] 绘制失败:', err)
    showMessage('轨迹绘制失败: ' + err.message)
  }
}

function handleDrawTrack() {
  drawTrack()
}

function handleRefreshTrack() {
  drawTrack()
}

function hideMessage() {
  message.value = ''
}

// ---- 保存设置 ----
async function handleSaveSettings() {
  await keep.saveAllData()
  showMessage('用户数据已永久保存。\n（你不换浏览器的话）')
}

// ---- 重置 ----
async function handleReset() {
  await keep.resetAllData()
  portraitSrc.value = defaultPortrait
  const preset = bgPresets[selectedBgPreset.value]
  const cleanBg = preset?.bg || ''
  originalBgSrc.value = cleanBg
  bgSrc.value = cleanBg
  initWeatherIcon()
  showMessage('所有数据已成功清除')
}

// ---- 下载 ----
async function handleDownload() {
  const el = document.getElementById('new-Img')
  if (!el) return
  try {
    // 等待字体和图片加载完成
    await document.fonts.ready
    await nextTick()
    await delay(300)

    const { default: html2canvas } = await import('html2canvas')
    const bufCanvas = document.createElement('canvas')
    const w = keep.form.savePicWidth
    bufCanvas.width = w
    bufCanvas.height = Math.floor(w * 2157 / 1080)
    const scale = w / el.getBoundingClientRect().width
    const canvas = await html2canvas(el, {
      canvas: bufCanvas,
      useCORS: true,
      logging: false,
      height: bufCanvas.height,
      width: bufCanvas.width,
      scale
    })
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `keep${keep.form.month}月${keep.form.day}日跑步打卡.png`
    link.href = dataUrl
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showMessage('图片已保存！')
  } catch (err) {
    console.error('截图生成失败:', err)
    showMessage('截图生成失败')
  }
}

// ---- 预览 ----
async function handlePreview() {
  const el = document.getElementById('new-Img')
  if (!el) return
  try {
    await document.fonts.ready
    await nextTick()
    await delay(300)

    const { default: html2canvas } = await import('html2canvas')
    const bufCanvas = document.createElement('canvas')
    const w = keep.form.savePicWidth
    bufCanvas.width = w
    bufCanvas.height = Math.floor(w * 2157 / 1080)
    const scale = w / el.getBoundingClientRect().width
    const canvas = await html2canvas(el, {
      canvas: bufCanvas,
      useCORS: true,
      logging: false,
      height: bufCanvas.height,
      width: bufCanvas.width,
      scale
    })
    previewDataUrl.value = canvas.toDataURL('image/png')
    showPreview.value = true
  } catch (err) {
    console.error('截图生成失败:', err)
    showMessage('截图生成失败')
  }
}

// ---- 批量生成 ----
let batchCancelled = false

async function handleBatchGenerate(params) {
  batchCancelled = false
  const { dateStart, dateEnd, timeStart, timeEnd, count,
          weatherMode, fixedWeather, tempMin, tempMax,
          humiMin, humiMax, kmMin, kmMax, speedMin, speedMax } = params

  if (!dateStart || !dateEnd) { showMessage('请填写起始日期和结束日期'); return }

  const startDate = new Date(dateStart)
  const endDate = new Date(dateEnd)
  if (endDate < startDate) { showMessage('结束日期不能早于起始日期'); return }

  const [tsH, tsM] = timeStart.split(':').map(Number)
  const [teH, teM] = timeEnd.split(':').map(Number)
  if (isNaN(tsH) || isNaN(tsM) || isNaN(teH) || isNaN(teM)) { showMessage('时间格式不正确'); return }
  const startMinutes = tsH * 60 + tsM
  const endMinutes = teH * 60 + teM
  if (endMinutes < startMinutes) { showMessage('结束时间不能早于起始时间'); return }

  const weatherOptions = ['晴', '多云', '阴天']
  const dateDiffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // 预加载 html2canvas 和轨迹数据
  const { default: html2canvas } = await import('html2canvas')
  await loadLocalTrackData()

  for (let i = 0; i < count; i++) {
    if (batchCancelled) break
    showMessage(`正在生成: ${i + 1} / ${count} ...`)

    // 日期（均匀分布）
    const progress = count > 1 ? i / (count - 1) : 0.5
    const dayOffset = Math.floor(progress * (dateDiffDays - 1))
    const curr = new Date(startDate)
    curr.setDate(startDate.getDate() + dayOffset)
    keep.form.year = curr.getFullYear()
    keep.form.month = curr.getMonth() + 1
    keep.form.day = curr.getDate()

    // 时间（随机）
    const minuteOffset = Math.floor(Math.random() * (endMinutes - startMinutes + 1))
    const totalMinutes = startMinutes + minuteOffset
    keep.form.hour = Math.floor(totalMinutes / 60)
    keep.form.minute = totalMinutes % 60

    // 天气
    if (weatherMode === 'fixed') {
      keep.form.weatherType = fixedWeather
    } else {
      keep.form.weatherType = weatherOptions[Math.floor(Math.random() * weatherOptions.length)]
    }
    const wMap = { '晴': weather1, '多云': weather2, '阴天': weather3 }
    weatherIcon.value = wMap[keep.form.weatherType] || weather1

    // 温度
    const tMin = tempMin ?? -5
    const tMax = tempMax ?? 30
    keep.form.temperature = Math.floor(tMin + Math.random() * (tMax - tMin + 1))

    // 湿度
    const hMin = humiMin ?? 20
    const hMax = humiMax ?? 90
    keep.form.humidity = Math.floor(hMin + Math.random() * (hMax - hMin + 1))

    // 公里 & 配速
    const kmLo = kmMin ?? 2.2
    const kmHi = kmMax ?? 3.9
    keep.form.miles = Math.round((kmLo + Math.random() * (kmHi - kmLo)) * 100) / 100
    const spLo = speedMin ?? 4.3
    const spHi = speedMax ?? 5.2
    keep.form.speeds = Math.round((spLo + Math.random() * (spHi - spLo)) * 100) / 100

    // 随机轨迹（有背景时重新绘制）
    const batchPreset = bgPresets[selectedBgPreset.value]
    const batchDrawBg = (batchPreset?.empty) || originalBgSrc.value
    if (batchDrawBg) {
      try {
        const newTrack = await drawTrackOnBg(batchDrawBg, {
          width: 360, height: 719,
          colorChange: keep.form.colorChange,
          bsProb: keep.form.bsProb,
          bsRangeMin: keep.form.bsRangeMin,
          bsRangeMax: keep.form.bsRangeMax
        })
        bgSrc.value = newTrack
      } catch (e) {
        console.warn('批量第', i + 1, '张轨迹绘制失败:', e)
      }
      await delay(200)
    }

    // 渲染（Vue 响应式自动更新预览）
    await nextTick()
    await delay(200)

    // 生成截图
    const el = document.getElementById('new-Img')
    if (!el) continue
    try {
      await document.fonts.ready
      await delay(300)
      const bufCanvas = document.createElement('canvas')
      const w = keep.form.savePicWidth || 1080
      bufCanvas.width = w
      bufCanvas.height = Math.floor(w * 2157 / 1080)
      const scale = w / el.getBoundingClientRect().width
      const canvas = await html2canvas(el, {
        canvas: bufCanvas, useCORS: true, logging: false,
        height: bufCanvas.height, width: bufCanvas.width, scale
      })
      const link = document.createElement('a')
      link.download = `keep${keep.form.month}月${keep.form.day}日跑步打卡.png`
      link.href = canvas.toDataURL('image/png')
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('批量第', i + 1, '张生成失败:', err)
    }
    await delay(150)
  }

  if (!batchCancelled) {
    showMessage(`批量生成完成！共 ${count} 张图片。`)
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}
</script>

<style scoped>
.keep-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page, #f5f7fa);
}

.keep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: var(--bg-card, #fff);
  border-bottom: 1px solid var(--border-light, #e8edf2);
  flex-shrink: 0;
  z-index: 10;
}

.keep-back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary, #5a6577);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.15s;
}
.keep-back:hover {
  background: var(--bg-card-hover, #f8fafc);
  color: var(--text-primary, #1a1a2e);
  text-decoration: none;
}

.keep-spacer { width: 90px; }
.keep-right { width: 90px; display: flex; justify-content: flex-end; }

.keep-title-text {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  font-family: var(--font-display, 'DINCond-Bold', Arial Black, sans-serif);
  color: var(--text-primary, #1a1a2e);
}

.keep-highlight { color: var(--color-primary, #26c99a); }

.login-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-tertiary, #949eae);
  text-decoration: none;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.15s;
}
.login-link:hover {
  background: var(--bg-card-hover, #f8fafc);
  color: var(--color-primary, #26c99a);
  text-decoration: none;
}

.keep-body {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 16px;
  overflow: hidden;
}

.keep-preview-area {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
}

.keep-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  min-width: 0;
  max-width: 420px;
}

/* 预览弹窗 */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.form-section {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-light, #e8edf2);
  border-radius: var(--radius-md, 8px);
  padding: 12px;
}
</style>
