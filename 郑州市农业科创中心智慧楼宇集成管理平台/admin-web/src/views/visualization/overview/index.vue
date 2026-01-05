<template>
  <div class="overview-container">
    <!-- 顶部统计栏 -->
    <div class="header-bar">
      <div class="stat-item">
        <div class="icon building"><el-icon :size="20"><OfficeBuilding /></el-icon></div>
        <div class="info"><div class="value">{{ stats.buildings }}</div><div class="label">建筑</div></div>
      </div>
      <div class="stat-item">
        <div class="icon device"><el-icon :size="20"><Monitor /></el-icon></div>
        <div class="info"><div class="value">{{ stats.devices }}</div><div class="label">设备</div></div>
      </div>
      <div class="stat-item">
        <div class="icon alarm"><el-icon :size="20"><Bell /></el-icon></div>
        <div class="info"><div class="value">{{ stats.alarms }}</div><div class="label">告警</div></div>
      </div>
      <div class="stat-item">
        <div class="icon energy"><el-icon :size="20"><Lightning /></el-icon></div>
        <div class="info"><div class="value">{{ stats.energy }} kWh</div><div class="label">今日能耗</div></div>
      </div>
      <div class="header-time">{{ currentTime }}</div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧面板 -->
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>建筑概览</span></div>
          <div class="building-list">
            <div v-for="b in buildingList" :key="b.id" class="building-item" :class="{ active: selectedBuilding?.id === b.id }" @click="handleSelectBuilding(b)">
              <div class="name">{{ b.name }}</div>
              <div class="meta">{{ b.floors }} 层 · {{ b.devices }} 设备</div>
              <el-tag :type="b.status === 'normal' ? 'success' : 'warning'" size="small">{{ b.status === 'normal' ? '正常' : '告警' }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>实时告警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="a in alarmList" :key="a.id" :type="a.level === 'high' ? 'danger' : 'warning'" :timestamp="a.time">
              <div class="alarm-title">{{ a.title }}</div>
              <div class="alarm-meta">{{ a.location }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>

      <!-- 中间3D场景 -->
      <el-col :span="12">
        <div class="panel scene-panel">
          <div class="panel-header">
            <span>园区3D视图</span>
            <el-button-group>
              <el-button size="small" :type="viewMode === '3d' ? 'primary' : ''" @click="viewMode = '3d'">3D</el-button>
              <el-button size="small" :type="viewMode === '2d' ? 'primary' : ''" @click="viewMode = '2d'">2D</el-button>
            </el-button-group>
          </div>
          <div class="scene-container">
            <div class="mock-3d-scene">
              <div class="building-3d" v-for="b in buildingList" :key="b.id" :class="{ selected: selectedBuilding?.id === b.id }" @click="handleSelectBuilding(b)">
                <div class="building-body">{{ b.name }}</div>
              </div>
              <div class="floor-grid"></div>
            </div>
            <div class="scene-controls">
              <el-button circle size="small"><el-icon><ZoomIn /></el-icon></el-button>
              <el-button circle size="small"><el-icon><ZoomOut /></el-icon></el-button>
              <el-button circle size="small"><el-icon><Refresh /></el-icon></el-button>
            </div>
          </div>
        </div>

        <!-- 底部趋势 -->
        <div class="panel mt-12">
          <div class="panel-header"><span>能耗趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <!-- 右侧面板 -->
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>设备运行</span></div>
          <div class="device-stats">
            <div class="ds-item"><span>空调</span><el-progress :percentage="deviceStats.hvac" :stroke-width="8" /></div>
            <div class="ds-item"><span>照明</span><el-progress :percentage="deviceStats.lighting" :stroke-width="8" /></div>
            <div class="ds-item"><span>电梯</span><el-progress :percentage="deviceStats.elevator" :stroke-width="8" /></div>
            <div class="ds-item"><span>消防</span><el-progress :percentage="deviceStats.fire" :stroke-width="8" /></div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>环境监测</span></div>
          <div class="env-grid">
            <div class="env-item"><div class="label">温度</div><div class="value">{{ env.temp }}°C</div></div>
            <div class="env-item"><div class="label">湿度</div><div class="value">{{ env.humidity }}%</div></div>
            <div class="env-item"><div class="label">PM2.5</div><div class="value">{{ env.pm25 }}</div></div>
            <div class="env-item"><div class="label">CO2</div><div class="value">{{ env.co2 }} ppm</div></div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>安防状态</span></div>
          <div class="security-list">
            <div class="sec-item"><span>门禁</span><el-tag type="success" size="small">{{ security.access }} 在线</el-tag></div>
            <div class="sec-item"><span>监控</span><el-tag type="success" size="small">{{ security.camera }} 在线</el-tag></div>
            <div class="sec-item"><span>报警</span><el-tag :type="security.alarm > 0 ? 'danger' : 'success'" size="small">{{ security.alarm }} 告警</el-tag></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { OfficeBuilding, Monitor, Bell, Lightning, ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'

const stats = reactive({ buildings: 5, devices: 1268, alarms: 6, energy: 2860 })
const currentTime = ref(new Date().toLocaleString())
const viewMode = ref('3d')

const buildingList = ref([
  { id: 1, name: '研发楼A', floors: 8, devices: 320, status: 'normal' },
  { id: 2, name: '研发楼B', floors: 6, devices: 280, status: 'alert' },
  { id: 3, name: '综合楼', floors: 4, devices: 180, status: 'normal' },
  { id: 4, name: '宿舍楼', floors: 12, devices: 360, status: 'normal' }
])
const selectedBuilding = ref(buildingList.value[0])

const alarmList = ref([
  { id: 1, title: '温度超标', level: 'high', location: 'A栋5F机房', time: '10:25' },
  { id: 2, title: '门禁异常', level: 'mid', location: 'B栋1F大门', time: '10:12' },
  { id: 3, title: '烟感报警', level: 'high', location: '综合楼2F', time: '09:58' }
])

const deviceStats = reactive({ hvac: 86, lighting: 92, elevator: 100, fire: 100 })
const env = reactive({ temp: 24.5, humidity: 48, pm25: 18, co2: 680 })
const security = reactive({ access: 128, camera: 86, alarm: 2 })

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const handleSelectBuilding = (b: any) => { selectedBuilding.value = b }

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['0h', '4h', '8h', '12h', '16h', '20h', '24h'], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{ type: 'line', data: [120, 180, 320, 420, 380, 280, 160], smooth: true, areaStyle: { color: 'rgba(64,158,255,0.2)' }, lineStyle: { width: 2, color: '#409EFF' } }]
  })
}

onMounted(() => {
  initChart()
  setInterval(() => { currentTime.value = new Date().toLocaleString() }, 1000)
})
</script>

<style lang="scss" scoped>
.overview-container { display: flex; flex-direction: column; gap: 12px; background: #0a1628; min-height: 100vh; padding: 12px; color: #e0e6ed; }

.header-bar { display: flex; align-items: center; gap: 24px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px 20px;
  .stat-item { display: flex; align-items: center; gap: 10px; .icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; &.building { background: #409EFF; } &.device { background: #67C23A; } &.alarm { background: #F56C6C; } &.energy { background: #E6A23C; } } .info { .value { font-size: 18px; font-weight: 600; } .label { font-size: 12px; color: #909399; } } }
  .header-time { margin-left: auto; font-size: 14px; color: #909399; }
}

.main-content { flex: 1; }

.panel { background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; .panel-header { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.building-list { padding: 8px; max-height: 200px; overflow: auto; .building-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px; border-radius: 6px; cursor: pointer; transition: background 0.2s; &:hover { background: rgba(255,255,255,0.08); } &.active { background: rgba(64,158,255,0.2); } .name { font-weight: 500; } .meta { font-size: 12px; color: #909399; flex: 1; } } }

.timeline { padding: 12px 14px; .alarm-title { font-weight: 500; } .alarm-meta { font-size: 12px; color: #909399; } }

.scene-panel { .scene-container { position: relative; height: 320px; background: linear-gradient(180deg, #0d1f35 0%, #152a44 100%); .mock-3d-scene { display: flex; align-items: flex-end; justify-content: center; gap: 20px; height: 100%; padding: 20px 40px 40px; perspective: 600px; .building-3d { transform: rotateX(10deg) rotateY(-10deg); transition: transform 0.3s; cursor: pointer; &.selected { transform: rotateX(10deg) rotateY(-10deg) scale(1.1); } .building-body { background: linear-gradient(180deg, #3a7bd5, #00d2ff); padding: 40px 20px; border-radius: 4px; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.3); } } .floor-grid { position: absolute; bottom: 20px; left: 40px; right: 40px; height: 60px; background: repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px); } } .scene-controls { position: absolute; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; } } }

.chart { height: 160px; padding: 8px 12px 12px; }

.device-stats { padding: 12px 14px; .ds-item { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; span { min-width: 40px; font-size: 13px; } .el-progress { flex: 1; } } }

.env-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 12px 14px; .env-item { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; text-align: center; .label { font-size: 12px; color: #909399; } .value { font-size: 18px; font-weight: 600; margin-top: 4px; } } }

.security-list { padding: 12px 14px; .sec-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); &:last-child { border-bottom: none; } } }
</style>
