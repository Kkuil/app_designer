<template>
  <div class="field-inspection-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Magnet /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">巡检任务</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card today"><div class="icon"><el-icon :size="24"><Calendar /></el-icon></div><div class="content"><div class="value">{{ stats.today }}</div><div class="label">今日任务</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card completed"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.completed }}</div><div class="label">已完成</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card abnormal"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.abnormal }}</div><div class="label">异常上报</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header">
            <span>巡检路线</span>
            <el-button type="primary" link @click="handleAddRoute"><el-icon><Plus /></el-icon></el-button>
          </div>
          <div class="route-list">
            <div v-for="route in routeList" :key="route.id" class="route-item" :class="{ active: selectedRoute?.id === route.id }" @click="selectedRoute = route">
              <div class="info">
                <div class="name">{{ route.name }}</div>
                <div class="desc">{{ route.pointCount }} 个巡检点</div>
              </div>
              <el-tag :type="route.status === 'active' ? 'success' : 'info'" size="small">{{ route.status === 'active' ? '启用' : '停用' }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>巡检人员</span></div>
          <div class="person-list">
            <div v-for="person in personList" :key="person.id" class="person-item">
              <el-avatar :size="32">{{ person.name.charAt(0) }}</el-avatar>
              <div class="info">
                <div class="name">{{ person.name }}</div>
                <div class="status">
                  <el-tag :type="person.onDuty ? 'success' : 'info'" size="small">{{ person.onDuty ? '在岗' : '离岗' }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>巡检任务列表</span>
            <el-button type="primary" size="small" @click="handleCreateTask"><el-icon><Plus /></el-icon>新建任务</el-button>
          </div>
          <el-table :data="taskList" height="400" stripe>
            <el-table-column prop="name" label="任务名称" width="150" />
            <el-table-column prop="route" label="巡检路线" width="120" />
            <el-table-column prop="person" label="巡检人" width="90" />
            <el-table-column prop="planTime" label="计划时间" width="160" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }"><el-tag :type="taskStatusType(row.status)" size="small">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="100">
              <template #default="{ row }"><el-progress :percentage="row.progress" :stroke-width="6" /></template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }"><el-button type="primary" link size="small" @click="handleViewTask(row)">详情</el-button></template>
            </el-table-column>
          </el-table>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>巡检地图</span></div>
          <div class="map-area">
            <div class="mock-map">
              <div v-for="point in mapPoints" :key="point.id" class="map-point" :class="point.status" :style="{ left: point.x + '%', top: point.y + '%' }">
                <el-tooltip :content="point.name">
                  <div class="point-marker"></div>
                </el-tooltip>
              </div>
              <div class="map-legend">
                <span class="legend-item"><span class="dot checked"></span>已巡检</span>
                <span class="legend-item"><span class="dot pending"></span>待巡检</span>
                <span class="legend-item"><span class="dot abnormal"></span>异常</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>异常记录</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="record in abnormalList" :key="record.id" type="danger" :timestamp="record.time">
              <div class="record-title">{{ record.point }}</div>
              <div class="record-content">{{ record.issue }}</div>
              <div class="record-person">上报人: {{ record.person }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>完成率趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="taskDialogVisible" title="任务详情" width="700px">
      <el-descriptions :column="2" border v-if="currentTask">
        <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
        <el-descriptions-item label="巡检路线">{{ currentTask.route }}</el-descriptions-item>
        <el-descriptions-item label="巡检人">{{ currentTask.person }}</el-descriptions-item>
        <el-descriptions-item label="任务状态"><el-tag :type="taskStatusType(currentTask.status)" size="small">{{ currentTask.status }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ currentTask.planTime }}</el-descriptions-item>
        <el-descriptions-item label="完成进度"><el-progress :percentage="currentTask.progress" /></el-descriptions-item>
      </el-descriptions>
      <div class="point-table">
        <div class="section-title">巡检点完成情况</div>
        <el-table :data="taskPoints" height="200">
          <el-table-column prop="name" label="巡检点" width="140" />
          <el-table-column prop="checkTime" label="检查时间" width="160" />
          <el-table-column prop="result" label="检查结果" width="100">
            <template #default="{ row }"><el-tag :type="row.result === '正常' ? 'success' : row.result === '异常' ? 'danger' : 'info'" size="small">{{ row.result }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Magnet, Calendar, CircleCheck, Warning, Plus } from '@element-plus/icons-vue'

const stats = reactive({ total: 156, today: 12, completed: 8, abnormal: 2 })

const routeList = ref([
  { id: 1, name: 'A座日常巡检', pointCount: 15, status: 'active' },
  { id: 2, name: 'B座消防巡检', pointCount: 20, status: 'active' },
  { id: 3, name: 'C座设备巡检', pointCount: 12, status: 'inactive' }
])
const selectedRoute = ref(routeList.value[0])

const personList = ref([
  { id: 1, name: '张三', onDuty: true },
  { id: 2, name: '李四', onDuty: true },
  { id: 3, name: '王五', onDuty: false }
])

const taskList = ref([
  { id: 1, name: 'A座早间巡检', route: 'A座日常巡检', person: '张三', planTime: '2025-01-15 08:00', status: '已完成', progress: 100 },
  { id: 2, name: 'B座消防检查', route: 'B座消防巡检', person: '李四', planTime: '2025-01-15 10:00', status: '进行中', progress: 65 },
  { id: 3, name: 'A座午间巡检', route: 'A座日常巡检', person: '张三', planTime: '2025-01-15 14:00', status: '待执行', progress: 0 }
])

const mapPoints = ref([
  { id: 1, name: '入口大厅', x: 20, y: 30, status: 'checked' },
  { id: 2, name: '电梯间-1F', x: 40, y: 25, status: 'checked' },
  { id: 3, name: '消防通道-A', x: 60, y: 40, status: 'pending' },
  { id: 4, name: '配电室', x: 75, y: 55, status: 'abnormal' },
  { id: 5, name: '楼顶设备间', x: 50, y: 70, status: 'pending' }
])

const abnormalList = ref([
  { id: 1, point: '配电室', issue: '配电柜温度偏高', person: '李四', time: '10:25' },
  { id: 2, point: '消防通道-B', issue: '灭火器过期', person: '张三', time: '09:15' }
])

const taskPoints = ref([
  { name: '入口大厅', checkTime: '08:05', result: '正常', remark: '' },
  { name: '电梯间-1F', checkTime: '08:12', result: '正常', remark: '' },
  { name: '消防通道-A', checkTime: '-', result: '待检', remark: '' }
])

const chartRef = ref()
const taskDialogVisible = ref(false)
const currentTask = ref<any>(null)

const taskStatusType = (status: string) => {
  const map: Record<string, string> = { '待执行': 'info', '进行中': 'primary', '已完成': 'success', '已取消': 'warning' }
  return map[status] || ''
}

const handleAddRoute = () => { ElMessage.info('新建巡检路线') }
const handleCreateTask = () => { ElMessage.info('新建巡检任务') }
const handleViewTask = (row: any) => { currentTask.value = row; taskDialogVisible.value = true }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', min: 0, max: 100, axisLabel: { fontSize: 10, formatter: '{value}%' } },
      series: [{ type: 'line', data: [95, 98, 92, 100, 96, 88, 94], smooth: true, areaStyle: { color: 'rgba(103,194,58,0.15)' }, lineStyle: { color: '#67C23A' }, itemStyle: { color: '#67C23A' } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.field-inspection-container { display: flex; flex-direction: column; gap: 12px; }

.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 14px; .icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 22px; font-weight: 600; } .label { color: #909399; font-size: 13px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.today .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.completed .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.abnormal .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
}}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 14px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.route-list { padding: 8px; .route-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .info { .name { font-weight: 500; } .desc { font-size: 12px; color: #909399; } } } }

.person-list { padding: 12px; .person-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; &:last-child { border-bottom: none; } .info { flex: 1; .name { font-weight: 500; } } } }

.map-area { padding: 16px; .mock-map { height: 200px; background: linear-gradient(135deg, #f0f2f5, #e8eaec); border-radius: 8px; position: relative; .map-point { position: absolute; .point-marker { width: 16px; height: 16px; border-radius: 50%; cursor: pointer; } &.checked .point-marker { background: #67C23A; } &.pending .point-marker { background: #409EFF; } &.abnormal .point-marker { background: #F56C6C; animation: pulse 1.5s infinite; } } .map-legend { position: absolute; bottom: 8px; right: 8px; display: flex; gap: 12px; font-size: 12px; .legend-item { display: flex; align-items: center; gap: 4px; .dot { width: 8px; height: 8px; border-radius: 50%; &.checked { background: #67C23A; } &.pending { background: #409EFF; } &.abnormal { background: #F56C6C; } } } } } }

@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }

.timeline { padding: 12px 16px; max-height: 280px; overflow: auto; .record-title { font-weight: 500; } .record-content { font-size: 13px; color: #606266; } .record-person { font-size: 12px; color: #909399; } }

.chart { height: 180px; padding: 12px; }

.main-content { flex: 1; }

.point-table { margin-top: 20px; .section-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #409EFF; } }
</style>
