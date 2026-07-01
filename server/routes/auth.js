import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { findUserByUsername, findUserByUsernameWithPassword, findUserById, createUser, updateUserAvatar } from '../db.js'
import { config } from '../config.js'

const router = Router()

const JWT_SECRET = config.JWT_SECRET
const SALT_ROUNDS = config.SALT_ROUNDS

// 头像上传目录
const AVATAR_DIR = path.resolve('server/uploads/avatars')
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true })
}

const avatarUpload = multer({
  dest: AVATAR_DIR,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 JPG/PNG/GIF/WebP 格式'))
    }
  }
})

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body

    if (!username || !password) {
      return res.status(400).json({ ok: false, message: '用户名和密码不能为空' })
    }

    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ ok: false, message: '用户名长度需要在 2-20 个字符之间' })
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: '密码长度不能少于 6 位' })
    }

    const existing = await findUserByUsername(username)
    if (existing) {
      return res.status(409).json({ ok: false, message: '用户名已存在' })
    }

    const hash = bcrypt.hashSync(password, SALT_ROUNDS)
    const displayName = nickname || username

    const newUser = await createUser(username, hash, displayName)

    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      ok: true,
      message: '注册成功',
      data: {
        token,
        user: { id: newUser.id, username, nickname: displayName, avatar: null }
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ ok: false, message: '用户名和密码不能为空' })
    }

    const user = await findUserByUsernameWithPassword(username)

    if (!user) {
      return res.status(401).json({ ok: false, message: '用户名或密码错误' })
    }

    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) {
      return res.status(401).json({ ok: false, message: '用户名或密码错误' })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      ok: true,
      message: '登录成功',
      data: {
        token,
        user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar }
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: '未登录' })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET)

    const user = await findUserById(decoded.userId)

    if (!user) {
      return res.status(404).json({ ok: false, message: '用户不存在' })
    }

    res.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          created_at: user.created_at
        }
      }
    })
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'token 无效或已过期' })
  }
})

// 上传头像
router.post('/avatar', avatarUpload.single('avatar'), async (req, res) => {
  try {
    // 验证登录
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: '未登录' })
    }
    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET)

    const file = req.file
    if (!file) {
      return res.status(400).json({ ok: false, message: '请选择图片' })
    }

    // 生成文件名（用时间戳避免同名覆盖缓存问题）
    const ext = path.extname(file.originalname) || '.png'
    const filename = `avatar_${decoded.userId}_${Date.now()}${ext}`
    const destPath = path.join(AVATAR_DIR, filename)

    // 先查旧头像信息
    const oldUser = await findUserById(decoded.userId)

    // 保存新文件
    fs.renameSync(file.path, destPath)

    // 删除旧头像文件（确保不是新文件）
    if (oldUser?.avatar) {
      const oldFileName = path.basename(oldUser.avatar)
      const oldPath = path.join(AVATAR_DIR, oldFileName)
      if (fs.existsSync(oldPath) && oldPath !== destPath) {
        fs.unlinkSync(oldPath)
      }
    }

    const avatarUrl = `/uploads/avatars/${filename}`
    await updateUserAvatar(decoded.userId, avatarUrl)

    res.json({
      ok: true,
      message: '头像更新成功',
      data: { avatar: avatarUrl }
    })
  } catch (err) {
    console.error('Avatar upload error:', err)
    res.status(500).json({ ok: false, message: '上传失败' })
  }
})

export default router
