<template>
  <div class="reservation-stats-page">
    <div class="filter-bar">
      <el-form :inline="true">
        <el-form-item label="统计周期"><el-select v-model="period" @change="handlePeriodChange"><el-option label="近7天" value="week" /><el-option label="近30天" value="month" /><el-option label="近90天" value="quarter" /><el-option label="本年度" value="year" /></el-select></el-form-item>
        <el-form-item label="设备类型"><el-select v-model="equipmentType" placeholder="全部" clearable><el-option label="分析仪器" value="analysis" /><el-option label="光学仪器" value="optical" /><el-option label="物理仪器" value="physical" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleRefresh"><el-icon><Refresh /></el-icon>刷新数据</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出报表</el-button></el-form-item>
      </el-form>
    </div>
    <div class="stats-cards">
      <el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background: #409EFF"><el-icon :size="24" color="#fff"><Calendar /></el-icon></div><div class="stat-info"><span class="stat-value">{{ stats.totalReservations }}</span><span class="stat-label">预约总数</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background: #67C23A"><el-icon :size="24" color="#fff"><Check /></el-icon></div><div class="stat-info"><span class="stat-value">{{ stats.completedRate }}%</span><span class="stat-label">完成率</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background: #E6A23C"><el-icon :size="24" color="#fff"><Clock /></el-icon></div><div class="stat-info"><span class="stat-value">{{ stats.totalHours }}h</span><span class="stat-label">使用时长</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background: #F56C6C"><el-icon :size="24" color="#fff"><TrendCharts /></el-icon></div><div class="stat-info"><span class="stat-value">{{ stats.avgUsage }}%</span><span class="stat-label">平均使用率</span></div></div></el-card>
    </div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card><template #header><span>预约趋势</span></template><div ref="trendChart" style="height: 300px"></div></el-card>
      </el-col>
      <el-col :span="12">
        <el-card><template #header><span>设备使用排行</span></template><div ref="rankChart" style="height: 300px"></div></el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card><template #header><span>部门使用分布</span></template><div ref="deptChart" style="height: 300px"></div></el-card>
      </el-col>
      <el-col :span="12">
        <el-card><template #header><span>时段分布</span></template><div ref="timeChart" style="height: 300px"></div></el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top: 20px">
      <template #header><span>设备使用详情</span></template>
      <el-table :data="detailData" stripe border>
        <el-table-column prop="rank" label="排名" width="60" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="reserveCount" label="预约次数" width="100" />
        <el-table-column prop="useHours" label="使用时长(h)" width="110" />
        <el-table-column prop="usageRate" label="使用率" width="100"><template #default="{ row }"><el-progress :percentage="row.usageRate" :color="row.usageRate > 80 ? '#F56C6C' : '#409EFF'" /></template></el-table-column>
        <el-table-column prop="userCount" label="使用人数" width="100" />
        <el-table-column prop="income" label="收入(元)" width="100" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
const period = ref('month'), equipmentType = ref('')
const trendChart = ref<HTMLElement>()
const rankChart = ref<HTMLElement>()
const deptChart = ref<HTMLElement>()
const timeChart = ref<HTMLElement>()
const stats = ref({ totalReservations: 156, completedRate: 92, totalHours: 1280, avgUsage: 68 })
const detailData = ref([
  { rank: 1, name: '高效液相色谱仪', reserveCount: 45, useHours: 180, usageRate: 92, userCount: 12, income: 36000 },
  { rank: 2, name: '气相色谱质谱联用仪', reserveCount: 38, useHours: 152, usageRate: 85, userCount: 10, income: 45600 },
  { rank: 3, name: '紫外可见分光光度计', reserveCount: 32, useHours: 96, usageRate: 78, userCount: 18, income: 4800 },
  { rank: 4, name: '原子吸收光谱仪', reserveCount: 25, useHours: 100, usageRate: 65, userCount: 8, income: 25000 },
  { rank: 5, name: '超速离心机', reserveCount: 16, useHours: 48, usageRate: 45, userCount: 6, income: 7200 }
])
const initCharts = () => {
  if (trendChart.value) { const chart = echarts.init(trendChart.value); chart.setOption({ tooltip: { trigger: 'axis' }, legend: { data: ['预约数', '完成数'] }, xAxis: { type: 'category', data: ['12/16', '12/17', '12/18', '12/19', '12/20', '12/21', '12/22'] }, yAxis: { type: 'value' }, series: [{ name: '预约数', type: 'line', data: [18, 22, 25, 20, 28, 15, 28], smooth: true }, { name: '完成数', type: 'line', data: [16, 20, 23, 18, 26, 14, 25], smooth: true }] }) }
  if (rankChart.value) { const chart = echarts.init(rankChart.value); chart.setOption({ tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, xAxis: { type: 'value' }, yAxis: { type: 'category', data: ['超速离心机', '原子吸收光谱仪', '紫外分光光度计', '气质联用仪', '液相色谱仪'] }, series: [{ type: 'bar', data: [16, 25, 32, 38, 45], itemStyle: { color: '#409EFF' } }] }) }
  if (deptChart.value) { const chart = echarts.init(deptChart.value); chart.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['35%', '65%'], data: [{ value: 45, name: '研发一部' }, { value: 38, name: '研发二部' }, { value: 28, name: '实验中心' }, { value: 22, name: '质检部' }, { value: 23, name: '其他' }] }] }) }
  if (timeChart.value) { const chart = echarts.init(timeChart.value); chart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['8-9', '9-10', '10-11', '11-12', '14-15', '15-16', '16-17', '17-18'] }, yAxis: { type: 'value', name: '预约次数' }, series: [{ type: 'bar', data: [12, 28, 35, 18, 32, 38, 25, 8], itemStyle: { color: '#67C23A' } }] }) }
}
onMounted(() => initCharts())
const handlePeriodChange = () => { ElMessage.success('统计周期已切换'); initCharts() }
const handleRefresh = () => { ElMessage.success('数据已刷新'); initCharts() }
const handleExport = () => ElMessage.success('报表导出成功')
</script>
<style scoped>.reservation-stats-page { height: 100%; overflow-y: auto; }.filter-bar { margin-bottom: 20px; }.stats-cards { display: flex; gap: 20px; margin-bottom: 20px; }.stat-card { flex: 1; }.stat-content { display: flex; align-items: center; gap: 15px; }.stat-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }.stat-info { display: flex; flex-direction: column; }.stat-value { font-size: 24px; font-weight: bold; }.stat-label { font-size: 14px; color: #909399; }</style>
