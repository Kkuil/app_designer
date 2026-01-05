<template>
  <div class="broadcast-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card online">
          <div class="stat-icon"><el-icon :size="26"><Microphone /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.devices }}</div>
            <div class="stat-label">在线终端</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card plan">
          <div class="stat-icon"><el-icon :size="26"><VideoCamera /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.playlists }}</div>
            <div class="stat-label">节目单</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card task">
          <div class="stat-icon"><el-icon :size="26"><Timer /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.tasks }}</div>
            <div class="stat-label">今日计划</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card alarm">
          <div class="stat-icon"><el-icon :size="26"><BellFilled /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.emergency }}</div>
            <div class="stat-label">应急广播</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header">
            <span>分区列表</span>
            <el-input v-model="zoneKeyword" size="small" placeholder="搜索分区" prefix-icon="Search" clearable />
          </div>
          <div class="zone-list">
            <div
              v-for="zone in filteredZones"
              :key="zone.id"
              class="zone-item"
              :class="{ active: selectedZone?.id === zone.id }"
              @click="handleSelectZone(zone)"
            >
              <div class="zone-info">
                <div class="zone-name">{{ zone.name }}</div>
                <div class="zone-desc">{{ zone.devices }} 台终端</div>
              </div>
              <el-tag :type="zone.status === 'online' ? 'success' : 'warning'" size="small">{{ zone.status === 'online' ? '在线' : '离线' }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>应急广播</span></div>
          <div class="emergency-actions">
            <el-button type="danger" plain block @click="handleEmergency('fire')"><el-icon><BellFilled /></el-icon>火警广播</el-button>
            <el-button type="warning" plain block @click="handleEmergency('evacuate')"><el-icon><Promotion /></el-icon>疏散广播</el-button>
            <el-button type="primary" plain block @click="handleEmergency('test')"><el-icon><Microphone /></el-icon>测试播报</el-button>
          </div>
        </div>
      </el-col>

      <el-col :span="10">
        <div class="panel">
          <div class="panel-header">
            <span>当前播放</span>
            <div class="actions">
              <el-button size="small" @click="handlePrev"><el-icon><CaretLeft /></el-icon></el-button>
              <el-button type="primary" size="small" @click="handlePlayPause">{{ playing ? '暂停' : '播放' }}</el-button>
              <el-button size="small" @click="handleNext"><el-icon><CaretRight /></el-icon></el-button>
            </div>
          </div>
          <div class="now-playing">
            <div class="cover">{{ currentProgram.title.slice(0, 1) }}</div>
            <div class="info">
              <div class="title">{{ currentProgram.title }}</div>
              <div class="meta">{{ currentProgram.album }} · {{ currentProgram.duration }}</div>
              <el-progress :percentage="currentProgram.progress" :show-text="false" :stroke-width="8" />
            </div>
            <div class="volume">
              <span>音量</span>
              <el-slider v-model="volume" :min="0" :max="100" :show-tooltip="false" @change="handleVolume" />
            </div>
          </div>
          <div class="playlist">
            <div class="list-header">
              <span>播放列表</span>
              <el-button type="primary" size="small" @click="handleAddProgram"><el-icon><Plus /></el-icon>新增节目</el-button>
            </div>
            <div class="program-list">
              <div v-for="item in programList" :key="item.id" class="program-item" :class="{ active: item.id === currentProgram.id }" @click="handleSelectProgram(item)">
                <div class="program-title">{{ item.title }}</div>
                <div class="program-meta">{{ item.album }} · {{ item.duration }}</div>
                <el-tag :type="item.status === 'ready' ? 'success' : 'info'" size="small">{{ item.status === 'ready' ? '可播' : '排队' }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header">
            <span>定时计划</span>
            <el-button type="primary" size="small" @click="handleAddSchedule"><el-icon><Plus /></el-icon>添加计划</el-button>
          </div>
          <el-table :data="scheduleList" height="200" stripe>
            <el-table-column prop="name" label="计划" width="140" />
            <el-table-column prop="time" label="时间" width="120" />
            <el-table-column prop="zone" label="分区" />
            <el-table-column prop="repeat" label="周期" width="120" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">{{ row.status === 'enabled' ? '启用' : '停用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditSchedule(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteSchedule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="panel">
          <div class="panel-header"><span>终端状态</span></div>
          <div class="device-status">
            <div class="device-list">
              <div v-for="device in deviceList" :key="device.id" class="device-item">
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-zone">{{ device.zone }}</div>
                </div>
                <div class="device-meta">
                  <el-tag :type="device.status === 'online' ? 'success' : 'warning'" size="small">{{ device.status === 'online' ? '在线' : '离线' }}</el-tag>
                  <span class="volume">{{ device.volume }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>音量分布</span></div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Microphone, VideoCamera, Timer, BellFilled, Promotion, CaretLeft, CaretRight, Plus } from '@element-plus/icons-vue'

const stats = reactive({ devices: 128, playlists: 26, tasks: 18, emergency: 2 })

const zoneKeyword = ref('')
const zoneList = ref([
  { id: 1, name: '园区公共区', devices: 24, status: 'online' },
  { id: 2, name: '研发楼A', devices: 18, status: 'online' },
  { id: 3, name: '研发楼B', devices: 16, status: 'offline' },
  { id: 4, name: '综合楼', devices: 22, status: 'online' },
  { id: 5, name: '宿舍区', devices: 28, status: 'online' }
])

const filteredZones = computed(() => zoneList.value.filter(z => z.name.includes(zoneKeyword.value)))
const selectedZone = ref(filteredZones.value[0])

const programList = ref([
  { id: 1, title: '早间通知', album: '系统', duration: '02:30', status: 'ready' },
  { id: 2, title: '背景音乐1', album: 'BGM', duration: '15:00', status: 'queue' },
  { id: 3, title: '午休提示', album: '系统', duration: '01:00', status: 'ready' },
  { id: 4, title: '应急指令模板', album: '应急', duration: '00:45', status: 'ready' }
])

const currentProgram = ref(programList.value[0])
const playing = ref(true)
const volume = ref(60)

const scheduleList = ref([
  { id: 1, name: '上班铃声', time: '08:30', zone: '园区公共区', repeat: '工作日', status: 'enabled' },
  { id: 2, name: '午间提示', time: '12:00', zone: '全区', repeat: '每天', status: 'enabled' },
  { id: 3, name: '下班铃声', time: '18:00', zone: '园区公共区', repeat: '工作日', status: 'enabled' }
])

const deviceList = ref([
  { id: 1, name: 'A区中控', zone: '园区公共区', status: 'online', volume: 62 },
  { id: 2, name: 'A区门厅', zone: '园区公共区', status: 'online', volume: 55 },
  { id: 3, name: 'B楼一层', zone: '研发楼B', status: 'offline', volume: 0 },
  { id: 4, name: '宿舍楼1', zone: '宿舍区', status: 'online', volume: 48 }
])

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const handleSelectZone = (zone: any) => { selectedZone.value = zone }
const handleEmergency = (type: string) => { ElMessage.success(`已触发${type}广播`) }
const handlePrev = () => { ElMessage.info('上一首') }
const handlePlayPause = () => { playing.value = !playing.value }
const handleNext = () => { ElMessage.info('下一首') }
const handleVolume = () => { ElMessage.success(`音量已调整至${volume.value}%`) }
const handleAddProgram = () => { ElMessage.info('新增节目') }
const handleSelectProgram = (item: any) => { currentProgram.value = item }
const handleAddSchedule = () => { ElMessage.info('添加计划') }
const handleEditSchedule = (row: any) => { ElMessage.info(`编辑 ${row.name}`) }
const handleDeleteSchedule = (row: any) => { ElMessage.warning(`删除 ${row.name}`) }

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    tooltip: {},
    grid: { left: 40, right: 16, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['园区', 'A楼', 'B楼', '综合楼', '宿舍'], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{ type: 'bar', data: [62, 55, 40, 58, 52], barWidth: 16, itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] } }]
  })
}

onMounted(() => { initChart() })
</script>

<style lang="scss" scoped>
.broadcast-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row { .stat-card { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 8px; padding: 16px; .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; }
    .stat-content { .stat-value { font-size: 24px; font-weight: 600; } .stat-label { color: #909399; font-size: 12px; } }
    &.online .stat-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
    &.plan .stat-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
    &.task .stat-icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
    &.alarm .stat-icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  }}

.main-content { flex: 1; }

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
  .mt-12 { margin-top: 12px; }
}

.zone-list { max-height: 420px; overflow: auto; padding: 8px; }
.zone-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; }
  .zone-info { .zone-name { font-weight: 500; } .zone-desc { color: #909399; font-size: 12px; } }
}

.emergency-actions { padding: 12px; display: flex; flex-direction: column; gap: 10px; }

.now-playing { display: grid; grid-template-columns: 80px 1fr; gap: 12px; padding: 16px; .cover { background: linear-gradient(135deg, #409EFF, #66b1ff); border-radius: 12px; color: #fff; font-size: 28px; display: flex; align-items: center; justify-content: center; }
  .info { display: flex; flex-direction: column; gap: 6px; .title { font-weight: 600; font-size: 16px; } .meta { color: #909399; font-size: 12px; } }
  .volume { grid-column: span 2; display: flex; align-items: center; gap: 8px; color: #909399; }
}

.playlist { border-top: 1px solid #ebeef5; .list-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; }
  .program-list { max-height: 220px; overflow: auto; padding: 0 12px 12px; }
  .program-item { padding: 10px; border-radius: 8px; transition: background 0.2s; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .program-title { font-weight: 500; } .program-meta { font-size: 12px; color: #909399; margin-top: 4px; }
    display: flex; align-items: center; justify-content: space-between; gap: 12px; }
}

.device-status { padding: 8px; }
.device-list { max-height: 260px; overflow: auto; }
.device-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; &:nth-child(odd) { background: #f8f9fb; } .device-info { .device-name { font-weight: 500; } .device-zone { font-size: 12px; color: #909399; } } .device-meta { display: flex; align-items: center; gap: 10px; .volume { font-size: 12px; color: #606266; } } }

.chart-container { height: 220px; padding: 8px 12px 12px; }
</style>
