import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  id: number
  username: string
  name: string
  avatar: string
  phone: string
  department: string
  roles: string[]
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '')
  
  const setToken = (newToken: string) => {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }
  
  const clearToken = () => {
    token.value = ''
    uni.removeStorageSync('token')
  }
  
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }
  
  const logout = () => {
    clearToken()
    userInfo.value = null
    uni.reLaunch({ url: '/pages/login/index' })
  }
  
  const checkLoginStatus = () => {
    if (!token.value) {
      uni.reLaunch({ url: '/pages/login/index' })
      return false
    }
    return true
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    setToken,
    clearToken,
    setUserInfo,
    logout,
    checkLoginStatus
  }
})
