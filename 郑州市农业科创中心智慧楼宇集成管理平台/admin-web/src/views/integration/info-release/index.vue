<template>
  <div class="release-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card screen">
          <div class="icon"><el-icon :size="24"><Monitor /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.screens }}</div>
            <div class="label">在线屏幕</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card task">
          <div class="icon"><el-icon :size="24"><List /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.tasks }}</div>
            <div class="label">播发任务</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card material">
          <div class="icon"><el-icon :size="24"><Picture /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.assets }}</div>
            <div class="label">素材</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card notice">
          <div class="icon"><el-icon :size="24"><Bell /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.notices }}</div>
            <div class="label">紧急公告</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="7">
        <div class="panel">
          <div class="panel-header">
            <span>屏幕分组</span>
            <el-button type="primary" link @click="handleAddGroup"><el-icon><Plus /></el-icon></el-button>
          </div>
          <div class="group-list">
            <div v-for="group in groupList" :key="group.id" class="group-item" :class="{ active: selectedGroup?.id === group.id }" @click="handleSelectGroup(group)">
              <div class="name">{{ group.name }}</div>
              <div class="meta">{{ group.count }} 块屏幕</div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>任务队列</span></div>
          <div class="task-list">
            <div v-for="task in taskList" :key="task.id" class="task-item">
              <div class="title">{{ task.title }}</div>
              <div class="meta">{{ task.time }} · {{ task.target }}</div>
              <el-tag :type="task.status === 'running' ? 'success' : 'info'" size="small">{{ task.status === 'running' ? '播发中' : '待播发' }}</el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="10">
        <div class="panel">
          <div class="panel-header">
            <span>屏幕列表</span>
            <el-button type="primary" size="small" @click="handleAddScreen"><el-icon><Plus /></el-icon>添加屏幕</el-button>
          </div>
          <el-table :data="screenList" height="320" stripe>
            <el-table-column prop="name" label="屏幕" width="160" />
            <el-table-column prop="location" label="位置" width="160" />
            <el-table-column prop="res" label="分辨率" width="120" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">{{ row.status === 'online' ? '在线' : '离线' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="volume" label="音量" width="100" />
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button>
                <el-button type="warning" link size="small" @click="handlePush(row)">推送</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>素材库</span></div>
          <div class="asset-grid">
            <div v-for="asset in assetList" :key="asset.id" class="asset-card">
              <div class="thumb">{{ asset.type }}</div>
              <div class="asset-info">
                <div class="title">{{ asset.title }}</div>
                <div class="meta">{{ asset.duration }}</div>
              </div>
              <el-button type="primary" link size="small" @click="handleUseAsset(asset)">使用</el-button>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="7">
        <div class="panel">
          <div class="panel-header"><span>实时预览</span></div>
          <div class="preview">
            <div class="screen">{{ currentPreview.title }}</div>
            <div class="preview-meta">{{ currentPreview.desc }}</div>
            <el-slider v-model="previewProgress" :min="0" :max="100" :show-tooltip="false" />
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>投放统计</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Monitor, List, Picture, Bell, Plus } from '@element-plus/icons-vue'

const stats = reactive({ screens: 86, tasks: 24, assets: 320, notices: 3 })

const groupList = ref([
  { id: 1, name: '大厅屏', count: 6 },
  { id: 2, name: '走廊屏', count: 12 },
  { id: 3, name: '会议区', count: 8 }
])
const selectedGroup = ref(groupList.value[0])

const taskList = ref([
  { id: 1, title: '早间公告', time: '08:00', target: '全体屏幕', status: 'running' },
  { id: 2, title: '午间问候', time: '12:00', target: '大厅屏', status: 'pending' }
])

const screenList = ref([
  { id: 1, name: 'A楼大厅-01', location: 'A栋1F', res: '1920x1080', status: 'online', volume: '60%' },
  { id: 2, name: 'B楼走廊-02', location: 'B栋3F', res: '1920x1080', status: 'online', volume: '45%' },
  { id: 3, name: '会议区-01', location: '综合楼2F', res: '3840x2160', status: 'offline', volume: '0%' }
])

const assetList = ref([
  { id: 1, title: '企业形象片', duration: '00:30', type: 'Video' },
  { id: 2, title: '安全提示', duration: '00:15', type: 'Image' },
  { id: 3, title: '活动海报', duration: '00:10', type: 'Image' }
])

const currentPreview = reactive({ title: '早间公告', desc: '欢迎来到智慧园区' })
const previewProgress = ref(30)

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const handleAddGroup = () => { ElMessage.info('新增分组') }
const handleSelectGroup = (group: any) => { selectedGroup.value = group }
const handleAddScreen = () => { ElMessage.info('添加屏幕') }
const handlePreview = (row: any) => { currentPreview.title = row.name; currentPreview.desc = row.location }
const handlePush = (row: any) => { ElMessage.success(`推送到 ${row.name}`) }
const handleUseAsset = (asset: any) => { ElMessage.success(`已添加 ${asset.title}`) }

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    grid: { left: 40, right: 16, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{ type: 'bar', data: [32, 28, 30, 26, 34, 22, 18], barWidth: 16, itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] } }]
  })
}

onMounted(() => { initChart() })
</script>

<style lang="scss" scoped>
.release-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.screen .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.task .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.material .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.notice .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  }
}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.group-list { padding: 10px 12px; display: flex; flex-direction: column; gap: 10px; }
.group-item { background: #f8f9fb; border-radius: 8px; padding: 10px; cursor: pointer; transition: background 0.2s; &.active { background: #ecf5ff; } .name { font-weight: 600; } .meta { color: #909399; font-size: 12px; } }

.task-list { padding: 12px; display: flex; flex-direction: column; gap: 10px; .task-item { background: #f8f9fb; border-radius: 8px; padding: 10px; .title { font-weight: 600; } .meta { color: #909399; font-size: 12px; margin: 2px 0; } } }

.asset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 12px; .asset-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; .thumb { height: 60px; border-radius: 6px; background: #f0f5ff; display: flex; align-items: center; justify-content: center; color: #409EFF; font-weight: 600; } .asset-info { .title { font-weight: 600; } .meta { color: #909399; font-size: 12px; } } }
}

.preview { padding: 16px; display: flex; flex-direction: column; gap: 10px; .screen { background: linear-gradient(135deg, #409EFF, #66b1ff); color: #fff; border-radius: 10px; padding: 16px; font-weight: 600; text-align: center; } .preview-meta { color: #909399; text-align: center; } }

.chart { height: 200px; padding: 8px 12px 12px; }

.main-content { flex: 1; }

.el-table { padding: 0 8px 12px; }
</style>
