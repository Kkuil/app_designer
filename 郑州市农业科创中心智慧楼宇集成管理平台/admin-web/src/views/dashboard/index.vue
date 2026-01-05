<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card devices">
          <div class="stat-icon">
            <el-icon :size="32"><Cpu /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalDevices }}</div>
            <div class="stat-label">设备总数</div>
          </div>
          <div class="stat-trend up">
            <el-icon><Top /></el-icon>
            <span>+12%</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card online">
          <div class="stat-icon">
            <el-icon :size="32"><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.onlineDevices }}</div>
            <div class="stat-label">在线设备</div>
          </div>
          <div class="stat-trend up">
            <el-icon><Top /></el-icon>
            <span>+5%</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card alarms">
          <div class="stat-icon">
            <el-icon :size="32"><Bell /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeAlarms }}</div>
            <div class="stat-label">活跃报警</div>
          </div>
          <div class="stat-trend down">
            <el-icon><Bottom /></el-icon>
            <span>-8%</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card workorders">
          <div class="stat-icon">
            <el-icon :size="32"><Tickets /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingWorkorders }}</div>
            <div class="stat-label">待处理工单</div>
          </div>
          <div class="stat-trend">
            <span>较昨日持平</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">能耗趋势</span>
            <el-radio-group v-model="energyTimeRange" size="small">
              <el-radio-button label="day">今日</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="energyChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">设备状态分布</span>
          </div>
          <div ref="deviceStatusChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 报警和工单 -->
    <el-row :gutter="20" class="data-row">
      <el-col :xs="24" :lg="12">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">最新报警</span>
            <el-link type="primary" @click="$router.push('/alarm/realtime')">查看更多</el-link>
          </div>
          <el-table :data="latestAlarms" style="width: 100%" max-height="300">
            <el-table-column prop="level" label="等级" width="80">
              <template #default="{ row }">
                <el-tag :type="getAlarmLevelType(row.level)" size="small">
                  {{ getAlarmLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="deviceName" label="设备" min-width="120" />
            <el-table-column prop="content" label="报警内容" min-width="150" show-overflow-tooltip />
            <el-table-column prop="time" label="时间" width="160" />
          </el-table>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">待处理工单</span>
            <el-link type="primary" @click="$router.push('/operation/workorder')">查看更多</el-link>
          </div>
          <el-table :data="pendingWorkorders" style="width: 100%" max-height="300">
            <el-table-column prop="code" label="工单号" width="120" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
            <el-table-column prop="priority" label="优先级" width="80">
              <template #default="{ row }">
                <el-tag :type="getPriorityType(row.priority)" size="small">
                  {{ row.priority }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <!-- 环境监测 -->
    <el-row :gutter="20" class="env-row">
      <el-col :xs="24">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">环境监测</span>
          </div>
          <el-row :gutter="20">
            <el-col :xs="12" :sm="8" :md="4" v-for="item in environmentData" :key="item.name">
              <div class="env-item">
                <div class="env-icon" :style="{ backgroundColor: item.color }">
                  <el-icon :size="24"><component :is="item.icon" /></el-icon>
                </div>
                <div class="env-info">
                  <div class="env-value">{{ item.value }}{{ item.unit }}</div>
                  <div class="env-name">{{ item.name }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'
import { Sunny, Cloudy } from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  totalDevices: 1256,
  onlineDevices: 1189,
  activeAlarms: 23,
  pendingWorkorders: 15
})

const energyTimeRange = ref('day')
const energyChartRef = ref<HTMLElement>()
const deviceStatusChartRef = ref<HTMLElement>()

let energyChart: echarts.ECharts | null = null
let deviceStatusChart: echarts.ECharts | null = null

// 最新报警数据
const latestAlarms = ref([
  { level: 1, deviceName: '空调主机-01', content: '运行温度过高', time: '2025-01-15 14:30:22' },
  { level: 2, deviceName: '电梯-03', content: '电梯故障停机', time: '2025-01-15 14:25:18' },
  { level: 3, deviceName: '消防主机', content: '烟感探测器触发', time: '2025-01-15 14:20:05' },
  { level: 1, deviceName: '照明系统-2F', content: '照度低于设定值', time: '2025-01-15 14:15:33' },
  { level: 2, deviceName: '新风机组-01', content: '滤网需要更换', time: '2025-01-15 14:10:12' }
])

// 待处理工单数据
const pendingWorkorders = ref([
  { code: 'WO202501150001', type: '维修', title: '3楼空调不制冷', priority: '高' },
  { code: 'WO202501150002', type: '保养', title: '电梯年度保养', priority: '中' },
  { code: 'WO202501150003', type: '维修', title: '5楼灯具损坏', priority: '低' },
  { code: 'WO202501150004', type: '巡检', title: '消防设备巡检', priority: '中' },
  { code: 'WO202501150005', type: '维修', title: '停车场道闸故障', priority: '高' }
])

// 环境监测数据
const environmentData = ref([
  { name: '温度', value: 24.5, unit: '°C', icon: markRaw(Sunny), color: '#ff9800' },
  { name: '湿度', value: 65, unit: '%', icon: markRaw(Cloudy), color: '#2196f3' },
  { name: 'PM2.5', value: 35, unit: 'μg/m³', icon: markRaw(Cloudy), color: '#4caf50' },
  { name: 'CO2', value: 450, unit: 'ppm', icon: markRaw(Cloudy), color: '#9c27b0' },
  { name: '噪音', value: 42, unit: 'dB', icon: markRaw(Cloudy), color: '#f44336' },
  { name: '光照', value: 380, unit: 'lux', icon: markRaw(Sunny), color: '#ffc107' }
])

// 获取报警等级类型
const getAlarmLevelType = (level: number) => {
  const types = { 1: 'warning', 2: 'danger', 3: 'danger' }
  return types[level as keyof typeof types] || 'info'
}

// 获取报警等级文本
const getAlarmLevelText = (level: number) => {
  const texts = { 1: '一般', 2: '重要', 3: '紧急' }
  return texts[level as keyof typeof texts] || '未知'
}

// 获取优先级类型
const getPriorityType = (priority: string) => {
  const types: Record<string, string> = { '高': 'danger', '中': 'warning', '低': 'info' }
  return types[priority] || 'info'
}

// 初始化能耗图表
const initEnergyChart = () => {
  if (!energyChartRef.value) return
  
  energyChart = echarts.init(energyChartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['用电量', '用水量', '燃气量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '用电量',
        type: 'line',
        smooth: true,
        data: [120, 80, 150, 280, 320, 250, 180],
        areaStyle: { opacity: 0.3 }
      },
      {
        name: '用水量',
        type: 'line',
        smooth: true,
        data: [50, 30, 80, 120, 100, 90, 60],
        areaStyle: { opacity: 0.3 }
      },
      {
        name: '燃气量',
        type: 'line',
        smooth: true,
        data: [20, 15, 40, 60, 55, 45, 30],
        areaStyle: { opacity: 0.3 }
      }
    ]
  }
  
  energyChart.setOption(option)
}

// 初始化设备状态图表
const initDeviceStatusChart = () => {
  if (!deviceStatusChartRef.value) return
  
  deviceStatusChart = echarts.init(deviceStatusChartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '正常运行', itemStyle: { color: '#67C23A' } },
          { value: 141, name: '离线', itemStyle: { color: '#909399' } },
          { value: 42, name: '告警', itemStyle: { color: '#E6A23C' } },
          { value: 25, name: '故障', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  
  deviceStatusChart.setOption(option)
}

// 窗口大小变化处理
const handleResize = () => {
  energyChart?.resize()
  deviceStatusChart?.resize()
}

onMounted(() => {
  initEnergyChart()
  initDeviceStatusChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  energyChart?.dispose()
  deviceStatusChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  
  &.devices .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
  &.online .stat-icon { background: linear-gradient(135deg, #11998e, #38ef7d); }
  &.alarms .stat-icon { background: linear-gradient(135deg, #eb3349, #f45c43); }
  &.workorders .stat-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
  
  .stat-content {
    flex: 1;
    margin-left: 16px;
    
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }
    
    .stat-label {
      font-size: 14px;
      color: #999;
      margin-top: 4px;
    }
  }
  
  .stat-trend {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
    
    &.up {
      color: #67C23A;
    }
    
    &.down {
      color: #F56C6C;
    }
  }
}

.chart-row,
.data-row,
.env-row {
  margin-bottom: 20px;
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
}

.chart-container {
  height: 300px;
}

.env-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;
  
  .env-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  
  .env-info {
    margin-left: 12px;
    
    .env-value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    
    .env-name {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}
</style>
