<template>
  <div class="device-vis-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Monitor /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">设备总数</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card online"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.online }}</div><div class="label">在线</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card offline"><div class="icon"><el-icon :size="24"><CircleClose /></el-icon></div><div class="content"><div class="value">{{ stats.offline }}</div><div class="label">离线</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card alert"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.alert }}</div><div class="label">告警</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>设备分类</span></div>
          <div class="category-list">
            <div v-for="cat in categoryList" :key="cat.id" class="category-item" :class="{ active: selectedCategory?.id === cat.id }" @click="handleSelectCategory(cat)">
              <div class="icon" :style="{ background: cat.color }"><el-icon><component :is="cat.icon" /></el-icon></div>
              <div class="info"><div class="name">{{ cat.name }}</div><div class="count">{{ cat.count }} 台</div></div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>设备分布</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>设备拓扑</span>
            <el-button-group>
              <el-button size="small" :type="viewMode === 'topo' ? 'primary' : ''" @click="viewMode = 'topo'">拓扑</el-button>
              <el-button size="small" :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'">列表</el-button>
            </el-button-group>
          </div>
          <div class="topo-view" v-if="viewMode === 'topo'">
            <div class="topo-level gateway">
              <div class="level-label">网关层</div>
              <div class="device-nodes">
                <div v-for="gw in gatewayList" :key="gw.id" class="device-node" :class="gw.status">
                  <div class="node-icon"><el-icon><Connection /></el-icon></div>
                  <div class="node-name">{{ gw.name }}</div>
                </div>
              </div>
            </div>
            <div class="topo-line"></div>
            <div class="topo-level controller">
              <div class="level-label">控制层</div>
              <div class="device-nodes">
                <div v-for="ctrl in controllerList" :key="ctrl.id" class="device-node" :class="ctrl.status">
                  <div class="node-icon"><el-icon><Cpu /></el-icon></div>
                  <div class="node-name">{{ ctrl.name }}</div>
                </div>
              </div>
            </div>
            <div class="topo-line"></div>
            <div class="topo-level sensor">
              <div class="level-label">感知层</div>
              <div class="device-nodes">
                <div v-for="s in sensorList" :key="s.id" class="device-node" :class="s.status">
                  <div class="node-icon"><el-icon><Odometer /></el-icon></div>
                  <div class="node-name">{{ s.name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="list-view" v-else>
            <el-table :data="deviceList" height="320" stripe>
              <el-table-column prop="name" label="设备" width="160" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="location" label="位置" width="140" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }"><el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">{{ row.status === 'online' ? '在线' : '离线' }}</el-tag></template>
              </el-table-column>
              <el-table-column label="操作" width="100"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
            </el-table>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>在线趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>设备详情</span></div>
          <div class="device-detail" v-if="selectedDevice">
            <div class="detail-item"><span>名称</span><strong>{{ selectedDevice.name }}</strong></div>
            <div class="detail-item"><span>类型</span><strong>{{ selectedDevice.type }}</strong></div>
            <div class="detail-item"><span>位置</span><strong>{{ selectedDevice.location }}</strong></div>
            <div class="detail-item"><span>状态</span><el-tag :type="selectedDevice.status === 'online' ? 'success' : 'danger'" size="small">{{ selectedDevice.status === 'online' ? '在线' : '离线' }}</el-tag></div>
            <div class="detail-item"><span>IP</span><strong>{{ selectedDevice.ip }}</strong></div>
            <div class="detail-item"><span>上线时间</span><strong>{{ selectedDevice.uptime }}</strong></div>
          </div>
          <el-empty v-else description="请选择设备" :image-size="60" />
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>告警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="a in alarmList" :key="a.id" :type="a.level === 'high' ? 'danger' : 'warning'" :timestamp="a.time">
              <div class="alarm-title">{{ a.title }}</div>
              <div class="alarm-meta">{{ a.device }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Monitor, CircleCheck, CircleClose, Warning, Connection, Cpu, Odometer, Sunny, VideoCamera, Bell } from '@element-plus/icons-vue'

const stats = reactive({ total: 1268, online: 1180, offline: 88, alert: 12 })
const viewMode = ref('topo')

const categoryList = ref([
  { id: 1, name: '空调设备', count: 320, color: '#409EFF', icon: markRaw(Sunny) },
  { id: 2, name: '照明设备', count: 460, icon: markRaw(Sunny), color: '#67C23A' },
  { id: 3, name: '监控摄像', count: 180, icon: markRaw(VideoCamera), color: '#E6A23C' },
  { id: 4, name: '消防设备', count: 220, icon: markRaw(Bell), color: '#F56C6C' }
])
const selectedCategory = ref(categoryList.value[0])

const gatewayList = ref([{ id: 1, name: '网关-01', status: 'online' }, { id: 2, name: '网关-02', status: 'online' }])
const controllerList = ref([{ id: 1, name: '控制器-A1', status: 'online' }, { id: 2, name: '控制器-A2', status: 'offline' }, { id: 3, name: '控制器-B1', status: 'online' }])
const sensorList = ref([{ id: 1, name: '温度-501', status: 'online' }, { id: 2, name: '湿度-502', status: 'online' }, { id: 3, name: 'CO2-503', status: 'alert' }, { id: 4, name: 'PM2.5-504', status: 'online' }])

const deviceList = ref([
  { id: 1, name: '空调-5F-01', type: '空调', location: 'A栋5F', status: 'online', ip: '192.168.1.101', uptime: '2025-01-01' },
  { id: 2, name: '摄像头-3F-02', type: '监控', location: 'B栋3F', status: 'online', ip: '192.168.1.102', uptime: '2025-01-05' },
  { id: 3, name: '烟感-2F-01', type: '消防', location: '综合楼2F', status: 'offline', ip: '192.168.1.103', uptime: '2025-01-10' }
])
const selectedDevice = ref<any>(null)

const alarmList = ref([
  { id: 1, title: '设备离线', level: 'high', device: '烟感-2F-01', time: '10:20' },
  { id: 2, title: 'CO2超标', level: 'mid', device: 'CO2-503', time: '09:45' }
])

const chartRef = ref()
const pieRef = ref()

const handleSelectCategory = (cat: any) => { selectedCategory.value = cat }
const handleView = (row: any) => { selectedDevice.value = row; ElMessage.info(`查看 ${row.name}`) }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['0h', '4h', '8h', '12h', '16h', '20h'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ type: 'line', data: [1150, 1160, 1175, 1180, 1178, 1182], smooth: true, areaStyle: { color: 'rgba(103,194,58,0.2)' } }]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: categoryList.value.map(c => ({ value: c.count, name: c.name, itemStyle: { color: c.color } })), label: { fontSize: 10 } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.device-vis-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.online .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.offline .icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
  &.alert .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.category-list { padding: 8px; .category-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; } .info { .name { font-weight: 500; } .count { font-size: 12px; color: #909399; } } } }

.pie-chart { height: 200px; padding: 12px; }

.topo-view { padding: 20px; .topo-level { .level-label { font-size: 12px; color: #909399; margin-bottom: 8px; } .device-nodes { display: flex; gap: 16px; flex-wrap: wrap; .device-node { background: #f5f7fa; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; &:hover { transform: translateY(-2px); }
  &.online { border: 1px solid #67C23A; .node-icon { color: #67C23A; } }
  &.offline { border: 1px solid #909399; .node-icon { color: #909399; } }
  &.alert { border: 1px solid #F56C6C; .node-icon { color: #F56C6C; } }
  .node-icon { font-size: 20px; } .node-name { font-size: 13px; }
  } } }
  .topo-line { height: 30px; width: 2px; background: #dcdfe6; margin: 8px auto; }
}

.list-view { padding: 12px; }

.chart { height: 160px; padding: 8px 12px 12px; }

.device-detail { padding: 12px 16px; .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ebeef5; &:last-child { border-bottom: none; } span { color: #909399; } } }

.timeline { padding: 12px 16px; .alarm-title { font-weight: 500; } .alarm-meta { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }
</style>
