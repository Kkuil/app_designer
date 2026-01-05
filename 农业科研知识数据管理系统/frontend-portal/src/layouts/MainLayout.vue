<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="28"><Promotion /></el-icon>
          <span>农业科研知识数据管理系统</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            首页
          </el-menu-item>
          <el-menu-item index="/announcements">
            <el-icon><Bell /></el-icon>
            公告浏览
          </el-menu-item>
          <el-menu-item index="/info">
            <el-icon><InfoFilled /></el-icon>
            信息展示
          </el-menu-item>
          <el-menu-item index="/feedback">
            <el-icon><ChatDotSquare /></el-icon>
            用户反馈
          </el-menu-item>
          <el-menu-item index="/tools">
            <el-icon><Box /></el-icon>
            用户工具集
          </el-menu-item>
        </el-menu>
        <div class="user-area">
          <el-button type="primary" @click="handleLogin">登录</el-button>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="main-content">
      <router-view />
    </el-main>

    <!-- 底部 -->
    <el-footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#">关于我们</a>
          <el-divider direction="vertical" />
          <a href="#">联系方式</a>
          <el-divider direction="vertical" />
          <a href="#">隐私政策</a>
          <el-divider direction="vertical" />
          <a href="#">使用条款</a>
        </div>
        <p class="copyright">© 2025 农业科研知识数据管理系统 版权所有</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

const activeMenu = computed(() => {
  return route.path
})

const handleLogin = () => {
  ElMessage.info('登录功能开发中，敬请期待！')
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #1a5f2a 0%, #2d8a3e 100%);
  padding: 0;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  background: transparent;
  border: none;
  margin-left: 40px;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.85);
  border-bottom: none;
  font-size: 15px;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.user-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.main-content {
  flex: 1;
  padding: 0;
  margin-top: 64px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px - 120px);
}

.footer {
  background: #2c3e50;
  color: white;
  padding: 30px 0;
  height: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  margin-bottom: 15px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #67c23a;
}

.copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}
</style>
