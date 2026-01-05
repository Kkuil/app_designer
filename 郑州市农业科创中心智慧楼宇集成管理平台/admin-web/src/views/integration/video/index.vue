<template>
  <div class="video-monitor-container">
    <!-- 摄像机统计概览 -->
    <div class="camera-stats-bar">
      <div class="stat-item total">
        <el-icon :size="20"><VideoCamera /></el-icon>
        <span class="label">摄像机总数</span>
        <span class="value">{{ cameraStats.total }}</span>
      </div>
      <div class="stat-item online">
        <el-icon :size="20"><CircleCheck /></el-icon>
        <span class="label">在线</span>
        <span class="value">{{ cameraStats.online }}</span>
      </div>
      <div class="stat-item offline">
        <el-icon :size="20"><CircleClose /></el-icon>
        <span class="label">离线</span>
        <span class="value">{{ cameraStats.offline }}</span>
      </div>
      <div class="stat-item error">
        <el-icon :size="20"><Warning /></el-icon>
        <span class="label">异常</span>
        <span class="value">{{ cameraStats.error }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="label">球机</span>
        <span class="value">{{ cameraStats.ptz }}</span>
      </div>
      <div class="stat-item">
        <span class="label">枪机</span>
        <span class="value">{{ cameraStats.bullet }}</span>
      </div>
      <div class="stat-item">
        <span class="label">半球</span>
        <span class="value">{{ cameraStats.dome }}</span>
      </div>
    </div>

    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select v-model="selectedArea" placeholder="选择区域" style="width: 160px" @change="handleAreaChange">
          <el-option v-for="area in areaList" :key="area.value" :label="area.label" :value="area.value" />
        </el-select>
        <el-input v-model="searchText" placeholder="搜索摄像头" style="width: 200px; margin-left: 12px" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-radio-group v-model="layoutMode" @change="handleLayoutChange">
          <el-radio-button value="1">1画面</el-radio-button>
          <el-radio-button value="4">4画面</el-radio-button>
          <el-radio-button value="9">9画面</el-radio-button>
          <el-radio-button value="16">16画面</el-radio-button>
        </el-radio-group>
        <el-button type="primary" class="ml-12" @click="handleFullscreen">
          <el-icon><FullScreen /></el-icon>全屏
        </el-button>
      </div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 左侧设备树 -->
      <el-col :span="5">
        <div class="device-tree-panel">
          <div class="panel-header">
            <span>设备列表</span>
            <el-tag type="info" size="small">{{ cameraList.length }}台</el-tag>
          </div>
          <div class="device-list-header">
            <el-button type="primary" link size="small" @click="showDeviceTable = !showDeviceTable">
              {{ showDeviceTable ? '树形视图' : '列表视图' }}
            </el-button>
          </div>
          
          <!-- 设备列表表格 -->
          <el-table v-if="showDeviceTable" :data="cameraList" size="small" height="400">
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column prop="name" label="名称" width="100" show-overflow-tooltip />
            <el-table-column prop="typeName" label="类型" width="60" />
            <el-table-column prop="ip" label="IP" width="110" />
            <el-table-column prop="status" label="状态" width="70">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : row.status === 'warning' ? 'warning' : 'info'" size="small">
                  {{ row.status === 'normal' ? '正常' : row.status === 'warning' ? '异常' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 设备树 -->
          <el-tree
            v-else
            :data="deviceTreeData"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleDeviceClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <el-icon v-if="data.children" color="#409EFF"><Folder /></el-icon>
                <el-icon v-else :color="data.status === 'normal' ? '#67C23A' : data.status === 'warning' ? '#E6A23C' : '#909399'"><VideoCamera /></el-icon>
                <span class="node-label">{{ node.label }}</span>
                <el-tag v-if="!data.children" :type="data.status === 'normal' ? 'success' : data.status === 'warning' ? 'warning' : 'info'" size="small">
                  {{ data.status === 'normal' ? '在线' : data.status === 'warning' ? '异常' : '离线' }}
                </el-tag>
              </div>
            </template>
          </el-tree>
          
          <!-- 选中设备详情 -->
          <div class="device-detail" v-if="selectedDevice">
            <div class="detail-header">设备详情</div>
            <div class="detail-item"><span>设备ID:</span><strong>CAM-{{ String(selectedDevice.id).padStart(3, '0') }}</strong></div>
            <div class="detail-item"><span>设备名称:</span><strong>{{ selectedDevice.name }}</strong></div>
            <div class="detail-item"><span>摄像机类型:</span><strong>{{ selectedDevice.typeName }}</strong></div>
            <div class="detail-item"><span>IP地址:</span><strong>{{ selectedDevice.ip }}</strong></div>
            <div class="detail-item"><span>MAC地址:</span><strong>{{ selectedDevice.mac }}</strong></div>
            <div class="detail-item"><span>部署位置:</span><strong>{{ selectedDevice.location }}</strong></div>
            <div class="detail-item">
              <span>运行状态:</span>
              <el-tag :type="selectedDevice.status === 'normal' ? 'success' : selectedDevice.status === 'warning' ? 'warning' : 'info'" size="small">
                {{ selectedDevice.status === 'normal' ? '正常运行' : selectedDevice.status === 'warning' ? '异常' : '离线' }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间视频区域 -->
      <el-col :span="14">
        <div class="video-grid" :class="'layout-' + layoutMode" ref="videoGridRef">
          <div
            v-for="(slot, index) in videoSlots"
            :key="index"
            class="video-slot"
            :class="{ active: activeSlot === index, playing: slot.camera }"
            @click="activeSlot = index"
            @drop="handleDrop($event, index)"
            @dragover.prevent
          >
            <template v-if="slot.camera">
              <div class="video-player">
                <div class="video-mock">
                  <el-icon :size="48" color="#fff"><VideoPlay /></el-icon>
                  <span>{{ slot.camera.name }}</span>
                </div>
                <div class="video-controls">
                  <el-button-group size="small">
                    <el-button @click.stop="handleSnapshot(slot)"><el-icon><Camera /></el-icon></el-button>
                    <el-button @click.stop="handleRecord(slot)"><el-icon><VideoPause /></el-icon></el-button>
                    <el-button @click.stop="handlePTZ(slot)"><el-icon><Aim /></el-icon></el-button>
                    <el-button @click.stop="handleCloseSlot(index)"><el-icon><Close /></el-icon></el-button>
                  </el-button-group>
                </div>
                <div class="video-info">
                  <span class="camera-name">{{ slot.camera.name }}</span>
                  <span class="record-time" v-if="slot.recording">
                    <el-icon color="#F56C6C"><VideoPause /></el-icon>
                    {{ formatRecordTime(slot.recordTime) }}
                  </span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="empty-slot">
                <el-icon :size="32" color="#C0C4CC"><Plus /></el-icon>
                <span>拖拽摄像头到此处</span>
              </div>
            </template>
          </div>
        </div>
      </el-col>

      <!-- 右侧控制面板 -->
      <el-col :span="5">
        <div class="control-panel">
          <!-- PTZ控制 -->
          <div class="panel-section">
            <div class="section-header">云台控制</div>
            <div class="ptz-control">
              <div class="ptz-grid">
                <div class="ptz-btn" @mousedown="handlePTZControl('up-left')" @mouseup="handlePTZStop">
                  <el-icon><TopLeft /></el-icon>
                </div>
                <div class="ptz-btn" @mousedown="handlePTZControl('up')" @mouseup="handlePTZStop">
                  <el-icon><Top /></el-icon>
                </div>
                <div class="ptz-btn" @mousedown="handlePTZControl('up-right')" @mouseup="handlePTZStop">
                  <el-icon><TopRight /></el-icon>
                </div>
                <div class="ptz-btn" @mousedown="handlePTZControl('left')" @mouseup="handlePTZStop">
                  <el-icon><Back /></el-icon>
                </div>
                <div class="ptz-btn center" @click="handlePTZHome">
                  <el-icon><Aim /></el-icon>
                </div>
                <div class="ptz-btn" @mousedown="handlePTZControl('right')" @mouseup="handlePTZStop">
                  <el-icon><Right /></el-icon>
                </div>
                <div class="ptz-btn" @mousedown="handlePTZControl('down-left')" @mouseup="handlePTZStop">
                  <el-icon><BottomLeft /></el-icon>
                </div>
                <div class="ptz-btn" @mousedown="handlePTZControl('down')" @mouseup="handlePTZStop">
                  <el-icon><Bottom /></el-icon>
                </div>
                <div class="ptz-btn" @mousedown="handlePTZControl('down-right')" @mouseup="handlePTZStop">
                  <el-icon><BottomRight /></el-icon>
                </div>
              </div>
              <div class="ptz-zoom">
                <span>变焦</span>
                <el-slider v-model="zoomLevel" :min="1" :max="20" />
              </div>
            </div>
          </div>

          <!-- 预置点 -->
          <div class="panel-section">
            <div class="section-header">
              <span>预置点</span>
              <el-button type="primary" link size="small" @click="handleAddPreset">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div class="preset-list">
              <div v-for="preset in presetList" :key="preset.id" class="preset-item" @click="handleGotoPreset(preset)">
                <span>{{ preset.name }}</span>
                <el-button type="danger" link size="small" @click.stop="handleDeletePreset(preset)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 录像回放 -->
          <div class="panel-section">
            <div class="section-header">录像回放</div>
            <el-date-picker
              v-model="playbackDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
            <div class="timeline-bar">
              <div class="timeline-track">
                <div
                  v-for="segment in timelineSegments"
                  :key="segment.id"
                  class="timeline-segment"
                  :style="{ left: segment.left + '%', width: segment.width + '%' }"
                  :class="segment.type"
                />
              </div>
              <div class="timeline-labels">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 报警信息 -->
    <div class="alarm-bar">
      <el-icon color="#F56C6C"><Bell /></el-icon>
      <el-carousel height="30px" direction="vertical" :autoplay="true" indicator-position="none">
        <el-carousel-item v-for="alarm in recentAlarms" :key="alarm.id">
          <div class="alarm-item">
            <el-tag :type="alarm.level === 'high' ? 'danger' : alarm.level === 'medium' ? 'warning' : 'info'" size="small">
              {{ alarm.levelText }}
            </el-tag>
            <span class="alarm-content">{{ alarm.content }}</span>
            <span class="alarm-time">{{ alarm.time }}</span>
            <el-button type="primary" link size="small" @click="handleViewAlarm(alarm)">查看</el-button>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, FullScreen, Folder, VideoCamera, VideoPlay, Camera, VideoPause,
  Aim, Close, Plus, Delete, Bell, TopLeft, Top, TopRight, Back, Right,
  BottomLeft, Bottom, BottomRight, CircleCheck, CircleClose, Warning
} from '@element-plus/icons-vue'

// 区域列表
const areaList = ref([
  { value: 'all', label: '全部区域' },
  { value: 'building-a', label: 'A栋办公楼' },
  { value: 'building-b', label: 'B栋研发楼' },
  { value: 'parking', label: '停车场' },
  { value: 'gate', label: '出入口' },
  { value: 'plaza', label: '中心广场' }
])

const selectedArea = ref('all')
const searchText = ref('')
const layoutMode = ref('4')
const activeSlot = ref(0)
const zoomLevel = ref(1)
const playbackDate = ref('')
const videoGridRef = ref()
const showDeviceTable = ref(false)
const selectedDevice = ref<any>(null)

// 摄像机列表
const cameraList = ref([
  { id: 1, name: '大门入口1', area: 'gate', online: true, ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:01', type: 'bullet', typeName: '枪机', location: 'A栋大门左侧', status: 'normal' },
  { id: 2, name: '大门入口2', area: 'gate', online: true, ip: '192.168.1.102', mac: '00:1A:2B:3C:4D:02', type: 'bullet', typeName: '枪机', location: 'A栋大门右侧', status: 'normal' },
  { id: 3, name: 'A栋大厅', area: 'building-a', online: true, ip: '192.168.1.103', mac: '00:1A:2B:3C:4D:03', type: 'dome', typeName: '半球', location: 'A栋1F大厅中央', status: 'normal' },
  { id: 4, name: 'A栋电梯口', area: 'building-a', online: false, ip: '192.168.1.104', mac: '00:1A:2B:3C:4D:04', type: 'dome', typeName: '半球', location: 'A栋1F电梯厅', status: 'offline' },
  { id: 5, name: 'B栋大厅', area: 'building-b', online: true, ip: '192.168.1.105', mac: '00:1A:2B:3C:4D:05', type: 'ptz', typeName: '球机', location: 'B栋1F大厅', status: 'normal' },
  { id: 6, name: '地下车库入口', area: 'parking', online: true, ip: '192.168.1.106', mac: '00:1A:2B:3C:4D:06', type: 'bullet', typeName: '枪机', location: '地下车库B1入口', status: 'normal' },
  { id: 7, name: '地下车库B区', area: 'parking', online: true, ip: '192.168.1.107', mac: '00:1A:2B:3C:4D:07', type: 'ptz', typeName: '球机', location: '地下车库B区中央', status: 'warning' },
  { id: 8, name: '中心广场', area: 'plaza', online: true, ip: '192.168.1.108', mac: '00:1A:2B:3C:4D:08', type: 'ptz', typeName: '球机', location: '中心广场东侧', status: 'normal' }
])

// 摄像机统计
const cameraStats = computed(() => {
  const total = cameraList.value.length
  const online = cameraList.value.filter(c => c.online).length
  const offline = cameraList.value.filter(c => !c.online).length
  const error = cameraList.value.filter(c => c.status === 'warning').length
  const ptz = cameraList.value.filter(c => c.type === 'ptz').length
  const bullet = cameraList.value.filter(c => c.type === 'bullet').length
  const dome = cameraList.value.filter(c => c.type === 'dome').length
  return { total, online, offline, error, ptz, bullet, dome }
})

// 设备树数据
const deviceTreeData = computed(() => {
  const grouped: Record<string, any> = {}
  cameraList.value.forEach(camera => {
    const area = areaList.value.find(a => a.value === camera.area)
    const areaName = area?.label || '未分组'
    if (!grouped[camera.area]) {
      grouped[camera.area] = { id: camera.area, name: areaName, children: [] }
    }
    grouped[camera.area].children.push(camera)
  })
  return Object.values(grouped)
})

// 视频槽位
const videoSlots = ref<Array<{ camera: any; recording: boolean; recordTime: number }>>([
  { camera: null, recording: false, recordTime: 0 },
  { camera: null, recording: false, recordTime: 0 },
  { camera: null, recording: false, recordTime: 0 },
  { camera: null, recording: false, recordTime: 0 }
])

// 预置点列表
const presetList = ref([
  { id: 1, name: '预置点1-入口全景' },
  { id: 2, name: '预置点2-左侧通道' },
  { id: 3, name: '预置点3-右侧通道' }
])

// 时间线片段
const timelineSegments = ref([
  { id: 1, left: 8, width: 15, type: 'normal' },
  { id: 2, left: 25, width: 20, type: 'normal' },
  { id: 3, left: 50, width: 10, type: 'alarm' },
  { id: 4, left: 65, width: 25, type: 'normal' }
])

// 最近报警
const recentAlarms = ref([
  { id: 1, level: 'high', levelText: '高危', content: '大门入口检测到异常入侵', time: '10:25:30' },
  { id: 2, level: 'medium', levelText: '中危', content: '地下车库B区摄像头离线', time: '10:20:15' },
  { id: 3, level: 'low', levelText: '低危', content: 'A栋电梯口信号弱', time: '10:15:00' }
])

// 初始化默认播放
onMounted(() => {
  // 默认加载前4个在线摄像头
  const onlineCameras = cameraList.value.filter(c => c.online).slice(0, 4)
  onlineCameras.forEach((camera, index) => {
    if (index < videoSlots.value.length) {
      videoSlots.value[index].camera = camera
    }
  })
})

const handleAreaChange = (area: string) => {
  // 区域筛选逻辑
}

const handleLayoutChange = (layout: string) => {
  const count = parseInt(layout)
  while (videoSlots.value.length < count) {
    videoSlots.value.push({ camera: null, recording: false, recordTime: 0 })
  }
  while (videoSlots.value.length > count) {
    videoSlots.value.pop()
  }
}

const handleFullscreen = () => {
  if (videoGridRef.value) {
    videoGridRef.value.requestFullscreen?.()
  }
}

const handleDeviceClick = (data: any) => {
  if (!data.children) {
    selectedDevice.value = data
    if (data.online) {
      // 将摄像头添加到当前活动槽位
      videoSlots.value[activeSlot.value].camera = data
      // 移动到下一个空槽位
      const nextEmpty = videoSlots.value.findIndex((s, i) => i > activeSlot.value && !s.camera)
      if (nextEmpty !== -1) activeSlot.value = nextEmpty
    }
  }
}

const handleDrop = (event: DragEvent, index: number) => {
  // 拖拽处理
}

const handleSnapshot = (slot: any) => {
  ElMessage.success(`已截图: ${slot.camera.name}`)
}

const handleRecord = (slot: any) => {
  slot.recording = !slot.recording
  if (slot.recording) {
    ElMessage.success('开始录像')
  } else {
    ElMessage.info('停止录像')
    slot.recordTime = 0
  }
}

const handlePTZ = (slot: any) => {
  ElMessage.info('打开云台控制')
}

const handleCloseSlot = (index: number) => {
  videoSlots.value[index].camera = null
  videoSlots.value[index].recording = false
  videoSlots.value[index].recordTime = 0
}

const handlePTZControl = (direction: string) => {
  console.log('PTZ control:', direction)
}

const handlePTZStop = () => {
  console.log('PTZ stop')
}

const handlePTZHome = () => {
  ElMessage.info('云台归位')
}

const handleAddPreset = () => {
  ElMessage.success('预置点已保存')
}

const handleGotoPreset = (preset: any) => {
  ElMessage.info(`转到: ${preset.name}`)
}

const handleDeletePreset = (preset: any) => {
  presetList.value = presetList.value.filter(p => p.id !== preset.id)
}

const handleViewAlarm = (alarm: any) => {
  ElMessage.info('查看报警详情')
}

const formatRecordTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 录像计时器
let recordTimer: number
onMounted(() => {
  recordTimer = window.setInterval(() => {
    videoSlots.value.forEach(slot => {
      if (slot.recording) slot.recordTime++
    })
  }, 1000)
})

onUnmounted(() => {
  clearInterval(recordTimer)
})
</script>

<style lang="scss" scoped>
.video-monitor-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.camera-stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .label { color: #606266; font-size: 13px; }
    .value { font-weight: 600; font-size: 18px; color: #303133; }
    
    &.total { .value { color: #409EFF; } }
    &.online { color: #67C23A; .value { color: #67C23A; } }
    &.offline { color: #909399; .value { color: #909399; } }
    &.error { color: #F56C6C; .value { color: #F56C6C; } }
  }
  
  .stat-divider {
    width: 1px;
    height: 24px;
    background: #ebeef5;
  }
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

.main-content {
  flex: 1;
  min-height: 0;
}

.device-tree-panel {
  background: #fff;
  border-radius: 8px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .el-tree {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .tree-node {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;

    .node-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .device-list-header {
    padding: 8px 16px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .device-detail {
    padding: 12px 16px;
    border-top: 1px solid #ebeef5;
    background: #fafafa;
    
    .detail-header {
      font-weight: 600;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 12px;
      
      span { color: #909399; }
      strong { color: #303133; }
    }
  }
}

.video-grid {
  background: #1a1a2e;
  border-radius: 8px;
  height: 100%;
  display: grid;
  gap: 4px;
  padding: 4px;

  &.layout-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
  &.layout-4 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
  &.layout-9 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
  &.layout-16 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); }
}

.video-slot {
  background: #0f0f23;
  border: 2px solid transparent;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;

  &:hover { border-color: #409EFF; }
  &.active { border-color: #67C23A; }
  &.playing { border-color: #409EFF; }

  .empty-slot {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #606266;
    gap: 8px;
  }

  .video-player {
    height: 100%;
    position: relative;

    .video-mock {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      gap: 8px;
      color: #fff;
    }

    .video-controls {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover .video-controls { opacity: 1; }

    .video-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px 12px;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      display: flex;
      justify-content: space-between;
      align-items: center;

      .camera-name { color: #fff; font-size: 12px; }
      .record-time { color: #F56C6C; font-size: 12px; display: flex; align-items: center; gap: 4px; }
    }
  }
}

.control-panel {
  background: #fff;
  border-radius: 8px;
  height: 100%;
  overflow-y: auto;

  .panel-section {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;

    &:last-child { border-bottom: none; }

    .section-header {
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.ptz-control {
  .ptz-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    margin-bottom: 16px;

    .ptz-btn {
      aspect-ratio: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f7fa;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover { background: #409EFF; color: #fff; }
      &.center { background: #409EFF; color: #fff; }
    }
  }

  .ptz-zoom {
    display: flex;
    align-items: center;
    gap: 12px;

    span { white-space: nowrap; font-size: 14px; }
    .el-slider { flex: 1; }
  }
}

.preset-list {
  max-height: 120px;
  overflow-y: auto;

  .preset-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover { background: #f5f7fa; }
  }
}

.timeline-bar {
  margin-top: 12px;

  .timeline-track {
    height: 20px;
    background: #ebeef5;
    border-radius: 4px;
    position: relative;

    .timeline-segment {
      position: absolute;
      top: 2px;
      bottom: 2px;
      border-radius: 2px;

      &.normal { background: #67C23A; }
      &.alarm { background: #F56C6C; }
    }
  }

  .timeline-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}

.alarm-bar {
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  .el-carousel { flex: 1; }

  .alarm-item {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 30px;

    .alarm-content { flex: 1; }
    .alarm-time { color: #909399; font-size: 12px; }
  }
}
</style>
