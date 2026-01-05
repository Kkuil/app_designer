<template>
  <div class="sidebar-container">
    <!-- Logo -->
    <div class="logo">
      <span v-show="!appStore.sidebarCollapsed" class="logo-text">郑州市农业科创中心智慧楼宇集成管理平台</span>
    </div>

    <!-- 菜单 -->
    <el-scrollbar class="menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :unique-opened="true"
        router
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 单个菜单项 -->
          <el-menu-item
            v-if="!route.children || route.children.length === 1"
            :index="getMenuPath(route)"
          >
            <el-icon v-if="getMenuMeta(route).icon">
              <component :is="getMenuMeta(route).icon" />
            </el-icon>
            <template #title>{{ getMenuMeta(route).title }}</template>
          </el-menu-item>

          <!-- 子菜单 -->
          <el-sub-menu v-else :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="`${route.path}/${child.path}`"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 获取菜单路由（过滤hidden）
const menuRoutes = computed(() => {
  const routes = router.options.routes
  return routes.filter(r => !r.meta?.hidden && r.path !== '/login' && r.path !== '/:pathMatch(.*)*')
})

// 当前激活菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})

// 获取菜单路径
const getMenuPath = (route: RouteRecordRaw) => {
  if (route.children && route.children.length === 1) {
    return `${route.path}/${route.children[0].path}`
  }
  return route.path
}

// 获取菜单meta
const getMenuMeta = (route: RouteRecordRaw) => {
  if (route.children && route.children.length === 1) {
    return route.children[0].meta || {}
  }
  return route.meta || {}
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100vh;
  background-color: #304156;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #263445;

  .logo-img {
    width: 32px;
    height: 32px;
  }

  .logo-text {
    margin-left: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    white-space: wrap;
  }
}

.menu-scrollbar {
  height: calc(100vh - 60px);

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}

:deep(.el-menu) {
  border-right: none;

  .el-menu-item,
  .el-sub-menu__title {
    &:hover {
      background-color: #263445;
    }
  }

  .el-menu-item.is-active {
    background-color: #409EFF !important;
    color: #fff !important;
  }
}
</style>
