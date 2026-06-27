<template>
  <div id="new-Img" class="new-img">
    <!-- 背景图 -->
    <div class="bgimgwrap">
      <img ref="bgImgRef" :src="bgSrc" class="innerbgimg" @load="adaptBgSize" />
    </div>
    <!-- 全尺寸 Keep UI 覆盖层 (半透明框架) -->
    <img :src="guiImgSrc" id="gui-img" />
    <!-- 头像 -->
    <div class="portrait-wrap">
      <img ref="portraitRef" :src="portraitSrc" class="portrait" @load="adaptPortraitSize" />
    </div>
    <!-- 天气图标 -->
    <div class="weather-imgwrap">
      <img :src="weatherIcon" class="weather" />
    </div>
    <!-- 文本 -->
    <span class="keep-title">{{ form.keepTitle || '' }}</span>
    <span class="username">{{ form.username || '' }}</span>
    <span class="mile">
      <span class="mile-data">{{ milesDisplay }}</span>
      <span class="gongli">公里</span>
    </span>
    <span class="datetime date">{{ dateDisplay }}</span>
    <span class="datetime time">{{ timeDisplay }}</span>
    <span class="env temperature">{{ tempDisplay }}</span>
    <span class="env humidity">{{ humiDisplay }}</span>
    <span class="speed-time speed">{{ speedDisplay }}</span>
    <span class="speed-time cost-time">{{ costTime }}</span>
    <span class="speed-time calorie">{{ calorie }}</span>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  milesDisplay: { type: String, default: '0.00' },
  speedDisplay: { type: String, default: "00'00" },
  costTime: { type: String, default: '00:00:00' },
  calorie: { type: [String, Number], default: '0' },
  dateDisplay: { type: String, default: '0000/00/00' },
  timeDisplay: { type: String, default: '00:00' },
  tempDisplay: { type: String, default: '0℃' },
  humiDisplay: { type: String, default: '0%' },
  portraitSrc: { type: String, default: '' },
  bgSrc: { type: String, default: '' },
  weatherIcon: { type: String, default: '' }
})

const bgImgRef = ref(null)
const portraitRef = ref(null)

const guiImgSrc = computed(() => 'images/1.png?_=' + Date.now())

const bgWidth = 360
const bgHeight = 719
const ptWidth = 40
const ptHeight = 40

function adaptBgSize() {
  const img = bgImgRef.value
  if (!img || !img.naturalWidth) return
  if (img.naturalWidth / img.naturalHeight > 0.501) {
    img.style.height = bgHeight + 'px'
    img.style.width = Math.floor(img.naturalWidth * bgHeight / img.naturalHeight) + 'px'
  } else {
    img.style.height = Math.floor(img.naturalHeight * bgWidth / img.naturalWidth) + 'px'
    img.style.width = bgWidth + 'px'
  }
}

function adaptPortraitSize() {
  const img = portraitRef.value
  if (!img || !img.naturalWidth) return
  if (img.naturalWidth / img.naturalHeight > 1) {
    img.style.height = ptHeight + 'px'
    img.style.width = Math.floor(img.naturalWidth * ptHeight / img.naturalHeight) + 'px'
  } else {
    img.style.height = Math.floor(img.naturalHeight * ptWidth / img.naturalWidth) + 'px'
    img.style.width = ptWidth + 'px'
  }
}

watch(() => props.bgSrc, () => nextTick(adaptBgSize))
watch(() => props.portraitSrc, () => nextTick(adaptPortraitSize))
onMounted(() => nextTick(() => { adaptBgSize(); adaptPortraitSize() }))
</script>

<style>
/* 截图画布 — 全局非 scoped，确保 html2canvas 正确截取 */
.new-img {
  position: relative;
  width: 360px;
  height: 719px;
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  flex-shrink: 0;
}

.new-img .bgimgwrap {
  position: absolute;
  width: 360px;
  height: 719px;
  display: flex;
  overflow: hidden;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.new-img .innerbgimg {
  display: block;
  max-width: none;
}

.new-img #gui-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 360px;
  height: 719px;
  vertical-align: top;
  pointer-events: none;
  z-index: 1;
}

/* 头像 - 右上区域 */
.new-img .portrait-wrap {
  position: absolute;
  top: 335px;
  left: 284px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.new-img .portrait {
  width: 40px;
  height: 40px;
  display: block;
  object-fit: cover;
}

/* 天气图标 - 右上日期下方 */
.new-img .weather-imgwrap {
  position: absolute;
  top: 426.5px;
  left: 238px;
  width: 14px;
  height: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.new-img .weather {
  width: 14px;
  height: 14px;
  display: block;
}

/* 总：所有 span 绝对定位 */
.new-img > span {
  position: absolute;
}

/* 运动标题 - 左上 */
.new-img .keep-title {
  top: 361px;
  left: 30px;
  font-size: 12px;
  color: #a2a2a2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 16px;
  z-index: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

/* 用户名 - 右上 */
.new-img .username {
  top: 385px;
  right: 34px;
  font-size: 13px;
  color: #a2a2a2;
  z-index: 2;
  white-space: nowrap;
}

/* 公里数 - 左下大号显示 */
.new-img .mile {
  top: 387px;
  left: 32px;
  z-index: 2;
  white-space: nowrap;
}

.new-img .mile-data {
  font-family: 'keeprun', 'DINCond-Bold', Arial Black, sans-serif;
  font-size: 46px;
  color: #57525d;
  letter-spacing: -1px;
  display: inline-block;
  line-height: 1;
}

.new-img .gongli {
  font-size: 11px;
  color: #57525d;
  font-family: 'keeprun', 'DINCond-Bold', Arial Black, sans-serif;
  margin-left: 5px;
  position: relative;
  bottom: 6px;
}

/* 日期时间 - 右上 */
.new-img .datetime {
  font-size: 13px;
  color: #a2a2a2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  z-index: 2;
}
.new-img .date  { top: 407px; left: 222px; }
.new-img .time  { top: 407px; left: 296px; }

/* 温湿度 - 右上 */
.new-img .env {
  font-size: 13px;
  color: #a2a2a2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: -0.5px;
  z-index: 2;
}
.new-img .temperature { top: 424px; left: 252px; }
.new-img .humidity    { top: 424px; left: 303px; }

/* 配速/用时/卡路里 - 底部 */
.new-img .speed-time {
  font-size: 24px;
  color: #58505b;
  font-family: 'keeprun', 'DINCond-Bold', Arial Black, sans-serif;
  z-index: 2;
}
.new-img .speed     { top: 480px; left: 32px; }
.new-img .cost-time { top: 480px; left: 140px; }
.new-img .calorie   { top: 480px; right: 32px; }
</style>
