import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const sidebarWidth = ref('200px')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    sidebarWidth.value = sidebarCollapsed.value ? '64px' : '200px'
  }

  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed
    sidebarWidth.value = collapsed ? '64px' : '200px'
  }

  return {
    sidebarCollapsed,
    sidebarWidth,
    toggleSidebar,
    setSidebarCollapsed
  }
})
