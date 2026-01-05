<template>
  <div class="elevator-system-container">
    <!-- 顶部统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon"><el-icon :size="28"><Box /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">电梯总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card running">
          <div class="stat-icon"><el-icon :size="28"><CaretTop /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.running }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card idle">
          <div class="stat-icon"><el-icon :size="28"><Clock /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.idle }}</div>
            <div class="stat-label">待机中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card fault">
          <div class="stat-icon"><el-icon :size="28"><Warning /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.fault }}</div>
            <div class="stat-label">故障/检修</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <!-- 电梯状态卡片 -->
      <el-col :span="18">
        <div class="elevator-grid">
          <div
            v-for="elevator in elevatorList"
            :key="elevator.id"
            class="elevator-card"
            :class="elevator.status"
            @click="handleSelectElevator(elevator)"
          >
            <div class="elevator-header">
              <span class="elevator-name">{{ elevator.name }}</span>
              <el-tag :type="getStatusType(elevator.status)" size="small">
                {{ getStatusText(elevator.status) }}
              </el-tag>
            </div>
            <div class="elevator-body">
              <div class="elevator-visual">
                <div class="shaft">
                  <div
                    class="car"
                    :style="{ bottom: getCarPosition(elevator) + '%' }"
                    :class="{ moving: elevator.status === 'running' }"
                  >
                    <div class="car-body">
                      <span class="floor-num">{{ elevator.currentFloor }}</span>
                    </div>
                    <div class="direction" v-if="elevator.direction">
                      <el-icon v-if="elevator.direction === 'up'"><CaretTop /></el-icon>
                      <el-icon v-else><CaretBottom /></el-icon>
                    </div>
                  </div>
                  <div class="floor-labels">
                    <span v-for="floor in elevator.floors" :key="floor" class="floor-label">{{ floor }}F</span>
                  </div>
                </div>
              </div>
              <div class="elevator-info">
                <div class="info-item">
                  <span class="label">当前楼层</span>
                  <span class="value">{{ elevator.currentFloor }}F</span>
                </div>
                <div class="info-item">
                  <span class="label">运行方向</span>
                  <span class="value">{{ elevator.direction === 'up' ? '↑上行' : elevator.direction === 'down' ? '↓下行' : '停止' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">载重</span>
                  <span class="value">{{ elevator.load }}%</span>
                </div>
                <div class="info-item">
                  <span class="label">门状态</span>
                  <span class="value">{{ elevator.doorStatus }}</span>
                </div>
              </div>
            </div>
            <div class="elevator-footer">
              <el-button-group size="small">
                <el-button @click.stop="handleCallElevator(elevator)">召梯</el-button>
                <el-button @click.stop="handleEmergencyStop(elevator)" type="danger">急停</el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧控制面板 -->
      <el-col :span="6">
        <!-- 选中电梯控制 -->
        <div class="control-panel" v-if="selectedElevator">
          <div class="panel-header">
            <span>{{ selectedElevator.name }}</span>
            <el-tag :type="getStatusType(selectedElevator.status)" size="small">
              {{ getStatusText(selectedElevator.status) }}
            </el-tag>
          </div>
          <div class="control-content">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="设备编号">{{ selectedElevator.code }}</el-descriptions-item>
              <el-descriptions-item label="电梯类型">{{ selectedElevator.type }}</el-descriptions-item>
              <el-descriptions-item label="额定载重">{{ selectedElevator.capacity }}kg</el-descriptions-item>
              <el-descriptions-item label="运行速度">{{ selectedElevator.speed }}m/s</el-descriptions-item>
              <el-descriptions-item label="服务楼层">{{ selectedElevator.serviceFloors }}</el-descriptions-item>
              <el-descriptions-item label="今日运行">{{ selectedElevator.runCount }}次</el-descriptions-item>
            </el-descriptions>

            <div class="control-actions">
              <div class="action-title">远程控制</div>
              <div class="action-buttons">
                <el-button type="primary" @click="handleLockElevator">
                  <el-icon><Lock /></el-icon>锁梯
                </el-button>
                <el-button type="warning" @click="handleFireMode">
                  <el-icon><Warning /></el-icon>消防
                </el-button>
                <el-button type="success" @click="handleMaintenanceMode">
                  <el-icon><Tools /></el-icon>检修
                </el-button>
                <el-button @click="handleResetElevator">
                  <el-icon><Refresh /></el-icon>复位
                </el-button>
              </div>
            </div>

            <div class="floor-call">
              <div class="action-title">楼层召梯</div>
              <div class="floor-buttons">
                <el-button
                  v-for="floor in selectedElevator.floors"
                  :key="floor"
                  :type="calledFloors.includes(floor) ? 'primary' : 'default'"
                  size="small"
                  @click="handleFloorCall(floor)"
                >
                  {{ floor }}F
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 告警信息 -->
        <div class="alarm-panel">
          <div class="panel-header">
            <span>告警信息</span>
            <el-badge :value="alarmList.length" type="danger" />
          </div>
          <div class="alarm-list">
            <div v-for="alarm in alarmList" :key="alarm.id" class="alarm-item" :class="alarm.level">
              <div class="alarm-icon">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="alarm-content">
                <div class="alarm-title">{{ alarm.title }}</div>
                <div class="alarm-desc">{{ alarm.elevatorName }}</div>
                <div class="alarm-time">{{ alarm.time }}</div>
              </div>
              <el-button type="primary" link size="small" @click="handleAlarmDetail(alarm)">处理</el-button>
            </div>
          </div>
        </div>

        <!-- 运行统计 -->
        <div class="chart-panel">
          <div class="panel-header"><span>今日运行统计</span></div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { Box, CaretTop, CaretBottom, Clock, Warning, Lock, Tools, Refresh, Bell } from '@element-plus/icons-vue'

const stats = reactive({ total: 12, running: 8, idle: 3, fault: 1 })

const elevatorList = ref([
  { id: 1, name: 'A栋1#梯', code: 'EL-A01', type: '客梯', status: 'running', currentFloor: 8, direction: 'up', load: 45, doorStatus: '关闭', capacity: 1000, speed: 2.5, serviceFloors: '1-15F', runCount: 156, floors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { id: 2, name: 'A栋2#梯', code: 'EL-A02', type: '客梯', status: 'running', currentFloor: 3, direction: 'down', load: 20, doorStatus: '关闭', capacity: 1000, speed: 2.5, serviceFloors: '1-15F', runCount: 142, floors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { id: 3, name: 'A栋货梯', code: 'EL-A03', type: '货梯', status: 'idle', currentFloor: 1, direction: null, load: 0, doorStatus: '关闭', capacity: 2000, speed: 1.5, serviceFloors: 'B1-15F', runCount: 45, floors: [-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { id: 4, name: 'B栋1#梯', code: 'EL-B01', type: '客梯', status: 'running', currentFloor: 12, direction: 'up', load: 65, doorStatus: '关闭', capacity: 1000, speed: 2.5, serviceFloors: '1-20F', runCount: 189, floors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { id: 5, name: 'B栋2#梯', code: 'EL-B02', type: '客梯', status: 'fault', currentFloor: 5, direction: null, load: 0, doorStatus: '打开', capacity: 1000, speed: 2.5, serviceFloors: '1-20F', runCount: 78, floors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { id: 6, name: 'B栋货梯', code: 'EL-B03', type: '货梯', status: 'running', currentFloor: 6, direction: 'down', load: 80, doorStatus: '关闭', capacity: 2000, speed: 1.5, serviceFloors: 'B1-20F', runCount: 67, floors: [-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] }
])

const selectedElevator = ref<any>(null)
const calledFloors = ref<number[]>([])

const alarmList = ref([
  { id: 1, level: 'high', title: '电梯困人', elevatorName: 'B栋2#梯', time: '10:25:00' },
  { id: 2, level: 'medium', title: '超载报警', elevatorName: 'A栋1#梯', time: '09:45:00' },
  { id: 3, level: 'low', title: '门机故障', elevatorName: 'A栋货梯', time: '08:30:00' }
])

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getStatusType = (status: string) => {
  const map: Record<string, string> = { running: 'success', idle: 'info', fault: 'danger', maintenance: 'warning' }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { running: '运行中', idle: '待机', fault: '故障', maintenance: '检修' }
  return map[status] || status
}

const getCarPosition = (elevator: any) => {
  const floors = elevator.floors
  const minFloor = Math.min(...floors)
  const maxFloor = Math.max(...floors)
  const range = maxFloor - minFloor
  return ((elevator.currentFloor - minFloor) / range) * 80 + 5
}

const handleSelectElevator = (elevator: any) => {
  selectedElevator.value = elevator
  calledFloors.value = []
}

const handleCallElevator = (elevator: any) => {
  ElMessage.success(`${elevator.name} 召梯指令已发送`)
}

const handleEmergencyStop = (elevator: any) => {
  ElMessageBox.confirm(`确认对 ${elevator.name} 执行急停操作?`, '急停确认', { type: 'warning' }).then(() => {
    elevator.status = 'fault'
    elevator.direction = null
    ElMessage.warning('急停指令已发送')
  })
}

const handleLockElevator = () => {
  ElMessage.success('锁梯指令已发送')
}

const handleFireMode = () => {
  ElMessageBox.confirm('确认启动消防模式? 电梯将迫降至首层', '消防模式').then(() => {
    ElMessage.warning('消防模式已启动')
  })
}

const handleMaintenanceMode = () => {
  ElMessage.success('检修模式已启动')
}

const handleResetElevator = () => {
  if (selectedElevator.value) {
    selectedElevator.value.status = 'idle'
    ElMessage.success('电梯已复位')
  }
}

const handleFloorCall = (floor: number) => {
  if (calledFloors.value.includes(floor)) {
    calledFloors.value = calledFloors.value.filter(f => f !== floor)
  } else {
    calledFloors.value.push(floor)
    ElMessage.success(`${floor}F 召梯成功`)
  }
}

const handleAlarmDetail = (alarm: any) => {
  ElMessage.info('处理报警')
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 30, right: 10, top: 20, bottom: 25 },
      xAxis: { type: 'category', data: ['A1', 'A2', 'A货', 'B1', 'B2', 'B货'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ data: [156, 142, 45, 189, 78, 67], type: 'bar', itemStyle: { color: '#409EFF' }, barWidth: 20 }]
    }
    chartInstance.setOption(option)
  }
}

onMounted(() => {
  selectedElevator.value = elevatorList.value[0]
  initChart()
})
</script>

<style lang="scss" scoped>
.elevator-system-container {
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
    &.running .stat-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
    &.idle .stat-icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
    &.fault .stat-icon { background: linear-gradient(135deg, #F56C6C, #f89898); }

    .stat-value { font-size: 28px; font-weight: 600; }
    .stat-label { font-size: 14px; color: #909399; }
  }
}

.main-content { flex: 1; }

.elevator-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .elevator-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s;

    &:hover { border-color: #409EFF; }
    &.running { border-left: 4px solid #67C23A; }
    &.idle { border-left: 4px solid #909399; }
    &.fault { border-left: 4px solid #F56C6C; background: #fef0f0; }

    .elevator-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .elevator-name { font-weight: 600; }
    }

    .elevator-body {
      display: flex;
      gap: 16px;

      .elevator-visual {
        width: 60px;

        .shaft {
          position: relative;
          height: 120px;
          background: linear-gradient(to bottom, #e4e7ed, #f5f7fa);
          border-radius: 4px;
          border: 1px solid #dcdfe6;

          .car {
            position: absolute;
            left: 4px;
            right: 4px;
            height: 20px;
            transition: bottom 0.5s ease;

            &.moving { animation: elevator-move 2s infinite; }

            .car-body {
              width: 100%;
              height: 100%;
              background: #409EFF;
              border-radius: 2px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 10px;
              font-weight: bold;
            }

            .direction {
              position: absolute;
              right: -16px;
              top: 50%;
              transform: translateY(-50%);
              color: #67C23A;
            }
          }

          .floor-labels {
            position: absolute;
            right: -20px;
            top: 0;
            bottom: 0;
            display: flex;
            flex-direction: column-reverse;
            justify-content: space-between;
            font-size: 8px;
            color: #909399;

            .floor-label { height: 12px; }
          }
        }
      }

      .elevator-info {
        flex: 1;

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;

          .label { color: #909399; }
          .value { font-weight: 500; }
        }
      }
    }

    .elevator-footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;
      display: flex;
      justify-content: center;
    }
  }
}

@keyframes elevator-move {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.control-panel, .alarm-panel, .chart-panel {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.control-panel {
  .control-content { padding: 16px; }

  .control-actions, .floor-call {
    margin-top: 16px;

    .action-title {
      font-weight: 500;
      margin-bottom: 12px;
      color: #606266;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .floor-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
  }
}

.alarm-panel {
  .alarm-list { padding: 8px; max-height: 200px; overflow-y: auto; }

  .alarm-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;

    &.high { background: #fef0f0; }
    &.medium { background: #fdf6ec; }
    &.low { background: #f5f7fa; }

    .alarm-icon { color: #F56C6C; }
    .alarm-content {
      flex: 1;
      .alarm-title { font-weight: 500; }
      .alarm-desc, .alarm-time { font-size: 12px; color: #909399; }
    }
  }
}

.chart-panel {
  .chart-container { height: 150px; padding: 12px; }
}
</style>
