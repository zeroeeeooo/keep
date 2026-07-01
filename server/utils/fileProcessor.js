/**
 * 文件处理工具 — 图片压缩
 *
 * 在 multer 保存文件后执行，将图片压缩到合理尺寸和大小，
 * PNG/GIF 转换为 JPEG 以大幅减小体积。
 */
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const ALLOWED_IMAGES = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

/**
 * 压缩单张图片
 *
 * @param {string} filePath   multer 保存后的绝对路径
 * @returns {string|null}     压缩后的文件名（仅 basename），
 *                             若文件非图片或压缩失败返回 null
 */
export async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!ALLOWED_IMAGES.includes(ext)) return null

  try {
    const meta = await sharp(filePath).metadata()

    // 跳过动画 GIF
    if (ext === '.gif' && (meta.pages || 0) > 1) return null
    // 已经是小图（< 100KB）则跳过
    const stat = fs.statSync(filePath)
    if (stat.size < 100 * 1024) return null

    // 输出格式：PNG/GIF → JPEG，其余保持原格式
    const toJpeg = ['.png', '.gif'].includes(ext)
    const outputExt = toJpeg ? '.jpg' : ext

    // 用目录 + 新文件名构建输出路径
    const dir = path.dirname(filePath)
    const baseName = path.basename(filePath, ext)
    const outputName = baseName + outputExt
    const outputPath = path.join(dir, outputName)

    // 写入临时文件，避免同名冲突
    const tmpPath = outputPath + '.tmp'

    const pipeline = sharp(filePath).resize(1920, 1920, {
      fit: 'inside',
      withoutEnlargement: true
    })

    if (toJpeg || ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(tmpPath)
    } else {
      // webp
      await pipeline.webp({ quality: 80 }).toFile(tmpPath)
    }

    // 替换原文件
    fs.unlinkSync(filePath)
    fs.renameSync(tmpPath, outputPath)

    return outputName
  } catch (err) {
    console.error(`[fileProcessor] 图片压缩失败 [${filePath}]:`, err.message)
    // 清理可能的残留临时文件
    const tmp = filePath + '.tmp'
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
    return null
  }
}

/**
 * 修复文件名编码：将错误解析为 Latin-1 的 UTF-8 字节重新正确解码
 *
 * 典型场景：Node.js 接收 multipart 上传时，文件名中的非 ASCII 字符
 * 被当作 Latin-1 解读（每个字节变成一个字符），导致中文变乱码。
 * 此函数把字符还原为字节，再按 UTF-8 重新解码。
 */
function fixEncoding(str) {
  if (!str) return str
  try {
    const bytes = Buffer.from(str, 'latin1')
    const fixed = bytes.toString('utf-8')
    // 只在使用 latin1 能产生有效变化时采用（避免 ASCII 字符串被误转换）
    return fixed !== str ? fixed : str
  } catch {
    return str
  }
}

/**
 * 安全解码文件名（处理浏览器可能的 URL 编码），然后在必要时修复编码。
 */
function decodeAndFix(name) {
  if (!name) return name
  // 第一步：URL 解码（如果有 %XX 编码）
  let result
  try {
    result = decodeURIComponent(name)
  } catch {
    result = name
  }
  // 第二步：如果结果中包含拉丁1 扩展字符（0x80-0xFF），可能是 UTF-8 被错误解析，
  // 尝试用 Buffer 重新解码
  if (/[\x80-\xFF]/.test(result)) {
    const fixed = fixEncoding(result)
    if (fixed !== result) {
      console.log(`[fileProcessor] 编码修复: "${result}" → "${fixed}"`)
      return fixed
    }
  }
  return result
}

/**
 * 批量处理上传的文件列表（只压缩图片，PDF 跳过）
 *
 * @param {Array<{ path: string, filename: string, originalname: string }>} files  multer 产生的 file 对象数组
 * @returns {Promise<Array<{ url: string, name: string }>>}  压缩/处理后的文件对象数组
 */
export async function processUploadedFiles(files) {
  if (!files || !files.length) return []

  const results = []
  for (const f of files) {
    const newName = await compressImage(f.path)
    const url = newName ? '/uploads/' + newName : '/uploads/' + f.filename
    const name = decodeAndFix(f.originalname)
    console.log(`[fileProcessor] 文件名处理: 原始="${f.originalname}", 解码后="${name}"`)
    results.push({ url, name })
  }
  return results
}
