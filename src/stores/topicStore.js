/**
 * topicStore — 话题状态管理 (Pinia)
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { topicApi, replyApi } from '../api/topics.js'

export const useTopicStore = defineStore('topic', () => {
  const allTopics = ref([])
  const myTopics = ref([])
  const currentTopic = ref(null)
  const replies = ref([])
  const loading = ref(false)
  const filter = ref('all')

  function generateRotation() {
    return (Math.random() * 4 - 2).toFixed(1) + 'deg'
  }

  async function loadTopics() {
    loading.value = true
    const res = await topicApi.list()
    if (res.ok) {
      allTopics.value = (res.data.topics || []).map(t => ({
        ...t,
        rotation: generateRotation()
      }))
    }
    loading.value = false
  }

  async function loadMyTopics() {
    const res = await topicApi.mine()
    if (res.ok) {
      myTopics.value = (res.data.topics || []).map(t => ({
        ...t,
        rotation: generateRotation()
      }))
    }
  }

  async function loadTopic(id) {
    const res = await topicApi.get(id)
    if (res.ok) {
      currentTopic.value = { ...res.data.topic, rotation: '0deg' }
    }
    return res
  }

  async function loadReplies(topicId) {
    const res = await replyApi.list(topicId)
    if (res.ok) replies.value = res.data.replies || []
    return res
  }

  async function createTopic({ content, files }) {
    return await topicApi.create({ content, files })
  }

  async function deleteTopic(id) {
    const res = await topicApi.remove(id)
    if (res.ok) {
      allTopics.value = allTopics.value.filter(t => t.id !== id)
      myTopics.value = myTopics.value.filter(t => t.id !== id)
    }
    return res
  }

  async function createReply(topicId, { content, files }) {
    return await replyApi.create(topicId, { content, files })
  }

  async function deleteReply(replyId) {
    return await replyApi.remove(replyId)
  }

  const displayTopics = ref([])

  return {
    allTopics, myTopics, currentTopic, replies,
    loading, filter, displayTopics,
    loadTopics, loadMyTopics, loadTopic, loadReplies,
    createTopic, deleteTopic, createReply, deleteReply
  }
})
