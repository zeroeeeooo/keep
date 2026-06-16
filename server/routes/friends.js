import { Router } from 'express'
import jwt from 'jsonwebtoken'
import {
  searchUsers,
  addFriend,
  getFriendship,
  getFriendshipById,
  updateFriendRequest,
  removeFriend,
  getFriendList,
  getPendingRequests,
  getSentRequests,
  findUserById
} from '../db.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'keep-pro-secret-key-change-in-production'

// ---- 中间件：解析当前用户 ----
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

// ---- 搜索用户（已 JOIN 优化，无需逐条查询） ----
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 1) {
      return res.json({ ok: true, data: { users: [] } })
    }

    const users = await searchUsers(q.trim(), req.currentUser.userId)

    res.json({ ok: true, data: { users } })
  } catch (err) {
    console.error('Search users error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 发送好友请求 ----
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { userId: targetId } = req.body
    const currentUserId = req.currentUser.userId

    if (!targetId) {
      return res.status(400).json({ ok: false, message: '缺少目标用户 ID' })
    }

    if (Number(targetId) === currentUserId) {
      return res.status(400).json({ ok: false, message: '不能添加自己为好友' })
    }

    const targetUser = await findUserById(targetId)
    if (!targetUser) {
      return res.status(404).json({ ok: false, message: '用户不存在' })
    }

    const existing = await getFriendship(currentUserId, Number(targetId))
    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(409).json({ ok: false, message: '已经是好友了' })
      }
      if (existing.user_id === currentUserId && existing.status === 'pending') {
        return res.status(409).json({ ok: false, message: '已发送过好友请求，请等待对方处理' })
      }
      if (existing.friend_id === currentUserId && existing.status === 'pending') {
        // 对方已向你发出请求，自动接受
        await updateFriendRequest(existing.id, 'accepted')
        return res.json({ ok: true, message: '对方已向你发出过好友请求，已自动成为好友' })
      }
    }

    await addFriend(currentUserId, Number(targetId))
    res.json({ ok: true, message: '好友请求已发送' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, message: '好友关系已存在' })
    }
    console.error('Add friend error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 处理好友请求（接受 / 拒绝，含归属校验） ----
router.put('/request/:relationId', authMiddleware, async (req, res) => {
  try {
    const { relationId } = req.params
    const { action } = req.body

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ ok: false, message: '无效操作' })
    }

    const relation = await getFriendshipById(relationId)
    if (!relation) {
      return res.status(404).json({ ok: false, message: '好友请求不存在' })
    }

    // 校验：只有被请求方（friend_id）才能接受/拒绝
    if (Number(relation.friend_id) !== Number(req.currentUser.userId)) {
      return res.status(403).json({ ok: false, message: '无权操作此好友请求' })
    }

    if (relation.status !== 'pending') {
      return res.status(400).json({ ok: false, message: '该请求已被处理' })
    }

    const status = action === 'accept' ? 'accepted' : 'rejected'
    await updateFriendRequest(relationId, status)

    res.json({
      ok: true,
      message: action === 'accept' ? '已接受好友请求' : '已拒绝好友请求'
    })
  } catch (err) {
    console.error('Handle friend request error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 撤回已发送的好友请求 ----
router.delete('/request/:relationId', authMiddleware, async (req, res) => {
  try {
    const { relationId } = req.params

    const relation = await getFriendshipById(relationId)
    if (!relation) {
      return res.status(404).json({ ok: false, message: '好友请求不存在' })
    }

    if (Number(relation.user_id) !== Number(req.currentUser.userId)) {
      return res.status(403).json({ ok: false, message: '无权撤回此请求' })
    }

    if (relation.status !== 'pending') {
      return res.status(400).json({ ok: false, message: '该请求已被处理，无法撤回' })
    }

    await removeFriend(relation.user_id, relation.friend_id)

    res.json({ ok: true, message: '好友请求已撤回' })
  } catch (err) {
    console.error('Cancel request error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 删除好友 ----
router.delete('/:friendId', authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.params
    const currentUserId = req.currentUser.userId

    const relation = await getFriendship(currentUserId, Number(friendId))
    if (!relation || relation.status !== 'accepted') {
      return res.status(404).json({ ok: false, message: '好友关系不存在' })
    }

    await removeFriend(currentUserId, Number(friendId))

    res.json({ ok: true, message: '已删除好友' })
  } catch (err) {
    console.error('Remove friend error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 获取好友列表 ----
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const friends = await getFriendList(req.currentUser.userId)
    res.json({ ok: true, data: { friends } })
  } catch (err) {
    console.error('Get friend list error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 获取收到的好友请求 ----
router.get('/requests/incoming', authMiddleware, async (req, res) => {
  try {
    const requests = await getPendingRequests(req.currentUser.userId)
    res.json({ ok: true, data: { requests } })
  } catch (err) {
    console.error('Get pending requests error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

// ---- 获取已发送的好友请求 ----
router.get('/requests/sent', authMiddleware, async (req, res) => {
  try {
    const requests = await getSentRequests(req.currentUser.userId)
    res.json({ ok: true, data: { requests } })
  } catch (err) {
    console.error('Get sent requests error:', err)
    res.status(500).json({ ok: false, message: '服务器内部错误' })
  }
})

export default router
