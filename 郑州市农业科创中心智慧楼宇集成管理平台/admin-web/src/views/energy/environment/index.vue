<template>
  <div class="environment-monitor-container">
    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="监测区域">
          <el-select v-model="searchForm.area" placeholder="请选择区域" clearable style="width: 160px">
            <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="监测类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 140px">
            <el-option label="温度" value="temperature" />
            <el-option label="湿度" value="humidity" />
            <el-option label="PM2.5" value="pm25" />
            <el-option label="CO2" value="co2" />
            <el-option label="光照" value="light" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="正常" value="normal" />
            <el-option label="报警" value="alarm" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 340px"
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

    <!-- 实时环境数据卡片 -->
    <el-row :gutter="16" class="env-cards-row">
      <el-col :span="4" v-for="card in envCards" :key="card.type">
        <el-card class="env-card" shadow="hover" :class="{ 'alarm': card.isAlarm }">
          <div class="env-card-header">
            <div class="env-icon" :style="{ backgroundColor: card.bgColor }">
              <el-icon :size="24" :color="card.color">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <el-tag v-if="card.isAlarm" type="danger" size="small" effect="dark">报警</el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </div>
          <div class="env-value">
            <span class="value">{{ card.value }}</span>
            <span class="unit">{{ card.unit }}</span>
          </div>
          <div class="env-name">{{ card.name }}</div>
          <div class="env-range">
            <span class="label">正常范围:</span>
            <span class="range">{{ card.range }}</span>
          </div>
          <div class="env-trend" :class="card.trend > 0 ? 'up' : 'down'">
            <el-icon v-if="card.trend > 0"><Top /></el-icon>
            <el-icon v-else><Bottom /></el-icon>
            <span>较1小时前 {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 区域环境监测总览 -->
    <el-card class="overview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">区域环境监测总览</span>
          <div class="header-actions">
            <el-button-group>
              <el-button :type="viewMode === 'card' ? 'primary' : ''" size="small" @click="viewMode = 'card'">
                <el-icon><Grid /></el-icon>
              </el-button>
              <el-button :type="viewMode === 'list' ? 'primary' : ''" size="small" @click="viewMode = 'list'">
                <el-icon><List /></el-icon>
              </el-button>
            </el-button-group>
            <el-button size="small" @click="handleRefreshAll">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="area-cards">
        <div class="area-card" v-for="area in areaData" :key="area.id">
          <div class="area-header">
            <span class="area-name">{{ area.name }}</span>
            <el-tag :type="getAreaStatusType(area.status)" size="small">{{ area.statusText }}</el-tag>
          </div>
          <div class="area-env-grid">
            <div class="env-item">
              <div class="env-label">温度</div>
              <div class="env-data" :class="{ 'alarm': area.temperature.isAlarm }">
                {{ area.temperature.value }}°C
              </div>
            </div>
            <div class="env-item">
              <div class="env-label">湿度</div>
              <div class="env-data" :class="{ 'alarm': area.humidity.isAlarm }">
                {{ area.humidity.value }}%
              </div>
            </div>
            <div class="env-item">
              <div class="env-label">PM2.5</div>
              <div class="env-data" :class="{ 'alarm': area.pm25.isAlarm }">
                {{ area.pm25.value }}
              </div>
            </div>
            <div class="env-item">
              <div class="env-label">CO2</div>
              <div class="env-data" :class="{ 'alarm': area.co2.isAlarm }">
                {{ area.co2.value }}ppm
              </div>
            </div>
          </div>
          <div class="area-footer">
            <span class="update-time">{{ area.updateTime }}</span>
            <el-button type="primary" link size="small" @click="handleViewAreaDetail(area)">详情</el-button>
          </div>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <el-table v-else :data="areaData" border stripe style="width: 100%">
        <el-table-column prop="name" label="区域名称" width="150" />
        <el-table-column label="温度(°C)" width="120">
          <template #default="{ row }">
            <span :class="{ 'alarm-text': row.temperature.isAlarm }">{{ row.temperature.value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="湿度(%)" width="120">
          <template #default="{ row }">
            <span :class="{ 'alarm-text': row.humidity.isAlarm }">{{ row.humidity.value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="PM2.5(μg/m³)" width="130">
          <template #default="{ row }">
            <span :class="{ 'alarm-text': row.pm25.isAlarm }">{{ row.pm25.value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="CO2(ppm)" width="120">
          <template #default="{ row }">
            <span :class="{ 'alarm-text': row.co2.isAlarm }">{{ row.co2.value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="光照(Lux)" width="120">
          <template #default="{ row }">
            <span>{{ row.light?.value || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="statusText" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAreaStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewAreaDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 环境趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">环境数据趋势</span>
              <div class="header-actions">
                <el-select v-model="chartArea" size="small" style="width: 140px; margin-right: 10px">
                  <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-radio-group v-model="chartType" size="small">
                  <el-radio-button label="temperature">温度</el-radio-button>
                  <el-radio-button label="humidity">湿度</el-radio-button>
                  <el-radio-button label="pm25">PM2.5</el-radio-button>
                  <el-radio-button label="co2">CO2</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div ref="trendChartRef" class="trend-chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">环境质量分布</span>
            </div>
          </template>
          <div ref="qualityChartRef" class="quality-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报警记录 -->
    <el-card class="alarm-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">
            环境报警记录
            <el-badge :value="alarmCount" :max="99" class="alarm-badge" />
          </span>
          <div class="header-actions">
            <el-button type="danger" size="small" @click="handleClearAllAlarm">
              <el-icon><Delete /></el-icon>
              清除所有报警
            </el-button>
            <el-button size="small" @click="handleExportAlarm">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="alarmData" border stripe style="width: 100%">
        <el-table-column prop="id" label="报警ID" width="100" />
        <el-table-column prop="area" label="区域" width="140" />
        <el-table-column prop="type" label="报警类型" width="120">
          <template #default="{ row }">
            <el-tag type="danger" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="报警内容" min-width="200" />
        <el-table-column prop="value" label="当前值" width="100" />
        <el-table-column prop="threshold" label="阈值" width="100" />
        <el-table-column prop="level" label="报警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelType(row.level)" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="报警时间" width="180" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已处理' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleProcessAlarm(row)">处理</el-button>
            <el-button type="primary" link size="small" @click="handleViewAlarmDetail(row)">详情</el-button>
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
        />
      </div>
    </el-card>

    <!-- 阈值设置弹窗 -->
    <el-dialog v-model="thresholdDialogVisible" title="报警阈值设置" width="600px">
      <el-form :model="thresholdForm" label-width="120px">
        <el-divider content-position="left">温度设置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低温度">
              <el-input-number v-model="thresholdForm.tempMin" :min="-20" :max="50" />
              <span class="unit-text">°C</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高温度">
              <el-input-number v-model="thresholdForm.tempMax" :min="-20" :max="50" />
              <span class="unit-text">°C</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">湿度设置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低湿度">
              <el-input-number v-model="thresholdForm.humidityMin" :min="0" :max="100" />
              <span class="unit-text">%</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高湿度">
              <el-input-number v-model="thresholdForm.humidityMax" :min="0" :max="100" />
              <span class="unit-text">%</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">PM2.5设置</el-divider>
        <el-form-item label="PM2.5上限">
          <el-input-number v-model="thresholdForm.pm25Max" :min="0" :max="500" />
          <span class="unit-text">μg/m³</span>
        </el-form-item>
        <el-divider content-position="left">CO2设置</el-divider>
        <el-form-item label="CO2上限">
          <el-input-number v-model="thresholdForm.co2Max" :min="0" :max="5000" />
          <span class="unit-text">ppm</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="thresholdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveThreshold">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Search, Refresh, Download, Delete, Grid, List, Top, Bottom, Sunny, Cloudy } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = ref({
  area: '',
  type: '',
  status: '',
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

// 环境数据卡片
const envCards = ref([
  {
    type: 'temperature',
    name: '平均温度',
    value: 24.5,
    unit: '°C',
    icon: Sunny,
    color: '#F56C6C',
    bgColor: 'rgba(245, 108, 108, 0.1)',
    range: '18-28°C',
    trend: 2.3,
    isAlarm: false
  },
  {
    type: 'humidity',
    name: '平均湿度',
    value: 65,
    unit: '%',
    icon: Cloudy,
    color: '#409EFF',
    bgColor: 'rgba(64, 158, 255, 0.1)',
    range: '40-70%',
    trend: -1.5,
    isAlarm: false
  },
  {
    type: 'pm25',
    name: 'PM2.5',
    value: 35,
    unit: 'μg/m³',
    icon: Cloudy,
    color: '#67C23A',
    bgColor: 'rgba(103, 194, 58, 0.1)',
    range: '<75',
    trend: -5.2,
    isAlarm: false
  },
  {
    type: 'co2',
    name: 'CO2浓度',
    value: 680,
    unit: 'ppm',
    icon: Cloudy,
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.1)',
    range: '<1000',
    trend: 3.8,
    isAlarm: false
  },
  {
    type: 'light',
    name: '光照强度',
    value: 12500,
    unit: 'Lux',
    icon: Sunny,
    color: '#909399',
    bgColor: 'rgba(144, 147, 153, 0.1)',
    range: '500-50000',
    trend: 15.2,
    isAlarm: false
  },
  {
    type: 'noise',
    name: '噪音',
    value: 45,
    unit: 'dB',
    icon: Cloudy,
    color: '#606266',
    bgColor: 'rgba(96, 98, 102, 0.1)',
    range: '<60',
    trend: -2.1,
    isAlarm: false
  }
])

// 视图模式
const viewMode = ref('card')

// 区域数据
const areaData = ref([
  {
    id: 1,
    name: '1号实验楼',
    temperature: { value: 24.5, isAlarm: false },
    humidity: { value: 62, isAlarm: false },
    pm25: { value: 28, isAlarm: false },
    co2: { value: 580, isAlarm: false },
    light: { value: 850 },
    status: 'normal',
    statusText: '正常',
    updateTime: '2025-01-15 14:32:18'
  },
  {
    id: 2,
    name: '2号实验楼',
    temperature: { value: 25.2, isAlarm: false },
    humidity: { value: 58, isAlarm: false },
    pm25: { value: 32, isAlarm: false },
    co2: { value: 620, isAlarm: false },
    light: { value: 920 },
    status: 'normal',
    statusText: '正常',
    updateTime: '2025-01-15 14:32:15'
  },
  {
    id: 3,
    name: '温室大棚A区',
    temperature: { value: 32.5, isAlarm: true },
    humidity: { value: 85, isAlarm: true },
    pm25: { value: 18, isAlarm: false },
    co2: { value: 1250, isAlarm: true },
    light: { value: 45000 },
    status: 'alarm',
    statusText: '报警',
    updateTime: '2025-01-15 14:32:12'
  },
  {
    id: 4,
    name: '温室大棚B区',
    temperature: { value: 28.8, isAlarm: false },
    humidity: { value: 72, isAlarm: false },
    pm25: { value: 22, isAlarm: false },
    co2: { value: 820, isAlarm: false },
    light: { value: 38000 },
    status: 'normal',
    statusText: '正常',
    updateTime: '2025-01-15 14:32:08'
  },
  {
    id: 5,
    name: '办公楼',
    temperature: { value: 23.5, isAlarm: false },
    humidity: { value: 55, isAlarm: false },
    pm25: { value: 35, isAlarm: false },
    co2: { value: 520, isAlarm: false },
    light: { value: 650 },
    status: 'normal',
    statusText: '正常',
    updateTime: '2025-01-15 14:32:05'
  },
  {
    id: 6,
    name: '仓储中心',
    temperature: { value: 18.2, isAlarm: false },
    humidity: { value: 48, isAlarm: false },
    pm25: { value: 42, isAlarm: false },
    co2: { value: 380, isAlarm: false },
    light: { value: 320 },
    status: 'normal',
    statusText: '正常',
    updateTime: '2025-01-15 14:32:02'
  }
])

// 图表相关
const chartArea = ref('lab1')
const chartType = ref('temperature')
const trendChartRef = ref<HTMLElement | null>(null)
const qualityChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let qualityChart: echarts.ECharts | null = null

// 报警数据
const alarmCount = ref(8)
const alarmData = ref([
  { id: 'ALM-001', area: '温室大棚A区', type: '高温报警', content: '温度超过上限阈值', value: '32.5°C', threshold: '28°C', level: '严重', time: '2025-01-15 14:28:35', status: '未处理' },
  { id: 'ALM-002', area: '温室大棚A区', type: '高湿报警', content: '湿度超过上限阈值', value: '85%', threshold: '70%', level: '一般', time: '2025-01-15 14:25:18', status: '未处理' },
  { id: 'ALM-003', area: '温室大棚A区', type: 'CO2报警', content: 'CO2浓度超过上限阈值', value: '1250ppm', threshold: '1000ppm', level: '严重', time: '2025-01-15 14:22:45', status: '未处理' },
  { id: 'ALM-004', area: '1号实验楼', type: 'PM2.5报警', content: 'PM2.5浓度超过上限阈值', value: '82μg/m³', threshold: '75μg/m³', level: '一般', time: '2025-01-15 13:45:22', status: '已处理' },
  { id: 'ALM-005', area: '2号实验楼', type: '低温报警', content: '温度低于下限阈值', value: '15.2°C', threshold: '18°C', level: '一般', time: '2025-01-15 12:18:35', status: '已处理' },
  { id: 'ALM-006', area: '办公楼', type: '低湿报警', content: '湿度低于下限阈值', value: '35%', threshold: '40%', level: '一般', time: '2025-01-15 11:28:12', status: '已处理' },
  { id: 'ALM-007', area: '仓储中心', type: '高温报警', content: '温度超过上限阈值', value: '30.5°C', threshold: '28°C', level: '一般', time: '2025-01-15 10:15:28', status: '已处理' },
  { id: 'ALM-008', area: '温室大棚B区', type: 'CO2报警', content: 'CO2浓度超过上限阈值', value: '1120ppm', threshold: '1000ppm', level: '一般', time: '2025-01-15 09:42:55', status: '已处理' }
])

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 86
})

// 阈值设置
const thresholdDialogVisible = ref(false)
const thresholdForm = ref({
  tempMin: 18,
  tempMax: 28,
  humidityMin: 40,
  humidityMax: 70,
  pm25Max: 75,
  co2Max: 1000
})

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const tempData = [22.5, 22.2, 21.8, 21.5, 21.2, 21.5, 22.0, 23.5, 24.8, 25.5, 26.2, 26.8, 27.2, 27.5, 27.8, 27.5, 27.0, 26.5, 25.8, 25.0, 24.2, 23.5, 23.0, 22.8]
  const upperLimit = Array(24).fill(28)
  const lowerLimit = Array(24).fill(18)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['温度', '上限', '下限'],
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
      data: hours,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      min: 15,
      max: 35
    },
    series: [
      {
        name: '温度',
        type: 'line',
        smooth: true,
        data: tempData,
        itemStyle: { color: '#F56C6C' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        }
      },
      {
        name: '上限',
        type: 'line',
        data: upperLimit,
        itemStyle: { color: '#E6A23C' },
        lineStyle: { type: 'dashed' }
      },
      {
        name: '下限',
        type: 'line',
        data: lowerLimit,
        itemStyle: { color: '#409EFF' },
        lineStyle: { type: 'dashed' }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化质量分布图表
const initQualityChart = () => {
  if (!qualityChartRef.value) return
  
  qualityChart = echarts.init(qualityChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}个区域 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
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
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 4, name: '优秀', itemStyle: { color: '#67C23A' } },
          { value: 1, name: '良好', itemStyle: { color: '#409EFF' } },
          { value: 1, name: '警告', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  
  qualityChart.setOption(option)
}

// 获取区域状态类型
const getAreaStatusType = (status: string) => {
  const types: { [key: string]: string } = {
    normal: 'success',
    alarm: 'danger',
    offline: 'info'
  }
  return types[status] || ''
}

// 获取报警级别类型
const getAlarmLevelType = (level: string) => {
  const types: { [key: string]: string } = {
    '严重': 'danger',
    '一般': 'warning',
    '提示': 'info'
  }
  return types[level] || ''
}

// 操作方法
const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.value = {
    area: '',
    type: '',
    status: '',
    dateRange: []
  }
  ElMessage.success('已重置')
}

const handleRefreshAll = () => {
  ElMessage.success('数据已刷新')
}

const handleViewAreaDetail = (area: any) => {
  ElMessage.info(`查看 ${area.name} 的详细环境数据`)
}

const handleProcessAlarm = (row: any) => {
  ElMessageBox.confirm(`确认处理报警 ${row.id}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = '已处理'
    alarmCount.value--
    ElMessage.success('报警已处理')
  }).catch(() => {})
}

const handleViewAlarmDetail = (row: any) => {
  ElMessage.info(`查看报警 ${row.id} 的详细信息`)
}

const handleClearAllAlarm = () => {
  ElMessageBox.confirm('确认清除所有已处理的报警记录?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已清除所有报警')
  }).catch(() => {})
}

const handleExportAlarm = () => {
  ElMessage.success('正在导出报警记录...')
}

const handleSaveThreshold = () => {
  thresholdDialogVisible.value = false
  ElMessage.success('阈值设置已保存')
}

// 监听图表类型变化
watch([chartArea, chartType], () => {
  initTrendChart()
})

// 窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  qualityChart?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initTrendChart()
    initQualityChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  qualityChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.environment-monitor-container {
  padding: 0;
  
  .filter-card {
    margin-bottom: 20px;
    
    :deep(.el-card__body) {
      padding-bottom: 2px;
    }
  }
  
  .env-cards-row {
    margin-bottom: 20px;
  }
  
  .env-card {
    text-align: center;
    transition: all 0.3s;
    
    &.alarm {
      border-color: #F56C6C;
      background: rgba(245, 108, 108, 0.05);
    }
    
    .env-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .env-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .env-value {
      margin-bottom: 8px;
      
      .value {
        font-size: 32px;
        font-weight: 700;
        color: #303133;
      }
      
      .unit {
        font-size: 14px;
        color: #909399;
        margin-left: 4px;
      }
    }
    
    .env-name {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }
    
    .env-range {
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
      
      .label {
        margin-right: 4px;
      }
    }
    
    .env-trend {
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      
      &.up {
        color: #F56C6C;
      }
      
      &.down {
        color: #67C23A;
      }
    }
  }
  
  .overview-card {
    margin-bottom: 20px;
    
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
    
    .area-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      
      .area-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        
        .area-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          
          .area-name {
            font-size: 15px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .area-env-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 12px;
          
          .env-item {
            text-align: center;
            padding: 8px;
            background: #fff;
            border-radius: 6px;
            
            .env-label {
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }
            
            .env-data {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              
              &.alarm {
                color: #F56C6C;
              }
            }
          }
        }
        
        .area-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #eee;
          
          .update-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
    
    .alarm-text {
      color: #F56C6C;
      font-weight: 600;
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
      
      .header-actions {
        display: flex;
        align-items: center;
      }
    }
    
    .trend-chart {
      height: 350px;
    }
    
    .quality-chart {
      height: 350px;
    }
  }
  
  .alarm-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
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
  
  .unit-text {
    margin-left: 8px;
    color: #909399;
  }
}
</style>
