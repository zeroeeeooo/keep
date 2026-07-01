import { Router } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { createTopic, getTopics, getMyTopics, getTopicById, deleteTopic,
         createReply, getReplies, deleteReply } from '../db.js'
import { processUploadedFiles } from '../utils/fileProcessor.js'
import { config } from '../config.js'

const router = Router()
const JWT_SECRET = config.JWT_SECRET

// ---- 文件上传配置 ----
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.resolve(__dirname, '../uploads')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件格式，仅支持图片(JPG/PNG/GIF/WebP)和PDF'))
    }
  }
})

// ---- 带错误处理的 multer 中间件 ----
function uploadMiddleware(req, res, next) {
  upload.array('files', 9)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.json({ ok: false, message: '文件大小不能超过 20MB' })
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.json({ ok: false, message: '超出最大文件数量（9个）' })
        }
        return res.json({ ok: false, message: '文件上传失败: ' + err.message })
      }
      return res.json({ ok: false, message: err.message })
    }
    next()
  })
}

// ---- Auth middleware ----
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.json({ ok: false, message: '未登录' })
  try {
    const token = authHeader.split(' ')[1]
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.json({ ok: false, message: 'token 无效' })
  }
}

// ---- 话题 API ----

// 获取话题列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query
    const topics = await getTopics(req.user.userId, parseInt(page), parseInt(pageSize))
    res.json({ ok: true, data: { topics } })
  } catch (err) {
    console.error('getTopics error:', err)
    res.json({ ok: false, message: '服务器错误' })
  }
})

// 获取我的话题
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query
    const topics = await getMyTopics(req.user.userId, parseInt(page), parseInt(pageSize))
    res.json({ ok: true, data: { topics } })
  } catch (err) {
    console.error('getMyTopics error:', err)
    res.json({ ok: false, message: '服务器错误' })
  }
})

// 获取话题详情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const topic = await getTopicById(req.params.id)
    if (!topic) return res.json({ ok: false, message: '话题不存在' })
    res.json({ ok: true, data: { topic } })
  } catch (err) {
    console.error('getTopicById error:', err)
    res.json({ ok: false, message: '服务器错误' })
  }
})

// 创建话题（支持文件上传+压缩）
router.post('/', authMiddleware, uploadMiddleware, async (req, res) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.json({ ok: false, message: '内容不能为空' })
    }

    // 压缩图片（PDF 跳过）
    const files = await processUploadedFiles(req.files)

    const topic = await createTopic(req.user.userId, content.trim(), files)
    res.json({ ok: true, data: { topic }, message: '话题已创建' })
  } catch (err) {
    console.error('createTopic error:', err)
    res.json({ ok: false, message: '创建失败' })
  }
})

// 删除话题
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const topic = await getTopicById(req.params.id)
    if (!topic) return res.json({ ok: false, message: '话题不存在' })
    if (topic.user_id !== req.user.userId) return res.json({ ok: false, message: '无权删除' })
    await deleteTopic(req.params.id)
    res.json({ ok: true, message: '已删除' })
  } catch (err) {
    console.error('deleteTopic error:', err)
    res.json({ ok: false, message: '删除失败' })
  }
})

// ---- 回复 API ----

// 获取回复列表
router.get('/:id/replies', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query
    const replies = await getReplies(req.params.id, parseInt(page), parseInt(pageSize))
    res.json({ ok: true, data: { replies } })
  } catch (err) {
    console.error('getReplies error:', err)
    res.json({ ok: false, message: '服务器错误' })
  }
})

// 创建回复（支持文件上传+压缩）
router.post('/:id/replies', authMiddleware, uploadMiddleware, async (req, res) => {
  try {
    const { content } = req.body
    const hasFiles = req.files && req.files.length > 0
    if ((!content || !content.trim()) && !hasFiles) {
      return res.json({ ok: false, message: '内容不能为空' })
    }

    // 压缩图片（PDF 跳过）
    const files = await processUploadedFiles(req.files)

    const reply = await createReply(req.params.id, req.user.userId, (content || '').trim(), files)
    res.json({ ok: true, data: { reply }, message: '回复成功' })
  } catch (err) {
    console.error('createReply error:', err)
    res.json({ ok: false, message: '回复失败' })
  }
})

export default router
