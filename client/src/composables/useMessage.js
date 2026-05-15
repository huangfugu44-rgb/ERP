import { ref } from 'vue'

const messages = ref([])
let messageId = 0

export const message = {
  success(title, message) {
    return addMessage({ type: 'success', title, message })
  },
  
  error(title, message) {
    return addMessage({ type: 'error', title, message })
  },
  
  warning(title, message) {
    return addMessage({ type: 'warning', title, message })
  },
  
  info(title, message) {
    return addMessage({ type: 'info', title, message })
  },
  
  loading(title, message) {
    return addMessage({ type: 'loading', title, message, duration: 0 })
  },
  
  remove(id) {
    const index = messages.value.findIndex(m => m.id === id)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
  },
  
  clear() {
    messages.value = []
  }
}

function addMessage(options) {
  const id = ++messageId
  const messageObj = {
    id,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    duration: options.duration !== undefined ? options.duration : 3000
  }
  
  messages.value.push(messageObj)
  
  if (messageObj.duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, messageObj.duration)
  }
  
  return id
}

function removeMessage(id) {
  const index = messages.value.findIndex(m => m.id === id)
  if (index > -1) {
    messages.value.splice(index, 1)
  }
}

export function useMessage() {
  return {
    messages,
    success: message.success,
    error: message.error,
    warning: message.warning,
    info: message.info,
    loading: message.loading,
    remove: message.remove,
    clear: message.clear
  }
}

export function useConfirm() {
  return {
    confirm(options) {
      return new Promise((resolve) => {
        const id = ++messageId
        const messageObj = {
          id,
          type: 'confirm',
          title: options.title || '确认操作',
          message: options.message || '确定要执行此操作吗？',
          confirmText: options.confirmText || '确定',
          cancelText: options.cancelText || '取消',
          onConfirm: () => {
            message.remove(id)
            resolve(true)
          },
          onCancel: () => {
            message.remove(id)
            resolve(false)
          }
        }
        
        messages.value.push(messageObj)
      })
    }
  }
}

export default {
  message,
  useMessage,
  useConfirm
}
