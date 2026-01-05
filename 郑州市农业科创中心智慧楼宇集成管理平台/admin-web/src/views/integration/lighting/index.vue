<template>
  <div class="lighting-system-container">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="control-left">
        <el-select v-model="selectedBuilding" placeholder="选择建筑" style="width: 160px" @change="handleBuildingChange">
          <el-option v-for="building in buildingList" :key="building.value" :label="building.label" :value="building.value" />
        </el-select>
        <el-select v-model="selectedFloor" placeholder="选择楼层" style="width: 120px; margin-left: 12px">
          <el-option v-for="floor in floorList" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </div>
      <div class="control-right">
        <el-button type="success" @click="handleAllOn"><el-icon><Sunny /></el-icon>全开</el-button>
        <el-button type="warning" @click="handleAllOff"><el-icon><Moon /></el-icon>全关</el-button>
        <el-button type="primary" @click="handleSceneMode"><el-icon><MagicStick /></el-icon>场景模式</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧区域列表 -->
      <el-col :span="5">
        <div class="area-panel">
          <div class="panel-header">
            <span>照明区域</span>
          </div>
          <div class="area-list">
            <div
              v-for="area in areaList"
              :key="area.id"
              class="area-item"
              :class="{ active: selectedArea?.id === area.id }"
              @click="handleSelectArea(area)"
            >
              <div class="area-icon" :class="{ on: area.lightsOn > 0 }">
                <el-icon><Sunny /></el-icon>
              </div>
              <div class="area-info">
                <div class="area-name">{{ area.name }}</div>
                <div class="area-stat">
                  <span class="on">{{ area.lightsOn }}</span> / {{ area.total }} 开启
                </div>
              </div>
              <el-switch v-model="area.mainSwitch" size="small" @click.stop @change="handleAreaSwitch(area)" />
            </div>
          </div>
        </div>

        <!-- 场景模式 -->
        <div class="scene-panel">
          <div class="panel-header"><span>场景模式</span></div>
          <div class="scene-list">
            <div
              v-for="scene in sceneList"
              :key="scene.id"
              class="scene-item"
              :class="{ active: activeScene === scene.id }"
              @click="handleApplyScene(scene)"
            >
              <el-icon :size="20"><component :is="scene.icon" /></el-icon>
              <span>{{ scene.name }}</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间照明控制 -->
      <el-col :span="13">
        <div class="lighting-control-panel">
          <div class="panel-header">
            <div class="header-left">
              <span>{{ selectedArea?.name || '照明控制' }}</span>
              <el-tag type="info" class="ml-8">{{ selectedArea?.lightsOn || 0 }} 灯开启</el-tag>
            </div>
            <div class="header-right">
              <el-button size="small" @click="handleBatchSelect">批量选择</el-button>
              <el-button type="primary" size="small" @click="handleGroupControl">分组控制</el-button>
            </div>
          </div>

          <!-- 灯具网格 -->
          <div class="lights-grid">
            <div
              v-for="light in lightsList"
              :key="light.id"
              class="light-card"
              :class="{ on: light.on, selected: selectedLights.includes(light.id), offline: !light.online }"
              @click="handleLightClick(light)"
            >
              <div class="light-icon">
                <el-icon :size="28"><Sunny /></el-icon>
              </div>
              <div class="light-color-indicator" v-if="light.adjustableColor && light.on" :style="{ backgroundColor: light.color }"></div>
              <div class="light-name">{{ light.name }}</div>
              <div class="light-brightness" v-if="light.on">
                <el-slider v-model="light.brightness" :show-tooltip="false" size="small" @click.stop />
                <span class="brightness-value">{{ light.brightness }}%</span>
              </div>
              <div class="light-status" v-else>
                <span class="status-text">{{ light.online ? '已关闭' : '离线' }}</span>
              </div>
              <el-switch v-model="light.on" size="small" @click.stop @change="handleLightSwitch(light)" :disabled="!light.online" />
            </div>
          </div>

          <!-- 调光控制 -->
          <div class="dimming-control" v-if="selectedLights.length > 0">
            <div class="control-header">
              <span>已选择 {{ selectedLights.length }} 个灯具</span>
              <el-button type="primary" link @click="selectedLights = []">取消选择</el-button>
            </div>
            <div class="control-body">
              <div class="control-item">
                <span class="label">批量开关</span>
                <el-switch v-model="batchOn" @change="handleBatchSwitch" />
              </div>
              <div class="control-item">
                <span class="label">统一亮度</span>
                <el-slider v-model="batchBrightness" @change="handleBatchBrightness" />
              </div>
              <div class="control-item">
                <span class="label">色温调节</span>
                <el-slider v-model="batchColorTemp" :min="2700" :max="6500" @change="handleBatchColorTemp">
                  <template #suffix>K</template>
                </el-slider>
              </div>
              <div class="control-item">
                <span class="label">颜色选择</span>
                <el-color-picker v-model="batchColor" @change="handleBatchColor" />
              </div>
            </div>
          </div>
        </div>

        <!-- 灯光预案 -->
        <div class="preset-panel">
          <div class="panel-header">
            <span>灯光预案</span>
            <el-button type="primary" link @click="handleAddPreset"><el-icon><Plus /></el-icon>新增预案</el-button>
          </div>
          <div class="preset-grid">
            <div 
              v-for="preset in lightingPresets" 
              :key="preset.id" 
              class="preset-card"
              :class="{ active: selectedPreset?.id === preset.id }"
              @click="handleSelectPreset(preset)"
            >
              <div class="preset-color" :style="{ backgroundColor: preset.color }"></div>
              <div class="preset-info">
                <div class="preset-name">{{ preset.name }}</div>
                <div class="preset-desc">{{ preset.description }}</div>
                <div class="preset-meta">
                  <el-tag size="small" type="info">亮度 {{ preset.brightness }}%</el-tag>
                  <el-tag size="small" type="info">{{ preset.colorTemp }}K</el-tag>
                </div>
              </div>
              <div class="preset-actions">
                <el-button type="primary" size="small" @click.stop="handleApplyPreset(preset)">应用</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 定时任务 -->
        <div class="schedule-panel">
          <div class="panel-header">
            <span>定时任务</span>
            <el-button type="primary" link @click="handleAddSchedule"><el-icon><Plus /></el-icon>新增</el-button>
          </div>
          <el-table :data="scheduleList" height="150" stripe>
            <el-table-column prop="name" label="任务名称" width="120" />
            <el-table-column prop="area" label="控制区域" width="120" />
            <el-table-column prop="action" label="动作" width="80">
              <template #default="{ row }">
                <el-tag :type="row.action === 'on' ? 'success' : 'info'" size="small">{{ row.action === 'on' ? '开灯' : '关灯' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="执行时间" width="100" />
            <el-table-column prop="repeat" label="重复" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditSchedule(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteSchedule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- 右侧统计面板 -->
      <el-col :span="6">
        <!-- 统计概览 -->
        <div class="stat-panel">
          <div class="panel-header"><span>照明统计</span></div>
          <div class="stat-content">
            <div class="stat-item">
              <div class="stat-label">灯具总数</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">开启数量</div>
              <div class="stat-value on">{{ stats.on }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">关闭数量</div>
              <div class="stat-value off">{{ stats.off }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">离线设备</div>
              <div class="stat-value offline">{{ stats.offline }}</div>
            </div>
          </div>
        </div>

        <!-- 能耗统计 -->
        <div class="energy-panel">
          <div class="panel-header"><span>今日能耗</span></div>
          <div class="energy-content">
            <div class="energy-main">
              <div class="energy-value">{{ stats.todayEnergy }}</div>
              <div class="energy-unit">kWh</div>
            </div>
            <div class="energy-compare">
              <span :class="stats.compareRate > 0 ? 'up' : 'down'">
                {{ stats.compareRate > 0 ? '↑' : '↓' }} {{ Math.abs(stats.compareRate) }}%
              </span>
              <span class="compare-text">较昨日</span>
            </div>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>

        <!-- 故障告警 -->
        <div class="alarm-panel">
          <div class="panel-header">
            <span>设备告警</span>
            <el-badge :value="alarmList.length" type="danger" />
          </div>
          <div class="alarm-list">
            <div v-for="alarm in alarmList" :key="alarm.id" class="alarm-item">
              <div class="alarm-icon"><el-icon><Warning /></el-icon></div>
              <div class="alarm-content">
                <div class="alarm-title">{{ alarm.title }}</div>
                <div class="alarm-time">{{ alarm.time }}</div>
              </div>
              <el-button type="primary" link size="small" @click="handleAlarmDetail(alarm)">处理</el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 场景模式弹窗 -->
    <el-dialog v-model="sceneDialogVisible" title="场景模式" width="500px">
      <div class="scene-grid">
        <div
          v-for="scene in allScenes"
          :key="scene.id"
          class="scene-card"
          :class="{ active: tempScene === scene.id }"
          @click="tempScene = scene.id"
        >
          <el-icon :size="32"><component :is="scene.icon" /></el-icon>
          <div class="scene-name">{{ scene.name }}</div>
          <div class="scene-desc">{{ scene.desc }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="sceneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmScene">应用场景</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Sunny, Moon, MagicStick, Plus, Warning } from '@element-plus/icons-vue'

const buildingList = ref([
  { value: 'a', label: 'A栋办公楼' },
  { value: 'b', label: 'B栋研发楼' },
  { value: 'outdoor', label: '室外区域' }
])

const floorList = ref([
  { value: 'all', label: '全部楼层' },
  { value: '1', label: '1F' },
  { value: '2', label: '2F' },
  { value: '3', label: '3F' }
])

const selectedBuilding = ref('a')
const selectedFloor = ref('all')

const areaList = ref([
  { id: 1, name: '1F大厅', total: 24, lightsOn: 18, mainSwitch: true },
  { id: 2, name: '2F办公区', total: 48, lightsOn: 32, mainSwitch: true },
  { id: 3, name: '3F会议室', total: 16, lightsOn: 0, mainSwitch: false },
  { id: 4, name: '走廊通道', total: 32, lightsOn: 32, mainSwitch: true },
  { id: 5, name: '地下车库', total: 64, lightsOn: 24, mainSwitch: true }
])

const selectedArea = ref(areaList.value[0])
const activeScene = ref('')

const sceneList = ref([
  { id: 'work', name: '工作模式', icon: 'Sunny' },
  { id: 'meeting', name: '会议模式', icon: 'VideoCamera' },
  { id: 'away', name: '离开模式', icon: 'Moon' },
  { id: 'night', name: '夜间模式', icon: 'MoonNight' }
])

const allScenes = ref([
  { id: 'work', name: '工作模式', icon: 'Sunny', desc: '全亮度办公照明' },
  { id: 'meeting', name: '会议模式', icon: 'VideoCamera', desc: '适合会议投影' },
  { id: 'presentation', name: '演示模式', icon: 'Film', desc: '暗光投影环境' },
  { id: 'energy', name: '节能模式', icon: 'Coin', desc: '降低亮度节能' },
  { id: 'away', name: '离开模式', icon: 'Moon', desc: '保留应急照明' },
  { id: 'night', name: '夜间模式', icon: 'MoonNight', desc: '最低亮度值守' }
])

const lightsList = ref([
  { id: 1, name: '主灯1', on: true, brightness: 100, colorTemp: 4000, color: '#FFFFFF', adjustableColor: true, online: true },
  { id: 2, name: '主灯2', on: true, brightness: 100, colorTemp: 4000, color: '#FFFFFF', adjustableColor: true, online: true },
  { id: 3, name: '主灯3', on: true, brightness: 80, colorTemp: 4000, color: '#FFE4B5', adjustableColor: true, online: true },
  { id: 4, name: '主灯4', on: false, brightness: 0, colorTemp: 4000, color: '#FFFFFF', adjustableColor: false, online: true },
  { id: 5, name: '筒灯1', on: true, brightness: 60, colorTemp: 3000, color: '#FFA500', adjustableColor: true, online: true },
  { id: 6, name: '筒灯2', on: true, brightness: 60, colorTemp: 3000, color: '#FFA500', adjustableColor: true, online: true },
  { id: 7, name: '筒灯3', on: false, brightness: 0, colorTemp: 3000, color: '#FFFFFF', adjustableColor: false, online: false },
  { id: 8, name: '射灯1', on: true, brightness: 100, colorTemp: 5000, color: '#87CEEB', adjustableColor: true, online: true }
])

const selectedLights = ref<number[]>([])
const batchOn = ref(true)
const batchBrightness = ref(100)
const batchColorTemp = ref(4000)
const batchColor = ref('#FFFFFF')

// 灯光预案
const lightingPresets = ref([
  { id: 1, name: '日常办公', description: '白光100%亮度，适合日常办公', brightness: 100, colorTemp: 4000, color: '#FFFFFF', areas: ['办公区', '会议室'] },
  { id: 2, name: '会议演示', description: '降低亮度60%，适合投影演示', brightness: 60, colorTemp: 4500, color: '#F5F5DC', areas: ['会议室'] },
  { id: 3, name: '节能模式', description: '50%亮度节能运行', brightness: 50, colorTemp: 4000, color: '#FFFFFF', areas: ['走廊', '大厅'] },
  { id: 4, name: '暖光氛围', description: '暖色调柔和照明', brightness: 70, colorTemp: 3000, color: '#FFE4B5', areas: ['休息区', '接待区'] },
  { id: 5, name: '深夜值守', description: '最低亮度应急照明', brightness: 20, colorTemp: 3500, color: '#FFF8DC', areas: ['走廊', '安保室'] },
  { id: 6, name: '迎宾模式', description: '全亮度暖白光欢迎来宾', brightness: 100, colorTemp: 3500, color: '#FFFACD', areas: ['大厅', '接待区'] }
])

const presetDialogVisible = ref(false)
const selectedPreset = ref<any>(null)

const scheduleList = ref([
  { id: 1, name: '早间开灯', area: '全区域', action: 'on', time: '07:00', repeat: '工作日', enabled: true },
  { id: 2, name: '午休关灯', area: '办公区', action: 'off', time: '12:00', repeat: '工作日', enabled: true },
  { id: 3, name: '下班关灯', area: '全区域', action: 'off', time: '19:00', repeat: '工作日', enabled: true },
  { id: 4, name: '夜间巡更', area: '走廊通道', action: 'on', time: '22:00', repeat: '每天', enabled: true }
])

const stats = reactive({
  total: 184,
  on: 106,
  off: 75,
  offline: 3,
  todayEnergy: 256.8,
  compareRate: -12
})

const alarmList = ref([
  { id: 1, title: '筒灯3离线', time: '10:25:00' },
  { id: 2, title: '走廊灯具故障', time: '09:15:00' }
])

const sceneDialogVisible = ref(false)
const tempScene = ref('')
const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const handleBuildingChange = () => {
  // 切换建筑
}

const handleSelectArea = (area: any) => {
  selectedArea.value = area
}

const handleAreaSwitch = (area: any) => {
  area.lightsOn = area.mainSwitch ? area.total : 0
  ElMessage.success(`${area.name} 已${area.mainSwitch ? '开启' : '关闭'}`)
}

const handleAllOn = () => {
  areaList.value.forEach(area => {
    area.mainSwitch = true
    area.lightsOn = area.total
  })
  ElMessage.success('全部照明已开启')
}

const handleAllOff = () => {
  areaList.value.forEach(area => {
    area.mainSwitch = false
    area.lightsOn = 0
  })
  ElMessage.success('全部照明已关闭')
}

const handleSceneMode = () => {
  sceneDialogVisible.value = true
}

const handleApplyScene = (scene: any) => {
  activeScene.value = scene.id
  ElMessage.success(`已切换到${scene.name}`)
}

const handleConfirmScene = () => {
  activeScene.value = tempScene.value
  sceneDialogVisible.value = false
  ElMessage.success('场景已应用')
}

const handleLightClick = (light: any) => {
  if (selectedLights.value.includes(light.id)) {
    selectedLights.value = selectedLights.value.filter(id => id !== light.id)
  } else {
    selectedLights.value.push(light.id)
  }
}

const handleLightSwitch = (light: any) => {
  ElMessage.success(`${light.name} 已${light.on ? '开启' : '关闭'}`)
}

const handleBatchSelect = () => {
  if (selectedLights.value.length === lightsList.value.length) {
    selectedLights.value = []
  } else {
    selectedLights.value = lightsList.value.map(l => l.id)
  }
}

const handleGroupControl = () => {
  ElMessage.info('分组控制')
}

const handleBatchSwitch = (val: boolean) => {
  lightsList.value.forEach(light => {
    if (selectedLights.value.includes(light.id) && light.online) {
      light.on = val
    }
  })
}

const handleBatchBrightness = (val: number) => {
  lightsList.value.forEach(light => {
    if (selectedLights.value.includes(light.id) && light.on) {
      light.brightness = val
    }
  })
}

const handleBatchColorTemp = (val: number) => {
  ElMessage.info(`色温已调整至 ${val}K`)
}

const handleBatchColor = (val: string) => {
  lightsList.value.forEach(light => {
    if (selectedLights.value.includes(light.id) && light.on && light.adjustableColor) {
      light.color = val
    }
  })
  ElMessage.info('颜色已调整')
}

const handleSelectPreset = (preset: any) => {
  selectedPreset.value = preset
}

const handleApplyPreset = (preset: any) => {
  lightsList.value.forEach(light => {
    if (light.online) {
      light.on = true
      light.brightness = preset.brightness
      light.colorTemp = preset.colorTemp
      if (light.adjustableColor) {
        light.color = preset.color
      }
    }
  })
  ElMessage.success(`已应用预案: ${preset.name}`)
}

const handleAddPreset = () => {
  presetDialogVisible.value = true
}

const handleAddSchedule = () => {
  ElMessage.info('新增定时任务')
}

const handleEditSchedule = (row: any) => {
  ElMessage.info('编辑定时任务')
}

const handleDeleteSchedule = (row: any) => {
  ElMessage.success('任务已删除')
}

const handleAlarmDetail = (alarm: any) => {
  ElMessage.info('处理告警')
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 35, right: 10, top: 10, bottom: 25 },
      xAxis: { type: 'category', data: ['00', '04', '08', '12', '16', '20', '24'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{
        data: [15, 12, 35, 45, 55, 48, 25],
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { color: '#E6A23C' },
        itemStyle: { color: '#E6A23C' }
      }]
    }
    chartInstance.setOption(option)
  }
}

onMounted(() => {
  initChart()
})
</script>

<style lang="scss" scoped>
.lighting-system-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
}

.main-content { flex: 1; }

.area-panel, .scene-panel, .lighting-control-panel, .schedule-panel, .stat-panel, .energy-panel, .alarm-panel {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;

    .ml-8 { margin-left: 8px; }
  }
}

.area-panel {
  margin-bottom: 16px;

  .area-list { padding: 8px; }

  .area-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover { background: #f5f7fa; }
    &.active { background: #ecf5ff; }

    .area-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f2f5;
      color: #909399;

      &.on { background: #fdf6ec; color: #E6A23C; }
    }

    .area-info {
      flex: 1;
      .area-name { font-weight: 500; }
      .area-stat { font-size: 12px; color: #909399; .on { color: #E6A23C; font-weight: 600; } }
    }
  }
}

.scene-panel {
  .scene-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 12px;

    .scene-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px;
      border-radius: 8px;
      background: #f5f7fa;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 12px;

      &:hover { background: #ecf5ff; }
      &.active { background: #409EFF; color: #fff; }
    }
  }
}

.lighting-control-panel {
  margin-bottom: 16px;

  .lights-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px;

    .light-card {
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #ebeef5;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover { border-color: #409EFF; }
      &.on { border-color: #E6A23C; background: #fdf6ec; .light-icon { color: #E6A23C; } }
      &.selected { border-color: #409EFF; box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2); }
      &.offline { opacity: 0.5; }

      .light-icon { margin-bottom: 8px; color: #909399; }
      .light-color-indicator { width: 24px; height: 24px; border-radius: 50%; margin: 0 auto 8px; border: 2px solid #ebeef5; }
      .light-name { font-weight: 500; margin-bottom: 8px; }
      .light-brightness { .brightness-value { font-size: 12px; color: #909399; } }
      .light-status { .status-text { font-size: 12px; color: #909399; } }
    }
  }

  .dimming-control {
    margin: 0 16px 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .control-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .control-body {
      display: flex;
      gap: 24px;

      .control-item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;

        .label { white-space: nowrap; font-size: 14px; }
        .el-slider { flex: 1; }
      }
    }
  }
}

.schedule-panel { padding-bottom: 16px; }

.preset-panel {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 16px;
  
  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
  
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px;
    
    .preset-card {
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      
      &:hover { border-color: #409EFF; box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15); }
      &.active { border-color: #409EFF; background: #ecf5ff; }
      
      .preset-color {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        margin-bottom: 8px;
      }
      
      .preset-info {
        .preset-name { font-weight: 600; margin-bottom: 4px; }
        .preset-desc { font-size: 12px; color: #909399; margin-bottom: 8px; }
        .preset-meta { display: flex; gap: 6px; flex-wrap: wrap; }
      }
      
      .preset-actions {
        margin-top: 10px;
        text-align: right;
      }
    }
  }
}

.stat-panel {
  margin-bottom: 16px;

  .stat-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;

    .stat-item {
      text-align: center;
      .stat-label { font-size: 12px; color: #909399; margin-bottom: 4px; }
      .stat-value { font-size: 24px; font-weight: 600; &.on { color: #E6A23C; } &.off { color: #909399; } &.offline { color: #F56C6C; } }
    }
  }
}

.energy-panel {
  margin-bottom: 16px;

  .energy-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;

    .energy-main {
      display: flex;
      align-items: baseline;
      gap: 4px;
      .energy-value { font-size: 32px; font-weight: 600; color: #E6A23C; }
      .energy-unit { font-size: 14px; color: #909399; }
    }

    .energy-compare {
      text-align: right;
      .up { color: #F56C6C; }
      .down { color: #67C23A; }
      .compare-text { font-size: 12px; color: #909399; margin-left: 4px; }
    }
  }

  .chart-container { height: 120px; padding: 0 12px 12px; }
}

.alarm-panel {
  .alarm-list { padding: 8px; max-height: 150px; overflow-y: auto; }

  .alarm-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #fef0f0;
    border-radius: 8px;
    margin-bottom: 8px;

    .alarm-icon { color: #F56C6C; }
    .alarm-content { flex: 1; .alarm-title { font-weight: 500; } .alarm-time { font-size: 12px; color: #909399; } }
  }
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .scene-card {
    padding: 20px;
    border-radius: 8px;
    border: 2px solid #ebeef5;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover { border-color: #409EFF; }
    &.active { border-color: #409EFF; background: #ecf5ff; }

    .scene-name { font-weight: 500; margin-top: 8px; }
    .scene-desc { font-size: 12px; color: #909399; margin-top: 4px; }
  }
}
</style>
