<template>
  <div class="fire-alarm-container">
    <!-- 顶部状态概览 -->
    <div class="status-overview">
      <div class="status-card normal">
        <div class="status-icon"><el-icon :size="32"><CircleCheck /></el-icon></div>
        <div class="status-info">
          <div class="status-value">{{ statusData.normal }}</div>
          <div class="status-label">正常设备</div>
        </div>
      </div>
      <div class="status-card alarm">
        <div class="status-icon"><el-icon :size="32"><Bell /></el-icon></div>
        <div class="status-info">
          <div class="status-value">{{ statusData.alarm }}</div>
          <div class="status-label">报警中</div>
        </div>
      </div>
      <div class="status-card fault">
        <div class="status-icon"><el-icon :size="32"><Warning /></el-icon></div>
        <div class="status-info">
          <div class="status-value">{{ statusData.fault }}</div>
          <div class="status-label">故障</div>
        </div>
      </div>
      <div class="status-card offline">
        <div class="status-icon"><el-icon :size="32"><WarningFilled /></el-icon></div>
        <div class="status-info">
          <div class="status-value">{{ statusData.offline }}</div>
          <div class="status-label">离线</div>
        </div>
      </div>
      <div class="status-card shield">
        <div class="status-icon"><el-icon :size="32"><Hide /></el-icon></div>
        <div class="status-info">
          <div class="status-value">{{ statusData.shield }}</div>
          <div class="status-label">屏蔽</div>
        </div>
      </div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧区域树 -->
      <el-col :span="5">
        <div class="area-tree-panel">
          <div class="panel-header">
            <span>区域分布</span>
          </div>
          <el-tree
            :data="areaTree"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleAreaClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span class="node-label">{{ node.label }}</span>
                <el-badge v-if="data.alarmCount" :value="data.alarmCount" type="danger" class="node-badge" />
              </div>
            </template>
          </el-tree>
        </div>
      </el-col>

      <!-- 中间设备监控 -->
      <el-col :span="14">
        <div class="device-monitor-panel">
          <div class="panel-header">
            <div class="header-left">
              <span>消防设备监控</span>
              <el-tag type="info" class="ml-12">{{ selectedArea?.name || '全部区域' }}</el-tag>
            </div>
            <div class="header-right">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button value="list">列表</el-radio-button>
                <el-radio-button value="grid">网格</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-if="viewMode === 'list'" class="device-list-view">
            <el-table :data="filteredDevices" height="400" stripe>
              <el-table-column prop="code" label="设备编号" width="120" />
              <el-table-column prop="name" label="设备名称" width="150" />
              <el-table-column prop="type" label="设备类型" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="location" label="安装位置" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="当前值" width="100" />
              <el-table-column prop="updateTime" label="更新时间" width="160" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleViewDevice(row)">详情</el-button>
                  <el-button v-if="row.status === 'alarm'" type="success" link size="small" @click="handleConfirmAlarm(row)">确认</el-button>
                  <el-button type="warning" link size="small" @click="handleShieldDevice(row)">
                    {{ row.status === 'shield' ? '解除' : '屏蔽' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 网格视图 -->
          <div v-else class="device-grid-view">
            <div
              v-for="device in filteredDevices"
              :key="device.id"
              class="device-card"
              :class="device.status"
              @click="handleViewDevice(device)"
            >
              <div class="device-icon">
                <el-icon :size="24"><component :is="getDeviceIcon(device.type)" /></el-icon>
              </div>
              <div class="device-name">{{ device.name }}</div>
              <div class="device-location">{{ device.location }}</div>
              <div class="device-value">{{ device.value }}</div>
              <el-tag :type="getStatusType(device.status)" size="small">{{ getStatusText(device.status) }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 报警记录 -->
        <div class="alarm-record-panel">
          <div class="panel-header">
            <span>实时报警记录</span>
            <el-button type="primary" link @click="handleViewAllAlarm">查看全部</el-button>
          </div>
          <el-table :data="alarmRecords" height="200" stripe>
            <el-table-column prop="time" label="报警时间" width="160" />
            <el-table-column prop="deviceName" label="报警设备" width="150" />
            <el-table-column prop="type" label="报警类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.level === 'high' ? 'danger' : 'warning'" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.handled ? 'success' : 'danger'" size="small">
                  {{ row.handled ? '已处理' : '未处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleAlarmDetail(row)">详情</el-button>
                <el-button v-if="!row.handled" type="success" link size="small" @click="handleAlarm(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- 右侧面板 -->
      <el-col :span="5">
        <!-- 消防系统状态 -->
        <div class="system-status-panel">
          <div class="panel-header"><span>系统状态</span></div>
          <div class="system-list">
            <div v-for="system in systemStatus" :key="system.id" class="system-item">
              <div class="system-icon" :class="system.status">
                <el-icon><component :is="system.icon" /></el-icon>
              </div>
              <div class="system-info">
                <div class="system-name">{{ system.name }}</div>
                <div class="system-desc">{{ system.desc }}</div>
              </div>
              <el-switch v-model="system.enabled" size="small" />
            </div>
          </div>
        </div>

        <!-- 联动设置 -->
        <div class="linkage-panel">
          <div class="panel-header"><span>联动设置</span></div>
          <div class="linkage-list">
            <div v-for="link in linkageSettings" :key="link.id" class="linkage-item">
              <div class="linkage-info">
                <div class="linkage-name">{{ link.name }}</div>
                <div class="linkage-desc">{{ link.desc }}</div>
              </div>
              <el-switch v-model="link.enabled" size="small" />
            </div>
          </div>
        </div>

        <!-- 今日统计 -->
        <div class="stat-panel">
          <div class="panel-header"><span>今日统计</span></div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 设备详情弹窗 -->
    <el-dialog v-model="deviceDialogVisible" :title="selectedDevice?.name" width="600px">
      <el-descriptions :column="2" border v-if="selectedDevice">
        <el-descriptions-item label="设备编号">{{ selectedDevice.code }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ selectedDevice.type }}</el-descriptions-item>
        <el-descriptions-item label="安装位置">{{ selectedDevice.location }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(selectedDevice.status)">{{ getStatusText(selectedDevice.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前数值">{{ selectedDevice.value }}</el-descriptions-item>
        <el-descriptions-item label="阈值设置">{{ selectedDevice.threshold }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ selectedDevice.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="deviceDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleTestDevice">设备测试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  CircleCheck, Bell, Warning, WarningFilled, Hide, Aim, Odometer
} from '@element-plus/icons-vue'

const statusData = reactive({
  normal: 156,
  alarm: 2,
  fault: 3,
  offline: 5,
  shield: 8
})

const areaTree = ref([
  {
    id: 1, name: 'A栋', alarmCount: 1,
    children: [
      { id: 11, name: '1F大厅', alarmCount: 1 },
      { id: 12, name: '2F办公区', alarmCount: 0 },
      { id: 13, name: '3F机房', alarmCount: 0 }
    ]
  },
  {
    id: 2, name: 'B栋', alarmCount: 1,
    children: [
      { id: 21, name: '1F大厅', alarmCount: 0 },
      { id: 22, name: '2F研发区', alarmCount: 1 }
    ]
  },
  { id: 3, name: '地下车库', alarmCount: 0 },
  { id: 4, name: '室外区域', alarmCount: 0 }
])

const selectedArea = ref<any>(null)
const viewMode = ref('list')

const deviceList = ref([
  { id: 1, code: 'FD-001', name: '烟感探测器A1-1', type: '烟感', location: 'A栋1F大厅', status: 'normal', value: '正常', threshold: '3%/m', updateTime: '2025-01-15 10:25:00', areaId: 11 },
  { id: 2, code: 'FD-002', name: '温感探测器A1-2', type: '温感', location: 'A栋1F大厅', status: 'alarm', value: '68°C', threshold: '60°C', updateTime: '2025-01-15 10:26:00', areaId: 11 },
  { id: 3, code: 'FD-003', name: '手动报警按钮A1-3', type: '手动按钮', location: 'A栋1F走廊', status: 'normal', value: '正常', threshold: '-', updateTime: '2025-01-15 10:25:00', areaId: 11 },
  { id: 4, code: 'FD-004', name: '烟感探测器A2-1', type: '烟感', location: 'A栋2F办公区', status: 'normal', value: '正常', threshold: '3%/m', updateTime: '2025-01-15 10:25:00', areaId: 12 },
  { id: 5, code: 'FD-005', name: '气体探测器A3-1', type: '气体探测', location: 'A栋3F机房', status: 'fault', value: '故障', threshold: '1000ppm', updateTime: '2025-01-15 10:20:00', areaId: 13 },
  { id: 6, code: 'FD-006', name: '烟感探测器B2-1', type: '烟感', location: 'B栋2F研发区', status: 'alarm', value: '5.2%/m', threshold: '3%/m', updateTime: '2025-01-15 10:26:30', areaId: 22 }
])

const filteredDevices = computed(() => {
  if (!selectedArea.value) return deviceList.value
  return deviceList.value.filter(d => d.areaId === selectedArea.value.id)
})

const alarmRecords = ref([
  { id: 1, time: '2025-01-15 10:26:30', deviceName: '烟感探测器B2-1', type: '烟雾报警', level: 'high', location: 'B栋2F研发区', handled: false },
  { id: 2, time: '2025-01-15 10:26:00', deviceName: '温感探测器A1-2', type: '温度超限', level: 'high', location: 'A栋1F大厅', handled: false },
  { id: 3, time: '2025-01-15 09:15:00', deviceName: '烟感探测器A2-3', type: '烟雾报警', level: 'medium', location: 'A栋2F办公区', handled: true },
  { id: 4, time: '2025-01-15 08:30:00', deviceName: '手动报警按钮B1-1', type: '手动触发', level: 'high', location: 'B栋1F大厅', handled: true }
])

const systemStatus = ref([
  { id: 1, name: '火灾报警主机', desc: '运行正常', icon: 'Monitor', status: 'normal', enabled: true },
  { id: 2, name: '消防水泵', desc: '待命状态', icon: 'Odometer', status: 'normal', enabled: true },
  { id: 3, name: '防排烟系统', desc: '待命状态', icon: 'Wind', status: 'normal', enabled: true },
  { id: 4, name: '应急照明', desc: '市电供电', icon: 'Sunny', status: 'normal', enabled: true }
])

const linkageSettings = ref([
  { id: 1, name: '自动启动消防水泵', desc: '火警时自动启动', enabled: true },
  { id: 2, name: '联动防排烟', desc: '火警时自动启动排烟', enabled: true },
  { id: 3, name: '切断非消防电源', desc: '确认火警后切断', enabled: true },
  { id: 4, name: '电梯迫降', desc: '火警时电梯迫降首层', enabled: true },
  { id: 5, name: '联动广播', desc: '自动播放疏散提示', enabled: true }
])

const deviceDialogVisible = ref(false)
const selectedDevice = ref<any>(null)
const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    normal: 'success', alarm: 'danger', fault: 'warning', offline: 'info', shield: ''
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: '正常', alarm: '报警', fault: '故障', offline: '离线', shield: '屏蔽'
  }
  return map[status] || status
}

const getDeviceIcon = (type: string) => {
  return 'Aim'
}

const handleAreaClick = (data: any) => {
  selectedArea.value = data
}

const handleViewDevice = (device: any) => {
  selectedDevice.value = device
  deviceDialogVisible.value = true
}

const handleConfirmAlarm = (device: any) => {
  ElMessageBox.confirm('确认该设备报警已处理?', '确认报警').then(() => {
    device.status = 'normal'
    ElMessage.success('报警已确认')
  })
}

const handleShieldDevice = (device: any) => {
  const action = device.status === 'shield' ? '解除屏蔽' : '屏蔽'
  ElMessageBox.confirm(`确认${action}该设备?`, action).then(() => {
    device.status = device.status === 'shield' ? 'normal' : 'shield'
    ElMessage.success(`${action}成功`)
  })
}

const handleViewAllAlarm = () => {
  ElMessage.info('查看全部报警记录')
}

const handleAlarmDetail = (row: any) => {
  ElMessage.info('查看报警详情')
}

const handleAlarm = (row: any) => {
  ElMessageBox.confirm('确认处理该报警?', '处理报警').then(() => {
    row.handled = true
    ElMessage.success('报警已处理')
  })
}

const handleTestDevice = () => {
  ElMessage.success('设备测试指令已发送')
  deviceDialogVisible.value = false
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 35, right: 10, top: 10, bottom: 25 },
      xAxis: {
        type: 'category',
        data: ['报警', '故障', '屏蔽', '测试'],
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{
        data: [
          { value: 8, itemStyle: { color: '#F56C6C' } },
          { value: 3, itemStyle: { color: '#E6A23C' } },
          { value: 2, itemStyle: { color: '#909399' } },
          { value: 5, itemStyle: { color: '#409EFF' } }
        ],
        type: 'bar',
        barWidth: 30
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
.fire-alarm-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-overview {
  display: flex;
  gap: 16px;

  .status-card {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;

    .status-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    &.normal .status-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
    &.alarm .status-icon { background: linear-gradient(135deg, #F56C6C, #f89898); animation: pulse 1s infinite; }
    &.fault .status-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
    &.offline .status-icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
    &.shield .status-icon { background: linear-gradient(135deg, #606266, #8c8c8c); }

    .status-value { font-size: 28px; font-weight: 600; }
    .status-label { font-size: 14px; color: #909399; }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.main-content { flex: 1; }

.area-tree-panel, .device-monitor-panel, .alarm-record-panel,
.system-status-panel, .linkage-panel, .stat-panel {
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

    .ml-12 { margin-left: 12px; }
  }
}

.area-tree-panel {
  height: 100%;

  .el-tree { padding: 8px; }

  .tree-node {
    display: flex;
    align-items: center;
    width: 100%;

    .node-label { flex: 1; }
    .node-badge { margin-left: 8px; }
  }
}

.device-monitor-panel {
  margin-bottom: 16px;

  .device-list-view { padding: 16px; }

  .device-grid-view {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px;

    .device-card {
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      border: 2px solid #ebeef5;
      transition: all 0.3s;

      &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

      &.normal { border-color: #67C23A; }
      &.alarm { border-color: #F56C6C; background: #fef0f0; }
      &.fault { border-color: #E6A23C; background: #fdf6ec; }
      &.offline { border-color: #909399; }
      &.shield { border-color: #c0c4cc; background: #f5f7fa; }

      .device-icon { margin-bottom: 8px; }
      .device-name { font-weight: 500; margin-bottom: 4px; }
      .device-location { font-size: 12px; color: #909399; margin-bottom: 8px; }
      .device-value { font-size: 14px; margin-bottom: 8px; }
    }
  }
}

.alarm-record-panel { padding-bottom: 16px; }

.system-status-panel, .linkage-panel {
  margin-bottom: 16px;

  .system-list, .linkage-list { padding: 8px; }

  .system-item, .linkage-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;

    &:hover { background: #f5f7fa; }
  }

  .system-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.normal { background: #67C23A; }
    &.fault { background: #E6A23C; }
  }

  .system-info, .linkage-info {
    flex: 1;

    .system-name, .linkage-name { font-weight: 500; }
    .system-desc, .linkage-desc { font-size: 12px; color: #909399; }
  }
}

.stat-panel {
  .chart-container { height: 150px; padding: 12px; }
}
</style>
