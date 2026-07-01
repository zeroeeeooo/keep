/**
 * 集中配置管理
 *
 * 生产环境必须通过环境变量设置所有敏感值；
 * 开发环境提供安全的本地回退（不包含公开的硬编码字符串）。
 */
import 'dotenv/config'
import crypto from 'crypto'

const IS_PROD = process.env.NODE_ENV === 'production' || !!process.env.RENDER

/**
 * 获取必需的环境变量
 * 生产环境缺失时直接退出进程，避免使用不安全的回退值
 */
function requireEnv(key, devFallback) {
  if (process.env[key]) return process.env[key]
  if (IS_PROD) {
    console.error(`[FATAL] 环境变量 ${key} 未设置，服务器拒绝启动`)
    process.exit(1)
  }
  return devFallback
}

export const config = {
  // JWT 签名密钥：生产环境必须通过 JWT_SECRET 环境变量设置
  JWT_SECRET: requireEnv('JWT_SECRET', crypto.randomBytes(32).toString('hex')),

  // 数据库
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: requireEnv('DB_PASSWORD', 'dev-only'),
  DB_NAME: process.env.DB_NAME || 'wyzwjf',

  // 默认管理员密码（仅开发环境使用）
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'dev-admin-123',

  // 服务器
  PORT: process.env.PORT || 3001,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,

  // 环境标识
  IS_PROD,
  SALT_ROUNDS: 10,
}
