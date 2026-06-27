import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { initDB } from './db.js'
import authRoutes from './routes/auth.js'
import friendRoutes from './routes/friends.js'
import noteRoutes from './routes/notes.js'
import topicRoutes from './routes/topics.js'

const PORT = process.env.PORT || 3001

// 确保上传目录存在
const uploadsDir = path.resolve('server/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const app = express()

// CORS — 允许前端域名（本地 + 生产）
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.CLIENT_ORIGIN,         // Render 前端地址，在 Dashboard 中设置
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    // 生产环境允许所有来源（你的前端域名固定即可）
    return cb(null, true)
  },
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(uploadsDir))

// 初始化数据库
await initDB()

// 认证路由
app.use('/api/auth', authRoutes)

// 好友路由
app.use('/api/friends', friendRoutes)

// 随手一记路由
app.use('/api/notes', noteRoutes)

// 话题路由
app.use('/api/topics', topicRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
