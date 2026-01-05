<template>
  <div class="energy-analysis-container">
    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="分析类型">
          <el-select v-model="searchForm.analysisType" placeholder="请选择分析类型" style="width: 140px">
            <el-option label="日分析" value="day" />
            <el-option label="周分析" value="week" />
            <el-option label="月分析" value="month" />
            <el-option label="年分析" value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="能源类型">
          <el-select v-model="searchForm.energyType" placeholder="请选择能源类型" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="电" value="electric" />
            <el-option label="水" value="water" />
            <el-option label="燃气" value="gas" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="searchForm.area" placeholder="请选择区域" clearable style="width: 160px">
            <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比时间">
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
            分析
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="stat in statCards" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
              <el-icon :size="28" :color="stat.color">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span></div>
              <div class="stat-label">{{ stat.title }}</div>
              <div class="stat-compare" :class="stat.trend > 0 ? 'up' : 'down'">
                <el-icon v-if="stat.trend > 0"><Top /></el-icon>
                <el-icon v-else><Bottom /></el-icon>
                <span>{{ stat.compareType }}{{ Math.abs(stat.trend) }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">能耗对比分析</span>
              <el-radio-group v-model="compareType" size="small">
                <el-radio-button label="yoy">同比</el-radio-button>
                <el-radio-button label="mom">环比</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="compareChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">能源结构占比</span>
            </div>
          </template>
          <div ref="structureChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">能耗趋势分析</span>
              <el-select v-model="trendEnergyType" size="small" style="width: 100px">
                <el-option label="用电量" value="electric" />
                <el-option label="用水量" value="water" />
                <el-option label="用气量" value="gas" />
              </el-select>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container-lg"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">分时段能耗</span>
            </div>
          </template>
          <div ref="timeDistributionRef" class="chart-container-lg"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 能耗排名 -->
    <el-row :gutter="20" class="ranking-row">
      <el-col :span="12">
        <el-card class="ranking-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">区域能耗排名</span>
              <el-tag type="warning" size="small">本月</el-tag>
            </div>
          </template>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(item, index) in areaRanking" :key="item.name">
              <div class="ranking-info">
                <span class="ranking-index" :class="getRankingClass(index)">{{ index + 1 }}</span>
                <span class="ranking-name">{{ item.name }}</span>
              </div>
              <div class="ranking-bar-wrapper">
                <div class="ranking-bar" :style="{ width: item.percent + '%', backgroundColor: getBarColor(index) }"></div>
              </div>
              <div class="ranking-value">{{ item.value }}<span class="unit">kWh</span></div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="ranking-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">设备能耗排名</span>
              <el-tag type="warning" size="small">本月</el-tag>
            </div>
          </template>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(item, index) in deviceRanking" :key="item.name">
              <div class="ranking-info">
                <span class="ranking-index" :class="getRankingClass(index)">{{ index + 1 }}</span>
                <span class="ranking-name">{{ item.name }}</span>
              </div>
              <div class="ranking-bar-wrapper">
                <div class="ranking-bar" :style="{ width: item.percent + '%', backgroundColor: getBarColor(index) }"></div>
              </div>
              <div class="ranking-value">{{ item.value }}<span class="unit">kWh</span></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">能耗分析明细</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="handleExportDetail">
              <el-icon><Download /></el-icon>
              导出明细
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="analysisData" border stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="area" label="区域" width="140" />
        <el-table-column prop="electricUsage" label="用电量(kWh)" width="120" />
        <el-table-column prop="waterUsage" label="用水量(m³)" width="120" />
        <el-table-column prop="gasUsage" label="用气量(m³)" width="120" />
        <el-table-column prop="totalCost" label="能耗成本(元)" width="120" />
        <el-table-column prop="yoyChange" label="同比变化" width="100">
          <template #default="{ row }">
            <span :class="row.yoyChange > 0 ? 'trend-up' : 'trend-down'">
              {{ row.yoyChange > 0 ? '+' : '' }}{{ row.yoyChange }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="momChange" label="环比变化" width="100">
          <template #default="{ row }">
            <span :class="row.momChange > 0 ? 'trend-up' : 'trend-down'">
              {{ row.momChange > 0 ? '+' : '' }}{{ row.momChange }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="能耗评价" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">查看详情</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Search, Refresh, Download, TrendCharts, Histogram, PieChart, Timer, Top, Bottom } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = ref({
  analysisType: 'month',
  energyType: '',
  area: '',
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

// 统计卡片数据
const statCards = ref([
  {
    title: '本月总能耗',
    value: '85,480',
    unit: 'kWh',
    icon: TrendCharts,
    color: '#409EFF',
    bgColor: 'rgba(64, 158, 255, 0.1)',
    trend: 5.8,
    compareType: '同比'
  },
  {
    title: '本月用电量',
    value: '68,520',
    unit: 'kWh',
    icon: Histogram,
    color: '#67C23A',
    bgColor: 'rgba(103, 194, 58, 0.1)',
    trend: -3.2,
    compareType: '同比'
  },
  {
    title: '本月用水量',
    value: '12,680',
    unit: 'm³',
    icon: PieChart,
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.1)',
    trend: 2.5,
    compareType: '同比'
  },
  {
    title: '能耗成本',
    value: '58,960',
    unit: '元',
    icon: Timer,
    color: '#F56C6C',
    bgColor: 'rgba(245, 108, 108, 0.1)',
    trend: -1.8,
    compareType: '同比'
  }
])

// 图表相关
const compareType = ref('yoy')
const trendEnergyType = ref('electric')
const compareChartRef = ref<HTMLElement | null>(null)
const structureChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
const timeDistributionRef = ref<HTMLElement | null>(null)

let compareChart: echarts.ECharts | null = null
let structureChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let timeDistributionChart: echarts.ECharts | null = null

// 区域排名数据
const areaRanking = ref([
  { name: '1号实验楼', value: 24560, percent: 100 },
  { name: '温室大棚A区', value: 18960, percent: 77 },
  { name: '2号实验楼', value: 15680, percent: 64 },
  { name: '温室大棚B区', value: 12580, percent: 51 },
  { name: '办公楼', value: 8560, percent: 35 },
  { name: '仓储中心', value: 5680, percent: 23 }
])

// 设备排名数据
const deviceRanking = ref([
  { name: '空调系统', value: 18560, percent: 100 },
  { name: '照明系统', value: 12680, percent: 68 },
  { name: '实验设备', value: 10560, percent: 57 },
  { name: '灌溉系统', value: 8960, percent: 48 },
  { name: '温控系统', value: 6580, percent: 35 },
  { name: '办公设备', value: 4280, percent: 23 }
])

// 分析明细数据
const analysisData = ref([
  { date: '2025-01-15', area: '1号实验楼', electricUsage: 856, waterUsage: 28, gasUsage: 15, totalCost: 689.5, yoyChange: 5.2, momChange: 2.1, status: '正常' },
  { date: '2025-01-15', area: '2号实验楼', electricUsage: 652, waterUsage: 22, gasUsage: 12, totalCost: 528.6, yoyChange: -3.8, momChange: -1.5, status: '优秀' },
  { date: '2025-01-15', area: '温室大棚A区', electricUsage: 425, waterUsage: 98, gasUsage: 0, totalCost: 412.8, yoyChange: 8.5, momChange: 3.2, status: '警告' },
  { date: '2025-01-15', area: '温室大棚B区', electricUsage: 365, waterUsage: 85, gasUsage: 0, totalCost: 356.2, yoyChange: 2.1, momChange: 0.8, status: '正常' },
  { date: '2025-01-15', area: '办公楼', electricUsage: 286, waterUsage: 18, gasUsage: 45, totalCost: 298.5, yoyChange: -5.6, momChange: -2.8, status: '优秀' },
  { date: '2025-01-15', area: '仓储中心', electricUsage: 186, waterUsage: 12, gasUsage: 8, totalCost: 168.2, yoyChange: 1.2, momChange: 0.5, status: '正常' },
  { date: '2025-01-14', area: '1号实验楼', electricUsage: 838, waterUsage: 26, gasUsage: 14, totalCost: 672.8, yoyChange: 4.8, momChange: 1.8, status: '正常' },
  { date: '2025-01-14', area: '2号实验楼', electricUsage: 662, waterUsage: 24, gasUsage: 13, totalCost: 538.2, yoyChange: -2.5, momChange: -0.8, status: '优秀' },
  { date: '2025-01-14', area: '温室大棚A区', electricUsage: 412, waterUsage: 95, gasUsage: 0, totalCost: 398.6, yoyChange: 7.2, momChange: 2.5, status: '警告' },
  { date: '2025-01-14', area: '温室大棚B区', electricUsage: 358, waterUsage: 82, gasUsage: 0, totalCost: 348.5, yoyChange: 1.8, momChange: 0.5, status: '正常' }
])

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 180
})

// 初始化对比图表
const initCompareChart = () => {
  if (!compareChartRef.value) return
  
  compareChart = echarts.init(compareChartRef.value)
  
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const thisYear = [7520, 6890, 7850, 8560, 9120, 10580, 11250, 10860, 9580, 8960, 8250, 7680]
  const lastYear = [7120, 6580, 7250, 7980, 8560, 9860, 10580, 10120, 8960, 8250, 7680, 7120]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['本期', '同期'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      name: '能耗(kWh)'
    },
    series: [
      {
        name: '本期',
        type: 'bar',
        barWidth: '35%',
        data: thisYear,
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '同期',
        type: 'bar',
        barWidth: '35%',
        data: lastYear,
        itemStyle: { color: '#91cc75', borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
  
  compareChart.setOption(option)
}

// 初始化结构图表
const initStructureChart = () => {
  if (!structureChartRef.value) return
  
  structureChart = echarts.init(structureChartRef.value)
  
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
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 68520, name: '用电量', itemStyle: { color: '#409EFF' } },
          { value: 12680, name: '用水量', itemStyle: { color: '#67C23A' } },
          { value: 4280, name: '用气量', itemStyle: { color: '#E6A23C' } }
        ]
      }
    ]
  }
  
  structureChart.setOption(option)
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
  const data = [2580, 2420, 2650, 2890, 2560, 2380, 2680, 2920, 3150, 2860, 2750, 2680, 2590, 2450, 2680, 2890, 3020, 2950, 2780, 2650, 2580, 2420, 2560, 2780, 2890, 2950, 2820, 2680, 2590, 2458]
  const avgData = Array(30).fill(2720)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['日用电量', '平均值'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: 'kWh'
    },
    series: [
      {
        name: '日用电量',
        type: 'line',
        smooth: true,
        data: data,
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: '平均值',
        type: 'line',
        data: avgData,
        itemStyle: { color: '#F56C6C' },
        lineStyle: { type: 'dashed' }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化分时段图表
const initTimeDistributionChart = () => {
  if (!timeDistributionRef.value) return
  
  timeDistributionChart = echarts.init(timeDistributionRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: ['50%', '45%'],
        data: [
          { value: 35680, name: '峰时', itemStyle: { color: '#F56C6C' } },
          { value: 28560, name: '平时', itemStyle: { color: '#409EFF' } },
          { value: 21240, name: '谷时', itemStyle: { color: '#67C23A' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  timeDistributionChart.setOption(option)
}

// 获取排名样式
const getRankingClass = (index: number) => {
  if (index === 0) return 'top1'
  if (index === 1) return 'top2'
  if (index === 2) return 'top3'
  return ''
}

// 获取进度条颜色
const getBarColor = (index: number) => {
  const colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A', '#909399', '#909399']
  return colors[index] || '#909399'
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: { [key: string]: string } = {
    '优秀': 'success',
    '正常': '',
    '警告': 'warning',
    '异常': 'danger'
  }
  return types[status] || ''
}

// 操作方法
const handleSearch = () => {
  ElMessage.success('开始分析数据...')
}

const handleReset = () => {
  searchForm.value = {
    analysisType: 'month',
    energyType: '',
    area: '',
    dateRange: []
  }
  ElMessage.success('已重置')
}

const handleExport = () => {
  ElMessage.success('正在生成分析报告...')
}

const handleExportDetail = () => {
  ElMessage.success('正在导出明细数据...')
}

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看 ${row.area} ${row.date} 的详细数据`)
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
}

const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
}

// 监听对比类型变化
watch(compareType, () => {
  initCompareChart()
})

watch(trendEnergyType, () => {
  initTrendChart()
})

// 窗口大小变化
const handleResize = () => {
  compareChart?.resize()
  structureChart?.resize()
  trendChart?.resize()
  timeDistributionChart?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initCompareChart()
    initStructureChart()
    initTrendChart()
    initTimeDistributionChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  compareChart?.dispose()
  structureChart?.dispose()
  trendChart?.dispose()
  timeDistributionChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.energy-analysis-container {
  padding: 0;
  
  .filter-card {
    margin-bottom: 20px;
    
    :deep(.el-card__body) {
      padding-bottom: 2px;
    }
  }
  
  .stat-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }
      
      .stat-info {
        flex: 1;
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          
          .stat-unit {
            font-size: 14px;
            font-weight: normal;
            color: #909399;
            margin-left: 4px;
          }
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin: 4px 0;
        }
        
        .stat-compare {
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          
          &.up {
            color: #F56C6C;
          }
          
          &.down {
            color: #67C23A;
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
    
    .chart-container {
      height: 300px;
    }
    
    .chart-container-lg {
      height: 350px;
    }
  }
  
  .ranking-row {
    margin-bottom: 20px;
  }
  
  .ranking-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .ranking-info {
          width: 140px;
          display: flex;
          align-items: center;
          
          .ranking-index {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #f0f0f0;
            color: #909399;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            
            &.top1 {
              background: #F56C6C;
              color: #fff;
            }
            
            &.top2 {
              background: #E6A23C;
              color: #fff;
            }
            
            &.top3 {
              background: #409EFF;
              color: #fff;
            }
          }
          
          .ranking-name {
            font-size: 14px;
            color: #303133;
          }
        }
        
        .ranking-bar-wrapper {
          flex: 1;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          margin: 0 16px;
          
          .ranking-bar {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s;
          }
        }
        
        .ranking-value {
          width: 100px;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          
          .unit {
            font-size: 12px;
            font-weight: normal;
            color: #909399;
            margin-left: 2px;
          }
        }
      }
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
    }
    
    .trend-up {
      color: #F56C6C;
    }
    
    .trend-down {
      color: #67C23A;
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}
</style>
