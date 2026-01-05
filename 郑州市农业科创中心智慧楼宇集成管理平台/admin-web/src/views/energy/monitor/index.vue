<template>
  <div class="energy-monitor-container">
    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="区域">
          <el-select v-model="searchForm.area" placeholder="请选择区域" clearable style="width: 160px">
            <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="能源类型">
          <el-select v-model="searchForm.energyType" placeholder="请选择能源类型" clearable style="width: 140px">
            <el-option label="电" value="electric" />
            <el-option label="水" value="water" />
            <el-option label="燃气" value="gas" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 实时功率仪表盘 -->
    <el-row :gutter="20" class="dashboard-row">
      <el-col :span="8" v-for="meter in meterData" :key="meter.type">
        <el-card class="meter-card" shadow="hover">
          <div class="meter-header">
            <div class="meter-icon" :style="{ backgroundColor: meter.color }">
              <el-icon :size="24" color="#fff">
                <component :is="meter.icon" />
              </el-icon>
            </div>
            <div class="meter-info">
              <span class="meter-title">{{ meter.title }}</span>
              <span class="meter-status" :class="meter.status">{{ meter.statusText }}</span>
            </div>
          </div>
          <div class="meter-chart" :ref="el => setMeterRef(el, meter.type)"></div>
          <div class="meter-stats">
            <div class="stat-item">
              <span class="stat-label">今日用量</span>
              <span class="stat-value">{{ meter.todayUsage }}<span class="stat-unit">{{ meter.unit }}</span></span>
            </div>
            <div class="stat-item">
              <span class="stat-label">本月累计</span>
              <span class="stat-value">{{ meter.monthUsage }}<span class="stat-unit">{{ meter.unit }}</span></span>
            </div>
            <div class="stat-item">
              <span class="stat-label">较昨日</span>
              <span class="stat-value" :class="meter.trend > 0 ? 'up' : 'down'">
                {{ meter.trend > 0 ? '+' : '' }}{{ meter.trend }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 环境参数趋势 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">环境参数趋势</span>
              <el-select v-model="envParamType" size="small" style="width: 120px">
                <el-option label="温度" value="temperature" />
                <el-option label="湿度" value="humidity" />
                <el-option label="CO2浓度" value="co2" />
                <el-option label="PM2.5" value="pm25" />
              </el-select>
            </div>
          </template>
          <div ref="envTrendChartRef" class="trend-chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">异常能耗统计</span>
              <el-date-picker v-model="abnormalDateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" size="small" style="width: 220px" />
            </div>
          </template>
          <div class="abnormal-stats">
            <div class="abnormal-summary">
              <div class="summary-item warning">
                <div class="summary-icon"><el-icon :size="24"><WarningFilled /></el-icon></div>
                <div class="summary-info">
                  <span class="summary-value">{{ abnormalStats.warningCount }}</span>
                  <span class="summary-label">预警次数</span>
                </div>
              </div>
              <div class="summary-item danger">
                <div class="summary-icon"><el-icon :size="24"><CircleCloseFilled /></el-icon></div>
                <div class="summary-info">
                  <span class="summary-value">{{ abnormalStats.alarmCount }}</span>
                  <span class="summary-label">告警次数</span>
                </div>
              </div>
              <div class="summary-item excess">
                <div class="summary-icon"><el-icon :size="24"><TrendCharts /></el-icon></div>
                <div class="summary-info">
                  <span class="summary-value">{{ abnormalStats.excessEnergy }}</span>
                  <span class="summary-label">超标能耗(kWh)</span>
                </div>
              </div>
            </div>
            <div ref="abnormalChartRef" class="abnormal-chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 能耗趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">能耗趋势</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button label="hour">时</el-radio-button>
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="trend-chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">能源占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="pie-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">实时监测数据</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button size="small" @click="handleRefreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="deviceId" label="设备编号" width="120" />
        <el-table-column prop="deviceName" label="设备名称" min-width="150" />
        <el-table-column prop="area" label="所属区域" width="120" />
        <el-table-column prop="energyType" label="能源类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getEnergyTagType(row.energyType)" size="small">
              {{ getEnergyTypeName(row.energyType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentValue" label="当前读数" width="120" />
        <el-table-column prop="power" label="实时功率" width="120" />
        <el-table-column prop="todayUsage" label="今日用量" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
              {{ row.status === 'normal' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button type="primary" link size="small" @click="handleViewHistory(row)">历史</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 设备详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="设备详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备编号">{{ currentDevice.deviceId }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentDevice.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="所属区域">{{ currentDevice.area }}</el-descriptions-item>
        <el-descriptions-item label="能源类型">{{ getEnergyTypeName(currentDevice.energyType) }}</el-descriptions-item>
        <el-descriptions-item label="当前读数">{{ currentDevice.currentValue }}</el-descriptions-item>
        <el-descriptions-item label="实时功率">{{ currentDevice.power }}</el-descriptions-item>
        <el-descriptions-item label="今日用量">{{ currentDevice.todayUsage }}</el-descriptions-item>
        <el-descriptions-item label="本月用量">{{ currentDevice.monthUsage }}</el-descriptions-item>
        <el-descriptions-item label="设备状态">
          <el-tag :type="currentDevice.status === 'normal' ? 'success' : 'danger'">
            {{ currentDevice.status === 'normal' ? '正常' : '异常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentDevice.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Search, Refresh, Download, Lightning, Watermelon, Smoking, WarningFilled, CircleCloseFilled, TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = ref({
  area: '',
  energyType: '',
  dateRange: []
})

// 区域选项
const areaOptions = [
  { label: '1号实验楼', value: 'lab1' },
  { label: '2号实验楼', value: 'lab2' },
  { label: '温室大棚A区', value: 'greenhouse_a' },
  { label: '温室大棚B区', value: 'greenhouse_b' },
  { label: '办公楼', value: 'office' },
  { label: '仓储中心', value: 'warehouse' }
]

// 仪表盘数据
const meterData = ref([
  {
    type: 'electric',
    title: '用电监测',
    icon: Lightning,
    color: '#409EFF',
    currentPower: 856.5,
    maxPower: 1200,
    todayUsage: '2,458',
    monthUsage: '68,520',
    unit: 'kWh',
    trend: 5.2,
    status: 'normal',
    statusText: '运行正常'
  },
  {
    type: 'water',
    title: '用水监测',
    icon: Watermelon,
    color: '#67C23A',
    currentPower: 125.8,
    maxPower: 300,
    todayUsage: '458',
    monthUsage: '12,680',
    unit: 'm³',
    trend: -3.8,
    status: 'normal',
    statusText: '运行正常'
  },
  {
    type: 'gas',
    title: '用气监测',
    icon: Smoking,
    color: '#E6A23C',
    currentPower: 45.2,
    maxPower: 100,
    todayUsage: '156',
    monthUsage: '4,280',
    unit: 'm³',
    trend: 2.1,
    status: 'warning',
    statusText: '轻微波动'
  }
])

// 图表引用
const meterRefs = ref<{ [key: string]: HTMLElement | null }>({})
const trendChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const envTrendChartRef = ref<HTMLElement | null>(null)
const abnormalChartRef = ref<HTMLElement | null>(null)
const trendType = ref('hour')
const envParamType = ref('temperature')
const abnormalDateRange = ref([])

// 异常能耗统计数据
const abnormalStats = ref({
  warningCount: 28,
  alarmCount: 5,
  excessEnergy: 2850
})

// 图表实例
let meterCharts: { [key: string]: echarts.ECharts } = {}
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let envTrendChart: echarts.ECharts | null = null
let abnormalChart: echarts.ECharts | null = null

// 设置仪表盘引用
const setMeterRef = (el: any, type: string) => {
  if (el) {
    meterRefs.value[type] = el
  }
}

// 初始化仪表盘图表
const initMeterCharts = () => {
  meterData.value.forEach(meter => {
    const el = meterRefs.value[meter.type]
    if (el) {
      const chart = echarts.init(el)
      meterCharts[meter.type] = chart
      
      const option = {
        series: [
          {
            type: 'gauge',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: meter.maxPower,
            splitNumber: 5,
            itemStyle: {
              color: meter.color
            },
            progress: {
              show: true,
              width: 20
            },
            pointer: {
              show: false
            },
            axisLine: {
              lineStyle: {
                width: 20,
                color: [[1, '#e6e6e6']]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 24,
              fontWeight: 'bold',
              offsetCenter: [0, '10%'],
              formatter: '{value}',
              color: meter.color
            },
            data: [{ value: meter.currentPower }]
          }
        ]
      }
      chart.setOption(option)
    }
  })
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const electricData = [420, 380, 350, 320, 310, 340, 450, 680, 850, 920, 890, 870, 860, 880, 910, 890, 920, 980, 850, 720, 650, 580, 520, 480]
  const waterData = [80, 75, 70, 65, 60, 70, 95, 130, 150, 145, 140, 135, 140, 145, 150, 145, 140, 135, 120, 105, 95, 90, 85, 82]
  const gasData = [30, 28, 25, 22, 20, 25, 35, 48, 55, 52, 50, 48, 50, 52, 55, 52, 50, 48, 42, 38, 35, 33, 32, 31]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['用电量(kWh)', '用水量(m³)', '用气量(m³)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' }
    },
    yAxis: [
      {
        type: 'value',
        name: '用电量',
        axisLine: { lineStyle: { color: '#409EFF' } },
        axisLabel: { color: '#666' }
      },
      {
        type: 'value',
        name: '用水/用气',
        axisLine: { lineStyle: { color: '#67C23A' } },
        axisLabel: { color: '#666' }
      }
    ],
    series: [
      {
        name: '用电量(kWh)',
        type: 'line',
        smooth: true,
        data: electricData,
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: '用水量(m³)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: waterData,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '用气量(m³)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: gasData,
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 68520, name: '用电', itemStyle: { color: '#409EFF' } },
          { value: 12680, name: '用水', itemStyle: { color: '#67C23A' } },
          { value: 4280, name: '用气', itemStyle: { color: '#E6A23C' } }
        ]
      }
    ]
  }
  
  pieChart.setOption(option)
}

// 初始化环境参数趋势图表
const initEnvTrendChart = () => {
  if (!envTrendChartRef.value) return
  
  envTrendChart = echarts.init(envTrendChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  
  const envData = {
    temperature: { data: [18, 17.5, 17, 17, 17.5, 18, 20, 22, 24, 25, 26, 26.5, 27, 26.5, 26, 25.5, 25, 24, 23, 22, 21, 20, 19, 18.5], name: '温度', unit: '°C', color: '#F56C6C', threshold: 26 },
    humidity: { data: [55, 56, 58, 60, 62, 60, 55, 50, 45, 42, 40, 38, 36, 38, 40, 42, 45, 48, 50, 52, 54, 55, 56, 55], name: '湿度', unit: '%', color: '#409EFF', threshold: 60 },
    co2: { data: [400, 380, 360, 350, 350, 380, 450, 580, 720, 850, 920, 980, 1020, 950, 880, 820, 780, 720, 650, 580, 520, 480, 450, 420], name: 'CO2浓度', unit: 'ppm', color: '#67C23A', threshold: 1000 },
    pm25: { data: [25, 22, 20, 18, 18, 20, 28, 35, 42, 48, 52, 55, 58, 52, 48, 45, 40, 38, 35, 32, 30, 28, 26, 25], name: 'PM2.5', unit: 'μg/m³', color: '#E6A23C', threshold: 50 }
  } as const
  
  type EnvParamKey = keyof typeof envData
  const currentEnv = envData[envParamType.value as EnvParamKey]
  if (!currentEnv) return
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: [currentEnv.name, '阈值'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: hours },
    yAxis: { type: 'value', name: currentEnv.unit },
    series: [
      {
        name: currentEnv.name,
        type: 'line',
        smooth: true,
        data: currentEnv.data,
        itemStyle: { color: currentEnv.color },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: currentEnv.color + '40' },
          { offset: 1, color: currentEnv.color + '05' }
        ]) },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markArea: {
          silent: true,
          data: [[
            { yAxis: currentEnv.threshold, itemStyle: { color: 'rgba(245, 108, 108, 0.1)' } },
            { yAxis: currentEnv.threshold * 1.5 }
          ]]
        }
      },
      {
        name: '阈值',
        type: 'line',
        data: Array(24).fill(currentEnv.threshold),
        lineStyle: { type: 'dashed', color: '#F56C6C' },
        itemStyle: { color: '#F56C6C' },
        symbol: 'none'
      }
    ]
  }
  
  envTrendChart.setOption(option)
}

// 初始化异常能耗图表
const initAbnormalChart = () => {
  if (!abnormalChartRef.value) return
  
  abnormalChart = echarts.init(abnormalChartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: ['1号楼', '2号楼', '温室A', '温室B', '办公楼', '仓储'] },
    yAxis: { type: 'value', name: '异常次数' },
    series: [
      {
        name: '预警',
        type: 'bar',
        stack: 'total',
        data: [5, 3, 8, 6, 4, 2],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '告警',
        type: 'bar',
        stack: 'total',
        data: [1, 0, 2, 1, 1, 0],
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }
  
  abnormalChart.setOption(option)
}

// 表格数据
const tableData = ref([
  { deviceId: 'ELE-001', deviceName: '1号楼总电表', area: '1号实验楼', energyType: 'electric', currentValue: '125680 kWh', power: '285.6 kW', todayUsage: '856 kWh', monthUsage: '24560 kWh', status: 'normal', updateTime: '2025-01-15 14:32:18' },
  { deviceId: 'ELE-002', deviceName: '2号楼总电表', area: '2号实验楼', energyType: 'electric', currentValue: '98520 kWh', power: '198.2 kW', todayUsage: '652 kWh', monthUsage: '18960 kWh', status: 'normal', updateTime: '2025-01-15 14:32:15' },
  { deviceId: 'WAT-001', deviceName: '园区总水表', area: '温室大棚A区', energyType: 'water', currentValue: '45680 m³', power: '45.8 m³/h', todayUsage: '158 m³', monthUsage: '4680 m³', status: 'normal', updateTime: '2025-01-15 14:32:10' },
  { deviceId: 'WAT-002', deviceName: '灌溉系统水表', area: '温室大棚B区', energyType: 'water', currentValue: '28960 m³', power: '28.5 m³/h', todayUsage: '98 m³', monthUsage: '2860 m³', status: 'normal', updateTime: '2025-01-15 14:32:08' },
  { deviceId: 'GAS-001', deviceName: '实验室燃气表', area: '1号实验楼', energyType: 'gas', currentValue: '8560 m³', power: '12.5 m³/h', todayUsage: '45 m³', monthUsage: '1280 m³', status: 'normal', updateTime: '2025-01-15 14:31:58' },
  { deviceId: 'ELE-003', deviceName: '温室电表A', area: '温室大棚A区', energyType: 'electric', currentValue: '56280 kWh', power: '125.8 kW', todayUsage: '425 kWh', monthUsage: '12580 kWh', status: 'normal', updateTime: '2025-01-15 14:31:55' },
  { deviceId: 'ELE-004', deviceName: '温室电表B', area: '温室大棚B区', energyType: 'electric', currentValue: '48960 kWh', power: '98.5 kW', todayUsage: '365 kWh', monthUsage: '10860 kWh', status: 'warning', updateTime: '2025-01-15 14:31:52' },
  { deviceId: 'WAT-003', deviceName: '办公楼水表', area: '办公楼', energyType: 'water', currentValue: '12580 m³', power: '8.2 m³/h', todayUsage: '28 m³', monthUsage: '856 m³', status: 'normal', updateTime: '2025-01-15 14:31:48' },
  { deviceId: 'ELE-005', deviceName: '仓储中心电表', area: '仓储中心', energyType: 'electric', currentValue: '32560 kWh', power: '65.2 kW', todayUsage: '186 kWh', monthUsage: '5680 kWh', status: 'normal', updateTime: '2025-01-15 14:31:45' },
  { deviceId: 'GAS-002', deviceName: '食堂燃气表', area: '办公楼', energyType: 'gas', currentValue: '5860 m³', power: '18.6 m³/h', todayUsage: '68 m³', monthUsage: '1980 m³', status: 'normal', updateTime: '2025-01-15 14:31:42' }
])

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 56
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentDevice = ref<any>({})

// 获取能源类型标签
const getEnergyTagType = (type: string) => {
  const types: { [key: string]: string } = {
    electric: '',
    water: 'success',
    gas: 'warning'
  }
  return types[type] || ''
}

// 获取能源类型名称
const getEnergyTypeName = (type: string) => {
  const names: { [key: string]: string } = {
    electric: '电',
    water: '水',
    gas: '燃气'
  }
  return names[type] || type
}

// 搜索
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 重置
const handleReset = () => {
  searchForm.value = {
    area: '',
    energyType: '',
    dateRange: []
  }
  ElMessage.success('已重置')
}

// 导出
const handleExport = () => {
  ElMessage.success('数据导出中...')
}

// 刷新数据
const handleRefreshData = () => {
  ElMessage.success('数据已刷新')
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentDevice.value = { ...row, monthUsage: row.monthUsage || '5680 kWh' }
  detailDialogVisible.value = true
}

// 查看历史
const handleViewHistory = (row: any) => {
  ElMessage.info(`查看 ${row.deviceName} 的历史数据`)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
}

const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
}

// 监听趋势类型变化
watch(trendType, () => {
  initTrendChart()
})

// 监听环境参数类型变化
watch(envParamType, () => {
  initEnvTrendChart()
})

// 窗口大小变化时重绘图表
const handleResize = () => {
  Object.values(meterCharts).forEach(chart => chart?.resize())
  trendChart?.resize()
  pieChart?.resize()
  envTrendChart?.resize()
  abnormalChart?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initMeterCharts()
    initTrendChart()
    initPieChart()
    initEnvTrendChart()
    initAbnormalChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  Object.values(meterCharts).forEach(chart => chart?.dispose())
  trendChart?.dispose()
  pieChart?.dispose()
  envTrendChart?.dispose()
  abnormalChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.energy-monitor-container {
  padding: 0;
  
  .filter-card {
    margin-bottom: 20px;
    
    :deep(.el-card__body) {
      padding-bottom: 2px;
    }
  }
  
  .dashboard-row {
    margin-bottom: 20px;
  }
  
  .meter-card {
    .meter-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .meter-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
      }
      
      .meter-info {
        display: flex;
        flex-direction: column;
        
        .meter-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
        
        .meter-status {
          font-size: 12px;
          color: #67C23A;
          
          &.warning {
            color: #E6A23C;
          }
        }
      }
    }
    
    .meter-chart {
      height: 160px;
    }
    
    .meter-stats {
      display: flex;
      justify-content: space-between;
      padding-top: 15px;
      border-top: 1px solid #eee;
      
      .stat-item {
        text-align: center;
        
        .stat-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          
          &.up {
            color: #F56C6C;
          }
          
          &.down {
            color: #67C23A;
          }
          
          .stat-unit {
            font-size: 12px;
            font-weight: normal;
            color: #909399;
            margin-left: 2px;
          }
        }
      }
    }
  }
  
  .chart-row {
    margin-bottom: 20px;
  }
  
  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .trend-chart {
      height: 350px;
    }
    
    .pie-chart {
      height: 350px;
    }
  }
  
  .abnormal-stats {
    .abnormal-summary {
      display: flex;
      justify-content: space-around;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
      
      .summary-item {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .summary-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        &.warning .summary-icon {
          background: rgba(230, 162, 60, 0.1);
          color: #E6A23C;
        }
        
        &.danger .summary-icon {
          background: rgba(245, 108, 108, 0.1);
          color: #F56C6C;
        }
        
        &.excess .summary-icon {
          background: rgba(64, 158, 255, 0.1);
          color: #409EFF;
        }
        
        .summary-info {
          display: flex;
          flex-direction: column;
          
          .summary-value {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
          }
          
          .summary-label {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
    
    .abnormal-chart {
      height: 200px;
    }
  }
  
  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}
</style>
