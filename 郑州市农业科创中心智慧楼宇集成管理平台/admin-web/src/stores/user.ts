import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getUserInfo } from '@/api/user'
import type { UserInfo, LoginParams } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '')
  const avatar = computed(() => userInfo.value?.avatar || '')

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('token')
  }

  const loginAction = async (loginParams: LoginParams) => {
    try {
      const res = await login(loginParams)
      setToken(res.data.token)
      return res
    } catch (error) {
      throw error
    }
  }

  const logoutAction = async () => {
    try {
      await logout()
    } finally {
      clearToken()
      userInfo.value = null
      roles.value = []
      permissions.value = []
    }
  }

  const getUserInfoAction = async () => {
    try {
      const res = await getUserInfo()
      userInfo.value = res.data
      roles.value = res.data.roles || []
      permissions.value = res.data.permissions || []
      return res
    } catch (error) {
      throw error
    }
  }

  const checkLoginStatus = () => {
    if (token.value) {
      getUserInfoAction().catch(() => {
        clearToken()
      })
    }
  }

  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission) || roles.value.includes('admin')
  }

  const hasRole = (role: string) => {
    return roles.value.includes(role)
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    isLoggedIn,
    userName,
    avatar,
    setToken,
    clearToken,
    loginAction,
    logoutAction,
    getUserInfoAction,
    checkLoginStatus,
    hasPermission,
    hasRole
  }
})
