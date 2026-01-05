<template>
  <div class="announcement-detail-page">
    <div class="container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/announcements' }">公告浏览</el-breadcrumb-item>
        <el-breadcrumb-item>公告详情</el-breadcrumb-item>
      </el-breadcrumb>

      <el-card class="detail-card">
        <div class="detail-header">
          <el-tag :type="getTagType(announcement.type)" size="large">{{ announcement.type }}</el-tag>
          <h1>{{ announcement.title }}</h1>
          <div class="meta-info">
            <span><el-icon><User /></el-icon> {{ announcement.author }}</span>
            <span><el-icon><Clock /></el-icon> {{ announcement.date }}</span>
            <span><el-icon><View /></el-icon> {{ announcement.views }} 次阅读</span>
          </div>
        </div>

        <el-divider />

        <div class="detail-content" v-html="announcement.content"></div>

        <el-divider />

        <div class="detail-footer">
          <div class="tags">
            <el-tag v-for="tag in announcement.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
          </div>
          <div class="actions">
            <el-button @click="handleCollect">
              <el-icon><Star /></el-icon> 收藏
            </el-button>
            <el-button @click="handleShare">
              <el-icon><Share /></el-icon> 分享
            </el-button>
            <el-button type="primary" @click="goBack">
              <el-icon><Back /></el-icon> 返回列表
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 相关公告 -->
      <el-card class="related-card">
        <template #header>
          <span class="card-title">相关公告</span>
        </template>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="item in relatedAnnouncements" :key="item.id">
            <div class="related-item" @click="viewRelated(item)">
              <el-tag :type="getTagType(item.type)" size="small">{{ item.type }}</el-tag>
              <h4>{{ item.title }}</h4>
              <span class="date">{{ item.date }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 模拟公告详情数据
const announcement = ref({
  id: route.params.id,
  type: '系统更新',
  title: '系统V2.0版本正式上线，新增多项实用功能',
  author: '系统管理员',
  date: '2024-12-20',
  views: 1256,
  tags: ['系统更新', '功能优化', 'V2.0'],
  content: `
    <h2>尊敬的用户：</h2>
    <p>农业科研知识数据管理系统V2.0版本已于2024年12月20日正式上线。本次更新包含多项功能改进和优化，为用户提供更便捷的使用体验。</p>
    
    <h3>一、主要更新内容</h3>
    <h4>1. 实验室设备预约优化</h4>
    <ul>
      <li>新增设备日历视图，直观展示设备预约状态</li>
      <li>支持批量预约和周期性预约</li>
      <li>增加预约提醒功能，支持短信和APP推送</li>
    </ul>
    
    <h4>2. 试剂耗材管理升级</h4>
    <ul>
      <li>优化库存盘点流程，支持扫码入库</li>
      <li>新增低库存预警功能</li>
      <li>完善采购审批流程</li>
    </ul>
    
    <h4>3. 项目申报流程简化</h4>
    <ul>
      <li>精简申报表单，减少填写项目</li>
      <li>支持历史项目信息复用</li>
      <li>新增在线咨询功能</li>
    </ul>
    
    <h3>二、系统维护时间</h3>
    <p>为确保系统稳定运行，我们将于每周日凌晨2:00-4:00进行系统维护，届时系统可能出现短暂无法访问的情况，请各位用户提前做好安排。</p>
    
    <h3>三、联系方式</h3>
    <p>如在使用过程中遇到问题，请联系技术支持：</p>
    <ul>
      <li>服务热线：400-123-4567</li>
      <li>电子邮箱：support@example.com</li>
      <li>在线客服：工作日 9:00-18:00</li>
    </ul>
    
    <p style="margin-top: 30px;">感谢您对农业科研知识数据管理系统的支持！</p>
    <p style="text-align: right; margin-top: 20px;">系统管理员<br/>2024年12月20日</p>
  `
})

const relatedAnnouncements = ref([
  { id: 2, type: '系统更新', title: '移动端APP V3.5版本发布', date: '2024-12-15' },
  { id: 3, type: '系统更新', title: '数据备份功能优化通知', date: '2024-12-10' },
  { id: 4, type: '重要通知', title: '年终系统维护安排', date: '2024-12-08' }
])

const getTagType = (type: string): string => {
  const types: Record<string, string> = {
    '系统更新': 'primary',
    '重要通知': 'warning',
    '学术会议': 'success',
    '政策法规': 'info'
  }
  return types[type] || 'info'
}

const handleCollect = () => {
  ElMessage.success('收藏成功！')
}

const handleShare = () => {
  ElMessage.success('分享链接已复制到剪贴板')
}

const goBack = () => {
  router.push('/announcements')
}

const viewRelated = (item: any) => {
  router.push(`/announcements/${item.id}`)
  ElMessage.info(`查看公告: ${item.title}`)
}
</script>

<style scoped>
.announcement-detail-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 30px 0;
}

.container {
  max-width: 1000px;
}

.el-breadcrumb {
  margin-bottom: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-header {
  text-align: center;
}

.detail-header h1 {
  font-size: 28px;
  color: #303133;
  margin: 20px 0;
  line-height: 1.4;
}

.meta-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #909399;
  font-size: 14px;
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-content {
  font-size: 16px;
  line-height: 2;
  color: #606266;
}

.detail-content :deep(h2) {
  font-size: 20px;
  color: #303133;
  margin: 20px 0 15px;
}

.detail-content :deep(h3) {
  font-size: 18px;
  color: #303133;
  margin: 25px 0 15px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.detail-content :deep(h4) {
  font-size: 16px;
  color: #303133;
  margin: 15px 0 10px;
}

.detail-content :deep(ul) {
  padding-left: 25px;
  margin: 10px 0;
}

.detail-content :deep(li) {
  margin: 8px 0;
}

.detail-content :deep(p) {
  margin: 15px 0;
  text-indent: 2em;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.tags {
  display: flex;
  gap: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.related-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.related-item {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.related-item:hover {
  background: #ecf5ff;
  transform: translateY(-3px);
}

.related-item h4 {
  margin: 10px 0;
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
}

.related-item .date {
  font-size: 12px;
  color: #909399;
}
</style>
