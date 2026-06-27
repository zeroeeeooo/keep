/**
 * useKeepDraw — 运动轨迹绘制 composable
 *
 * 在背景图上绘制运动轨迹，返回 dataURL
 * 轨迹坐标来自 API 或本地 drawingActions.json，以 300×600 为帧坐标系
 */

let _cachedTrackData = null

export async function loadLocalTrackData() {
  if (_cachedTrackData) return _cachedTrackData
  try {
    const resp = await fetch('drawingActions.json')
    if (resp.ok) {
      _cachedTrackData = await resp.json()
      return _cachedTrackData
    }
  } catch (e) {
    console.warn('[track] 加载本地轨迹数据失败:', e)
  }
  return null
}

async function fetchTrackData(useLocal = true) {
  if (useLocal) {
    const local = await loadLocalTrackData()
    if (local) return local
  }
  try {
    const resp = await fetch('https://tool.joytion.cn/generate-track')
    if (resp.ok) {
      _cachedTrackData = await resp.json()
      return _cachedTrackData
    }
  } catch (e) {
    console.warn('[track] API 获取失败:', e)
  }
  return generateRandomTrack()
}

function generateRandomTrack() {
  const points = []
  const w = 300, h = 600
  const startX = 30 + Math.random() * 60
  const startY = h - 60 - Math.random() * 30
  points.push({ action: 'down', x: startX, y: startY })
  let x = startX, y = startY
  const count = 50 + Math.floor(Math.random() * 60)
  for (let i = 0; i < count; i++) {
    x += 2 + Math.random() * 4
    y -= 1 + Math.random() * 3
    if (Math.random() < 0.2) x += (Math.random() - 0.5) * 15
    if (Math.random() < 0.15) y += (Math.random() - 0.5) * 8
    x = Math.max(20, Math.min(w - 20, x))
    y = Math.max(50, Math.min(h - 30, y))
    points.push({ action: 'move', x, y })
  }
  points.push({ action: 'up', x, y })
  return points
}

export function perturbTrackData(data) {
  if (!data || data.length === 0) return data
  const lastIdx = data.length - 1
  const angle = Math.random() * Math.PI * 2
  const startDist = 20 + Math.random() * 30
  const endDist = 20 + Math.random() * 30
  const sx = Math.cos(angle) * startDist
  const sy = Math.sin(angle) * startDist * 0.6
  const ex = Math.cos(angle) * endDist
  const ey = Math.sin(angle) * endDist * 0.6
  return data.map((item, i) => ({
    action: item.action,
    x: item.x + (i === 0 ? sx : i === lastIdx ? ex : (Math.random() - 0.5) * 1.5),
    y: item.y + (i === 0 ? sy : i === lastIdx ? ey : (Math.random() - 0.5) * 1.0)
  }))
}

/**
 * 在背景上绘制轨迹
 *
 * 流程：先以图片自然分辨率绘制完整轨迹，再缩放到 display 尺寸返回
 */
export async function drawTrackOnBg(bgSrc, options = {}) {
  const {
    colorChange = true,
    bsProb = 0.08,
    bsRangeMin = 30,
    bsRangeMax = 40
  } = options

  // 加载背景图片
  const bgImg = await loadImage(bgSrc)
  const natW = bgImg.naturalWidth
  const natH = bgImg.naturalHeight

  // 以自然分辨率创建画布
  const canvas = document.createElement('canvas')
  canvas.width = natW
  canvas.height = natH
  const ctx = canvas.getContext('2d')

  // 绘制背景
  ctx.drawImage(bgImg, 0, 0, natW, natH)

  // 计算缩放：原始代码使用 frameWidth=300, frameHeight=600 作为帧坐标系
  // draw_suofang 由图片尺寸相对于帧大小决定
  const frameW = 300
  const frameH = 600
  const suofang = natW / frameW  // 或 natH / frameH，两者近似

  // 原始硬编码偏移（在自然像素空间中的像素值）
  const offsetX = -32
  const offsetY = 38

  // 获取轨迹数据
  const trackData = await fetchTrackData(true)
  const lastIdx = trackData.length - 1

  // 随机偏移（每次不同轨迹）
  const angle = Math.random() * Math.PI * 2
  const startDist = 20 + Math.random() * 30
  const endDist = 20 + Math.random() * 30
  const startDx = Math.cos(angle) * startDist
  const startDy = Math.sin(angle) * startDist * 0.6
  const endDx = Math.cos(angle) * endDist
  const endDy = Math.sin(angle) * endDist * 0.6

  // 加载起点终点图标
  const startImg = await loadImage('images/start.png')
  const endImg = await loadImage('images/end.png')

  // 绘制轨迹
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = 5 * suofang

  let drawStarted = false
  let startX, startY
  let bsState = { isBs: false, bsNow: 0, bsRange: 0, rMax: 0, gMax: 0, bMax: 0 }

  for (let i = 0; i < trackData.length; i++) {
    const item = trackData[i]
    let { action, x, y } = item

    // 帧坐标系 → 自然像素坐标系
    x = x * suofang + offsetX
    y = y * suofang + offsetY

    // 随机偏移使每次不同
    if (i === 0 && action === 'down') { x += startDx; y += startDy }
    else if (i === lastIdx) { x += endDx; y += endDy }
    else { x += (Math.random() - 0.5) * 3; y += (Math.random() - 0.5) * 1 }

    switch (action) {
      case 'down':
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.strokeStyle = 'rgb(38, 201, 154)'
        startX = x; startY = y
        drawStarted = true
        break

      case 'move':
        if (!drawStarted) break
        if (colorChange) {
          if (bsState.isBs && bsState.bsNow >= bsState.bsRange) {
            bsState.isBs = false
            ctx.strokeStyle = 'rgb(38, 201, 154)'
          }
          if (!bsState.isBs && Math.random() < bsProb && i < trackData.length - 15) {
            bsState.isBs = true
            const rg = 2 * Math.random() - 1
            if (rg > 0) {
              bsState.rMax = Math.floor(193 * Math.pow(Math.abs(rg), 0.5))
              bsState.gMax = Math.floor(-110 * Math.pow(Math.abs(rg), 0.5))
              bsState.bMax = Math.floor(-66 * Math.pow(Math.abs(rg), 0.5))
            } else {
              bsState.rMax = Math.floor(27 * Math.pow(Math.abs(rg), 0.5))
              bsState.gMax = Math.floor(16 * Math.pow(Math.abs(rg), 0.5))
              bsState.bMax = Math.floor(94 * Math.pow(Math.abs(rg), 0.5))
            }
            bsState.bsRange = bsRangeMin + Math.floor((bsRangeMax - bsRangeMin) * Math.random())
            bsState.bsNow = 0
          }
          if (bsState.isBs) {
            const p = bsState.bsNow / bsState.bsRange
            const r = Math.floor(38 + bsState.rMax * 4 * p * (1 - p))
            const g = Math.floor(201 + bsState.gMax * 4 * p * (1 - p))
            const b = Math.floor(154 + bsState.bMax * 4 * p * (1 - p))
            ctx.strokeStyle = `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`
            bsState.bsNow += i >= trackData.length - 15 ? 3 : 1
          }
        }
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
        break

      case 'up':
        drawStarted = false
        break
    }
  }

  // 绘制起点/终点标记
  const iconSize = 30 * suofang
  if (startX != null) {
    ctx.drawImage(startImg, startX - iconSize / 2, startY - iconSize * 0.73, iconSize, iconSize)
  }
  const lastPt = trackData[trackData.length - 1]
  const lx = lastPt.x * suofang + offsetX + endDx
  const ly = lastPt.y * suofang + offsetY + endDy
  ctx.drawImage(endImg, lx - iconSize / 2, ly - iconSize * 0.73, iconSize, iconSize)

  // 缩放至显示尺寸 360×719
  const displayW = 360
  const displayH = 719
  const outCanvas = document.createElement('canvas')
  outCanvas.width = displayW
  outCanvas.height = displayH
  const outCtx = outCanvas.getContext('2d')
  outCtx.drawImage(canvas, 0, 0, natW, natH, 0, 0, displayW, displayH)

  return outCanvas.toDataURL('image/png')
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))) }

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败: ' + src))
    img.src = src
  })
}

export { fetchTrackData, generateRandomTrack }
