import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/auth'
import { setToken, removeToken, getUserInfo, setUserInfo } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(getUserInfo())
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const role = computed(() => userInfo.value?.role || '')

  async function login(loginForm) {
    try {
      const response = await loginApi(loginForm)
      
      if (response.success || response.token) {
        const receivedToken = response.token || response.data?.token
        const receivedUserInfo = response.data?.userInfo || response.userInfo
        
        token.value = receivedToken
        setToken(receivedToken)
        
        userInfo.value = receivedUserInfo
        setUserInfo(receivedUserInfo)
        
        return { success: true, data: { token: receivedToken, userInfo: receivedUserInfo } }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      return { success: false, message: error.message || '登录失败，请稍后重试' }
    }
  }

  async function logout() {
    try {
      await logoutApi()
    } catch (e) {
      // 忽略退出接口错误
    } finally {
      token.value = ''
      userInfo.value = null
      permissions.value = []
      removeToken()
    }
  }

  async function fetchUserInfo() {
    try {
      const response = await getUserInfoApi()
      if (response.success || response.user) {
        const info = response.user || response.data
        userInfo.value = info
        setUserInfo(info)
        return info
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    return null
  }

  function hasPermission(permission) {
    if (!permission) return true
    return permissions.value.includes(permission)
  }

  function hasRole(roleName) {
    if (!roleName) return true
    return userInfo.value?.role === roleName
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    username,
    role,
    login,
    logout,
    fetchUserInfo,
    hasPermission,
    hasRole
  }
})
