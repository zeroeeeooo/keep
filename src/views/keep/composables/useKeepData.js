/**
 * useKeepData — Keep 截图生成器核心数据管理
 *
 * 替代 public/js/init.js + public/js/indexedDB.js
 * 集中管理所有表单状态与 IndexedDB 持久化
 */
import { reactive, computed, toRefs } from 'vue'

const STORE_NAME = 'keep_settings'

// ---- IndexedDB 工具 ----
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('KeepDatabase', 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e)
  })
}

async function loadFromDB(key) {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => resolve(null)
  })
}

async function saveToDB(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put(data)
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e)
  })
}

async function clearDB() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).clear()
    req.onsuccess = () => resolve()
    req.onerror = (e) => reject(e)
  })
}

// ---- Store data as base64 for IndexedDB ----
async function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

// ========================

/**
 * 创建 Keep 数据状态
 */
export function useKeepData() {
  // ---- 表单数据 ----
  const form = reactive({
    username: '',
    keepTitle: '哈尔滨工程大学南田径场',
    miles: 2.8,
    speeds: 4.8,
    kmMin: 2.2,
    kmMax: 3.9,
    speedMin: 4.3,
    speedMax: 5.2,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    temperature: 12,
    humidity: 23,
    amapKey: '',
    savePicWidth: 1080,
    autoDraw: true,
    colorChange: true,
    bsProb: 0.08,
    bsRangeMin: 30,
    bsRangeMax: 40,
    weatherType: '晴',
    nowLocation: '南岗区'
  })

  // ---- 图片数据 ----
  const images = reactive({
    portrait: '',          // 头像 data URL
    portraitFile: null,    // 头像文件
    bgImg: '',             // 背景图片 URL
    bgImgFile: null,       // 背景图片文件
    bgImgSrc: []           // 预设背景图
  })

  // ---- 计算属性 ----
  const computedData = computed(() => {
    const m = form.miles
    const s = form.speeds
    const milesInt = Math.floor(m)
    const milesDec = Math.round((m - milesInt) * 100)
    const speedsInt = Math.floor(s)
    const speedsDec = Math.round((s - speedsInt) * 100)
    const times = (speedsDec / 60 + speedsInt) * m
    const timeInc = Math.trunc(times)
    const costHour = Math.floor(timeInc / 60)
    const costMin = timeInc % 60
    const costSec = Math.round((times - timeInc) * 60)
    const calorie = Math.round(69 * m * 1.036)

    return {
      milesDisplay: `${milesInt}.${String(milesDec).padStart(2, '0')}`,
      speedDisplay: `${String(speedsInt).padStart(2, '0')}'${String(speedsDec).padStart(2, '0')}"`,
      costTime: `${String(costHour).padStart(2, '0')}:${String(costMin).padStart(2, '0')}:${String(costSec).padStart(2, '0')}`,
      calorie,
      dateDisplay: `${form.year}/${String(form.month).padStart(2, '0')}/${String(form.day).padStart(2, '0')}`,
      timeDisplay: `${String(form.hour).padStart(2, '0')}:${String(form.minute).padStart(2, '0')}`,
      tempDisplay: `${form.temperature}℃`,
      humiDisplay: `${form.humidity}%`
    }
  })

  // ---- 随机生成公里和配速 ----
  function randomKmAndSpeed() {
    const km = form.kmMin + Math.random() * (form.kmMax - form.kmMin)
    const sp = form.speedMin + Math.random() * (form.speedMax - form.speedMin)
    form.miles = Math.round(km * 100) / 100
    form.speeds = Math.round(sp * 100) / 100
  }

  // ---- 加载 IndexedDB 数据 ----
  async function loadSavedData() {
    const info = await loadFromDB('keep_user_info')
    if (info) {
      Object.assign(form, {
        username: info.username || form.username,
        keepTitle: info.keepTitle || form.keepTitle,
        kmMin: info.kmMin ?? 2.2,
        kmMax: info.kmMax ?? 3.9,
        speedMin: info.speedMin ?? 4.3,
        speedMax: info.speedMax ?? 5.2,
        colorChange: info.colorChange ?? true,
        bsProb: info.bsProb ?? 0.08,
        bsRangeMin: info.bsRangeMin ?? 30,
        bsRangeMax: info.bsRangeMax ?? 40,
        savePicWidth: info.savePicWidth ?? 1080,
        autoDraw: info.autoDraw ?? true,
        amapKey: info.amapKey || ''
      })
    }
    randomKmAndSpeed()

    // 加载头像
    const pt = await loadFromDB('keep_portrait')
    if (pt) images.portrait = pt.data

    // 加载背景
    const bg = await loadFromDB('keep_bgimg')
    if (bg) images.bgImg = bg.data
  }

  // ---- 保存到 IndexedDB ----
  async function saveAllData() {
    await saveToDB({
      id: 'keep_user_info',
      username: form.username,
      keepTitle: form.keepTitle,
      kmMin: form.kmMin,
      kmMax: form.kmMax,
      speedMin: form.speedMin,
      speedMax: form.speedMax,
      colorChange: form.colorChange,
      bsProb: form.bsProb,
      bsRangeMin: form.bsRangeMin,
      bsRangeMax: form.bsRangeMax,
      savePicWidth: form.savePicWidth,
      autoDraw: form.autoDraw,
      amapKey: form.amapKey
    })
    if (images.portrait) {
      await saveToDB({ id: 'keep_portrait', data: images.portrait })
    }
    if (images.bgImg) {
      await saveToDB({ id: 'keep_bgimg', data: images.bgImg })
    }
  }

  async function resetAllData() {
    await clearDB()
    Object.assign(form, {
      username: '',
      keepTitle: '哈尔滨工程大学南田径场',
      miles: 2.8, speeds: 4.8,
      kmMin: 2.2, kmMax: 3.9,
      speedMin: 4.3, speedMax: 5.2,
      temperature: 12, humidity: 23,
      bsProb: 0.08, bsRangeMin: 30, bsRangeMax: 40,
      savePicWidth: 1080,
      autoDraw: true, colorChange: true,
      amapKey: ''
    })
    images.portrait = ''
    images.bgImg = ''
    randomKmAndSpeed()
  }

  return {
    form,
    images,
    computedData,
    randomKmAndSpeed,
    loadSavedData,
    saveAllData,
    resetAllData,
    fileToBase64
  }
}
