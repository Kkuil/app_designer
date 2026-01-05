<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-title">{{ stat.title }}</span>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
          </div>
          <div class="stat-footer">
            <span :class="stat.trend > 0 ? 'up' : 'down'">
              <el-icon><component :is="stat.trend > 0 ? 'Top' : 'Bottom'" /></el-icon>
              {{ Math.abs(stat.trend) }}%
            </span>
            <span>较上月</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 快捷操作 -->
      <el-col :xs="24" :md="12" :lg="8">
        <el-card class="quick-card">
          <template #header>
            <span class="card-title">快捷操作</span>
          </template>
          <el-row :gutter="15">
            <el-col :span="8" v-for="item in quickActions" :key="item.name">
              <div class="quick-item" @click="handleQuickAction(item)">
                <div class="quick-icon" :style="{ backgroundColor: item.color }">
                  <el-icon :size="20"><component :is="item.icon" /></el-icon>
                </div>
                <span>{{ item.name }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 待办事项 -->
      <el-col :xs="24" :md="12" :lg="8">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">待办事项</span>
              <el-badge :value="todoList.length" type="danger" />
            </div>
          </template>
          <el-scrollbar height="200px">
            <div v-for="item in todoList" :key="item.id" class="todo-item" @click="handleTodo(item)">
              <el-tag :type="item.type" size="small">{{ item.category }}</el-tag>
              <span class="todo-text">{{ item.text }}</span>
              <span class="todo-time">{{ item.time }}</span>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 系统公告 -->
      <el-col :xs="24" :lg="8">
        <el-card class="notice-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">系统公告</span>
              <el-button type="primary" link @click="viewAllNotice">查看全部</el-button>
            </div>
          </template>
          <el-scrollbar height="200px">
            <div v-for="item in notices" :key="item.id" class="notice-item" @click="viewNotice(item)">
              <el-icon :color="item.important ? '#f56c6c' : '#909399'"><Bell /></el-icon>
              <span class="notice-text">{{ item.title }}</span>
              <span class="notice-time">{{ item.date }}</span>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 设备使用趋势 -->
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">设备使用趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="60" color="#dcdfe6"><DataLine /></el-icon>
              <p>设备使用趋势图表</p>
              <el-button type="primary" @click="loadChart">加载图表数据</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 项目状态分布 -->
      <el-col :xs="24" :lg="8">
        <el-card class="pie-card">
          <template #header>
            <span class="card-title">项目状态分布</span>
          </template>
          <div class="pie-container">
            <div v-for="item in projectStatus" :key="item.name" class="pie-item">
              <div class="pie-bar">
                <div class="pie-progress" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
              </div>
              <div class="pie-info">
                <span class="pie-name">{{ item.name }}</span>
                <span class="pie-value">{{ item.value }}个 ({{ item.percent }}%)</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 最近预约 -->
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近预约</span>
              <el-button type="primary" link @click="viewAllReservation">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentReservations" stripe size="small">
            <el-table-column prop="equipment" label="设备名称" min-width="120" />
            <el-table-column prop="user" label="预约人" width="80" />
            <el-table-column prop="time" label="预约时间" width="140" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getReservationStatus(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleReservation(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 试剂库存预警 -->
      <el-col :xs="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">试剂库存预警</span>
              <el-button type="primary" link @click="viewAllInventory">查看全部</el-button>
            </div>
          </template>
          <el-table :data="lowInventory" stripe size="small">
            <el-table-column prop="name" label="试剂名称" min-width="120" />
            <el-table-column prop="current" label="当前库存" width="80" />
            <el-table-column prop="min" label="最低库存" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.current <= row.min ? 'danger' : 'warning'" size="small">
                  {{ row.current <= row.min ? '紧急' : '预警' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePurchase(row)">申购</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const chartType = ref('week')

// 统计数据
const stats = ref([
  { title: '用户总数', value: '12,580', icon: 'User', color: '#409eff', trend: 12.5 },
  { title: '设备数量', value: '1,200', icon: 'Monitor', color: '#67c23a', trend: 5.2 },
  { title: '本月预约', value: '3,680', icon: 'Calendar', color: '#e6a23c', trend: -3.1 },
  { title: '项目数量', value: '856', icon: 'Folder', color: '#f56c6c', trend: 8.7 }
])

// 快捷操作
const quickActions = ref([
  { name: '新增用户', icon: 'UserFilled', color: '#409eff' },
  { name: '设备入库', icon: 'Box', color: '#67c23a' },
  { name: '发布公告', icon: 'Bell', color: '#e6a23c' },
  { name: '审批预约', icon: 'Check', color: '#f56c6c' },
  { name: '项目申报', icon: 'Document', color: '#909399' },
  { name: '系统设置', icon: 'Setting', color: '#00d1b2' }
])

// 待办事项
const todoList = ref([
  { id: 1, category: '预约审核', text: '有3个设备预约待审核', time: '10分钟前', type: 'danger' },
  { id: 2, category: '项目评审', text: '2个项目待评审', time: '1小时前', type: 'warning' },
  { id: 3, category: '试剂申购', text: '5个申购单待处理', time: '2小时前', type: 'primary' },
  { id: 4, category: '设备保养', text: '核磁共振仪需保养', time: '今天', type: 'info' }
])

// 系统公告
const notices = ref([
  { id: 1, title: '系统将于本周日凌晨进行升级维护', date: '12-22', important: true },
  { id: 2, title: '关于2024年度考核工作的通知', date: '12-20', important: true },
  { id: 3, title: '实验室设备使用规范更新', date: '12-18', important: false },
  { id: 4, title: '元旦假期值班安排', date: '12-15', important: false }
])

// 项目状态分布
const projectStatus = ref([
  { name: '进行中', value: 45, percent: 52, color: '#409eff' },
  { name: '已完成', value: 28, percent: 33, color: '#67c23a' },
  { name: '待审核', value: 8, percent: 9, color: '#e6a23c' },
  { name: '已暂停', value: 5, percent: 6, color: '#909399' }
])

// 最近预约
const recentReservations = ref([
  { id: 1, equipment: '高效液相色谱仪', user: '张三', time: '12-23 09:00-12:00', status: '待审核' },
  { id: 2, equipment: '核磁共振仪', user: '李四', time: '12-23 14:00-17:00', status: '已通过' },
  { id: 3, equipment: '气相色谱仪', user: '王五', time: '12-24 09:00-11:00', status: '待审核' },
  { id: 4, equipment: '原子吸收光谱仪', user: '赵六', time: '12-24 14:00-16:00', status: '已驳回' }
])

// 库存预警
const lowInventory = ref([
  { id: 1, name: '乙腈(色谱纯)', current: 2, min: 5 },
  { id: 2, name: '甲醇(分析纯)', current: 3, min: 10 },
  { id: 3, name: '盐酸(优级纯)', current: 5, min: 8 },
  { id: 4, name: '硫酸(分析纯)', current: 4, min: 5 }
])

const getReservationStatus = (status: string) => {
  const types: Record<string, string> = {
    '待审核': 'warning',
    '已通过': 'success',
    '已驳回': 'danger'
  }
  return types[status] || 'info'
}

const handleQuickAction = (item: any) => {
  ElMessage.success(`点击了: ${item.name}`)
}

const handleTodo = (item: any) => {
  ElMessage.info(`处理待办: ${item.text}`)
}

const viewAllNotice = () => {
  ElMessage.info('跳转到公告列表')
}

const viewNotice = (item: any) => {
  ElMessage.info(`查看公告: ${item.title}`)
}

const loadChart = () => {
  ElMessage.success('图表数据加载成功')
}

const viewAllReservation = () => {
  ElMessage.info('跳转到预约列表')
}

const handleReservation = (row: any) => {
  ElMessage.info(`处理预约: ${row.equipment}`)
}

const viewAllInventory = () => {
  ElMessage.info('跳转到库存列表')
}

const handlePurchase = (row: any) => {
  ElMessage.success(`发起申购: ${row.name}`)
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  font-size: 13px;
  color: #909399;
  display: flex;
  gap: 5px;
}

.stat-footer .up {
  color: #67c23a;
  display: flex;
  align-items: center;
}

.stat-footer .down {
  color: #f56c6c;
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-card,
.todo-card,
.notice-card {
  margin-bottom: 20px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.quick-item:hover {
  background: #f5f7fa;
}

.quick-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
}

.quick-item span {
  font-size: 13px;
  color: #606266;
}

.todo-item,
.notice-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #ebeef5;
  cursor: pointer;
  gap: 10px;
}

.todo-item:last-child,
.notice-item:last-child {
  border-bottom: none;
}

.todo-item:hover,
.notice-item:hover {
  background: #f5f7fa;
}

.todo-text,
.notice-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-time,
.notice-time {
  font-size: 12px;
  color: #909399;
}

.chart-card,
.pie-card,
.table-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 15px 0;
}

.pie-container {
  padding: 10px 0;
}

.pie-item {
  margin-bottom: 20px;
}

.pie-bar {
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.pie-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.pie-info {
  display: flex;
  justify-content: space-between;
}

.pie-name {
  font-size: 14px;
  color: #606266;
}

.pie-value {
  font-size: 13px;
  color: #909399;
}
</style>
