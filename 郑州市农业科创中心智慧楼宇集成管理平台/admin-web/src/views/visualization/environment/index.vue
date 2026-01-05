<template>
  <div class="env-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card temp"><div class="icon"><el-icon :size="24"><Sunny /></el-icon></div><div class="content"><div class="value">{{ stats.temp }}°C</div><div class="label">平均温度</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card humidity"><div class="icon"><el-icon :size="24"><Watermelon /></el-icon></div><div class="content"><div class="value">{{ stats.humidity }}%</div><div class="label">平均湿度</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pm"><div class="icon"><el-icon :size="24"><Odometer /></el-icon></div><div class="content"><div class="value">{{ stats.pm25 }}</div><div class="label">PM2.5</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card co2"><div class="icon"><el-icon :size="24"><WindPower /></el-icon></div><div class="content"><div class="value">{{ stats.co2 }} ppm</div><div class="label">CO2浓度</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>区域选择</span></div>
          <div class="zone-list">
            <div v-for="zone in zoneList" :key="zone.id" class="zone-item" :class="{ active: selectedZone?.id === zone.id }" @click="handleSelectZone(zone)">
              <div class="name">{{ zone.name }}</div>
              <div class="meta">{{ zone.sensors }} 传感器</div>
              <el-tag :type="zone.status === 'good' ? 'success' : zone.status === 'fair' ? 'warning' : 'danger'" size="small">{{ zone.statusText }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>空气质量指数</span></div>
          <div class="aqi-display">
            <div class="aqi-value" :class="aqiLevel">{{ aqi }}</div>
            <div class="aqi-label">{{ aqiText }}</div>
          </div>
          <div ref="gaugeRef" class="gauge-chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>{{ selectedZone?.name || '区域' }} - 环境热力图</span>
            <el-radio-group v-model="heatmapType" size="small">
              <el-radio-button value="temp">温度</el-radio-button>
              <el-radio-button value="humidity">湿度</el-radio-button>
              <el-radio-button value="pm">PM2.5</el-radio-button>
            </el-radio-group>
          </div>
          <div class="heatmap-container">
            <div class="heatmap-grid">
              <div v-for="cell in heatmapData" :key="cell.id" class="heatmap-cell" :style="{ background: cell.color }">
                <div class="cell-value">{{ cell.value }}</div>
                <div class="cell-name">{{ cell.name }}</div>
              </div>
            </div>
            <div class="heatmap-legend">
              <span class="low">低</span>
              <div class="gradient"></div>
              <span class="high">高</span>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>环境趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>传感器列表</span></div>
          <div class="sensor-list">
            <div v-for="sensor in sensorList" :key="sensor.id" class="sensor-item">
              <div class="sensor-info"><div class="name">{{ sensor.name }}</div><div class="location">{{ sensor.location }}</div></div>
              <div class="sensor-value">{{ sensor.value }}</div>
              <el-tag :type="sensor.status === 'normal' ? 'success' : 'danger'" size="small">{{ sensor.status === 'normal' ? '正常' : '异常' }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>告警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="a in alarmList" :key="a.id" :type="a.level === 'high' ? 'danger' : 'warning'" :timestamp="a.time">
              <div class="alarm-title">{{ a.title }}</div>
              <div class="alarm-meta">{{ a.location }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { Sunny, Watermelon, Odometer, WindPower } from '@element-plus/icons-vue'

const stats = reactive({ temp: 24.5, humidity: 48, pm25: 18, co2: 680 })

const zoneList = ref([
  { id: 1, name: 'A栋办公区', sensors: 12, status: 'good', statusText: '优' },
  { id: 2, name: 'B栋办公区', sensors: 10, status: 'fair', statusText: '良' },
  { id: 3, name: '综合楼', sensors: 8, status: 'good', statusText: '优' },
  { id: 4, name: '地下车库', sensors: 6, status: 'poor', statusText: '差' }
])
const selectedZone = ref(zoneList.value[0])
const heatmapType = ref('temp')

const aqi = ref(42)
const aqiLevel = computed(() => aqi.value < 50 ? 'good' : aqi.value < 100 ? 'fair' : 'poor')
const aqiText = computed(() => aqi.value < 50 ? '优' : aqi.value < 100 ? '良' : '差')

const heatmapData = ref([
  { id: 1, name: '501', value: '24°C', color: 'rgba(64,158,255,0.6)' },
  { id: 2, name: '502', value: '25°C', color: 'rgba(64,158,255,0.7)' },
  { id: 3, name: '503', value: '26°C', color: 'rgba(230,162,60,0.6)' },
  { id: 4, name: '504', value: '23°C', color: 'rgba(64,158,255,0.5)' },
  { id: 5, name: '505', value: '27°C', color: 'rgba(245,108,108,0.6)' },
  { id: 6, name: '506', value: '24°C', color: 'rgba(64,158,255,0.6)' }
])

const sensorList = ref([
  { id: 1, name: '温度-501', location: 'A栋5F', value: '24.5°C', status: 'normal' },
  { id: 2, name: '湿度-502', location: 'A栋5F', value: '48%', status: 'normal' },
  { id: 3, name: 'CO2-503', location: 'A栋5F', value: '680ppm', status: 'normal' },
  { id: 4, name: 'PM2.5-504', location: 'A栋5F', value: '18', status: 'normal' }
])

const alarmList = ref([
  { id: 1, title: 'CO2超标', level: 'high', location: 'B栋3F会议室', time: '10:25' },
  { id: 2, title: '温度偏高', level: 'mid', location: '综合楼2F', time: '09:40' }
])

const chartRef = ref()
const gaugeRef = ref()

const handleSelectZone = (zone: any) => { selectedZone.value = zone }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['温度', '湿度', 'PM2.5'], top: 0, textStyle: { fontSize: 10 } },
      grid: { left: 40, right: 16, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: ['0h', '4h', '8h', '12h', '16h', '20h'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        { name: '温度', type: 'line', data: [22, 23, 24, 25, 24, 23], smooth: true },
        { name: '湿度', type: 'line', data: [45, 48, 50, 52, 48, 46], smooth: true },
        { name: 'PM2.5', type: 'line', data: [15, 18, 20, 22, 19, 17], smooth: true }
      ]
    })
  }
  if (gaugeRef.value) {
    echarts.init(gaugeRef.value).setOption({
      series: [{ type: 'gauge', radius: '90%', min: 0, max: 200, progress: { show: true, width: 12 }, axisLine: { lineStyle: { width: 12 } }, axisTick: { show: false }, splitLine: { length: 8, lineStyle: { width: 2 } }, axisLabel: { distance: 20, fontSize: 10 }, pointer: { show: false }, anchor: { show: false }, title: { show: false }, detail: { show: false }, data: [{ value: aqi.value }] }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.env-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.temp .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  &.humidity .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.pm .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.co2 .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.zone-list { padding: 8px; max-height: 220px; overflow: auto; .zone-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .name { font-weight: 500; } .meta { font-size: 12px; color: #909399; flex: 1; } } }

.aqi-display { text-align: center; padding: 12px; .aqi-value { font-size: 48px; font-weight: 700; &.good { color: #67C23A; } &.fair { color: #E6A23C; } &.poor { color: #F56C6C; } } .aqi-label { font-size: 14px; color: #909399; } }
.gauge-chart { height: 140px; }

.heatmap-container { padding: 16px; .heatmap-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; .heatmap-cell { border-radius: 8px; padding: 20px; text-align: center; .cell-value { font-size: 18px; font-weight: 600; color: #fff; } .cell-name { font-size: 12px; color: rgba(255,255,255,0.8); } } }
  .heatmap-legend { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; .gradient { width: 120px; height: 8px; background: linear-gradient(90deg, #409EFF, #E6A23C, #F56C6C); border-radius: 4px; } .low, .high { font-size: 12px; color: #909399; } }
}

.chart { height: 180px; padding: 8px 12px 12px; }

.sensor-list { padding: 8px; max-height: 240px; overflow: auto; .sensor-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; &:nth-child(odd) { background: #f8f9fb; } .sensor-info { flex: 1; .name { font-weight: 500; } .location { font-size: 12px; color: #909399; } } .sensor-value { font-weight: 600; } } }

.timeline { padding: 12px 16px; .alarm-title { font-weight: 500; } .alarm-meta { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }
</style>
