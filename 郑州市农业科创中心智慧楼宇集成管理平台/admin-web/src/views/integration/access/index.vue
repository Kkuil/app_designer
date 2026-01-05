<template>
  <div class="access-control-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" v-for="stat in statCards" :key="stat.key">
        <div class="stat-card" :class="stat.key">
          <div class="stat-icon">
            <el-icon :size="28"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧门禁设备列表 -->
      <el-col :span="6">
        <div class="device-panel">
          <div class="panel-header">
            <span>门禁设备</span>
            <el-button type="primary" link @click="handleAddDevice">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <el-input v-model="deviceSearch" placeholder="搜索设备" class="device-search">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <div class="device-list">
            <div
              v-for="device in filteredDevices"
              :key="device.id"
              class="device-item"
              :class="{ active: selectedDevice?.id === device.id }"
              @click="handleSelectDevice(device)"
            >
              <div class="device-icon" :class="device.status">
                <el-icon><Key /></el-icon>
              </div>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-location">{{ device.location }}</div>
              </div>
              <div class="device-status">
                <el-tag :type="getStatusType(device.status)" size="small">
                  {{ getStatusText(device.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间控制面板 -->
      <el-col :span="12">
        <div class="control-panel" v-if="selectedDevice">
          <div class="panel-header">
            <div class="header-left">
              <span class="device-title">{{ selectedDevice.name }}</span>
              <el-tag :type="getStatusType(selectedDevice.status)" class="ml-8">
                {{ getStatusText(selectedDevice.status) }}
              </el-tag>
            </div>
            <div class="header-right">
              <el-button-group>
                <el-button type="success" @click="handleRemoteOpen">
                  <el-icon><Unlock /></el-icon>远程开门
                </el-button>
                <el-button type="danger" @click="handleRemoteLock">
                  <el-icon><Lock /></el-icon>远程锁门
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 设备信息 -->
          <div class="device-detail">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="设备编号">{{ selectedDevice.code }}</el-descriptions-item>
              <el-descriptions-item label="设备类型">{{ selectedDevice.type }}</el-descriptions-item>
              <el-descriptions-item label="安装位置">{{ selectedDevice.location }}</el-descriptions-item>
              <el-descriptions-item label="IP地址">{{ selectedDevice.ip }}</el-descriptions-item>
              <el-descriptions-item label="通讯状态">
                <el-tag :type="selectedDevice.online ? 'success' : 'danger'" size="small">
                  {{ selectedDevice.online ? '在线' : '离线' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开门方式">{{ selectedDevice.openMode }}</el-descriptions-item>
              <el-descriptions-item label="今日通行">{{ selectedDevice.todayCount }}次</el-descriptions-item>
              <el-descriptions-item label="最后通行">{{ selectedDevice.lastAccess }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 通行记录 -->
          <div class="access-records">
            <div class="records-header">
              <span>实时通行记录</span>
              <el-button type="primary" link @click="handleViewMore">查看更多</el-button>
            </div>
            <el-table :data="accessRecords" height="300" stripe>
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="name" label="通行人员" width="100" />
              <el-table-column prop="department" label="部门" width="120" />
              <el-table-column prop="method" label="开门方式" width="100">
                <template #default="{ row }">
                  <el-tag size="small" :type="getMethodType(row.method)">{{ row.methodText }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="result" label="结果" width="80">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.result === 'success' ? 'success' : 'danger'">
                    {{ row.result === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="empty-panel" v-else>
          <el-empty description="请选择门禁设备" />
        </div>
      </el-col>

      <!-- 右侧功能区 -->
      <el-col :span="6">
        <!-- 人员授权 -->
        <div class="function-panel">
          <div class="panel-header">
            <span>快捷操作</span>
          </div>
          <div class="quick-actions">
            <div class="action-item" @click="handleAddAuth">
              <el-icon :size="24" color="#409EFF"><UserFilled /></el-icon>
              <span>人员授权</span>
            </div>
            <div class="action-item" @click="handleTempPass">
              <el-icon :size="24" color="#67C23A"><Tickets /></el-icon>
              <span>临时通行证</span>
            </div>
            <div class="action-item" @click="handleBlacklist">
              <el-icon :size="24" color="#F56C6C"><Warning /></el-icon>
              <span>黑名单</span>
            </div>
            <div class="action-item" @click="handleAccessTime">
              <el-icon :size="24" color="#E6A23C"><Clock /></el-icon>
              <span>时段设置</span>
            </div>
          </div>
        </div>

        <!-- 报警信息 -->
        <div class="alarm-panel">
          <div class="panel-header">
            <span>异常记录</span>
            <el-badge :value="alarmList.length" type="danger" />
          </div>
          <div class="alarm-list">
            <div v-for="alarm in alarmList" :key="alarm.id" class="alarm-item" :class="alarm.level">
              <div class="alarm-icon">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="alarm-content">
                <div class="alarm-title">{{ alarm.title }}</div>
                <div class="alarm-desc">{{ alarm.description }}</div>
                <div class="alarm-time">{{ alarm.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日统计 -->
        <div class="chart-panel">
          <div class="panel-header">
            <span>今日通行趋势</span>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 人员授权弹窗 -->
    <el-dialog v-model="authDialogVisible" title="人员授权" width="600px">
      <el-form :model="authForm" label-width="100px">
        <el-form-item label="选择人员">
          <el-select v-model="authForm.userId" filterable placeholder="请选择人员" style="width: 100%">
            <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权门禁">
          <el-checkbox-group v-model="authForm.devices">
            <el-checkbox v-for="device in deviceList" :key="device.id" :label="device.id">
              {{ device.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker
            v-model="authForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="通行时段">
          <el-time-picker
            v-model="authForm.timeRange"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="authDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAuth">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  Plus, Search, Key, Unlock, Lock, UserFilled, Tickets, Warning, Clock, Bell
} from '@element-plus/icons-vue'

// 统计卡片
const statCards = ref([
  { key: 'total', label: '门禁设备', value: 48, icon: 'Key' },
  { key: 'online', label: '在线设备', value: 45, icon: 'CircleCheck' },
  { key: 'today', label: '今日通行', value: 1256, icon: 'User' },
  { key: 'alarm', label: '异常告警', value: 3, icon: 'Warning' }
])

// 设备列表
const deviceList = ref([
  { id: 1, name: '大门入口门禁', code: 'AC-001', type: '双向门禁', location: '园区大门', ip: '192.168.1.101', status: 'open', online: true, openMode: '刷卡/人脸/密码', todayCount: 256, lastAccess: '2025-01-15 10:25:30' },
  { id: 2, name: 'A栋大厅门禁', code: 'AC-002', type: '单向门禁', location: 'A栋1F大厅', ip: '192.168.1.102', status: 'closed', online: true, openMode: '刷卡/人脸', todayCount: 189, lastAccess: '2025-01-15 10:20:15' },
  { id: 3, name: 'B栋办公区门禁', code: 'AC-003', type: '单向门禁', location: 'B栋2F', ip: '192.168.1.103', status: 'closed', online: true, openMode: '刷卡/指纹', todayCount: 145, lastAccess: '2025-01-15 10:18:00' },
  { id: 4, name: '地下车库入口', code: 'AC-004', type: '车道门禁', location: '地下车库', ip: '192.168.1.104', status: 'alarm', online: true, openMode: '车牌识别', todayCount: 320, lastAccess: '2025-01-15 10:26:00' },
  { id: 5, name: '机房门禁', code: 'AC-005', type: '双向门禁', location: 'A栋3F机房', ip: '192.168.1.105', status: 'closed', online: false, openMode: '刷卡/指纹/密码', todayCount: 12, lastAccess: '2025-01-15 09:30:00' }
])

const deviceSearch = ref('')
const selectedDevice = ref<any>(null)

const filteredDevices = computed(() => {
  if (!deviceSearch.value) return deviceList.value
  return deviceList.value.filter(d => 
    d.name.includes(deviceSearch.value) || d.location.includes(deviceSearch.value)
  )
})

// 通行记录
const accessRecords = ref([
  { id: 1, time: '2025-01-15 10:25:30', name: '张三', department: '研发部', method: 'face', methodText: '人脸识别', result: 'success' },
  { id: 2, time: '2025-01-15 10:24:15', name: '李四', department: '市场部', method: 'card', methodText: '刷卡', result: 'success' },
  { id: 3, time: '2025-01-15 10:22:00', name: '王五', department: '访客', method: 'qrcode', methodText: '二维码', result: 'success' },
  { id: 4, time: '2025-01-15 10:20:45', name: '未知', department: '-', method: 'card', methodText: '刷卡', result: 'fail' },
  { id: 5, time: '2025-01-15 10:18:30', name: '赵六', department: '财务部', method: 'fingerprint', methodText: '指纹', result: 'success' }
])

// 异常记录
const alarmList = ref([
  { id: 1, level: 'high', title: '非法入侵告警', description: '地下车库入口检测到尾随', time: '10:26:00' },
  { id: 2, level: 'medium', title: '设备离线', description: '机房门禁设备离线', time: '09:30:00' },
  { id: 3, level: 'low', title: '多次认证失败', description: 'A栋大厅门禁多次刷卡失败', time: '08:45:00' }
])

// 授权弹窗
const authDialogVisible = ref(false)
const authForm = reactive({
  userId: '',
  devices: [],
  dateRange: [],
  timeRange: []
})

const userList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    open: 'success',
    closed: 'info',
    alarm: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    open: '开启',
    closed: '关闭',
    alarm: '告警'
  }
  return map[status] || status
}

const getMethodType = (method: string) => {
  const map: Record<string, string> = {
    face: 'success',
    card: '',
    fingerprint: 'warning',
    qrcode: 'info'
  }
  return map[method] || ''
}

const handleSelectDevice = (device: any) => {
  selectedDevice.value = device
}

const handleAddDevice = () => {
  ElMessage.info('新增门禁设备')
}

const handleRemoteOpen = () => {
  ElMessage.success('远程开门指令已发送')
}

const handleRemoteLock = () => {
  ElMessage.success('远程锁门指令已发送')
}

const handleViewMore = () => {
  ElMessage.info('查看更多通行记录')
}

const handleViewDetail = (row: any) => {
  ElMessage.info(`查看 ${row.name} 的通行详情`)
}

const handleAddAuth = () => {
  authDialogVisible.value = true
}

const handleTempPass = () => {
  ElMessage.info('创建临时通行证')
}

const handleBlacklist = () => {
  ElMessage.info('管理黑名单')
}

const handleAccessTime = () => {
  ElMessage.info('设置通行时段')
}

const handleSubmitAuth = () => {
  ElMessage.success('授权成功')
  authDialogVisible.value = false
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 30, right: 10, top: 10, bottom: 25 },
      xAxis: {
        type: 'category',
        data: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
        axisLabel: { fontSize: 10 }
      },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{
        data: [5, 2, 3, 15, 120, 180, 95, 160, 200, 145, 60, 20],
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { color: '#409EFF' },
        itemStyle: { color: '#409EFF' }
      }]
    }
    chartInstance.setOption(option)
  }
}

onMounted(() => {
  selectedDevice.value = deviceList.value[0]
  initChart()
})
</script>

<style lang="scss" scoped>
.access-control-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    &.total .stat-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
    &.online .stat-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
    &.today .stat-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
    &.alarm .stat-icon { background: linear-gradient(135deg, #F56C6C, #f89898); }

    .stat-value { font-size: 28px; font-weight: 600; color: #303133; }
    .stat-label { font-size: 14px; color: #909399; margin-top: 4px; }
  }
}

.main-content {
  flex: 1;
}

.device-panel, .control-panel, .function-panel, .alarm-panel, .chart-panel {
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

.device-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .device-search { padding: 12px; }

  .device-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 8px;
  }

  .device-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover { background: #f5f7fa; }
    &.active { background: #ecf5ff; }

    .device-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      &.open { background: #67C23A; }
      &.closed { background: #909399; }
      &.alarm { background: #F56C6C; }
    }

    .device-info {
      flex: 1;

      .device-name { font-weight: 500; }
      .device-location { font-size: 12px; color: #909399; margin-top: 4px; }
    }
  }
}

.control-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header-left {
    display: flex;
    align-items: center;
    .device-title { font-size: 16px; }
    .ml-8 { margin-left: 8px; }
  }

  .device-detail { padding: 16px; }

  .access-records {
    flex: 1;
    padding: 0 16px 16px;

    .records-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 600;
    }
  }
}

.empty-panel {
  height: 100%;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.function-panel {
  margin-bottom: 16px;

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover { background: #ecf5ff; transform: translateY(-2px); }

      span { font-size: 12px; color: #606266; }
    }
  }
}

.alarm-panel {
  margin-bottom: 16px;

  .alarm-list {
    max-height: 200px;
    overflow-y: auto;
    padding: 8px;
  }

  .alarm-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;

    &.high { background: #fef0f0; }
    &.medium { background: #fdf6ec; }
    &.low { background: #f4f4f5; }

    .alarm-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }

    .high .alarm-icon { color: #F56C6C; }
    .medium .alarm-icon { color: #E6A23C; }
    .low .alarm-icon { color: #909399; }

    .alarm-content {
      flex: 1;

      .alarm-title { font-weight: 500; font-size: 13px; }
      .alarm-desc { font-size: 12px; color: #909399; margin-top: 4px; }
      .alarm-time { font-size: 11px; color: #c0c4cc; margin-top: 4px; }
    }
  }
}

.chart-panel {
  .chart-container { height: 150px; padding: 12px; }
}
</style>
