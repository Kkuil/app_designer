<template>
  <div class="patrol-system-container">
    <!-- 统计概览 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card route">
          <div class="stat-icon"><el-icon :size="28"><Location /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.routes }}</div>
            <div class="stat-label">巡检路线</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card today">
          <div class="stat-icon"><el-icon :size="28"><Checked /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayTasks }}</div>
            <div class="stat-label">今日任务</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card completed">
          <div class="stat-icon"><el-icon :size="28"><CircleCheck /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card abnormal">
          <div class="stat-icon"><el-icon :size="28"><Warning /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.abnormal }}</div>
            <div class="stat-label">异常上报</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧路线列表 -->
      <el-col :span="6">
        <div class="route-panel">
          <div class="panel-header">
            <span>巡检路线</span>
            <el-button type="primary" link @click="handleAddRoute"><el-icon><Plus /></el-icon></el-button>
          </div>
          <div class="route-list">
            <div
              v-for="route in routeList"
              :key="route.id"
              class="route-item"
              :class="{ active: selectedRoute?.id === route.id }"
              @click="handleSelectRoute(route)"
            >
              <div class="route-icon"><el-icon><Location /></el-icon></div>
              <div class="route-info">
                <div class="route-name">{{ route.name }}</div>
                <div class="route-points">{{ route.points }}个巡检点</div>
              </div>
              <el-tag :type="route.status === 'active' ? 'success' : 'info'" size="small">
                {{ route.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间任务面板 -->
      <el-col :span="12">
        <div class="task-panel">
          <div class="panel-header">
            <div class="header-left">
              <span>今日巡检任务</span>
              <el-tag type="info" class="ml-8">{{ taskList.length }} 个任务</el-tag>
            </div>
            <div class="header-right">
              <el-button type="primary" size="small" @click="handleAddTask"><el-icon><Plus /></el-icon>新建任务</el-button>
            </div>
          </div>

          <div class="task-timeline">
            <div v-for="task in taskList" :key="task.id" class="task-item" :class="task.status">
              <div class="task-time">
                <div class="time-start">{{ task.startTime }}</div>
                <div class="time-end">{{ task.endTime }}</div>
              </div>
              <div class="task-dot"></div>
              <div class="task-content">
                <div class="task-header">
                  <span class="task-name">{{ task.name }}</span>
                  <el-tag :type="getTaskStatusType(task.status)" size="small">{{ getTaskStatusText(task.status) }}</el-tag>
                </div>
                <div class="task-info">
                  <span><el-icon><Location /></el-icon>{{ task.route }}</span>
                  <span><el-icon><User /></el-icon>{{ task.guard }}</span>
                </div>
                <div class="task-progress" v-if="task.status === 'inProgress' || task.status === 'completed'">
                  <el-progress :percentage="task.progress" :stroke-width="6" :show-text="false" />
                  <span class="progress-text">{{ task.checkedPoints }}/{{ task.totalPoints }} 打卡点</span>
                </div>
                <div class="task-actions">
                  <el-button type="primary" link size="small" @click="handleViewTask(task)">详情</el-button>
                  <el-button v-if="task.status === 'pending'" type="success" link size="small" @click="handleStartTask(task)">开始</el-button>
                  <el-button v-if="task.abnormalCount > 0" type="warning" link size="small" @click="handleViewAbnormal(task)">
                    异常({{ task.abnormalCount }})
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 巡检记录 -->
        <div class="record-panel">
          <div class="panel-header">
            <span>巡检记录</span>
            <el-button type="primary" link @click="handleViewAllRecords">查看全部</el-button>
          </div>
          <el-table :data="recordList" height="180" stripe>
            <el-table-column prop="time" label="打卡时间" width="160" />
            <el-table-column prop="point" label="巡检点" width="120" />
            <el-table-column prop="guard" label="巡检人员" width="100" />
            <el-table-column prop="result" label="结果" width="80">
              <template #default="{ row }">
                <el-tag :type="row.result === 'normal' ? 'success' : 'danger'" size="small">
                  {{ row.result === 'normal' ? '正常' : '异常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </div>
      </el-col>

      <!-- 右侧地图/统计 -->
      <el-col :span="6">
        <!-- 实时位置 -->
        <div class="location-panel">
          <div class="panel-header"><span>人员位置</span></div>
          <div class="guard-list">
            <div v-for="guard in guardList" :key="guard.id" class="guard-item">
              <el-avatar :size="36">{{ guard.name.slice(0, 1) }}</el-avatar>
              <div class="guard-info">
                <div class="guard-name">{{ guard.name }}</div>
                <div class="guard-location">{{ guard.location }}</div>
              </div>
              <el-tag :type="guard.status === 'patrolling' ? 'success' : 'info'" size="small">
                {{ guard.status === 'patrolling' ? '巡检中' : '待命' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 完成率 -->
        <div class="completion-panel">
          <div class="panel-header"><span>今日完成率</span></div>
          <div class="completion-chart">
            <el-progress type="circle" :percentage="completionRate" :width="120" :stroke-width="10">
              <template #default>
                <span class="completion-value">{{ completionRate }}%</span>
              </template>
            </el-progress>
          </div>
          <div class="completion-stats">
            <div class="stat-item"><span class="label">计划任务</span><span class="value">{{ stats.todayTasks }}</span></div>
            <div class="stat-item"><span class="label">已完成</span><span class="value success">{{ stats.completed }}</span></div>
            <div class="stat-item"><span class="label">进行中</span><span class="value primary">{{ stats.inProgress }}</span></div>
          </div>
        </div>

        <!-- 本周统计 -->
        <div class="chart-panel">
          <div class="panel-header"><span>本周统计</span></div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Location, Checked, CircleCheck, Warning, Plus, User } from '@element-plus/icons-vue'

const stats = reactive({ routes: 8, todayTasks: 12, completed: 8, abnormal: 3, inProgress: 2 })

const routeList = ref([
  { id: 1, name: '园区外围巡检', points: 12, status: 'active' },
  { id: 2, name: 'A栋楼内巡检', points: 8, status: 'active' },
  { id: 3, name: 'B栋楼内巡检', points: 8, status: 'active' },
  { id: 4, name: '地下车库巡检', points: 6, status: 'active' },
  { id: 5, name: '夜间安全巡检', points: 15, status: 'active' },
  { id: 6, name: '消防设施巡检', points: 20, status: 'disabled' }
])

const selectedRoute = ref<any>(null)

const taskList = ref([
  { id: 1, name: '早班巡检', route: '园区外围巡检', guard: '张安保', startTime: '08:00', endTime: '09:00', status: 'completed', progress: 100, checkedPoints: 12, totalPoints: 12, abnormalCount: 0 },
  { id: 2, name: 'A栋上午巡检', route: 'A栋楼内巡检', guard: '李安保', startTime: '09:30', endTime: '10:30', status: 'completed', progress: 100, checkedPoints: 8, totalPoints: 8, abnormalCount: 1 },
  { id: 3, name: 'B栋上午巡检', route: 'B栋楼内巡检', guard: '王安保', startTime: '10:00', endTime: '11:00', status: 'inProgress', progress: 62, checkedPoints: 5, totalPoints: 8, abnormalCount: 0 },
  { id: 4, name: '车库巡检', route: '地下车库巡检', guard: '赵安保', startTime: '11:00', endTime: '11:30', status: 'pending', progress: 0, checkedPoints: 0, totalPoints: 6, abnormalCount: 0 },
  { id: 5, name: '午间巡检', route: '园区外围巡检', guard: '张安保', startTime: '12:00', endTime: '13:00', status: 'pending', progress: 0, checkedPoints: 0, totalPoints: 12, abnormalCount: 0 }
])

const recordList = ref([
  { id: 1, time: '2025-01-15 10:25', point: 'B栋5F走廊', guard: '王安保', result: 'normal', remark: '-' },
  { id: 2, time: '2025-01-15 10:18', point: 'B栋4F电梯口', guard: '王安保', result: 'normal', remark: '-' },
  { id: 3, time: '2025-01-15 09:45', point: 'A栋3F消防栓', guard: '李安保', result: 'abnormal', remark: '消防栓压力不足' },
  { id: 4, time: '2025-01-15 09:30', point: 'A栋2F办公区', guard: '李安保', result: 'normal', remark: '-' }
])

const guardList = ref([
  { id: 1, name: '张安保', location: '园区大门', status: 'standby' },
  { id: 2, name: '李安保', location: 'A栋1F大厅', status: 'standby' },
  { id: 3, name: '王安保', location: 'B栋5F', status: 'patrolling' },
  { id: 4, name: '赵安保', location: '监控中心', status: 'standby' }
])

const completionRate = computed(() => Math.round((stats.completed / stats.todayTasks) * 100))

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getTaskStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'info', inProgress: 'primary', completed: 'success', overdue: 'danger' }
  return map[status] || 'info'
}

const getTaskStatusText = (status: string) => {
  const map: Record<string, string> = { pending: '待执行', inProgress: '进行中', completed: '已完成', overdue: '超时' }
  return map[status] || status
}

const handleSelectRoute = (route: any) => { selectedRoute.value = route }
const handleAddRoute = () => { ElMessage.info('新增巡检路线') }
const handleAddTask = () => { ElMessage.info('新建巡检任务') }
const handleViewTask = (task: any) => { ElMessage.info(`查看任务: ${task.name}`) }
const handleStartTask = (task: any) => { task.status = 'inProgress'; ElMessage.success('任务已开始') }
const handleViewAbnormal = (task: any) => { ElMessage.info('查看异常记录') }
const handleViewAllRecords = () => { ElMessage.info('查看全部记录') }

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 35, right: 10, top: 20, bottom: 25 },
      legend: { data: ['完成', '异常'], top: 0, textStyle: { fontSize: 10 } },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        { name: '完成', type: 'bar', data: [12, 11, 12, 10, 12, 8, 6], itemStyle: { color: '#67C23A' }, barWidth: 12 },
        { name: '异常', type: 'bar', data: [1, 2, 0, 3, 1, 0, 0], itemStyle: { color: '#F56C6C' }, barWidth: 12 }
      ]
    }
    chartInstance.setOption(option)
  }
}

onMounted(() => { selectedRoute.value = routeList.value[0]; initChart() })
</script>

<style lang="scss" scoped>
.patrol-system-container {
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

    &.route .stat-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
    &.today .stat-icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
    &.completed .stat-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
    &.abnormal .stat-icon { background: linear-gradient(135deg, #F56C6C, #f89898); }

    .stat-value { font-size: 28px; font-weight: 600; }
    .stat-label { font-size: 14px; color: #909399; }
  }
}

.main-content { flex: 1; }

.route-panel, .task-panel, .record-panel, .location-panel, .completion-panel, .chart-panel {
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

.route-panel {
  height: 100%;
  .route-list { padding: 8px; }
  .route-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
    &:hover { background: #f5f7fa; }
    &.active { background: #ecf5ff; }
    .route-icon { width: 36px; height: 36px; border-radius: 8px; background: #ecf5ff; color: #409EFF; display: flex; align-items: center; justify-content: center; }
    .route-info { flex: 1; .route-name { font-weight: 500; } .route-points { font-size: 12px; color: #909399; } }
  }
}

.task-panel {
  margin-bottom: 16px;
  .task-timeline { padding: 16px; }
  .task-item {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #ebeef5;
    &:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .task-time { width: 60px; text-align: center; font-size: 12px; color: #909399; .time-start { font-weight: 600; color: #303133; } }
    .task-dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; background: #909399; }
    &.completed .task-dot { background: #67C23A; }
    &.inProgress .task-dot { background: #409EFF; animation: pulse 1.5s infinite; }
    &.pending .task-dot { background: #c0c4cc; }
    .task-content { flex: 1; .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; .task-name { font-weight: 500; } } .task-info { display: flex; gap: 16px; font-size: 12px; color: #909399; margin-bottom: 8px; } .task-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; .el-progress { flex: 1; } .progress-text { font-size: 12px; color: #909399; } } .task-actions { display: flex; gap: 8px; } }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.record-panel { padding-bottom: 16px; }

.location-panel {
  margin-bottom: 16px;
  .guard-list { padding: 8px; }
  .guard-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; &:hover { background: #f5f7fa; } .guard-info { flex: 1; .guard-name { font-weight: 500; } .guard-location { font-size: 12px; color: #909399; } } }
}

.completion-panel {
  margin-bottom: 16px;
  .completion-chart { display: flex; justify-content: center; padding: 16px; .completion-value { font-size: 24px; font-weight: 600; color: #67C23A; } }
  .completion-stats { display: flex; justify-content: space-around; padding: 0 16px 16px; .stat-item { text-align: center; .label { font-size: 12px; color: #909399; } .value { font-size: 18px; font-weight: 600; display: block; margin-top: 4px; &.success { color: #67C23A; } &.primary { color: #409EFF; } } } }
}

.chart-panel {
  .chart-container { height: 150px; padding: 12px; }
}
</style>
