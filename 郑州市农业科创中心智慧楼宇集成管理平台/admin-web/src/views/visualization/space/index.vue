<template>
  <div class="space-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card area"><div class="icon"><el-icon :size="24"><Grid /></el-icon></div><div class="content"><div class="value">{{ stats.totalArea }} m²</div><div class="label">总面积</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card used"><div class="icon"><el-icon :size="24"><OfficeBuilding /></el-icon></div><div class="content"><div class="value">{{ stats.usedArea }} m²</div><div class="label">已使用</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card rate"><div class="icon"><el-icon :size="24"><TrendCharts /></el-icon></div><div class="content"><div class="value">{{ stats.rate }}%</div><div class="label">使用率</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card rooms"><div class="icon"><el-icon :size="24"><House /></el-icon></div><div class="content"><div class="value">{{ stats.rooms }}</div><div class="label">房间数</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>楼层选择</span></div>
          <div class="floor-list">
            <div v-for="floor in floorList" :key="floor.id" class="floor-item" :class="{ active: selectedFloor?.id === floor.id }" @click="handleSelectFloor(floor)">
              <div class="name">{{ floor.name }}</div>
              <div class="meta">{{ floor.rooms }} 房间 · {{ floor.area }} m²</div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>空间类型</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>{{ selectedFloor?.name || '楼层' }} - 平面图</span>
            <el-button-group>
              <el-button size="small" :type="mapMode === 'usage' ? 'primary' : ''" @click="mapMode = 'usage'">使用状态</el-button>
              <el-button size="small" :type="mapMode === 'type' ? 'primary' : ''" @click="mapMode = 'type'">空间类型</el-button>
            </el-button-group>
          </div>
          <div class="floor-map">
            <div class="room-grid">
              <div v-for="room in roomList" :key="room.id" class="room-cell" :class="[room.type, room.status]" @click="handleSelectRoom(room)">
                <div class="room-name">{{ room.name }}</div>
                <div class="room-area">{{ room.area }} m²</div>
              </div>
            </div>
            <div class="map-legend">
              <span class="legend-item office">办公</span>
              <span class="legend-item meeting">会议</span>
              <span class="legend-item public">公共</span>
              <span class="legend-item storage">存储</span>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>使用率趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>房间详情</span></div>
          <div class="room-detail" v-if="selectedRoom">
            <div class="detail-item"><span>名称</span><strong>{{ selectedRoom.name }}</strong></div>
            <div class="detail-item"><span>类型</span><strong>{{ selectedRoom.typeName }}</strong></div>
            <div class="detail-item"><span>面积</span><strong>{{ selectedRoom.area }} m²</strong></div>
            <div class="detail-item"><span>容量</span><strong>{{ selectedRoom.capacity }} 人</strong></div>
            <div class="detail-item"><span>状态</span><el-tag :type="selectedRoom.status === 'using' ? 'success' : 'info'" size="small">{{ selectedRoom.status === 'using' ? '使用中' : '空闲' }}</el-tag></div>
            <div class="detail-item"><span>当前人数</span><strong>{{ selectedRoom.current }} 人</strong></div>
          </div>
          <el-empty v-else description="请选择房间" :image-size="60" />
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>今日预约</span></div>
          <div class="booking-list">
            <div v-for="b in bookingList" :key="b.id" class="booking-item">
              <div class="time">{{ b.time }}</div>
              <div class="info"><div class="title">{{ b.title }}</div><div class="room">{{ b.room }}</div></div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { Grid, OfficeBuilding, TrendCharts, House } from '@element-plus/icons-vue'

const stats = reactive({ totalArea: 28600, usedArea: 21800, rate: 76, rooms: 186 })

const floorList = ref([
  { id: 1, name: 'A栋 5F', rooms: 24, area: 2400 },
  { id: 2, name: 'A栋 4F', rooms: 22, area: 2200 },
  { id: 3, name: 'B栋 3F', rooms: 18, area: 1800 },
  { id: 4, name: '综合楼 2F', rooms: 16, area: 1600 }
])
const selectedFloor = ref(floorList.value[0])
const mapMode = ref('usage')

const roomList = ref([
  { id: 1, name: '501办公室', type: 'office', typeName: '办公室', area: 120, capacity: 20, status: 'using', current: 15 },
  { id: 2, name: '502办公室', type: 'office', typeName: '办公室', area: 100, capacity: 16, status: 'idle', current: 0 },
  { id: 3, name: '503会议室', type: 'meeting', typeName: '会议室', area: 60, capacity: 12, status: 'using', current: 8 },
  { id: 4, name: '504休息区', type: 'public', typeName: '公共区', area: 80, capacity: 30, status: 'using', current: 6 },
  { id: 5, name: '505储藏室', type: 'storage', typeName: '储藏室', area: 40, capacity: 2, status: 'idle', current: 0 },
  { id: 6, name: '506办公室', type: 'office', typeName: '办公室', area: 140, capacity: 24, status: 'using', current: 18 }
])
const selectedRoom = ref<any>(null)

const bookingList = ref([
  { id: 1, time: '09:00', title: '项目会议', room: '503会议室' },
  { id: 2, time: '14:00', title: '培训', room: '504休息区' }
])

const chartRef = ref()
const pieRef = ref()

const handleSelectFloor = (floor: any) => { selectedFloor.value = floor }
const handleSelectRoom = (room: any) => { selectedRoom.value = room }

const initCharts = () => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', max: 100, axisLabel: { fontSize: 10 } },
      series: [{ type: 'line', data: [72, 78, 80, 76, 82, 60, 45], smooth: true, areaStyle: { color: 'rgba(64,158,255,0.2)' } }]
    })
  }
  if (pieRef.value) {
    const pie = echarts.init(pieRef.value)
    pie.setOption({
      series: [{
        type: 'pie', radius: ['40%', '70%'], data: [
          { value: 60, name: '办公', itemStyle: { color: '#409EFF' } },
          { value: 20, name: '会议', itemStyle: { color: '#67C23A' } },
          { value: 12, name: '公共', itemStyle: { color: '#E6A23C' } },
          { value: 8, name: '存储', itemStyle: { color: '#909399' } }
        ],
        label: { fontSize: 10 }
      }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.space-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.area .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.used .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.rate .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.rooms .icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.floor-list { padding: 8px; max-height: 260px; overflow: auto; .floor-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .name { font-weight: 500; } .meta { font-size: 12px; color: #909399; } } }

.pie-chart { height: 200px; padding: 12px; }

.floor-map { padding: 16px; .room-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; .room-cell { background: #f5f7fa; border-radius: 8px; padding: 14px; cursor: pointer; transition: all 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  &.office { border-left: 3px solid #409EFF; }
  &.meeting { border-left: 3px solid #67C23A; }
  &.public { border-left: 3px solid #E6A23C; }
  &.storage { border-left: 3px solid #909399; }
  &.using { background: #f0f9eb; }
  .room-name { font-weight: 500; } .room-area { font-size: 12px; color: #909399; }
  }}
  .map-legend { display: flex; gap: 16px; margin-top: 16px; justify-content: center; .legend-item { font-size: 12px; padding-left: 12px; border-left: 3px solid; &.office { border-color: #409EFF; } &.meeting { border-color: #67C23A; } &.public { border-color: #E6A23C; } &.storage { border-color: #909399; } } }
}

.chart { height: 160px; padding: 8px 12px 12px; }

.room-detail { padding: 12px 16px; .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ebeef5; &:last-child { border-bottom: none; } span { color: #909399; } } }

.booking-list { padding: 12px; .booking-item { display: flex; gap: 12px; padding: 10px; background: #f8f9fb; border-radius: 8px; margin-bottom: 8px; .time { font-weight: 600; color: #409EFF; min-width: 50px; } .info { .title { font-weight: 500; } .room { font-size: 12px; color: #909399; } } } }

.main-content { flex: 1; }
</style>
