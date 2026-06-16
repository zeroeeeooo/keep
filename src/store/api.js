// API 基础路径：开发环境走 Vite 代理，生产环境直连 Render 后端
const DEV = import.meta.env.DEV

export const API_HOST = DEV ? '' : (import.meta.env.VITE_API_HOST || '')

export const API = {
  auth:    API_HOST + '/api/auth',
  friends: API_HOST + '/api/friends',
  notes:   API_HOST + '/api/notes',
  uploads: API_HOST + '/uploads',
}
