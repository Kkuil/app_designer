<template>
  <div class="parking-management-container">
    <!-- 统计概览 -->
    <div class="stat-overview">
      <div class="stat-card total">
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总车位</div>
        </div>
        <div class="stat-icon"><el-icon :size="32"><Van /></el-icon></div>
      </div>
      <div class="stat-card available">
        <div class="stat-content">
          <div class="stat-value">{{ stats.available }}</div>
          <div class="stat-label">空闲车位</div>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="(stats.available / stats.total) * 100" :show-text="false" :stroke-width="6" color="#67C23A" />
        </div>
      </div>
      <div class="stat-card occupied">
        <div class="stat-content">
          <div class="stat-value">{{ stats.occupied }}</div>
          <div class="stat-label">已占用</div>
        </div>
        <div class="stat-progress">
          <el-progress :percentage="(stats.occupied / stats.total) * 100" :show-text="false" :stroke-width="6" color="#409EFF" />
        </div>
      </div>
      <div class="stat-card today-in">
        <div class="stat-content">
          <div class="stat-value">{{ stats.todayIn }}</div>
          <div class="stat-label">今日入场</div>
        </div>
        <div class="stat-icon"><el-icon :size="32"><Bottom /></el-icon></div>
      </div>
      <div class="stat-card today-out">
        <div class="stat-content">
          <div class="stat-value">{{ stats.todayOut }}</div>
          <div class="stat-label">今日出场</div>
        </div>
        <div class="stat-icon"><el-icon :size="32"><Top /></el-icon></div>
      </div>
      <div class="stat-card revenue">
        <div class="stat-content">
          <div class="stat-value">¥{{ stats.revenue }}</div>
          <div class="stat-label">今日收入</div>
        </div>
        <div class="stat-icon"><el-icon :size="32"><Coin /></el-icon></div>
      </div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧区域选择 -->
      <el-col :span="5">
        <div class="area-panel">
          <div class="panel-header">
            <span>停车区域</span>
          </div>
          <div class="area-list">
            <div
              v-for="area in areaList"
              :key="area.id"
              class="area-item"
              :class="{ active: selectedArea?.id === area.id }"
              @click="handleSelectArea(area)"
            >
              <div class="area-icon">
                <el-icon><Place /></el-icon>
              </div>
              <div class="area-info">
                <div class="area-name">{{ area.name }}</div>
                <div class="area-stat">
                  <span class="available">{{ area.available }}</span> / {{ area.total }}
                </div>
              </div>
              <el-progress
                type="circle"
                :percentage="((area.total - area.available) / area.total) * 100"
                :width="40"
                :stroke-width="4"
                :color="getOccupancyColor(area)"
              />
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间车位地图 -->
      <el-col :span="13">
        <div class="parking-map-panel">
          <div class="panel-header">
            <div class="header-left">
              <span>{{ selectedArea?.name || '停车场' }}车位分布</span>
              <el-tag type="info" class="ml-8">空闲: {{ selectedArea?.available }}</el-tag>
            </div>
            <div class="header-right">
              <el-button-group size="small">
                <el-button :type="viewMode === 'map' ? 'primary' : ''" @click="viewMode = 'map'">地图</el-button>
                <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'">列表</el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 地图视图 -->
          <div v-if="viewMode === 'map'" class="parking-map">
            <div class="map-legend">
              <span class="legend-item available"><span class="dot"></span>空闲</span>
              <span class="legend-item occupied"><span class="dot"></span>占用</span>
              <span class="legend-item reserved"><span class="dot"></span>预约</span>
              <span class="legend-item disabled"><span class="dot"></span>禁用</span>
            </div>
            <div class="parking-grid">
              <div class="parking-row" v-for="(row, rowIndex) in parkingLayout" :key="rowIndex">
                <div
                  v-for="spot in row"
                  :key="spot.id"
                  class="parking-spot"
                  :class="spot.status"
                  @click="handleSpotClick(spot)"
                >
                  <div class="spot-number">{{ spot.number }}</div>
                  <div class="spot-plate" v-if="spot.plate">{{ spot.plate }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="parking-list">
            <el-table :data="parkingSpots" height="400" stripe>
              <el-table-column prop="number" label="车位号" width="100" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="getSpotStatusType(row.status)" size="small">{{ getSpotStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="plate" label="车牌号" width="120" />
              <el-table-column prop="enterTime" label="入场时间" width="160" />
              <el-table-column prop="duration" label="停放时长" width="100" />
              <el-table-column prop="fee" label="预计费用" width="100" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleSpotDetail(row)">详情</el-button>
                  <el-button v-if="row.status === 'occupied'" type="warning" link size="small" @click="handleForceOut(row)">强制出场</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 通行记录 -->
        <div class="record-panel">
          <div class="panel-header">
            <span>实时通行记录</span>
            <el-button type="primary" link @click="handleViewAllRecords">查看全部</el-button>
          </div>
          <el-table :data="passRecords" height="180" stripe>
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="plate" label="车牌号" width="120" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.type === 'in' ? 'success' : 'warning'" size="small">
                  {{ row.type === 'in' ? '入场' : '出场' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="gate" label="通道" />
            <el-table-column prop="carType" label="车辆类型" width="100" />
            <el-table-column prop="fee" label="费用" width="80" />
          </el-table>
        </div>
      </el-col>

      <!-- 右侧功能面板 -->
      <el-col :span="6">
        <!-- 快捷操作 -->
        <div class="quick-panel">
          <div class="panel-header"><span>快捷操作</span></div>
          <div class="quick-actions">
            <div class="action-item" @click="handleManualIn">
              <el-icon :size="24" color="#67C23A"><Bottom /></el-icon>
              <span>手动入场</span>
            </div>
            <div class="action-item" @click="handleManualOut">
              <el-icon :size="24" color="#E6A23C"><Top /></el-icon>
              <span>手动出场</span>
            </div>
            <div class="action-item" @click="handleOpenGate">
              <el-icon :size="24" color="#409EFF"><Unlock /></el-icon>
              <span>开闸放行</span>
            </div>
            <div class="action-item" @click="handleReservation">
              <el-icon :size="24" color="#909399"><Calendar /></el-icon>
              <span>车位预约</span>
            </div>
          </div>
        </div>

        <!-- 通道状态 -->
        <div class="gate-panel">
          <div class="panel-header">
            <span>通道闸机设备</span>
            <el-button type="primary" link size="small" @click="showGateDetail = !showGateDetail">
              {{ showGateDetail ? '简洁视图' : '详细视图' }}
            </el-button>
          </div>
          <div class="gate-list" v-if="!showGateDetail">
            <div v-for="gate in gateList" :key="gate.id" class="gate-item">
              <div class="gate-icon" :class="gate.status">
                <el-icon><SetUp /></el-icon>
              </div>
              <div class="gate-info">
                <div class="gate-name">{{ gate.name }}</div>
                <div class="gate-desc">{{ gate.type }}</div>
              </div>
              <el-tag :type="gate.status === 'normal' ? 'success' : 'danger'" size="small">
                {{ gate.status === 'normal' ? '正常' : '故障' }}
              </el-tag>
            </div>
          </div>
          <el-table v-else :data="gateList" size="small" height="220">
            <el-table-column prop="name" label="设备名称" width="100" />
            <el-table-column prop="deviceId" label="设备ID" width="100" />
            <el-table-column prop="type" label="类型" width="80" />
            <el-table-column prop="ip" label="IP地址" width="110" />
            <el-table-column prop="status" label="状态" width="70">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'normal' ? '正常' : '故障' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="success" link size="small" @click="handleGateOpen(row)">开闸</el-button>
                <el-button type="warning" link size="small" @click="handleGateClose(row)">落闸</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 闸机详细信息 -->
        <div class="gate-detail-panel">
          <div class="panel-header"><span>闸机设备详情</span></div>
          <div class="gate-detail-list">
            <div v-for="gate in gateList" :key="gate.id" class="gate-detail-card">
              <div class="gate-status-indicator" :class="gate.status"></div>
              <div class="gate-detail-content">
                <div class="gate-header">
                  <span class="gate-title">{{ gate.name }}</span>
                  <el-tag :type="gate.status === 'normal' ? 'success' : 'danger'" size="small">
                    {{ gate.status === 'normal' ? '在线' : '离线' }}
                  </el-tag>
                </div>
                <div class="gate-specs">
                  <div class="spec-item"><span>设备ID:</span><strong>{{ gate.deviceId }}</strong></div>
                  <div class="spec-item"><span>IP地址:</span><strong>{{ gate.ip }}</strong></div>
                  <div class="spec-item"><span>MAC地址:</span><strong>{{ gate.mac }}</strong></div>
                  <div class="spec-item"><span>品牌型号:</span><strong>{{ gate.model }}</strong></div>
                  <div class="spec-item"><span>闸杆状态:</span><strong>{{ gate.barrierStatus }}</strong></div>
                  <div class="spec-item"><span>今日通行:</span><strong>{{ gate.todayCount }} 次</strong></div>
                </div>
                <div class="gate-actions">
                  <el-button size="small" type="success" @click="handleGateOpen(gate)">
                    <el-icon><Unlock /></el-icon>开闸
                  </el-button>
                  <el-button size="small" type="warning" @click="handleGateClose(gate)">
                    <el-icon><Lock /></el-icon>落闸
                  </el-button>
                  <el-button size="small" @click="handleGateReboot(gate)">
                    <el-icon><Refresh /></el-icon>重启
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 收入统计 -->
        <div class="chart-panel">
          <div class="panel-header"><span>本周收入</span></div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 车位详情弹窗 -->
    <el-dialog v-model="spotDialogVisible" :title="'车位: ' + selectedSpot?.number" width="500px">
      <el-descriptions :column="2" border v-if="selectedSpot">
        <el-descriptions-item label="车位号">{{ selectedSpot.number }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getSpotStatusType(selectedSpot.status)">{{ getSpotStatusText(selectedSpot.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="车牌号" v-if="selectedSpot.plate">{{ selectedSpot.plate }}</el-descriptions-item>
        <el-descriptions-item label="入场时间" v-if="selectedSpot.enterTime">{{ selectedSpot.enterTime }}</el-descriptions-item>
        <el-descriptions-item label="停放时长" v-if="selectedSpot.duration">{{ selectedSpot.duration }}</el-descriptions-item>
        <el-descriptions-item label="预计费用" v-if="selectedSpot.fee">{{ selectedSpot.fee }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Van, Bottom, Top, Coin, Place, Unlock, Lock, Calendar, SetUp, Refresh } from '@element-plus/icons-vue'

const stats = reactive({
  total: 500,
  available: 186,
  occupied: 314,
  todayIn: 423,
  todayOut: 398,
  revenue: 12680
})

const areaList = ref([
  { id: 1, name: 'A区地面停车场', total: 150, available: 45 },
  { id: 2, name: 'B区地面停车场', total: 100, available: 32 },
  { id: 3, name: '地下一层停车场', total: 150, available: 58 },
  { id: 4, name: '地下二层停车场', total: 100, available: 51 }
])

const selectedArea = ref(areaList.value[0])
const viewMode = ref('map')

// 模拟车位布局
const parkingLayout = computed(() => {
  const layout = []
  for (let i = 0; i < 4; i++) {
    const row = []
    for (let j = 0; j < 10; j++) {
      const id = i * 10 + j + 1
      const statuses = ['available', 'occupied', 'occupied', 'available', 'occupied', 'reserved', 'occupied', 'available', 'occupied', 'disabled']
      const plates = ['', '京A12345', '京B67890', '', '沪C11111', '', '粤D22222', '', '苏E33333', '']
      row.push({
        id,
        number: `A${String(id).padStart(3, '0')}`,
        status: statuses[j],
        plate: plates[j]
      })
    }
    layout.push(row)
  }
  return layout
})

const parkingSpots = computed(() => {
  return parkingLayout.value.flat()
})

const passRecords = ref([
  { id: 1, time: '2025-01-15 10:28:00', plate: '京A12345', type: 'in', gate: 'A区入口', carType: '临时车', fee: '-' },
  { id: 2, time: '2025-01-15 10:26:30', plate: '京B67890', type: 'out', gate: 'A区出口', carType: '月租车', fee: '¥0' },
  { id: 3, time: '2025-01-15 10:25:00', plate: '沪C11111', type: 'in', gate: 'B区入口', carType: '临时车', fee: '-' },
  { id: 4, time: '2025-01-15 10:22:00', plate: '粤D22222', type: 'out', gate: 'A区出口', carType: '临时车', fee: '¥15' }
])

const gateList = ref([
  { id: 1, name: 'A区入口', type: '入口通道', status: 'normal', deviceId: 'GATE-001', ip: '192.168.10.101', mac: '00:1B:2C:3D:4E:01', model: '捷顺 JSKT-B01', barrierStatus: '已抬起', todayCount: 156 },
  { id: 2, name: 'A区出口', type: '出口通道', status: 'normal', deviceId: 'GATE-002', ip: '192.168.10.102', mac: '00:1B:2C:3D:4E:02', model: '捷顺 JSKT-B01', barrierStatus: '已落下', todayCount: 148 },
  { id: 3, name: 'B区入口', type: '入口通道', status: 'normal', deviceId: 'GATE-003', ip: '192.168.10.103', mac: '00:1B:2C:3D:4E:03', model: '捷顺 JSKT-B02', barrierStatus: '已落下', todayCount: 89 },
  { id: 4, name: '地下入口', type: '入口通道', status: 'fault', deviceId: 'GATE-004', ip: '192.168.10.104', mac: '00:1B:2C:3D:4E:04', model: '科拓 KT-G100', barrierStatus: '故障', todayCount: 0 }
])

const showGateDetail = ref(false)

const spotDialogVisible = ref(false)
const selectedSpot = ref<any>(null)
const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getOccupancyColor = (area: any) => {
  const rate = (area.total - area.available) / area.total
  if (rate > 0.9) return '#F56C6C'
  if (rate > 0.7) return '#E6A23C'
  return '#67C23A'
}

const getSpotStatusType = (status: string) => {
  const map: Record<string, string> = { available: 'success', occupied: 'primary', reserved: 'warning', disabled: 'info' }
  return map[status] || 'info'
}

const getSpotStatusText = (status: string) => {
  const map: Record<string, string> = { available: '空闲', occupied: '占用', reserved: '预约', disabled: '禁用' }
  return map[status] || status
}

const handleSelectArea = (area: any) => {
  selectedArea.value = area
}

const handleSpotClick = (spot: any) => {
  selectedSpot.value = spot
  spotDialogVisible.value = true
}

const handleSpotDetail = (row: any) => {
  selectedSpot.value = row
  spotDialogVisible.value = true
}

const handleForceOut = (row: any) => {
  ElMessage.warning(`强制出场: ${row.plate}`)
}

const handleViewAllRecords = () => {
  ElMessage.info('查看全部通行记录')
}

const handleManualIn = () => {
  ElMessage.info('手动入场登记')
}

const handleManualOut = () => {
  ElMessage.info('手动出场结算')
}

const handleOpenGate = () => {
  ElMessage.success('开闸指令已发送')
}

const handleReservation = () => {
  ElMessage.info('车位预约管理')
}

const handleGateOpen = (gate: any) => {
  gate.barrierStatus = '已抬起'
  ElMessage.success(`${gate.name} 开闸成功`)
}

const handleGateClose = (gate: any) => {
  gate.barrierStatus = '已落下'
  ElMessage.success(`${gate.name} 落闸成功`)
}

const handleGateReboot = (gate: any) => {
  ElMessage.info(`${gate.name} 正在重启...`)
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 40, right: 10, top: 10, bottom: 25 },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: (v: number) => (v / 1000) + 'k' } },
      series: [{
        data: [8500, 9200, 10800, 11500, 15600, 18200, 12680],
        type: 'bar',
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] },
        barWidth: 16
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
.parking-management-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-overview {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stat-value { font-size: 24px; font-weight: 600; }
    .stat-label { font-size: 12px; color: #909399; margin-top: 4px; }

    .stat-icon { color: #409EFF; }
    &.available .stat-icon { color: #67C23A; }
    &.today-out .stat-icon { color: #E6A23C; }
    &.revenue .stat-icon { color: #F56C6C; }

    .stat-progress { width: 60px; }
  }
}

.main-content { flex: 1; }

.area-panel, .parking-map-panel, .record-panel, .quick-panel, .gate-panel, .chart-panel {
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
  height: 100%;

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
      background: #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #409EFF;
    }

    .area-info {
      flex: 1;
      .area-name { font-weight: 500; }
      .area-stat { font-size: 12px; color: #909399; .available { color: #67C23A; font-weight: 600; } }
    }
  }
}

.parking-map-panel {
  margin-bottom: 16px;

  .parking-map {
    padding: 16px;

    .map-legend {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        &.available .dot { background: #67C23A; }
        &.occupied .dot { background: #409EFF; }
        &.reserved .dot { background: #E6A23C; }
        &.disabled .dot { background: #c0c4cc; }
      }
    }

    .parking-grid {
      .parking-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .parking-spot {
        width: 60px;
        height: 80px;
        border: 2px solid #dcdfe6;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover { transform: scale(1.05); }

        &.available { border-color: #67C23A; background: #f0f9eb; }
        &.occupied { border-color: #409EFF; background: #ecf5ff; }
        &.reserved { border-color: #E6A23C; background: #fdf6ec; }
        &.disabled { border-color: #c0c4cc; background: #f5f7fa; cursor: not-allowed; }

        .spot-number { font-size: 12px; font-weight: 600; }
        .spot-plate { font-size: 10px; color: #606266; margin-top: 4px; }
      }
    }
  }

  .parking-list { padding: 16px; }
}

.record-panel { padding-bottom: 16px; }

.quick-panel {
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

.gate-panel {
  margin-bottom: 16px;

  .gate-list { padding: 8px; }

  .gate-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;

    &:hover { background: #f5f7fa; }

    .gate-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      &.normal { background: #67C23A; }
      &.fault { background: #F56C6C; }
    }

    .gate-info {
      flex: 1;
      .gate-name { font-weight: 500; }
      .gate-desc { font-size: 12px; color: #909399; }
    }
  }
}

.chart-panel {
  .chart-container { height: 150px; padding: 12px; }
}

.gate-detail-panel {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 16px;
  
  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
  }
  
  .gate-detail-list {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .gate-detail-card {
    display: flex;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    overflow: hidden;
    
    .gate-status-indicator {
      width: 4px;
      &.normal { background: #67C23A; }
      &.fault { background: #F56C6C; }
    }
    
    .gate-detail-content {
      flex: 1;
      padding: 12px;
      
      .gate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        
        .gate-title { font-weight: 600; font-size: 14px; }
      }
      
      .gate-specs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        margin-bottom: 10px;
        
        .spec-item {
          font-size: 12px;
          span { color: #909399; }
          strong { color: #303133; margin-left: 4px; }
        }
      }
      
      .gate-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
