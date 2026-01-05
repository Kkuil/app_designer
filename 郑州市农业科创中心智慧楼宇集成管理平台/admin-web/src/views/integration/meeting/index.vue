<template>
  <div class="meeting-system-container">
    <!-- 日期选择和视图切换 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button @click="handlePrevDay"><el-icon><ArrowLeft /></el-icon></el-button>
          <el-button>{{ currentDate }}</el-button>
          <el-button @click="handleNextDay"><el-icon><ArrowRight /></el-icon></el-button>
        </el-button-group>
        <el-button @click="handleToday" class="ml-12">今天</el-button>
      </div>
      <div class="toolbar-right">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="day">日</el-radio-button>
          <el-radio-button value="week">周</el-radio-button>
          <el-radio-button value="list">列表</el-radio-button>
        </el-radio-group>
        <el-button type="primary" class="ml-12" @click="handleAddMeeting">
          <el-icon><Plus /></el-icon>预约会议
        </el-button>
      </div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧会议室列表 -->
      <el-col :span="5">
        <div class="room-panel">
          <div class="panel-header">
            <span>会议室</span>
            <el-button type="primary" link @click="handleManageRooms"><el-icon><Setting /></el-icon></el-button>
          </div>
          <div class="room-list">
            <div
              v-for="room in roomList"
              :key="room.id"
              class="room-item"
              :class="{ active: selectedRoom?.id === room.id, busy: room.status === 'busy' }"
              @click="handleSelectRoom(room)"
            >
              <div class="room-icon"><el-icon><OfficeBuilding /></el-icon></div>
              <div class="room-info">
                <div class="room-name">{{ room.name }}</div>
                <div class="room-capacity"><el-icon><User /></el-icon>{{ room.capacity }}人</div>
              </div>
              <el-tag :type="room.status === 'available' ? 'success' : room.status === 'busy' ? 'danger' : 'info'" size="small">
                {{ getRoomStatusText(room.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间时间表 -->
      <el-col :span="13">
        <div class="schedule-panel">
          <div class="panel-header">
            <span>{{ selectedRoom?.name || '会议室' }} - 预约情况</span>
          </div>

          <!-- 时间轴视图 -->
          <div class="timeline-view" v-if="viewMode === 'day'">
            <div class="time-axis">
              <div v-for="hour in timeSlots" :key="hour" class="time-slot">
                {{ hour }}:00
              </div>
            </div>
            <div class="meeting-area">
              <div
                v-for="meeting in todayMeetings"
                :key="meeting.id"
                class="meeting-block"
                :style="getMeetingStyle(meeting)"
                :class="meeting.status"
                @click="handleViewMeeting(meeting)"
              >
                <div class="meeting-title">{{ meeting.title }}</div>
                <div class="meeting-time">{{ meeting.startTime }} - {{ meeting.endTime }}</div>
                <div class="meeting-host">{{ meeting.host }}</div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div class="list-view" v-if="viewMode === 'list'">
            <el-table :data="meetingList" height="400" stripe>
              <el-table-column prop="title" label="会议主题" width="200" />
              <el-table-column prop="room" label="会议室" width="120" />
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="time" label="时间" width="140">
                <template #default="{ row }">
                  {{ row.startTime }} - {{ row.endTime }}
                </template>
              </el-table-column>
              <el-table-column prop="host" label="主持人" width="100" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="getMeetingStatusType(row.status)" size="small">{{ getMeetingStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleViewMeeting(row)">详情</el-button>
                  <el-button v-if="row.status === 'pending'" type="warning" link size="small" @click="handleCancelMeeting(row)">取消</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 设备控制 -->
        <div class="device-panel" v-if="selectedRoom">
          <div class="panel-header">
            <span>会议室设备</span>
            <el-tag :type="selectedRoom.deviceStatus === 'online' ? 'success' : 'danger'" size="small">
              {{ selectedRoom.deviceStatus === 'online' ? '设备在线' : '设备离线' }}
            </el-tag>
          </div>
          <div class="device-controls">
            <div class="control-item">
              <div class="control-label"><el-icon><Sunny /></el-icon>照明</div>
              <el-switch v-model="deviceControl.lighting" @change="handleDeviceControl('lighting')" />
            </div>
            <div class="control-item">
              <div class="control-label"><el-icon><Monitor /></el-icon>投影</div>
              <el-switch v-model="deviceControl.projector" @change="handleDeviceControl('projector')" />
            </div>
            <div class="control-item">
              <div class="control-label"><el-icon><Microphone /></el-icon>音响</div>
              <el-switch v-model="deviceControl.audio" @change="handleDeviceControl('audio')" />
            </div>
            <div class="control-item">
              <div class="control-label"><el-icon><Sunrise /></el-icon>空调</div>
              <el-switch v-model="deviceControl.ac" @change="handleDeviceControl('ac')" />
            </div>
            <div class="control-item full">
              <div class="control-label">温度设置</div>
              <el-slider v-model="deviceControl.temperature" :min="16" :max="30" :format-tooltip="(val: number) => `${val}°C`" />
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧面板 -->
      <el-col :span="6">
        <!-- 今日会议 -->
        <div class="today-panel">
          <div class="panel-header">
            <span>今日会议</span>
            <el-badge :value="todayMeetings.length" type="primary" />
          </div>
          <div class="meeting-list">
            <div v-for="meeting in todayMeetings" :key="meeting.id" class="meeting-item" :class="meeting.status">
              <div class="meeting-time-badge">{{ meeting.startTime }}</div>
              <div class="meeting-content">
                <div class="meeting-title">{{ meeting.title }}</div>
                <div class="meeting-info">
                  <span><el-icon><OfficeBuilding /></el-icon>{{ meeting.room }}</span>
                  <span><el-icon><User /></el-icon>{{ meeting.host }}</span>
                </div>
              </div>
              <el-tag :type="getMeetingStatusType(meeting.status)" size="small">{{ getMeetingStatusText(meeting.status) }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 会议统计 -->
        <div class="stat-panel">
          <div class="panel-header"><span>本月统计</span></div>
          <div class="stat-content">
            <div class="stat-item">
              <div class="stat-value">{{ monthStats.total }}</div>
              <div class="stat-label">会议总数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ monthStats.hours }}h</div>
              <div class="stat-label">使用时长</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ monthStats.rate }}%</div>
              <div class="stat-label">使用率</div>
            </div>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 预约会议弹窗 -->
    <el-dialog v-model="meetingDialogVisible" title="预约会议" width="600px">
      <el-form :model="meetingForm" label-width="100px" :rules="meetingRules" ref="meetingFormRef">
        <el-form-item label="会议主题" prop="title">
          <el-input v-model="meetingForm.title" placeholder="请输入会议主题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会议室" prop="room">
              <el-select v-model="meetingForm.room" placeholder="请选择会议室" style="width: 100%">
                <el-option v-for="room in roomList" :key="room.id" :label="room.name" :value="room.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议日期" prop="date">
              <el-date-picker v-model="meetingForm.date" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker v-model="meetingForm.startTime" placeholder="开始时间" format="HH:mm" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-time-picker v-model="meetingForm.endTime" placeholder="结束时间" format="HH:mm" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="参会人员" prop="attendees">
          <el-select v-model="meetingForm.attendees" multiple filterable placeholder="选择参会人员" style="width: 100%">
            <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="meetingForm.remark" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="meetingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitMeeting">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { ArrowLeft, ArrowRight, Plus, Setting, OfficeBuilding, User, Sunny, Monitor, Microphone, Sunrise } from '@element-plus/icons-vue'

const currentDate = ref('2025年1月15日')
const viewMode = ref('day')

const roomList = ref([
  { id: 1, name: '大会议室A', capacity: 30, status: 'busy', deviceStatus: 'online' },
  { id: 2, name: '大会议室B', capacity: 25, status: 'available', deviceStatus: 'online' },
  { id: 3, name: '中会议室1', capacity: 12, status: 'available', deviceStatus: 'online' },
  { id: 4, name: '中会议室2', capacity: 12, status: 'busy', deviceStatus: 'online' },
  { id: 5, name: '小会议室1', capacity: 6, status: 'available', deviceStatus: 'offline' },
  { id: 6, name: '小会议室2', capacity: 6, status: 'maintenance', deviceStatus: 'offline' }
])

const selectedRoom = ref(roomList.value[0])
const timeSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

const todayMeetings = ref([
  { id: 1, title: '周一例会', room: '大会议室A', startTime: '09:00', endTime: '10:00', host: '张总', status: 'completed', date: '2025-01-15' },
  { id: 2, title: '项目评审会', room: '大会议室A', startTime: '10:30', endTime: '12:00', host: '李经理', status: 'ongoing', date: '2025-01-15' },
  { id: 3, title: '客户洽谈', room: '中会议室2', startTime: '14:00', endTime: '16:00', host: '王经理', status: 'pending', date: '2025-01-15' },
  { id: 4, title: '技术分享', room: '大会议室B', startTime: '16:00', endTime: '17:30', host: '陈工', status: 'pending', date: '2025-01-15' }
])

const meetingList = ref([...todayMeetings.value])

const deviceControl = reactive({ lighting: true, projector: false, audio: true, ac: true, temperature: 24 })

const monthStats = reactive({ total: 86, hours: 245, rate: 72 })

const meetingDialogVisible = ref(false)
const meetingFormRef = ref()
const meetingForm = reactive({
  title: '', room: '', date: '', startTime: '', endTime: '', attendees: [], remark: ''
})

const meetingRules = {
  title: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
  room: [{ required: true, message: '请选择会议室', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const userList = ref([
  { id: 1, name: '张三' }, { id: 2, name: '李四' }, { id: 3, name: '王五' }, { id: 4, name: '赵六' }
])

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getRoomStatusText = (status: string) => {
  const map: Record<string, string> = { available: '空闲', busy: '使用中', maintenance: '维护' }
  return map[status] || status
}

const getMeetingStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'info', ongoing: 'success', completed: '', cancelled: 'danger' }
  return map[status] || 'info'
}

const getMeetingStatusText = (status: string) => {
  const map: Record<string, string> = { pending: '待开始', ongoing: '进行中', completed: '已结束', cancelled: '已取消' }
  return map[status] || status
}

const getMeetingStyle = (meeting: any) => {
  const startHour = parseInt(meeting.startTime.split(':')[0])
  const endHour = parseInt(meeting.endTime.split(':')[0])
  const startMin = parseInt(meeting.startTime.split(':')[1])
  const endMin = parseInt(meeting.endTime.split(':')[1])
  const top = ((startHour - 8) * 60 + startMin) * (40 / 60)
  const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (40 / 60)
  return { top: `${top}px`, height: `${height}px` }
}

const handlePrevDay = () => { ElMessage.info('上一天') }
const handleNextDay = () => { ElMessage.info('下一天') }
const handleToday = () => { ElMessage.info('返回今天') }
const handleSelectRoom = (room: any) => { selectedRoom.value = room }
const handleManageRooms = () => { ElMessage.info('管理会议室') }
const handleAddMeeting = () => { meetingDialogVisible.value = true }
const handleViewMeeting = (meeting: any) => { ElMessage.info(`查看会议: ${meeting.title}`) }
const handleCancelMeeting = (meeting: any) => { meeting.status = 'cancelled'; ElMessage.success('会议已取消') }
const handleDeviceControl = (device: string) => { ElMessage.success(`${device} 控制成功`) }

const handleSubmitMeeting = async () => {
  await meetingFormRef.value?.validate()
  ElMessage.success('会议预约成功')
  meetingDialogVisible.value = false
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 35, right: 10, top: 10, bottom: 25 },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ data: [8, 10, 12, 9, 11, 4, 2], type: 'bar', itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }, barWidth: 16 }]
    }
    chartInstance.setOption(option)
  }
}

onMounted(() => { initChart() })
</script>

<style lang="scss" scoped>
.meeting-system-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  .ml-12 { margin-left: 12px; }
}

.main-content { flex: 1; }

.room-panel, .schedule-panel, .device-panel, .today-panel, .stat-panel {
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

.room-panel {
  height: 100%;
  .room-list { padding: 8px; }
  .room-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
    &:hover { background: #f5f7fa; }
    &.active { background: #ecf5ff; }
    &.busy { border-left: 3px solid #F56C6C; }
    .room-icon { width: 36px; height: 36px; border-radius: 8px; background: #ecf5ff; color: #409EFF; display: flex; align-items: center; justify-content: center; }
    .room-info { flex: 1; .room-name { font-weight: 500; } .room-capacity { font-size: 12px; color: #909399; display: flex; align-items: center; gap: 4px; } }
  }
}

.schedule-panel {
  margin-bottom: 16px;
  .timeline-view {
    display: flex;
    padding: 16px;
    .time-axis { width: 60px; .time-slot { height: 40px; font-size: 12px; color: #909399; } }
    .meeting-area { flex: 1; position: relative; border-left: 1px solid #ebeef5; min-height: 480px; }
    .meeting-block {
      position: absolute;
      left: 8px;
      right: 8px;
      background: #ecf5ff;
      border-left: 3px solid #409EFF;
      border-radius: 4px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.3s;
      &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      &.ongoing { background: #f0f9eb; border-left-color: #67C23A; }
      &.completed { background: #f5f7fa; border-left-color: #909399; }
      .meeting-title { font-weight: 500; font-size: 13px; }
      .meeting-time { font-size: 12px; color: #909399; }
      .meeting-host { font-size: 12px; color: #606266; }
    }
  }
  .list-view { padding: 16px; }
}

.device-panel {
  .device-controls {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 16px;
    .control-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      &.full { grid-column: span 4; flex-direction: row; .control-label { min-width: 80px; } .el-slider { flex: 1; } }
      .control-label { display: flex; align-items: center; gap: 4px; font-size: 14px; }
    }
  }
}

.today-panel {
  margin-bottom: 16px;
  .meeting-list { padding: 8px; max-height: 250px; overflow-y: auto; }
  .meeting-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: #f5f7fa;
    &.ongoing { background: #f0f9eb; }
    .meeting-time-badge { font-weight: 600; color: #409EFF; min-width: 50px; }
    .meeting-content { flex: 1; .meeting-title { font-weight: 500; } .meeting-info { font-size: 12px; color: #909399; display: flex; gap: 12px; margin-top: 4px; } }
  }
}

.stat-panel {
  .stat-content {
    display: flex;
    justify-content: space-around;
    padding: 16px;
    .stat-item { text-align: center; .stat-value { font-size: 24px; font-weight: 600; color: #409EFF; } .stat-label { font-size: 12px; color: #909399; margin-top: 4px; } }
  }
  .chart-container { height: 120px; padding: 0 12px 12px; }
}
</style>
