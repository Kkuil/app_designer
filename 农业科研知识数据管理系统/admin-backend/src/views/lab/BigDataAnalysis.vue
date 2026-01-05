<template>
  <div class="bigdata-page">
    <!-- 数据概览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="stat in overviewStats" :key="stat.title">
        <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="28"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-title">{{ stat.title }}</span>
              <span class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 仪器使用趋势 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>仪器使用趋势分析</span>
              <div class="header-actions">
                <el-radio-group v-model="trendPeriod" size="small">
                  <el-radio-button value="week">周</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                  <el-radio-button value="quarter">季度</el-radio-button>
                  <el-radio-button value="year">年</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="60" color="#409eff"><DataLine /></el-icon>
              <p>仪器使用趋势图表</p>
              <div class="trend-data">
                <el-table :data="trendTableData" stripe size="small">
                  <el-table-column prop="date" label="日期" />
                  <el-table-column prop="usage" label="使用次数" />
                  <el-table-column prop="hours" label="使用时长(h)" />
                  <el-table-column prop="users" label="使用人数" />
                </el-table>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 仪器使用率排行 -->
      <el-col :span="8">
        <el-card class="rank-card">
          <template #header><span>仪器使用率TOP10</span></template>
          <div class="rank-list">
            <div v-for="(item, index) in usageRankList" :key="item.id" class="rank-item">
              <span class="rank-num" :class="index < 3 ? 'top' : ''">{{ index + 1 }}</span>
              <span class="rank-name">{{ item.name }}</span>
              <el-progress :percentage="item.rate" :stroke-width="8" :color="getProgressColor(item.rate)" style="flex: 1" />
              <span class="rank-value">{{ item.rate }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 课题组数据分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>课题组仪器使用分析</span>
              <el-button type="primary" link @click="handleExportGroup">导出报表</el-button>
            </div>
          </template>
          <el-table :data="groupAnalysis" stripe size="small">
            <el-table-column prop="groupName" label="课题组" min-width="120" />
            <el-table-column prop="memberCount" label="成员数" width="80" />
            <el-table-column prop="usageCount" label="使用次数" width="90" />
            <el-table-column prop="totalHours" label="总时长(h)" width="90" />
            <el-table-column prop="totalFee" label="总费用" width="100">
              <template #default="{ row }">¥{{ row.totalFee.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="avgRate" label="使用率" width="80">
              <template #default="{ row }">{{ row.avgRate }}%</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 试剂消耗分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>试剂消耗TOP10</span>
              <el-date-picker v-model="reagentPeriod" type="month" placeholder="选择月份" size="small" />
            </div>
          </template>
          <el-table :data="reagentConsumption" stripe size="small">
            <el-table-column prop="name" label="试剂名称" min-width="120" />
            <el-table-column prop="consumption" label="消耗量" width="100" />
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="trend" label="趋势" width="80">
              <template #default="{ row }">
                <span :class="row.trend > 0 ? 'text-danger' : 'text-success'">
                  {{ row.trend > 0 ? '↑' : '↓' }}{{ Math.abs(row.trend) }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 预约分析 -->
      <el-col :span="8">
        <el-card>
          <template #header><span>预约完成率分析</span></template>
          <div class="pie-data">
            <div v-for="item in reservationStats" :key="item.name" class="pie-item">
              <div class="pie-label">
                <span class="dot" :style="{ backgroundColor: item.color }"></span>
                <span>{{ item.name }}</span>
              </div>
              <div class="pie-bar">
                <div class="pie-progress" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
              </div>
              <span class="pie-value">{{ item.value }}次 ({{ item.percent }}%)</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 用户活跃度 -->
      <el-col :span="8">
        <el-card>
          <template #header><span>用户活跃度分析</span></template>
          <div class="user-activity">
            <div class="activity-item">
              <span class="activity-label">日活跃用户</span>
              <span class="activity-value">128</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">周活跃用户</span>
              <span class="activity-value">456</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">月活跃用户</span>
              <span class="activity-value">892</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">新增用户(本月)</span>
              <span class="activity-value">45</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 项目数据 -->
      <el-col :span="8">
        <el-card>
          <template #header><span>项目数据概览</span></template>
          <div class="project-stats">
            <div class="project-item">
              <el-icon :size="24" color="#409eff"><Folder /></el-icon>
              <div class="project-info">
                <span class="project-value">86</span>
                <span class="project-label">在研项目</span>
              </div>
            </div>
            <div class="project-item">
              <el-icon :size="24" color="#67c23a"><Check /></el-icon>
              <div class="project-info">
                <span class="project-value">124</span>
                <span class="project-label">已完成项目</span>
              </div>
            </div>
            <div class="project-item">
              <el-icon :size="24" color="#e6a23c"><Document /></el-icon>
              <div class="project-info">
                <span class="project-value">256</span>
                <span class="project-label">发表论文</span>
              </div>
            </div>
            <div class="project-item">
              <el-icon :size="24" color="#f56c6c"><Trophy /></el-icon>
              <div class="project-info">
                <span class="project-value">35</span>
                <span class="project-label">获奖成果</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据报表导出 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>数据报表中心</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="report in reportTypes" :key="report.id">
          <el-card class="report-card" shadow="hover" @click="handleGenerateReport(report)">
            <el-icon :size="40" :color="report.color"><component :is="report.icon" /></el-icon>
            <h4>{{ report.name }}</h4>
            <p>{{ report.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const trendPeriod = ref('month')
const reagentPeriod = ref(null)

const overviewStats = ref([
  { title: '仪器总数', value: '1,256', icon: 'Monitor', color: '#409eff', trend: 5.2 },
  { title: '本月预约次数', value: '3,680', icon: 'Calendar', color: '#67c23a', trend: 12.5 },
  { title: '本月使用时长', value: '8,920h', icon: 'Timer', color: '#e6a23c', trend: 8.3 },
  { title: '本月费用总计', value: '¥156.8万', icon: 'Money', color: '#f56c6c', trend: -2.1 }
])

const trendTableData = ref([
  { date: '12-25', usage: 156, hours: 420, users: 85 },
  { date: '12-26', usage: 168, hours: 456, users: 92 },
  { date: '12-27', usage: 145, hours: 398, users: 78 },
  { date: '12-28', usage: 182, hours: 512, users: 96 },
  { date: '12-29', usage: 175, hours: 480, users: 88 },
  { date: '12-30', usage: 190, hours: 536, users: 102 }
])

const usageRankList = ref([
  { id: 1, name: '高效液相色谱仪', rate: 95 },
  { id: 2, name: '气相色谱质谱联用仪', rate: 88 },
  { id: 3, name: '核磁共振仪', rate: 82 },
  { id: 4, name: '紫外可见分光光度计', rate: 78 },
  { id: 5, name: '原子吸收光谱仪', rate: 72 },
  { id: 6, name: '超速离心机', rate: 68 },
  { id: 7, name: '荧光显微镜', rate: 65 },
  { id: 8, name: 'PCR仪', rate: 62 },
  { id: 9, name: '电子天平', rate: 58 },
  { id: 10, name: '恒温培养箱', rate: 52 }
])

const groupAnalysis = ref([
  { groupName: '智慧农业研究组', memberCount: 12, usageCount: 256, totalHours: 680, totalFee: 136000, avgRate: 85 },
  { groupName: '作物遗传育种组', memberCount: 18, usageCount: 345, totalHours: 920, totalFee: 184000, avgRate: 78 },
  { groupName: '植物保护研究组', memberCount: 10, usageCount: 186, totalHours: 420, totalFee: 84000, avgRate: 72 },
  { groupName: '土壤环境研究组', memberCount: 8, usageCount: 124, totalHours: 280, totalFee: 56000, avgRate: 68 }
])

const reagentConsumption = ref([
  { name: '无水乙醇', consumption: '250L', amount: 8750, trend: 12 },
  { name: '甲醇(色谱纯)', consumption: '80L', amount: 22400, trend: 8 },
  { name: '乙腈(色谱纯)', consumption: '60L', amount: 18000, trend: -5 },
  { name: 'Tris缓冲液', consumption: '5kg', amount: 2600, trend: 15 },
  { name: '标准品套装', consumption: '12套', amount: 102000, trend: 3 }
])

const reservationStats = ref([
  { name: '已完成', value: 2856, percent: 78, color: '#67c23a' },
  { name: '已取消', value: 365, percent: 10, color: '#909399' },
  { name: '已违约', value: 182, percent: 5, color: '#f56c6c' },
  { name: '进行中', value: 256, percent: 7, color: '#409eff' }
])

const reportTypes = ref([
  { id: 1, name: '仪器使用报表', icon: 'Monitor', color: '#409eff', description: '统计各仪器使用情况' },
  { id: 2, name: '费用结算报表', icon: 'Money', color: '#67c23a', description: '各课题组费用明细' },
  { id: 3, name: '试剂消耗报表', icon: 'Box', color: '#e6a23c', description: '试剂库存及消耗分析' },
  { id: 4, name: '综合分析报表', icon: 'DataAnalysis', color: '#f56c6c', description: '全平台综合数据分析' }
])

const getProgressColor = (rate: number) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#409eff'
  if (rate >= 40) return '#e6a23c'
  return '#f56c6c'
}

const handleExportGroup = () => ElMessage.success('导出课题组报表')
const handleGenerateReport = (report: any) => ElMessage.success(`生成${report.name}`)
</script>

<style scoped>
.bigdata-page {
  min-height: 100%;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 0;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-title {
  font-size: 13px;
  color: #909399;
}

.stat-trend {
  font-size: 12px;
}

.stat-trend.up { color: #67c23a; }
.stat-trend.down { color: #f56c6c; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.trend-data {
  width: 100%;
  margin-top: 20px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
}

.rank-num.top {
  background: #409eff;
  color: white;
}

.rank-name {
  width: 120px;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-value {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: #606266;
}

.text-danger { color: #f56c6c; }
.text-success { color: #67c23a; }

.pie-data {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pie-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pie-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.pie-bar {
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.pie-progress {
  height: 100%;
  border-radius: 4px;
}

.pie-value {
  font-size: 12px;
  color: #909399;
}

.user-activity {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.activity-label {
  color: #606266;
}

.activity-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.project-info {
  display: flex;
  flex-direction: column;
}

.project-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.project-label {
  font-size: 12px;
  color: #909399;
}

.report-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.report-card:hover {
  transform: translateY(-5px);
}

.report-card h4 {
  margin: 15px 0 10px;
}

.report-card p {
  font-size: 13px;
  color: #909399;
  margin: 0;
}
</style>
