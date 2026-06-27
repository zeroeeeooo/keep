/**
 * friendsStore — 好友状态管理 (Pinia)
 *
 * 从 store/auth.js 拆分出的好友逻辑
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { friendsApi } from '../api/friends.js'

export const useFriendsStore = defineStore('friends', () => {
  // ---- State ----
  const friends = ref([])
  const incomingRequests = ref([])
  const sentRequests = ref([])
  const searchResults = ref([])

  // ---- Actions ----
  async function searchUsers(keyword) {
    const res = await friendsApi.search(keyword)
    if (res.ok) searchResults.value = res.data.users
    return res
  }

  async function sendFriendRequest(userId) {
    return await friendsApi.sendRequest(userId)
  }

  async function handleRequest(relationId, action) {
    return await friendsApi.handleRequest(relationId, action)
  }

  async function cancelSent(relationId) {
    return await friendsApi.cancelRequest(relationId)
  }

  async function removeFriend(friendId) {
    return await friendsApi.remove(friendId)
  }

  async function loadFriends() {
    const res = await friendsApi.getList()
    if (res.ok) friends.value = res.data.friends
  }

  async function loadRequests() {
    const [incoming, sent] = await Promise.all([
      friendsApi.getIncomingRequests(),
      friendsApi.getSentRequests()
    ])
    if (incoming.ok) incomingRequests.value = incoming.data.requests
    if (sent.ok) sentRequests.value = sent.data.requests
  }

  return {
    // state
    friends,
    incomingRequests,
    sentRequests,
    searchResults,
    // actions
    searchUsers,
    sendFriendRequest,
    handleRequest,
    cancelSent,
    removeFriend,
    loadFriends,
    loadRequests
  }
})
