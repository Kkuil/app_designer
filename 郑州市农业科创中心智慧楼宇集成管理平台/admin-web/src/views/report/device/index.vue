<template>
  <div class="report-device-container">
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="日期范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:240px" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="filters.type" placeholder="选择类型" style="width:150px">
            <el-option label="全部类型" value="" />
            <el-option label="空调设备" value="hvac" />
            <el-option label="照明设备" value="lighting" />
            <el-option label="安防设备" value="security" />
            <el-option label="消防设备" value="fire" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" style="width:120px">
            <el-option label="全部" value="" />
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="故障" value="fault" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
          <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出报表</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Monitor /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">设备总数</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card online"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.online }}</div><div class="label">在线设备</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card offline"><div class="icon"><el-icon :size="24"><CircleClose /></el-icon></div><div class="content"><div class="value">{{ stats.offline }}</div><div class="label">离线设备</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card fault"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.fault }}</div><div class="label">故障设备</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="panel">
          <div class="panel-header"><span>设备在线率趋势</span></div>
          <div ref="trendRef" class="trend-chart"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>设备类型分布</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>状态统计</span></div>
          <div ref="statusRef" class="pie-chart"></div>
        </div>
      </el-col>
    </el-row>

    <div class="panel">
      <div class="panel-header"><span>设备运行明细</span></div>
      <el-table :data="tableData" stripe height="320">
        <el-table-column prop="name" label="设备名称" width="160" />
        <el-table-column prop="type" label="设备类型" width="100" />
        <el-table-column prop="location" label="安装位置" width="140" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : row.status === '离线' ? 'info' : 'danger'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="运行时长" width="120" />
        <el-table-column prop="onlineRate" label="在线率" width="100">
          <template #default="{ row }"><el-progress :percentage="row.onlineRate" :stroke-width="6" /></template>
        </el-table-column>
        <el-table-column prop="faultCount" label="故障次数" width="90" />
        <el-table-column prop="lastOnline" label="最后在线" width="160" />
      </el-table>
      <div class="pagination">
        <el-pagination layout="total, prev, pager, next" :total="150" :page-size="10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Search, Refresh, Download, Monitor, CircleCheck, CircleClose, Warning } from '@element-plus/icons-vue'

const filters = reactive({ dateRange: [], type: '', status: '' })
const stats = reactive({ total: 1256, online: 1180, offline: 58, fault: 18 })

const tableData = ref([
  { name: '中央空调主机-01', type: '空调设备', location: 'A座机房', status: '在线', uptime: '1250h', onlineRate: 98.5, faultCount: 2, lastOnline: '2025-01-15 10:30' },
  { name: '烟感探测器-A101', type: '消防设备', location: 'A座1层', status: '在线', uptime: '2160h', onlineRate: 99.8, faultCount: 0, lastOnline: '2025-01-15 10:30' },
  { name: '监控摄像头-B201', type: '安防设备', location: 'B座2层', status: '离线', uptime: '1800h', onlineRate: 85.2, faultCount: 5, lastOnline: '2025-01-15 08:15' },
  { name: '智能灯控-C301', type: '照明设备', location: 'C座3层', status: '故障', uptime: '980h', onlineRate: 72.3, faultCount: 8, lastOnline: '2025-01-14 16:40' },
  { name: '门禁控制器-A102', type: '安防设备', location: 'A座1层', status: '在线', uptime: '2050h', onlineRate: 96.8, faultCount: 1, lastOnline: '2025-01-15 10:30' }
])

const trendRef = ref()
const pieRef = ref()
const statusRef = ref()

const handleSearch = () => { ElMessage.success('查询设备数据') }
const handleReset = () => { Object.assign(filters, { dateRange: [], type: '', status: '' }); ElMessage.info('已重置筛选条件') }
const handleExport = () => { ElMessage.success('正在导出报表...') }

const initCharts = () => {
  if (trendRef.value) {
    echarts.init(trendRef.value).setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 30, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: ['01-09', '01-10', '01-11', '01-12', '01-13', '01-14', '01-15'] },
      yAxis: { type: 'value', min: 90, max: 100, axisLabel: { formatter: '{value}%' } },
      series: [{ type: 'line', data: [96.5, 97.2, 95.8, 98.1, 97.5, 96.9, 97.8], smooth: true, areaStyle: { color: 'rgba(103,194,58,0.15)' }, lineStyle: { color: '#67C23A' }, itemStyle: { color: '#67C23A' }, markLine: { data: [{ type: 'average', name: '平均值' }] } }]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 320, name: '空调设备', itemStyle: { color: '#409EFF' } },
        { value: 280, name: '照明设备', itemStyle: { color: '#E6A23C' } },
        { value: 350, name: '安防设备', itemStyle: { color: '#67C23A' } },
        { value: 306, name: '消防设备', itemStyle: { color: '#F56C6C' } }
      ], label: { fontSize: 10 } }]
    })
  }
  if (statusRef.value) {
    echarts.init(statusRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 1180, name: '在线', itemStyle: { color: '#67C23A' } },
        { value: 58, name: '离线', itemStyle: { color: '#909399' } },
        { value: 18, name: '故障', itemStyle: { color: '#F56C6C' } }
      ], label: { fontSize: 10 } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.report-device-container { display: flex; flex-direction: column; gap: 12px; }

.filter-bar { background: #fff; border-radius: 8px; padding: 16px 16px 0; .el-form-item { margin-bottom: 16px; } }

.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 14px; .icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 22px; font-weight: 600; } .label { color: #909399; font-size: 13px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.online .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.offline .icon { background: linear-gradient(135deg, #909399, #c0c4cc); }
  &.fault .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 14px 16px; border-bottom: 1px solid #ebeef5; font-weight: 600; } }

.chart-row { .trend-chart { height: 260px; padding: 12px 16px; } .pie-chart { height: 260px; padding: 12px; } }

.pagination { padding: 12px 16px; display: flex; justify-content: flex-end; }
</style>
