<template>
  <div class="security-vis-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card camera"><div class="icon"><el-icon :size="24"><VideoCamera /></el-icon></div><div class="content"><div class="value">{{ stats.cameras }}</div><div class="label">监控点位</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card access"><div class="icon"><el-icon :size="24"><Key /></el-icon></div><div class="content"><div class="value">{{ stats.access }}</div><div class="label">门禁设备</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card alarm"><div class="icon"><el-icon :size="24"><Bell /></el-icon></div><div class="content"><div class="value">{{ stats.alarms }}</div><div class="label">报警器</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card event"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.events }}</div><div class="label">今日事件</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>区域</span></div>
          <div class="zone-list">
            <div v-for="zone in zoneList" :key="zone.id" class="zone-item" :class="{ active: selectedZone?.id === zone.id }" @click="handleSelectZone(zone)">
              <div class="name">{{ zone.name }}</div>
              <div class="meta">{{ zone.cameras }} 摄像 · {{ zone.access }} 门禁</div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>设备统计</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>安防布点</span>
            <el-button-group>
              <el-button size="small" :type="mapLayer === 'all' ? 'primary' : ''" @click="mapLayer = 'all'">全部</el-button>
              <el-button size="small" :type="mapLayer === 'camera' ? 'primary' : ''" @click="mapLayer = 'camera'">监控</el-button>
              <el-button size="small" :type="mapLayer === 'access' ? 'primary' : ''" @click="mapLayer = 'access'">门禁</el-button>
            </el-button-group>
          </div>
          <div class="security-map">
            <div class="map-grid">
              <div v-for="device in filteredDevices" :key="device.id" class="map-device" :class="[device.type, device.status]" :style="{ left: device.x + '%', top: device.y + '%' }" @click="handleSelectDevice(device)">
                <el-tooltip :content="device.name" placement="top">
                  <div class="device-icon"><el-icon><component :is="device.type === 'camera' ? VideoCamera : Key" /></el-icon></div>
                </el-tooltip>
              </div>
            </div>
            <div class="map-legend">
              <span class="legend-item camera">监控</span>
              <span class="legend-item access">门禁</span>
              <span class="legend-item alarm-status">异常</span>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>事件趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>实时视频</span></div>
          <div class="video-preview">
            <div class="video-placeholder">{{ selectedDevice?.name || '未选择' }}</div>
            <div class="video-controls">
              <el-button size="small" type="primary">全屏</el-button>
              <el-button size="small">回放</el-button>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>最新事件</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="e in eventList" :key="e.id" :type="e.level === 'high' ? 'danger' : 'warning'" :timestamp="e.time">
              <div class="event-title">{{ e.title }}</div>
              <div class="event-meta">{{ e.location }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, markRaw } from 'vue'
import * as echarts from 'echarts'
import { VideoCamera, Key, Bell, Warning } from '@element-plus/icons-vue'

const stats = reactive({ cameras: 186, access: 128, alarms: 64, events: 12 })
const mapLayer = ref('all')

const zoneList = ref([
  { id: 1, name: '园区大门', cameras: 8, access: 4 },
  { id: 2, name: 'A栋', cameras: 32, access: 24 },
  { id: 3, name: 'B栋', cameras: 28, access: 20 },
  { id: 4, name: '地下车库', cameras: 24, access: 8 }
])
const selectedZone = ref(zoneList.value[0])

const deviceList = ref([
  { id: 1, name: '大门摄像-01', type: 'camera', location: '园区大门', status: 'online', x: 15, y: 20 },
  { id: 2, name: '大门门禁-01', type: 'access', location: '园区大门', status: 'online', x: 20, y: 25 },
  { id: 3, name: 'A栋大厅摄像', type: 'camera', location: 'A栋1F', status: 'online', x: 40, y: 50 },
  { id: 4, name: 'A栋门禁-01', type: 'access', location: 'A栋1F', status: 'offline', x: 45, y: 55 },
  { id: 5, name: 'B栋电梯摄像', type: 'camera', location: 'B栋2F', status: 'online', x: 70, y: 40 }
])
const selectedDevice = ref<any>(null)

const filteredDevices = computed(() => mapLayer.value === 'all' ? deviceList.value : deviceList.value.filter(d => d.type === mapLayer.value))

const eventList = ref([
  { id: 1, title: '陌生人检测', level: 'high', location: '园区大门', time: '10:25' },
  { id: 2, title: '门禁异常开启', level: 'mid', location: 'A栋1F', time: '09:40' },
  { id: 3, title: '摄像头离线', level: 'mid', location: 'B栋3F', time: '09:15' }
])

const chartRef = ref()
const pieRef = ref()

const handleSelectZone = (zone: any) => { selectedZone.value = zone }
const handleSelectDevice = (device: any) => { selectedDevice.value = device }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['入侵', '异常', '故障'], top: 0, textStyle: { fontSize: 10 } },
      grid: { left: 40, right: 16, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        { name: '入侵', type: 'bar', data: [1, 0, 2, 1, 0, 0, 1], barWidth: 10, itemStyle: { color: '#F56C6C' } },
        { name: '异常', type: 'bar', data: [2, 3, 1, 2, 4, 1, 2], barWidth: 10, itemStyle: { color: '#E6A23C' } },
        { name: '故障', type: 'bar', data: [1, 1, 0, 1, 0, 2, 0], barWidth: 10, itemStyle: { color: '#909399' } }
      ]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 186, name: '监控', itemStyle: { color: '#409EFF' } },
        { value: 128, name: '门禁', itemStyle: { color: '#67C23A' } },
        { value: 64, name: '报警', itemStyle: { color: '#F56C6C' } }
      ], label: { fontSize: 10 } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.security-vis-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.camera .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.access .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.alarm .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  &.event .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.zone-list { padding: 8px; max-height: 200px; overflow: auto; .zone-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .name { font-weight: 500; } .meta { font-size: 12px; color: #909399; } } }

.pie-chart { height: 200px; padding: 12px; }

.security-map { padding: 16px; .map-grid { position: relative; height: 280px; background: linear-gradient(135deg, #f0f5ff 0%, #e8f0fe 100%); border-radius: 8px; .map-device { position: absolute; .device-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; &:hover { transform: scale(1.2); } }
  &.camera .device-icon { background: #409EFF; color: #fff; }
  &.access .device-icon { background: #67C23A; color: #fff; }
  &.offline .device-icon { background: #909399 !important; }
  } }
  .map-legend { display: flex; gap: 16px; margin-top: 12px; justify-content: center; .legend-item { font-size: 12px; padding-left: 16px; position: relative; &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 10px; height: 10px; border-radius: 50%; }
  &.camera::before { background: #409EFF; }
  &.access::before { background: #67C23A; }
  &.alarm-status::before { background: #F56C6C; }
  } }
}

.video-preview { padding: 12px; .video-placeholder { height: 160px; background: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #909399; margin-bottom: 12px; } .video-controls { display: flex; gap: 8px; justify-content: center; } }

.chart { height: 160px; padding: 8px 12px 12px; }

.timeline { padding: 12px 16px; .event-title { font-weight: 500; } .event-meta { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }
</style>
