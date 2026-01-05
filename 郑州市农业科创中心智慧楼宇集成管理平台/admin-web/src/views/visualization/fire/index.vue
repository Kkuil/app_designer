<template>
  <div class="fire-vis-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card device"><div class="icon"><el-icon :size="24"><Odometer /></el-icon></div><div class="content"><div class="value">{{ stats.devices }}</div><div class="label">消防设备</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card online"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.online }}</div><div class="label">在线</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card alarm"><div class="icon"><el-icon :size="24"><Bell /></el-icon></div><div class="content"><div class="value">{{ stats.alarms }}</div><div class="label">告警</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card fault"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.faults }}</div><div class="label">故障</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>区域/楼层</span></div>
          <div class="zone-tree">
            <el-tree :data="zoneTree" :props="treeProps" default-expand-all @node-click="handleTreeClick" />
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>设备类型</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>消防布点图</span>
            <el-button-group>
              <el-button size="small" :type="mapLayer === 'all' ? 'primary' : ''" @click="mapLayer = 'all'">全部</el-button>
              <el-button size="small" :type="mapLayer === 'smoke' ? 'primary' : ''" @click="mapLayer = 'smoke'">烟感</el-button>
              <el-button size="small" :type="mapLayer === 'hydrant' ? 'primary' : ''" @click="mapLayer = 'hydrant'">消火栓</el-button>
            </el-button-group>
          </div>
          <div class="floor-map">
            <div class="map-grid">
              <div v-for="device in filteredDevices" :key="device.id" class="map-device" :class="[device.type, device.status]" :style="{ left: device.x + '%', top: device.y + '%' }" @click="handleSelectDevice(device)">
                <el-tooltip :content="device.name" placement="top">
                  <div class="device-dot"></div>
                </el-tooltip>
              </div>
            </div>
            <div class="map-legend">
              <span class="legend-item smoke">烟感</span>
              <span class="legend-item hydrant">消火栓</span>
              <span class="legend-item extinguisher">灭火器</span>
              <span class="legend-item alarm-status">告警</span>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>告警趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>设备详情</span></div>
          <div class="device-detail" v-if="selectedDevice">
            <div class="detail-item"><span>名称</span><strong>{{ selectedDevice.name }}</strong></div>
            <div class="detail-item"><span>类型</span><strong>{{ selectedDevice.typeName }}</strong></div>
            <div class="detail-item"><span>位置</span><strong>{{ selectedDevice.location }}</strong></div>
            <div class="detail-item"><span>状态</span><el-tag :type="selectedDevice.status === 'normal' ? 'success' : 'danger'" size="small">{{ selectedDevice.status === 'normal' ? '正常' : '告警' }}</el-tag></div>
            <div class="detail-item"><span>最近检测</span><strong>{{ selectedDevice.lastCheck }}</strong></div>
          </div>
          <el-empty v-else description="请选择设备" :image-size="60" />
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>实时告警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="a in alarmList" :key="a.id" :type="a.level === 'fire' ? 'danger' : 'warning'" :timestamp="a.time">
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
import { Odometer, CircleCheck, Bell, Warning } from '@element-plus/icons-vue'

const stats = reactive({ devices: 680, online: 672, alarms: 3, faults: 5 })
const mapLayer = ref('all')

const zoneTree = ref([
  { id: 1, label: '园区', children: [{ id: 11, label: 'A栋', children: [{ id: 111, label: '1F' }, { id: 112, label: '2F' }] }, { id: 12, label: 'B栋' }] }
])
const treeProps = { children: 'children', label: 'label' }

const deviceList = ref([
  { id: 1, name: '烟感-A101', type: 'smoke', typeName: '烟感探测器', location: 'A栋1F', status: 'normal', x: 20, y: 30, lastCheck: '2025-01-15' },
  { id: 2, name: '烟感-A102', type: 'smoke', typeName: '烟感探测器', location: 'A栋1F', status: 'alarm', x: 40, y: 25, lastCheck: '2025-01-15' },
  { id: 3, name: '消火栓-A1', type: 'hydrant', typeName: '消火栓', location: 'A栋1F', status: 'normal', x: 60, y: 50, lastCheck: '2025-01-14' },
  { id: 4, name: '灭火器-A1', type: 'extinguisher', typeName: '灭火器', location: 'A栋1F', status: 'normal', x: 80, y: 40, lastCheck: '2025-01-13' },
  { id: 5, name: '烟感-B201', type: 'smoke', typeName: '烟感探测器', location: 'B栋2F', status: 'normal', x: 30, y: 70, lastCheck: '2025-01-15' }
])
const selectedDevice = ref<any>(null)

const filteredDevices = computed(() => mapLayer.value === 'all' ? deviceList.value : deviceList.value.filter(d => d.type === mapLayer.value))

const alarmList = ref([
  { id: 1, title: '烟感报警', level: 'fire', location: 'A栋1F 102室', time: '10:25' },
  { id: 2, title: '消火栓压力低', level: 'fault', location: 'B栋3F', time: '09:40' }
])

const chartRef = ref()
const pieRef = ref()

const handleTreeClick = () => {}
const handleSelectDevice = (device: any) => { selectedDevice.value = device }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ type: 'bar', data: [2, 1, 0, 3, 1, 0, 0], barWidth: 16, itemStyle: { color: '#F56C6C', borderRadius: [4, 4, 0, 0] } }]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 320, name: '烟感', itemStyle: { color: '#409EFF' } },
        { value: 180, name: '消火栓', itemStyle: { color: '#67C23A' } },
        { value: 120, name: '灭火器', itemStyle: { color: '#E6A23C' } },
        { value: 60, name: '其他', itemStyle: { color: '#909399' } }
      ], label: { fontSize: 10 } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.fire-vis-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.device .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.online .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.alarm .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  &.fault .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.zone-tree { padding: 12px; max-height: 200px; overflow: auto; }
.pie-chart { height: 200px; padding: 12px; }

.floor-map { padding: 16px; .map-grid { position: relative; height: 280px; background: #f0f5ff; border-radius: 8px; .map-device { position: absolute; .device-dot { width: 16px; height: 16px; border-radius: 50%; cursor: pointer; transition: transform 0.2s; &:hover { transform: scale(1.3); } }
  &.smoke .device-dot { background: #409EFF; }
  &.hydrant .device-dot { background: #67C23A; }
  &.extinguisher .device-dot { background: #E6A23C; }
  &.alarm .device-dot { background: #F56C6C; animation: pulse 1s infinite; }
  } }
  .map-legend { display: flex; gap: 16px; margin-top: 12px; justify-content: center; .legend-item { font-size: 12px; padding-left: 16px; position: relative; &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 10px; height: 10px; border-radius: 50%; }
  &.smoke::before { background: #409EFF; }
  &.hydrant::before { background: #67C23A; }
  &.extinguisher::before { background: #E6A23C; }
  &.alarm-status::before { background: #F56C6C; }
  } }
}

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.chart { height: 160px; padding: 8px 12px 12px; }

.device-detail { padding: 12px 16px; .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ebeef5; &:last-child { border-bottom: none; } span { color: #909399; } } }

.timeline { padding: 12px 16px; .alarm-title { font-weight: 500; } .alarm-meta { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }
</style>
