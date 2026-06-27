import { ref, onUnmounted } from 'vue'

/**
 * useToast — 统一 Toast 通知 composable
 *
 * 提取自 Notes.vue / Friends.vue 中的重复 Toast 逻辑。
 * 用法：
 *   const { toast, showToast } = useToast()
 *   showToast('操作成功', 'success')
 */
export function useToast() {
  const toast = ref({ show: false, message: '', type: 'info' })
  let toastTimer = null

  function showToast(message, type = 'info') {
    clearTimeout(toastTimer)
    toast.value = { show: true, message, type }
    toastTimer = setTimeout(() => {
      toast.value.show = false
    }, 2500)
  }

  onUnmounted(() => clearTimeout(toastTimer))

  return {
    toast,
    showToast
  }
}
