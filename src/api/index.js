/**
 * 统一 API 层
 *
 * 封装 fetch 请求，自动处理：
 * - 基础路径（开发/生产）
 * - Auth 请求头注入
 * - JSON / FormData 内容类型
 * - 错误处理
 */

const DEV = import.meta.env.DEV
export const API_HOST = DEV ? '' : (import.meta.env.VITE_API_HOST || '')

/**
 * 从 localStorage 获取 token（用于 api 模块临时读取）
 */
function getToken() {
  try {
    return localStorage.getItem('keep_auth_token')
  } catch {
    return null
  }
}

/**
 * 基础请求封装
 */
export async function request(url, options = {}) {
  const { body, method = 'GET', headers = {}, formData = false } = options

  const config = {
    method,
    headers: {
      ...headers
    }
  }

  // 注入 Authorization
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // 处理请求体
  if (body && !formData) {
    config.headers['Content-Type'] = 'application/json'
    config.body = JSON.stringify(body)
  } else if (formData) {
    config.body = formData
  }

  try {
    const res = await fetch(url, config)
    return await res.json()
  } catch (err) {
    return { ok: false, message: '网络错误，请检查服务器是否运行' }
  }
}

/** 快捷方法 */
export const api = {
  get(url) {
    return request(url, { method: 'GET' })
  },
  post(url, body) {
    return request(url, { method: 'POST', body })
  },
  put(url, body) {
    return request(url, { method: 'PUT', body })
  },
  delete(url) {
    return request(url, { method: 'DELETE' })
  },
  upload(url, formData) {
    return request(url, { method: 'POST', formData })
  }
}
