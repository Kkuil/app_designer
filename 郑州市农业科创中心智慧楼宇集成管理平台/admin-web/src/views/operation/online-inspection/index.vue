<template>
  <div class="online-inspection-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Monitor /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">监测设备</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card online"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.online }}</div><div class="label">在线正常</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card warning"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.warning }}</div><div class="label">异常预警</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card offline"><div class="icon"><el-icon :size="24"><CircleClose /></el-icon></div><div class="content"><div class="value">{{ stats.offline }}</div><div class="label">离线设备</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>设备分类</span></div>
          <div class="category-list">
            <div v-for="cat in categoryList" :key="cat.id" class="category-item" :class="{ active: selectedCategory?.id === cat.id }" @click="selectedCategory = cat">
              <el-icon :size="18"><component :is="cat.icon" /></el-icon>
              <span class="name">{{ cat.name }}</span>
              <span class="count">{{ cat.count }}</span>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>巡检规则</span></div>
          <div class="rule-list">
            <div v-for="rule in ruleList" :key="rule.id" class="rule-item">
              <div class="info">
                <div class="name">{{ rule.name }}</div>
                <div class="desc">{{ rule.interval }}</div>
              </div>
              <el-switch v-model="rule.enabled" size="small" />
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>设备状态监控</span>
            <el-button type="primary" size="small" @click="handleRefresh"><el-icon><Refresh /></el-icon>刷新</el-button>
          </div>
          <el-table :data="deviceList" height="400" stripe>
            <el-table-column prop="name" label="设备名称" width="160" />
            <el-table-column prop="type" label="设备类型" width="100" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }"><el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="value" label="当前值" width="100" />
            <el-table-column prop="lastCheck" label="上次巡检" width="160" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }"><el-button type="primary" link size="small" @click="handleViewDevice(row)">详情</el-button></template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>实时预警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="alert in alertList" :key="alert.id" :type="alert.level === 'critical' ? 'danger' : 'warning'" :timestamp="alert.time">
              <div class="alert-title">{{ alert.device }}</div>
              <div class="alert-content">{{ alert.message }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>巡检趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="detailVisible" title="设备详情" width="700px">
      <el-descriptions :column="2" border v-if="currentDevice">
        <el-descriptions-item label="设备名称">{{ currentDevice.name }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentDevice.type }}</el-descriptions-item>
        <el-descriptions-item label="当前状态"><el-tag :type="statusTagType(currentDevice.status)" size="small">{{ currentDevice.status }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="当前值">{{ currentDevice.value }}</el-descriptions-item>
        <el-descriptions-item label="阈值范围">{{ currentDevice.threshold || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次巡检">{{ currentDevice.lastCheck }}</el-descriptions-item>
      </el-descriptions>
      <div class="device-chart-section">
        <div class="section-title">历史数据趋势</div>
        <div ref="deviceChartRef" class="device-chart"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Monitor, CircleCheck, Warning, CircleClose, Refresh, Cpu, Lightning, Odometer } from '@element-plus/icons-vue'

const stats = reactive({ total: 856, online: 812, warning: 28, offline: 16 })

const categoryList = ref([
  { id: 1, name: '空调系统', icon: Cpu, count: 128 },
  { id: 2, name: '照明系统', icon: Lightning, count: 320 },
  { id: 3, name: '电力系统', icon: Odometer, count: 86 },
  { id: 4, name: '消防系统', icon: Warning, count: 156 }
])
const selectedCategory = ref(categoryList.value[0])

const ruleList = ref([
  { id: 1, name: '温度监测', interval: '每5分钟', enabled: true },
  { id: 2, name: '电量监测', interval: '每15分钟', enabled: true },
  { id: 3, name: '状态检测', interval: '每1分钟', enabled: true },
  { id: 4, name: '能耗分析', interval: '每小时', enabled: false }
])

const deviceList = ref([
  { id: 1, name: '空调主机-01', type: '空调设备', status: '正常', value: '25.6°C', lastCheck: '2025-01-15 10:30:00', threshold: '18-28°C' },
  { id: 2, name: '配电柜-A1', type: '电力设备', status: '正常', value: '380V', lastCheck: '2025-01-15 10:28:00', threshold: '370-390V' },
  { id: 3, name: '烟感-B201', type: '消防设备', status: '预警', value: '偏高', lastCheck: '2025-01-15 10:25:00', threshold: '<50ppm' },
  { id: 4, name: '照明控制器-C3', type: '照明设备', status: '离线', value: '-', lastCheck: '2025-01-15 08:00:00', threshold: '-' }
])

const alertList = ref([
  { id: 1, device: '烟感-B201', message: '烟雾浓度偏高', level: 'critical', time: '10:25' },
  { id: 2, device: '空调主机-03', message: '运行温度接近阈值', level: 'warning', time: '10:20' },
  { id: 3, device: '配电柜-A3', message: '电压波动', level: 'warning', time: '10:15' }
])

const chartRef = ref()
const deviceChartRef = ref()
const detailVisible = ref(false)
const currentDevice = ref<any>(null)

const statusTagType = (status: string) => {
  const map: Record<string, string> = { '正常': 'success', '预警': 'warning', '离线': 'info', '故障': 'danger' }
  return map[status] || ''
}

const handleRefresh = () => { ElMessage.success('刷新设备状态') }
const handleViewDevice = (row: any) => { currentDevice.value = row; detailVisible.value = true }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ type: 'line', data: [2, 1, 3, 5, 4, 2], smooth: true, areaStyle: { color: 'rgba(64,158,255,0.15)' }, lineStyle: { color: '#409EFF' }, itemStyle: { color: '#409EFF' } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.online-inspection-container { display: flex; flex-direction: column; gap: 12px; }

.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 14px; .icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 22px; font-weight: 600; } .label { color: #909399; font-size: 13px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.online .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.warning .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.offline .icon { background: linear-gradient(135deg, #909399, #c0c4cc); }
}}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 14px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.category-list { padding: 8px; .category-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .name { flex: 1; } .count { color: #909399; font-size: 12px; } } }

.rule-list { padding: 8px; .rule-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #f0f0f0; &:last-child { border-bottom: none; } .info { .name { font-weight: 500; } .desc { font-size: 12px; color: #909399; } } } }

.timeline { padding: 12px 16px; max-height: 280px; overflow: auto; .alert-title { font-weight: 500; } .alert-content { font-size: 12px; color: #909399; } }

.chart { height: 180px; padding: 12px; }

.main-content { flex: 1; }

.device-chart-section { margin-top: 20px; .section-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #409EFF; } .device-chart { height: 200px; } }
</style>
