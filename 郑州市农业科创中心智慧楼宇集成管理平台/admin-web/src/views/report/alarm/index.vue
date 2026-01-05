<template>
  <div class="report-alarm-container">
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="日期范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:240px" />
        </el-form-item>
        <el-form-item label="告警级别">
          <el-select v-model="filters.level" placeholder="选择级别" style="width:120px">
            <el-option label="全部" value="" />
            <el-option label="紧急" value="critical" />
            <el-option label="重要" value="major" />
            <el-option label="次要" value="minor" />
            <el-option label="提示" value="info" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警类型">
          <el-select v-model="filters.type" placeholder="选择类型" style="width:140px">
            <el-option label="全部" value="" />
            <el-option label="设备告警" value="device" />
            <el-option label="安防告警" value="security" />
            <el-option label="消防告警" value="fire" />
            <el-option label="环境告警" value="environment" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" style="width:120px">
            <el-option label="全部" value="" />
            <el-option label="未处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
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
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Bell /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">告警总数</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card critical"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.critical }}</div><div class="label">紧急告警</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pending"><div class="icon"><el-icon :size="24"><Clock /></el-icon></div><div class="content"><div class="value">{{ stats.pending }}</div><div class="label">待处理</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card resolved"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.resolved }}</div><div class="label">已处理</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="panel">
          <div class="panel-header"><span>告警趋势</span></div>
          <div ref="trendRef" class="trend-chart"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>告警级别分布</span></div>
          <div ref="levelRef" class="pie-chart"></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>告警类型分布</span></div>
          <div ref="typeRef" class="pie-chart"></div>
        </div>
      </el-col>
    </el-row>

    <div class="panel">
      <div class="panel-header"><span>告警明细</span></div>
      <el-table :data="tableData" stripe height="320">
        <el-table-column prop="time" label="告警时间" width="160" />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="device" label="告警设备" width="160" />
        <el-table-column prop="content" label="告警内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="100" />
        <el-table-column prop="handleTime" label="处理时间" width="160" />
      </el-table>
      <div class="pagination">
        <el-pagination layout="total, prev, pager, next" :total="280" :page-size="10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Search, Refresh, Download, Bell, Warning, Clock, CircleCheck } from '@element-plus/icons-vue'

const filters = reactive({ dateRange: [], level: '', type: '', status: '' })
const stats = reactive({ total: 286, critical: 12, pending: 28, resolved: 258 })

const tableData = ref([
  { time: '2025-01-15 10:25:30', level: '紧急', type: '消防告警', device: '烟感探测器-A301', content: '烟雾浓度超标，请立即检查', status: '处理中', handler: '张三', handleTime: '2025-01-15 10:28:00' },
  { time: '2025-01-15 09:15:20', level: '重要', type: '安防告警', device: '红外探测器-B201', content: '非工作时间区域入侵告警', status: '已处理', handler: '李四', handleTime: '2025-01-15 09:20:15' },
  { time: '2025-01-15 08:45:10', level: '次要', type: '设备告警', device: '空调主机-01', content: '设备运行温度偏高', status: '已处理', handler: '王五', handleTime: '2025-01-15 09:00:00' },
  { time: '2025-01-14 22:30:05', level: '提示', type: '环境告警', device: 'CO2传感器-C102', content: 'CO2浓度接近阈值', status: '未处理', handler: '-', handleTime: '-' },
  { time: '2025-01-14 18:20:00', level: '紧急', type: '安防告警', device: '门禁-主入口', content: '强行开门告警', status: '已处理', handler: '张三', handleTime: '2025-01-14 18:25:30' }
])

const levelTagType = (level: string) => {
  const map: Record<string, string> = { '紧急': 'danger', '重要': 'warning', '次要': 'info', '提示': '' }
  return map[level] || ''
}
const statusTagType = (status: string) => {
  const map: Record<string, string> = { '未处理': 'danger', '处理中': 'warning', '已处理': 'success' }
  return map[status] || ''
}

const trendRef = ref()
const levelRef = ref()
const typeRef = ref()

const handleSearch = () => { ElMessage.success('查询告警数据') }
const handleReset = () => { Object.assign(filters, { dateRange: [], level: '', type: '', status: '' }); ElMessage.info('已重置筛选条件') }
const handleExport = () => { ElMessage.success('正在导出报表...') }

const initCharts = () => {
  if (trendRef.value) {
    echarts.init(trendRef.value).setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['紧急', '重要', '次要', '提示'], bottom: 0 },
      grid: { left: 50, right: 30, top: 30, bottom: 50 },
      xAxis: { type: 'category', data: ['01-09', '01-10', '01-11', '01-12', '01-13', '01-14', '01-15'] },
      yAxis: { type: 'value' },
      series: [
        { name: '紧急', type: 'bar', stack: 'total', data: [2, 1, 3, 1, 2, 1, 2], itemStyle: { color: '#F56C6C' } },
        { name: '重要', type: 'bar', stack: 'total', data: [5, 4, 6, 3, 5, 4, 5], itemStyle: { color: '#E6A23C' } },
        { name: '次要', type: 'bar', stack: 'total', data: [12, 10, 15, 8, 11, 9, 12], itemStyle: { color: '#409EFF' } },
        { name: '提示', type: 'bar', stack: 'total', data: [20, 18, 22, 15, 19, 16, 21], itemStyle: { color: '#67C23A' } }
      ]
    })
  }
  if (levelRef.value) {
    echarts.init(levelRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 12, name: '紧急', itemStyle: { color: '#F56C6C' } },
        { value: 35, name: '重要', itemStyle: { color: '#E6A23C' } },
        { value: 89, name: '次要', itemStyle: { color: '#409EFF' } },
        { value: 150, name: '提示', itemStyle: { color: '#67C23A' } }
      ], label: { fontSize: 10 } }]
    })
  }
  if (typeRef.value) {
    echarts.init(typeRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 68, name: '设备告警', itemStyle: { color: '#409EFF' } },
        { value: 85, name: '安防告警', itemStyle: { color: '#F56C6C' } },
        { value: 52, name: '消防告警', itemStyle: { color: '#E6A23C' } },
        { value: 81, name: '环境告警', itemStyle: { color: '#67C23A' } }
      ], label: { fontSize: 10 } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.report-alarm-container { display: flex; flex-direction: column; gap: 12px; }

.filter-bar { background: #fff; border-radius: 8px; padding: 16px 16px 0; .el-form-item { margin-bottom: 16px; } }

.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 14px; .icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 22px; font-weight: 600; } .label { color: #909399; font-size: 13px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.critical .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  &.pending .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.resolved .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 14px 16px; border-bottom: 1px solid #ebeef5; font-weight: 600; } }

.chart-row { .trend-chart { height: 260px; padding: 12px 16px; } .pie-chart { height: 260px; padding: 12px; } }

.pagination { padding: 12px 16px; display: flex; justify-content: flex-end; }
</style>
