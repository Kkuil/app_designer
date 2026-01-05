<template>
  <div class="report-energy-container">
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="日期范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width:240px" />
        </el-form-item>
        <el-form-item label="建筑">
          <el-select v-model="filters.building" placeholder="选择建筑" style="width:160px">
            <el-option label="全部建筑" value="" />
            <el-option label="A座" value="A" />
            <el-option label="B座" value="B" />
            <el-option label="C座" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="能耗类型">
          <el-select v-model="filters.type" placeholder="选择类型" style="width:140px">
            <el-option label="全部" value="" />
            <el-option label="电" value="electricity" />
            <el-option label="水" value="water" />
            <el-option label="气" value="gas" />
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
        <div class="stat-card electricity"><div class="icon"><el-icon :size="24"><Lightning /></el-icon></div><div class="content"><div class="value">{{ stats.electricity.toLocaleString() }} <span class="unit">kWh</span></div><div class="label">用电量</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card water"><div class="icon"><el-icon :size="24"><Coffee /></el-icon></div><div class="content"><div class="value">{{ stats.water.toLocaleString() }} <span class="unit">m³</span></div><div class="label">用水量</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card gas"><div class="icon"><el-icon :size="24"><Odometer /></el-icon></div><div class="content"><div class="value">{{ stats.gas.toLocaleString() }} <span class="unit">m³</span></div><div class="label">用气量</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card cost"><div class="icon"><el-icon :size="24"><Money /></el-icon></div><div class="content"><div class="value">¥{{ stats.cost.toLocaleString() }}</div><div class="label">总费用</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="16">
        <div class="panel">
          <div class="panel-header"><span>能耗趋势</span>
            <el-radio-group v-model="chartPeriod" size="small">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendRef" class="trend-chart"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="panel">
          <div class="panel-header"><span>能耗占比</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>
    </el-row>

    <div class="panel">
      <div class="panel-header"><span>能耗明细</span></div>
      <el-table :data="tableData" stripe height="320">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="building" label="建筑" width="100" />
        <el-table-column prop="electricity" label="用电量(kWh)" width="130" />
        <el-table-column prop="water" label="用水量(m³)" width="120" />
        <el-table-column prop="gas" label="用气量(m³)" width="120" />
        <el-table-column prop="cost" label="费用(元)" width="120" />
        <el-table-column prop="yoy" label="同比" width="100">
          <template #default="{ row }"><span :style="{ color: row.yoy > 0 ? '#F56C6C' : '#67C23A' }">{{ row.yoy > 0 ? '+' : '' }}{{ row.yoy }}%</span></template>
        </el-table-column>
        <el-table-column prop="mom" label="环比" width="100">
          <template #default="{ row }"><span :style="{ color: row.mom > 0 ? '#F56C6C' : '#67C23A' }">{{ row.mom > 0 ? '+' : '' }}{{ row.mom }}%</span></template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination layout="total, prev, pager, next" :total="100" :page-size="10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Search, Refresh, Download, Lightning, Coffee, Odometer, Money } from '@element-plus/icons-vue'

const filters = reactive({ dateRange: [], building: '', type: '' })
const stats = reactive({ electricity: 125680, water: 3420, gas: 1850, cost: 186500 })
const chartPeriod = ref('day')

const tableData = ref([
  { date: '2025-01-15', building: 'A座', electricity: 4200, water: 120, gas: 65, cost: 6280, yoy: -3.2, mom: 1.5 },
  { date: '2025-01-15', building: 'B座', electricity: 3800, water: 95, gas: 52, cost: 5640, yoy: 2.1, mom: -0.8 },
  { date: '2025-01-14', building: 'A座', electricity: 4150, water: 118, gas: 62, cost: 6180, yoy: -2.8, mom: 0.5 },
  { date: '2025-01-14', building: 'B座', electricity: 3750, water: 92, gas: 50, cost: 5580, yoy: 1.8, mom: -1.2 },
  { date: '2025-01-13', building: 'C座', electricity: 2800, water: 78, gas: 38, cost: 4120, yoy: -1.5, mom: 2.3 }
])

const trendRef = ref()
const pieRef = ref()

const handleSearch = () => { ElMessage.success('查询能耗数据') }
const handleReset = () => { Object.assign(filters, { dateRange: [], building: '', type: '' }); ElMessage.info('已重置筛选条件') }
const handleExport = () => { ElMessage.success('正在导出报表...') }

const initCharts = () => {
  if (trendRef.value) {
    echarts.init(trendRef.value).setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['用电量', '用水量', '用气量'], bottom: 0 },
      grid: { left: 50, right: 30, top: 30, bottom: 50 },
      xAxis: { type: 'category', data: ['01-09', '01-10', '01-11', '01-12', '01-13', '01-14', '01-15'] },
      yAxis: [{ type: 'value', name: 'kWh' }, { type: 'value', name: 'm³' }],
      series: [
        { name: '用电量', type: 'bar', data: [3800, 4100, 3950, 4200, 4050, 3900, 4150], itemStyle: { color: '#409EFF' } },
        { name: '用水量', type: 'line', yAxisIndex: 1, data: [105, 112, 98, 120, 115, 108, 118], itemStyle: { color: '#67C23A' } },
        { name: '用气量', type: 'line', yAxisIndex: 1, data: [55, 62, 48, 65, 58, 52, 60], itemStyle: { color: '#E6A23C' } }
      ]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: ['45%', '70%'], data: [
        { value: 68, name: '电费', itemStyle: { color: '#409EFF' } },
        { value: 18, name: '水费', itemStyle: { color: '#67C23A' } },
        { value: 14, name: '气费', itemStyle: { color: '#E6A23C' } }
      ], label: { formatter: '{b}\n{d}%' } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.report-energy-container { display: flex; flex-direction: column; gap: 12px; }

.filter-bar { background: #fff; border-radius: 8px; padding: 16px 16px 0; .el-form-item { margin-bottom: 16px; } }

.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 14px; .icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 22px; font-weight: 600; .unit { font-size: 12px; font-weight: 400; color: #909399; } } .label { color: #909399; font-size: 13px; } }
  &.electricity .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.water .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.gas .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.cost .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 14px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } }

.chart-row { .trend-chart { height: 280px; padding: 12px 16px; } .pie-chart { height: 280px; padding: 12px; } }

.pagination { padding: 12px 16px; display: flex; justify-content: flex-end; }
</style>
