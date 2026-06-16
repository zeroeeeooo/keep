import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const DB_NAME = process.env.DB_NAME || 'wyzwjf'
const IS_PROD = process.env.NODE_ENV === 'production' || !!process.env.RENDER

// 启动时自动创建数据库（如果不存在）
await ensureDatabase()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'WJFasdf123',
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Aiven / 远程 MySQL 需要 SSL
  ...(IS_PROD ? { ssl: {} } : {})
})

async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'WJFasdf123',
    ...(IS_PROD ? { ssl: {} } : {})
  })
  await conn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await conn.end()
  console.log(`Database "${DB_NAME}" ensured`)
}

export async function initDB() {
  // 用户表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         BIGINT AUTO_INCREMENT PRIMARY KEY,
      username   VARCHAR(50)  NOT NULL UNIQUE,
      nickname   VARCHAR(50)  NOT NULL DEFAULT '',
      password   VARCHAR(255) NOT NULL,
      created_at VARCHAR(30)  NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // 好友关系表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS friends (
      id         BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id    BIGINT       NOT NULL,
      friend_id  BIGINT       NOT NULL,
      status     VARCHAR(20)  NOT NULL DEFAULT 'pending',
      created_at VARCHAR(30)  NOT NULL,
      updated_at VARCHAR(30)  NOT NULL,
      UNIQUE KEY uk_friendship (user_id, friend_id),
      FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // 随手一记表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id         BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id    BIGINT       NOT NULL,
      content    TEXT,
      files      JSON         DEFAULT NULL,
      created_at VARCHAR(30)  NOT NULL,
      updated_at VARCHAR(30)  NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  const [rows] = await pool.execute(
    'SELECT id FROM users WHERE username = ?', ['admin']
  )
  if (rows.length === 0) {
    const hash = bcrypt.hashSync('123456', 10)
    await pool.execute(
      'INSERT INTO users (username, nickname, password, created_at) VALUES (?, ?, ?, ?)',
      ['admin', '管理员', hash, new Date().toISOString()]
    )
    console.log('Default admin user created')
  }

  console.log('Database initialized')
}

// 查找用户（不包含密码，用于对外展示）
export async function findUserByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT id, username, nickname, created_at FROM users WHERE username = ?', [username]
  )
  return rows.length > 0 ? rows[0] : null
}

// 查找用户（包含密码，仅用于登录验证）
export async function findUserByUsernameWithPassword(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ?', [username]
  )
  return rows.length > 0 ? rows[0] : null
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, username, nickname, created_at FROM users WHERE id = ?', [id]
  )
  return rows.length > 0 ? rows[0] : null
}

export async function createUser(username, password, nickname) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, nickname, password, created_at) VALUES (?, ?, ?, ?)',
    [username, nickname, password, new Date().toISOString()]
  )
  return {
    id: result.insertId,
    username,
    nickname,
    password,
    created_at: new Date().toISOString()
  }
}

// ========== 好友相关查询 ==========

// 搜索用户（返回带 friend_status 的完整信息，一次 JOIN 查询）
export async function searchUsers(keyword, currentUserId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.nickname, u.created_at,
            f.id AS relation_id,
            CASE
              WHEN f.status = 'accepted' THEN 'friend'
              WHEN f.user_id = ? AND f.status = 'pending' THEN 'sent'
              WHEN f.friend_id = ? AND f.status = 'pending' THEN 'pending'
              ELSE 'none'
            END AS friend_status
     FROM users u
     LEFT JOIN friends f ON
       ((f.user_id = ? AND f.friend_id = u.id) OR
        (f.friend_id = ? AND f.user_id = u.id)) AND
       f.status IN ('accepted', 'pending')
     WHERE (u.username LIKE ? OR u.nickname LIKE ?) AND u.id != ?
     ORDER BY u.username
     LIMIT 20`,
    [currentUserId, currentUserId, currentUserId, currentUserId,
     `%${keyword}%`, `%${keyword}%`, currentUserId]
  )
  return rows
}

// 发送好友请求
export async function addFriend(userId, friendId) {
  const now = new Date().toISOString()
  const [result] = await pool.execute(
    'INSERT INTO friends (user_id, friend_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [userId, friendId, 'pending', now, now]
  )
  return result.insertId
}

// 查询两人之间的好友关系
export async function getFriendship(userId, friendId) {
  const [rows] = await pool.execute(
    `SELECT * FROM friends
     WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
     LIMIT 1`,
    [userId, friendId, friendId, userId]
  )
  return rows.length > 0 ? rows[0] : null
}

// 根据 relation_id 查询好友关系（含归属校验）
export async function getFriendshipById(relationId) {
  const [rows] = await pool.execute(
    'SELECT * FROM friends WHERE id = ?', [relationId]
  )
  return rows.length > 0 ? rows[0] : null
}

// 处理好友请求（接受 / 拒绝）
export async function updateFriendRequest(relationId, status) {
  const now = new Date().toISOString()
  await pool.execute(
    'UPDATE friends SET status = ?, updated_at = ? WHERE id = ?',
    [status, now, relationId]
  )
}

// 删除好友关系（双向删除）
export async function removeFriend(userId, friendId) {
  await pool.execute(
    'DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
    [userId, friendId, friendId, userId]
  )
}

// 获取好友列表（双向 accepted）
export async function getFriendList(userId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.nickname, u.created_at,
            f.id AS relation_id, f.created_at AS friend_since
     FROM friends f
     JOIN users u ON (CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END = u.id)
     WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'`,
    [userId, userId, userId]
  )
  return rows
}

// 获取收到的好友请求（pending，对方发来的）
export async function getPendingRequests(userId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.nickname, u.created_at,
            f.id AS relation_id, f.created_at AS requested_at
     FROM friends f
     JOIN users u ON f.user_id = u.id
     WHERE f.friend_id = ? AND f.status = 'pending'`,
    [userId]
  )
  return rows
}

// 获取已发送的好友请求
export async function getSentRequests(userId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.nickname, u.created_at,
            f.id AS relation_id, f.created_at AS requested_at
     FROM friends f
     JOIN users u ON f.friend_id = u.id
     WHERE f.user_id = ? AND f.status = 'pending'`,
    [userId]
  )
  return rows
}

// ========== 随手一记 ==========

// 创建笔记
export async function createNote(userId, content, files) {
  const now = new Date().toISOString()
  const [result] = await pool.execute(
    'INSERT INTO notes (user_id, content, files, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [userId, content || '', files ? JSON.stringify(files) : null, now, now]
  )
  return result.insertId
}

// 获取笔记列表（自己的 + 好友的，按时间倒序）
export async function getNotes(userId, page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize
  const limit = Number(pageSize)
  const offs = Number(offset)
  const [rows] = await pool.query(
    `SELECT n.id, n.user_id, n.content, n.files, n.created_at, n.updated_at,
            u.username, u.nickname
     FROM notes n
     JOIN users u ON n.user_id = u.id
     WHERE n.user_id = ?
        OR n.user_id IN (
          SELECT CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
          FROM friends f
          WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
        )
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, userId, userId, limit, offs]
  )
  return rows
}

// 获取自己的笔记
export async function getMyNotes(userId, page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize
  const limit = Number(pageSize)
  const offs = Number(offset)
  const [rows] = await pool.query(
    `SELECT n.id, n.user_id, n.content, n.files, n.created_at, n.updated_at,
            u.username, u.nickname
     FROM notes n
     JOIN users u ON n.user_id = u.id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offs]
  )
  return rows
}

// 删除笔记（校验所有者）
export async function deleteNote(noteId, userId) {
  const [result] = await pool.execute(
    'DELETE FROM notes WHERE id = ? AND user_id = ?',
    [noteId, userId]
  )
  return result.affectedRows > 0
}
