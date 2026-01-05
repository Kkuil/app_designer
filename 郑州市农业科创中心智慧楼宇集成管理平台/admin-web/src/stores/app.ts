import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TagView extends Partial<RouteLocationNormalized> {
  title?: string
}

export const useAppStore = defineStore('app', () => {
  // 侧边栏状态
  const sidebarCollapsed = ref(false)
  
  // 标签页
  const tagViews = ref<TagView[]>([])
  
  // 设备状态 - 是否移动端
  const isMobile = ref(false)
  
  // 主题
  const theme = ref<'light' | 'dark'>('light')

  // 方法
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const closeSidebar = () => {
    sidebarCollapsed.value = true
  }

  const openSidebar = () => {
    sidebarCollapsed.value = false
  }

  const addTagView = (view: TagView) => {
    const existIndex = tagViews.value.findIndex(v => v.path === view.path)
    if (existIndex === -1) {
      tagViews.value.push({
        ...view,
        title: view.meta?.title as string || 'unknown'
      })
    }
  }

  const removeTagView = (view: TagView) => {
    const index = tagViews.value.findIndex(v => v.path === view.path)
    if (index > -1) {
      tagViews.value.splice(index, 1)
    }
  }

  const removeOtherTagViews = (view: TagView) => {
    tagViews.value = tagViews.value.filter(v => v.path === view.path || v.meta?.affix)
  }

  const removeAllTagViews = () => {
    tagViews.value = tagViews.value.filter(v => v.meta?.affix)
  }

  const setMobile = (mobile: boolean) => {
    isMobile.value = mobile
    if (mobile) {
      closeSidebar()
    }
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return {
    sidebarCollapsed,
    tagViews,
    isMobile,
    theme,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    addTagView,
    removeTagView,
    removeOtherTagViews,
    removeAllTagViews,
    setMobile,
    setTheme
  }
})
