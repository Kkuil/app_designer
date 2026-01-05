<template>
  <div class="home-page">
    <!-- 轮播图/欢迎区 -->
    <section class="hero-section">
      <el-carousel height="400px" :interval="5000">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="banner-item" :style="{ background: item.background }">
            <div class="banner-content">
              <h1>{{ item.title }}</h1>
              <p>{{ item.description }}</p>
              <el-button type="primary" size="large" @click="handleBannerClick(item)">
                {{ item.buttonText }}
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 系统介绍 -->
    <section class="intro-section">
      <div class="container">
        <h2 class="section-title">系统介绍</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" v-for="feature in features" :key="feature.id">
            <el-card class="feature-card card-hover" shadow="hover">
              <div class="feature-icon" :style="{ backgroundColor: feature.color }">
                <el-icon :size="32"><component :is="feature.icon" /></el-icon>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- 最新公告 -->
    <section class="announcement-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新公告</h2>
          <el-button type="primary" link @click="goToAnnouncements">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :md="16">
            <el-card class="announcement-list-card">
              <el-table :data="announcements" stripe style="width: 100%" @row-click="viewAnnouncement">
                <el-table-column prop="type" label="类型" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getAnnouncementType(row.type)" size="small">{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
                <el-table-column prop="date" label="发布时间" width="120" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-card class="notice-card">
              <template #header>
                <div class="card-header">
                  <el-icon color="#e6a23c"><WarningFilled /></el-icon>
                  <span>重要通知</span>
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="notice in importantNotices"
                  :key="notice.id"
                  :timestamp="notice.date"
                  placement="top"
                  :color="notice.urgent ? '#f56c6c' : '#67c23a'"
                >
                  <el-card shadow="hover" class="notice-item" @click="viewNotice(notice)">
                    <p>{{ notice.title }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-entry-section">
      <div class="container">
        <h2 class="section-title">快捷入口</h2>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8" :md="4" v-for="entry in quickEntries" :key="entry.id">
            <div class="quick-entry-item" @click="handleQuickEntry(entry)">
              <div class="entry-icon" :style="{ backgroundColor: entry.bgColor }">
                <el-icon :size="28" :color="entry.iconColor"><component :is="entry.icon" /></el-icon>
              </div>
              <span>{{ entry.name }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- 统计数据 -->
    <section class="stats-section">
      <div class="container">
        <el-row :gutter="24">
          <el-col :xs="12" :md="6" v-for="stat in stats" :key="stat.label">
            <el-card class="stat-card" shadow="hover">
              <el-statistic :title="stat.label" :value="stat.value" :suffix="stat.suffix">
                <template #prefix>
                  <el-icon :color="stat.color"><component :is="stat.icon" /></el-icon>
                </template>
              </el-statistic>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 轮播图数据
const banners = ref([
  {
    id: 1,
    title: '农业科研知识数据管理系统',
    description: '专业的农业科研数据管理平台，助力科研创新与发展',
    buttonText: '了解更多',
    background: 'linear-gradient(135deg, #1a5f2a 0%, #3d9a4f 100%)'
  },
  {
    id: 2,
    title: '实验室设备预约管理',
    description: '便捷的设备预约系统，提高科研效率',
    buttonText: '立即预约',
    background: 'linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%)'
  },
  {
    id: 3,
    title: '科研项目全周期管理',
    description: '从申报到结项，全流程数字化管理',
    buttonText: '查看详情',
    background: 'linear-gradient(135deg, #8e44ad 0%, #c39bd3 100%)'
  }
])

// 系统特色
const features = ref([
  { id: 1, icon: 'DataAnalysis', title: '数据分析', description: '强大的数据分析能力，助力科研决策', color: '#409eff' },
  { id: 2, icon: 'Setting', title: '设备管理', description: '完善的实验设备管理与预约系统', color: '#67c23a' },
  { id: 3, icon: 'Document', title: '项目管理', description: '科研项目全生命周期管理', color: '#e6a23c' },
  { id: 4, icon: 'User', title: '团队协作', description: '高效的团队协作与沟通平台', color: '#f56c6c' }
])

// 公告列表
const announcements = ref([
  { id: 1, type: '系统更新', title: '系统V2.0版本正式上线，新增多项功能', date: '2024-12-20' },
  { id: 2, type: '学术会议', title: '2024年农业科技创新发展论坛即将召开', date: '2024-12-18' },
  { id: 3, type: '重要通知', title: '关于年终科研成果统计的通知', date: '2024-12-15' },
  { id: 4, type: '系统更新', title: '实验室预约系统优化升级公告', date: '2024-12-12' },
  { id: 5, type: '学术会议', title: '智慧农业技术交流会议通知', date: '2024-12-10' }
])

// 重要通知
const importantNotices = ref([
  { id: 1, title: '2024年度考核工作即将开始', date: '2024-12-22', urgent: true },
  { id: 2, title: '春节假期系统维护通知', date: '2024-12-20', urgent: false },
  { id: 3, title: '新版移动端APP上线', date: '2024-12-18', urgent: false },
  { id: 4, title: '科研经费报销截止提醒', date: '2024-12-15', urgent: true }
])

// 快捷入口
const quickEntries = ref([
  { id: 1, name: '设备预约', icon: 'Calendar', bgColor: '#ecf5ff', iconColor: '#409eff' },
  { id: 2, name: '项目申报', icon: 'Document', bgColor: '#f0f9eb', iconColor: '#67c23a' },
  { id: 3, name: '试剂领用', icon: 'Box', bgColor: '#fef0f0', iconColor: '#f56c6c' },
  { id: 4, name: '成果登记', icon: 'Trophy', bgColor: '#fdf6ec', iconColor: '#e6a23c' },
  { id: 5, name: '在线咨询', icon: 'Service', bgColor: '#f4f4f5', iconColor: '#909399' },
  { id: 6, name: '更多功能', icon: 'More', bgColor: '#ecf5ff', iconColor: '#409eff' }
])

// 统计数据
const stats = ref([
  { label: '注册用户', value: 12580, suffix: '人', icon: 'User', color: '#409eff' },
  { label: '科研项目', value: 856, suffix: '个', icon: 'Folder', color: '#67c23a' },
  { label: '实验设备', value: 1200, suffix: '台', icon: 'Monitor', color: '#e6a23c' },
  { label: '科研成果', value: 3680, suffix: '项', icon: 'Trophy', color: '#f56c6c' }
])

const getAnnouncementType = (type: string) => {
  const types: Record<string, string> = {
    '系统更新': 'primary',
    '学术会议': 'success',
    '重要通知': 'warning'
  }
  return types[type] || 'info'
}

const handleBannerClick = (item: any) => {
  ElMessage.success(`点击了: ${item.title}`)
}

const goToAnnouncements = () => {
  router.push('/announcements')
}

const viewAnnouncement = (row: any) => {
  router.push(`/announcements/${row.id}`)
}

const viewNotice = (notice: any) => {
  ElMessage.info(`查看通知: ${notice.title}`)
}

const handleQuickEntry = (entry: any) => {
  ElMessage.success(`即将进入: ${entry.name}`)
}
</script>

<style scoped>
.home-page {
  background-color: #f5f7fa;
}

.hero-section {
  margin-bottom: 40px;
}

.banner-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
  color: white;
}

.banner-content h1 {
  font-size: 42px;
  font-weight: 600;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.intro-section,
.announcement-section,
.quick-entry-section,
.stats-section {
  padding: 40px 0;
}

.announcement-section {
  background-color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.feature-card {
  text-align: center;
  padding: 20px;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.feature-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.feature-card h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.announcement-list-card {
  height: 100%;
}

.notice-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.notice-item {
  cursor: pointer;
}

.notice-item p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.quick-entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.quick-entry-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.entry-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.quick-entry-item span {
  font-size: 14px;
  color: #606266;
}

.stat-card {
  text-align: center;
  margin-bottom: 20px;
}

.stats-section {
  background: linear-gradient(135deg, #1a5f2a 0%, #3d9a4f 100%);
  padding: 60px 0;
}

.stats-section .stat-card {
  background: rgba(255, 255, 255, 0.95);
}
</style>
