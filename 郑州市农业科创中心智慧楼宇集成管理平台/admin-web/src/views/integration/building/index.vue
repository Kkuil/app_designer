<template>
  <div class="bms-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card hvac">
          <div class="icon"><el-icon :size="24"><Sunny /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.hvacOnline }}/{{ stats.hvacTotal }}</div>
            <div class="label">空调在线</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card energy">
          <div class="icon"><el-icon :size="24"><Lightning /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.powerUsage }} kWh</div>
            <div class="label">今日用能</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card alert">
          <div class="icon"><el-icon :size="24"><Bell /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.alarms }}</div>
            <div class="label">告警</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card env">
          <div class="icon"><el-icon :size="24"><Odometer /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.comfort }}%</div>
            <div class="label">舒适度指数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="7">
        <div class="panel">
          <div class="panel-header">
            <span>楼层列表</span>
            <el-input v-model="floorKeyword" size="small" placeholder="搜索楼层" prefix-icon="Search" clearable />
          </div>
          <div class="floor-list">
            <div
              v-for="floor in filteredFloors"
              :key="floor.id"
              class="floor-item"
              :class="{ active: selectedFloor?.id === floor.id }"
              @click="handleSelectFloor(floor)"
            >
              <div class="info">
                <div class="name">{{ floor.name }}</div>
                <div class="meta">空调 {{ floor.hvac }} · 传感 {{ floor.sensors }}</div>
              </div>
              <el-tag :type="floor.status === 'normal' ? 'success' : 'warning'" size="small">{{ floor.status === 'normal' ? '正常' : '异常' }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>设备开关</span></div>
          <div class="switch-group">
            <div class="switch-item">
              <span>新风系统</span>
              <el-switch v-model="switches.freshAir" @change="handleSwitch('freshAir')" />
            </div>
            <div class="switch-item">
              <span>空气净化</span>
              <el-switch v-model="switches.purifier" @change="handleSwitch('purifier')" />
            </div>
            <div class="switch-item">
              <span>照明</span>
              <el-switch v-model="switches.lighting" @change="handleSwitch('lighting')" />
            </div>
            <div class="switch-item">
              <span>百叶窗</span>
              <el-switch v-model="switches.blind" @change="handleSwitch('blind')" />
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="10">
        <div class="panel">
          <div class="panel-header">
            <span>{{ selectedFloor?.name || '楼层' }} - 环境与空调</span>
            <el-tag type="success" size="small">在线</el-tag>
          </div>
          <div class="environment">
            <div class="env-item">
              <div class="label">温度</div>
              <div class="value">{{ env.temp }}°C</div>
              <el-slider v-model="env.temp" :min="18" :max="30" @change="handleEnvChange('temp')" />
            </div>
            <div class="env-item">
              <div class="label">湿度</div>
              <div class="value">{{ env.humidity }}%</div>
              <el-slider v-model="env.humidity" :min="30" :max="70" @change="handleEnvChange('humidity')" />
            </div>
            <div class="env-item">
              <div class="label">新风量</div>
              <div class="value">{{ env.freshAir }} m³/h</div>
              <el-slider v-model="env.freshAir" :min="200" :max="800" @change="handleEnvChange('freshAir')" />
            </div>
          </div>

          <div class="device-grid">
            <div v-for="ac in hvacList" :key="ac.id" class="ac-card" :class="ac.status">
              <div class="ac-header">
                <span>{{ ac.name }}</span>
                <el-tag :type="ac.status === 'on' ? 'success' : 'info'" size="small">{{ ac.status === 'on' ? '运行' : '待机' }}</el-tag>
              </div>
              <div class="ac-body">
                <div class="temp">{{ ac.temp }}°C</div>
                <div class="mode">{{ ac.mode }}</div>
              </div>
              <div class="ac-actions">
                <el-button size="small" type="primary" link @click="handleAcControl(ac, 'on')">开机</el-button>
                <el-button size="small" type="warning" link @click="handleAcControl(ac, 'off')">关机</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>能耗趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
        <div class="panel mt-12">
          <div class="panel-header"><span>给排水监控</span></div>
          <div class="water-monitor">
            <div class="water-section">
              <div class="section-title">
                <el-icon color="#409EFF"><Drizzling /></el-icon>
                <span>供水系统</span>
              </div>
              <div class="water-stats">
                <div class="stat-item">
                  <span class="label">水箱液位</span>
                  <el-progress :percentage="waterSystem.tankLevel" :stroke-width="10" :color="waterSystem.tankLevel < 30 ? '#F56C6C' : '#67C23A'" />
                  <span class="value">{{ waterSystem.tankLevel }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">供水压力</span>
                  <span class="value pressure">{{ waterSystem.pressure }} MPa</span>
                </div>
                <div class="stat-item">
                  <span class="label">供水泵状态</span>
                  <el-tag :type="waterSystem.pumpStatus === 'running' ? 'success' : 'info'" size="small">
                    {{ waterSystem.pumpStatus === 'running' ? '运行中' : '待机' }}
                  </el-tag>
                </div>
                <div class="stat-item">
                  <span class="label">今日用水</span>
                  <span class="value">{{ waterSystem.todayUsage }} m³</span>
                </div>
              </div>
            </div>
            <div class="water-section">
              <div class="section-title">
                <el-icon color="#E6A23C"><Droplet /></el-icon>
                <span>排水系统</span>
              </div>
              <div class="water-stats">
                <div class="stat-item">
                  <span class="label">集水井液位</span>
                  <el-progress :percentage="drainSystem.pitLevel" :stroke-width="10" :color="drainSystem.pitLevel > 80 ? '#F56C6C' : '#67C23A'" />
                  <span class="value">{{ drainSystem.pitLevel }}%</span>
                </div>
                <div class="stat-item">
                  <span class="label">排水泵状态</span>
                  <el-tag :type="drainSystem.pumpStatus === 'running' ? 'success' : 'info'" size="small">
                    {{ drainSystem.pumpStatus === 'running' ? '运行中' : '待机' }}
                  </el-tag>
                </div>
                <div class="stat-item">
                  <span class="label">管道流速</span>
                  <span class="value">{{ drainSystem.flowRate }} m/s</span>
                </div>
                <div class="stat-item">
                  <span class="label">排水泵控制</span>
                  <el-switch v-model="drainSystem.pumpControl" @change="handleDrainPumpControl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="7">
        <div class="panel">
          <div class="panel-header"><span>告警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item
              v-for="alarm in alarmList"
              :key="alarm.id"
              :type="alarm.level === 'high' ? 'danger' : 'warning'"
              :timestamp="alarm.time"
            >
              <div class="alarm-title">{{ alarm.title }}</div>
              <div class="alarm-meta">{{ alarm.location }} · {{ alarm.desc }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>传感器</span></div>
          <el-table :data="sensorList" height="220" size="small" stripe>
            <el-table-column prop="name" label="设备" width="140" />
            <el-table-column prop="value" label="数值" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">{{ row.status === 'normal' ? '正常' : '异常' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Sunny, Lightning, Bell, Odometer, Drizzling } from '@element-plus/icons-vue'

const stats = reactive({ hvacOnline: 28, hvacTotal: 32, powerUsage: 1860, alarms: 3, comfort: 86 })

const floorKeyword = ref('')
const floorList = ref([
  { id: 1, name: 'A栋 5F', hvac: 6, sensors: 20, status: 'normal' },
  { id: 2, name: 'A栋 4F', hvac: 6, sensors: 18, status: 'normal' },
  { id: 3, name: 'B栋 3F', hvac: 5, sensors: 14, status: 'alert' },
  { id: 4, name: '综合楼 2F', hvac: 4, sensors: 10, status: 'normal' }
])

const filteredFloors = computed(() => floorList.value.filter(f => f.name.includes(floorKeyword.value)))
const selectedFloor = ref(filteredFloors.value[0])

const switches = reactive({ freshAir: true, purifier: true, lighting: true, blind: false })

const env = reactive({ temp: 24, humidity: 48, freshAir: 520 })

const hvacList = ref([
  { id: 1, name: '空调-5F-01', temp: 23, mode: '制冷', status: 'on' },
  { id: 2, name: '空调-5F-02', temp: 24, mode: '送风', status: 'on' },
  { id: 3, name: '空调-5F-03', temp: 25, mode: '送风', status: 'standby' },
  { id: 4, name: '空调-5F-04', temp: 26, mode: '制热', status: 'standby' }
])

const alarmList = ref([
  { id: 1, title: 'CO2 超标', level: 'high', location: 'A栋5F 会议室', desc: '浓度 1200ppm', time: '10:20' },
  { id: 2, title: '温度偏高', level: 'mid', location: 'A栋5F 办公区', desc: '28°C', time: '09:55' },
  { id: 3, title: '过滤器需要维护', level: 'mid', location: 'A栋4F 空调机', desc: '累计运行 1800h', time: '09:10' }
])

const sensorList = ref([
  { id: 1, name: '温度传感-501', value: '24.5°C', status: 'normal', location: 'A栋5F 办公区' },
  { id: 2, name: '湿度传感-502', value: '48%', status: 'normal', location: 'A栋5F 会议室' },
  { id: 3, name: 'CO2 传感-503', value: '950ppm', status: 'normal', location: 'A栋5F 会议室' },
  { id: 4, name: 'PM2.5 传感-504', value: '18ug/m³', status: 'normal', location: 'A栋5F 办公区' }
])

// 给排水系统数据
const waterSystem = reactive({
  tankLevel: 72,
  pressure: 0.35,
  pumpStatus: 'running',
  todayUsage: 156
})

const drainSystem = reactive({
  pitLevel: 35,
  pumpStatus: 'standby',
  flowRate: 1.2,
  pumpControl: false
})

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const handleSelectFloor = (floor: any) => { selectedFloor.value = floor }
const handleSwitch = (key: keyof typeof switches) => { ElMessage.success(`${key} 已切换`) }
const handleEnvChange = (key: keyof typeof env) => { ElMessage.success(`${key} 已调整`) }
const handleAcControl = (ac: any, action: string) => { ElMessage.info(`${ac.name} ${action}`) }

const handleDrainPumpControl = (val: boolean) => {
  drainSystem.pumpStatus = val ? 'running' : 'standby'
  ElMessage.success(`排水泵已${val ? '启动' : '停止'}`)
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['0h', '4h', '8h', '12h', '16h', '20h'], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{ type: 'line', data: [120, 180, 260, 340, 300, 180], smooth: true, areaStyle: { color: 'rgba(64,158,255,0.2)' }, lineStyle: { width: 2, color: '#409EFF' } }]
  })
}

onMounted(() => { initChart() })
</script>

<style lang="scss" scoped>
.bms-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 22px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.hvac .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.energy .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.alert .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.env .icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
  }
}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
  .mt-12 { margin-top: 12px; }
}

.floor-list { max-height: 420px; overflow: auto; padding: 8px; }
.floor-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .info { .name { font-weight: 500; } .meta { color: #909399; font-size: 12px; } } }

.switch-group { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; .switch-item { display: flex; align-items: center; justify-content: space-between; } }

.environment { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 14px; .env-item { background: #f8f9fb; border-radius: 8px; padding: 10px; .label { font-size: 12px; color: #909399; } .value { font-size: 18px; font-weight: 600; margin: 4px 0; } } }

.device-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 14px 14px; .ac-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 10px; &.on { border-color: #67C23A; } .ac-header { display: flex; justify-content: space-between; margin-bottom: 6px; } .ac-body { display: flex; justify-content: space-between; align-items: center; .temp { font-size: 20px; font-weight: 600; } .mode { color: #909399; font-size: 12px; } } .ac-actions { display: flex; gap: 8px; margin-top: 6px; } }
}

.chart { height: 220px; padding: 10px 12px 12px; }

.water-monitor {
  padding: 12px 16px;
  
  .water-section {
    margin-bottom: 16px;
    
    &:last-child { margin-bottom: 0; }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
    }
    
    .water-stats {
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      .stat-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f8f9fb;
        padding: 8px 12px;
        border-radius: 6px;
        
        .label { font-size: 13px; color: #606266; }
        .value { font-weight: 600; color: #303133; }
        .value.pressure { color: #409EFF; }
        .el-progress { width: 100px; margin: 0 10px; }
      }
    }
  }
}

.timeline { padding: 12px 16px; .alarm-title { font-weight: 500; } .alarm-meta { color: #909399; font-size: 12px; } }

.main-content { flex: 1; }

.el-table { padding: 0 8px 12px; }
</style>
