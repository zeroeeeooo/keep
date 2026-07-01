import { Router } from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { createNote, getNotes, getMyNotes, deleteNote } from '../db.js'
import { processUploadedFiles } from '../utils/fileProcessor.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'keep-pro-secret-key-change-in-production'

// ---- 文件上传配置 ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8)
    cb(null, name + ext)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
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
      // Multer 内部错误（文件过大、类型不对等）
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.json({ ok: false, message: '文件大小不能超过 20MB' })
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.json({ ok: false, message: '超出最大文件数量（9个）' })
        }
        return res.json({ ok: false, message: '文件上传失败: ' + err.message })
      }
      // fileFilter 抛出的错误
      return res.json({ ok: false, message: err.message })
    }
    next()
  })
}

// ---- 中间件 ----
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ ok: false, message: '未登录' })
  }
  try {
    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET)
    req.currentUser = decoded
    next()
  } catch {
    return res.status(401).json({ ok: false, message: 'token 无效或已过期' })
  }
}

// ---- 发布笔记 ----
router.post('/', authMiddleware, uploadMiddleware, async (req, res) => {
  try {
    const { content } = req.body

    // 压缩图片（PDF 跳过）
    const files = await processUploadedFiles(req.files)

    const noteId = await createNote(req.currentUser.userId, content, files.length ? files : null)

    const now = new Date().toISOString()
    res.json({
      ok: true,
      message: '发布成功',
      data: {
        note: {
          id: noteId,
          user_id: req.currentUser.userId,
          content: content || '',
          files: files.length ? files : [],
          created_at: now,
          updated_at: now,
          username: req.currentUser.username,
          nickname: req.currentUser.username
        }
      }
    })
  } catch (err) {
    console.error('Create note error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 获取笔记列表（自己的 + 好友的）----
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 50
    const notes = await getNotes(req.currentUser.userId, page, pageSize)

    // 解析 files JSON
    const result = notes.map(n => ({
      ...n,
      files: n.files ? JSON.parse(n.files) : []
    }))

    res.json({ ok: true, data: { notes: result } })
  } catch (err) {
    console.error('Get notes error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 获取自己的笔记 ----
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 50
    const notes = await getMyNotes(req.currentUser.userId, page, pageSize)

    const result = notes.map(n => ({
      ...n,
      files: n.files ? JSON.parse(n.files) : []
    }))

    res.json({ ok: true, data: { notes: result } })
  } catch (err) {
    console.error('Get my notes error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 删除笔记 ----
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await deleteNote(req.params.id, req.currentUser.userId)
    if (deleted) {
      res.json({ ok: true, message: '已删除' })
    } else {
      res.status(404).json({ ok: false, message: '笔记不存在或无权删除' })
    }
  } catch (err) {
    console.error('Delete note error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

export default router
