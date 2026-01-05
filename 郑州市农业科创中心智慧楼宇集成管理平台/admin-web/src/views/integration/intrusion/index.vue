<template>
  <div class="intrusion-alarm-container">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="status-item armed">
        <el-icon :size="20"><Lock /></el-icon>
        <span class="status-label">布防区域</span>
        <span class="status-value">{{ stats.armed }}</span>
      </div>
      <div class="status-item disarmed">
        <el-icon :size="20"><Unlock /></el-icon>
        <span class="status-label">撤防区域</span>
        <span class="status-value">{{ stats.disarmed }}</span>
      </div>
      <div class="status-item alarm">
        <el-icon :size="20"><Bell /></el-icon>
        <span class="status-label">报警中</span>
        <span class="status-value">{{ stats.alarm }}</span>
      </div>
      <div class="status-item fault">
        <el-icon :size="20"><Warning /></el-icon>
        <span class="status-label">故障</span>
        <span class="status-value">{{ stats.fault }}</span>
      </div>
      <div class="status-actions">
        <el-button type="danger" @click="handleGlobalArm"><el-icon><Lock /></el-icon>全局布防</el-button>
        <el-button type="warning" @click="handleGlobalDisarm"><el-icon><Unlock /></el-icon>全局撤防</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧防区列表 -->
      <el-col :span="6">
        <div class="zone-panel">
          <div class="panel-header">
            <span>防区列表</span>
            <el-input v-model="zoneSearch" placeholder="搜索防区" style="width: 120px" size="small">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="zone-list">
            <div
              v-for="zone in filteredZones"
              :key="zone.id"
              class="zone-item"
              :class="[zone.status, { active: selectedZone?.id === zone.id }]"
              @click="handleSelectZone(zone)"
            >
              <div class="zone-icon">
                <el-icon><Aim /></el-icon>
              </div>
              <div class="zone-info">
                <div class="zone-name">{{ zone.name }}</div>
                <div class="zone-type">{{ zone.type }}</div>
              </div>
              <el-tag :type="getZoneStatusType(zone.status)" size="small">{{ getZoneStatusText(zone.status) }}</el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间地图视图 -->
      <el-col :span="12">
        <div class="map-panel">
          <div class="panel-header">
            <span>防区分布图</span>
            <div class="header-right">
              <el-select v-model="selectedFloor" placeholder="选择楼层" style="width: 120px" size="small">
                <el-option v-for="floor in floorList" :key="floor.value" :label="floor.label" :value="floor.value" />
              </el-select>
            </div>
          </div>
          <div class="map-container">
            <div class="floor-plan">
              <div
                v-for="zone in zonePositions"
                :key="zone.id"
                class="zone-marker"
                :class="zone.status"
                :style="{ left: zone.x + '%', top: zone.y + '%' }"
                @click="handleSelectZone(zone)"
              >
                <el-tooltip :content="zone.name" placement="top">
                  <div class="marker-icon">
                    <el-icon><Aim /></el-icon>
                  </div>
                </el-tooltip>
              </div>
            </div>
            <div class="map-legend">
              <span class="legend-item armed"><span class="dot"></span>布防</span>
              <span class="legend-item disarmed"><span class="dot"></span>撤防</span>
              <span class="legend-item alarm"><span class="dot"></span>报警</span>
              <span class="legend-item fault"><span class="dot"></span>故障</span>
            </div>
          </div>
        </div>

        <!-- 报警记录 -->
        <div class="alarm-panel">
          <div class="panel-header">
            <span>实时报警</span>
            <el-button type="primary" link @click="handleViewAllAlarms">查看全部</el-button>
          </div>
          <el-table :data="alarmList" height="200" stripe>
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="zone" label="防区" width="120" />
            <el-table-column prop="type" label="报警类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.level === 'high' ? 'danger' : 'warning'" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.handled ? 'success' : 'danger'" size="small">{{ row.handled ? '已处理' : '未处理' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewAlarm(row)">详情</el-button>
                <el-button v-if="!row.handled" type="success" link size="small" @click="handleAlarm(row)">处理</el-button>
                <el-button type="info" link size="small" @click="handleViewVideo(row)">视频</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- 右侧控制面板 -->
      <el-col :span="6">
        <!-- 选中防区控制 -->
        <div class="control-panel" v-if="selectedZone">
          <div class="panel-header">
            <span>{{ selectedZone.name }}</span>
            <el-tag :type="getZoneStatusType(selectedZone.status)" size="small">{{ getZoneStatusText(selectedZone.status) }}</el-tag>
          </div>
          <div class="control-content">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="防区编号">{{ selectedZone.code }}</el-descriptions-item>
              <el-descriptions-item label="防区类型">{{ selectedZone.type }}</el-descriptions-item>
              <el-descriptions-item label="探测器数量">{{ selectedZone.detectorCount }}</el-descriptions-item>
              <el-descriptions-item label="最后报警">{{ selectedZone.lastAlarm || '-' }}</el-descriptions-item>
            </el-descriptions>

            <div class="control-actions">
              <el-button :type="selectedZone.status === 'armed' ? 'warning' : 'danger'" block @click="handleToggleArm">
                <el-icon><component :is="selectedZone.status === 'armed' ? 'Unlock' : 'Lock'" /></el-icon>
                {{ selectedZone.status === 'armed' ? '撤防' : '布防' }}
              </el-button>
              <el-button type="info" block @click="handleBypass">旁路</el-button>
              <el-button block @click="handleZoneConfig">配置</el-button>
            </div>

            <!-- 探测器列表 -->
            <div class="detector-list">
              <div class="list-header">探测器列表</div>
              <div v-for="detector in selectedZone.detectors" :key="detector.id" class="detector-item">
                <el-icon :color="detector.online ? '#67C23A' : '#909399'"><Aim /></el-icon>
                <span class="detector-name">{{ detector.name }}</span>
                <el-tag :type="detector.online ? 'success' : 'info'" size="small">{{ detector.online ? '在线' : '离线' }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日统计 -->
        <div class="stat-panel">
          <div class="panel-header"><span>今日统计</span></div>
          <div class="stat-content">
            <div class="stat-item">
              <div class="stat-value danger">{{ todayStats.alarm }}</div>
              <div class="stat-label">报警次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value success">{{ todayStats.handled }}</div>
              <div class="stat-label">已处理</div>
            </div>
            <div class="stat-item">
              <div class="stat-value warning">{{ todayStats.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
            <div class="stat-item">
              <div class="stat-value info">{{ todayStats.falseAlarm }}</div>
              <div class="stat-label">误报</div>
            </div>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { Lock, Unlock, Bell, Warning, Search, Aim } from '@element-plus/icons-vue'

const stats = reactive({ armed: 24, disarmed: 8, alarm: 2, fault: 1 })
const todayStats = reactive({ alarm: 15, handled: 12, pending: 3, falseAlarm: 2 })

const zoneSearch = ref('')
const selectedFloor = ref('1')

const floorList = ref([
  { value: '1', label: '1F' },
  { value: '2', label: '2F' },
  { value: '3', label: '3F' },
  { value: 'outdoor', label: '室外' }
])

const zoneList = ref([
  { id: 1, code: 'Z-001', name: '大门入口', type: '红外探测', status: 'armed', detectorCount: 3, lastAlarm: '2025-01-15 09:30', detectors: [{ id: 1, name: '红外探测器1', online: true }, { id: 2, name: '红外探测器2', online: true }, { id: 3, name: '门磁', online: true }] },
  { id: 2, code: 'Z-002', name: '财务室', type: '双鉴探测', status: 'armed', detectorCount: 2, lastAlarm: null, detectors: [{ id: 1, name: '双鉴探测器', online: true }, { id: 2, name: '玻璃破碎', online: true }] },
  { id: 3, code: 'Z-003', name: '服务器机房', type: '红外+门磁', status: 'armed', detectorCount: 4, lastAlarm: '2025-01-14 22:15', detectors: [{ id: 1, name: '红外探测器', online: true }, { id: 2, name: '门磁1', online: true }, { id: 3, name: '门磁2', online: false }, { id: 4, name: '震动探测器', online: true }] },
  { id: 4, code: 'Z-004', name: '围墙东侧', type: '电子围栏', status: 'alarm', detectorCount: 6, lastAlarm: '2025-01-15 10:25', detectors: [{ id: 1, name: '电子围栏1', online: true }, { id: 2, name: '电子围栏2', online: true }] },
  { id: 5, code: 'Z-005', name: '仓库区', type: '红外对射', status: 'disarmed', detectorCount: 4, lastAlarm: null, detectors: [{ id: 1, name: '对射1', online: true }, { id: 2, name: '对射2', online: true }] },
  { id: 6, code: 'Z-006', name: '地下车库', type: '微波探测', status: 'fault', detectorCount: 2, lastAlarm: null, detectors: [{ id: 1, name: '微波探测器', online: false }] }
])

const filteredZones = computed(() => {
  if (!zoneSearch.value) return zoneList.value
  return zoneList.value.filter(z => z.name.includes(zoneSearch.value) || z.code.includes(zoneSearch.value))
})

const selectedZone = ref<any>(null)

const zonePositions = computed(() => {
  return zoneList.value.map((zone, index) => ({
    ...zone,
    x: 15 + (index % 4) * 22,
    y: 20 + Math.floor(index / 4) * 35
  }))
})

const alarmList = ref([
  { id: 1, time: '2025-01-15 10:25:30', zone: '围墙东侧', type: '入侵报警', level: 'high', handled: false },
  { id: 2, time: '2025-01-15 09:30:00', zone: '大门入口', type: '门磁触发', level: 'medium', handled: true },
  { id: 3, time: '2025-01-15 08:45:00', zone: '财务室', type: '移动侦测', level: 'low', handled: true },
  { id: 4, time: '2025-01-15 07:15:00', zone: '仓库区', type: '对射报警', level: 'medium', handled: true }
])

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getZoneStatusType = (status: string) => {
  const map: Record<string, string> = { armed: 'success', disarmed: 'info', alarm: 'danger', fault: 'warning' }
  return map[status] || 'info'
}

const getZoneStatusText = (status: string) => {
  const map: Record<string, string> = { armed: '布防', disarmed: '撤防', alarm: '报警', fault: '故障' }
  return map[status] || status
}

const handleSelectZone = (zone: any) => {
  selectedZone.value = zone
}

const handleGlobalArm = () => {
  ElMessageBox.confirm('确认全局布防?', '全局布防').then(() => {
    zoneList.value.forEach(z => { if (z.status !== 'fault') z.status = 'armed' })
    stats.armed = zoneList.value.filter(z => z.status === 'armed').length
    stats.disarmed = zoneList.value.filter(z => z.status === 'disarmed').length
    ElMessage.success('全局布防成功')
  })
}

const handleGlobalDisarm = () => {
  ElMessageBox.confirm('确认全局撤防?', '全局撤防').then(() => {
    zoneList.value.forEach(z => { if (z.status === 'armed') z.status = 'disarmed' })
    stats.armed = zoneList.value.filter(z => z.status === 'armed').length
    stats.disarmed = zoneList.value.filter(z => z.status === 'disarmed').length
    ElMessage.success('全局撤防成功')
  })
}

const handleToggleArm = () => {
  if (selectedZone.value) {
    const newStatus = selectedZone.value.status === 'armed' ? 'disarmed' : 'armed'
    selectedZone.value.status = newStatus
    ElMessage.success(newStatus === 'armed' ? '布防成功' : '撤防成功')
  }
}

const handleBypass = () => {
  ElMessage.info('旁路设置')
}

const handleZoneConfig = () => {
  ElMessage.info('防区配置')
}

const handleViewAllAlarms = () => {
  ElMessage.info('查看全部报警')
}

const handleViewAlarm = (row: any) => {
  ElMessage.info('查看报警详情')
}

const handleAlarm = (row: any) => {
  row.handled = true
  ElMessage.success('报警已处理')
}

const handleViewVideo = (row: any) => {
  ElMessage.info('查看关联视频')
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 30, right: 10, top: 10, bottom: 25 },
      xAxis: { type: 'category', data: ['00', '04', '08', '12', '16', '20', '24'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ data: [0, 0, 1, 3, 5, 4, 2], type: 'bar', itemStyle: { color: '#F56C6C' }, barWidth: 16 }]
    }
    chartInstance.setOption(option)
  }
}

onMounted(() => {
  selectedZone.value = zoneList.value[0]
  initChart()
})
</script>

<style lang="scss" scoped>
.intrusion-alarm-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;

    &.armed { background: #f0f9eb; color: #67C23A; }
    &.disarmed { background: #f4f4f5; color: #909399; }
    &.alarm { background: #fef0f0; color: #F56C6C; }
    &.fault { background: #fdf6ec; color: #E6A23C; }

    .status-value { font-size: 20px; font-weight: 600; }
  }

  .status-actions { margin-left: auto; display: flex; gap: 8px; }
}

.main-content { flex: 1; }

.zone-panel, .map-panel, .alarm-panel, .control-panel, .stat-panel {
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
  }
}

.zone-panel {
  height: 100%;

  .zone-list { padding: 8px; max-height: 500px; overflow-y: auto; }

  .zone-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.3s;

    &:hover { background: #f5f7fa; }
    &.active { background: #ecf5ff; }
    &.armed { border-left-color: #67C23A; }
    &.disarmed { border-left-color: #909399; }
    &.alarm { border-left-color: #F56C6C; background: #fef0f0; }
    &.fault { border-left-color: #E6A23C; }

    .zone-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f2f5;
    }

    .zone-info {
      flex: 1;
      .zone-name { font-weight: 500; }
      .zone-type { font-size: 12px; color: #909399; }
    }
  }
}

.map-panel {
  margin-bottom: 16px;

  .map-container {
    padding: 16px;
    position: relative;

    .floor-plan {
      height: 250px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
      border-radius: 8px;
      position: relative;
      border: 1px solid #dcdfe6;
    }

    .zone-marker {
      position: absolute;
      transform: translate(-50%, -50%);
      cursor: pointer;
      transition: transform 0.3s;

      &:hover { transform: translate(-50%, -50%) scale(1.2); }

      .marker-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      &.armed .marker-icon { background: #67C23A; }
      &.disarmed .marker-icon { background: #909399; }
      &.alarm .marker-icon { background: #F56C6C; animation: pulse 1s infinite; }
      &.fault .marker-icon { background: #E6A23C; }
    }

    .map-legend {
      display: flex;
      gap: 16px;
      margin-top: 12px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;

        .dot { width: 10px; height: 10px; border-radius: 50%; }
        &.armed .dot { background: #67C23A; }
        &.disarmed .dot { background: #909399; }
        &.alarm .dot { background: #F56C6C; }
        &.fault .dot { background: #E6A23C; }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(245, 108, 108, 0); }
}

.alarm-panel { padding-bottom: 16px; }

.control-panel {
  margin-bottom: 16px;

  .control-content { padding: 16px; }

  .control-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }

  .detector-list {
    margin-top: 16px;

    .list-header { font-weight: 500; margin-bottom: 12px; }

    .detector-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 8px;

      .detector-name { flex: 1; font-size: 13px; }
    }
  }
}

.stat-panel {
  .stat-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;

    .stat-item {
      text-align: center;
      .stat-value { font-size: 24px; font-weight: 600; &.danger { color: #F56C6C; } &.success { color: #67C23A; } &.warning { color: #E6A23C; } &.info { color: #909399; } }
      .stat-label { font-size: 12px; color: #909399; margin-top: 4px; }
    }
  }

  .chart-container { height: 120px; padding: 0 12px 12px; }
}
</style>
