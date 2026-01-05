<template>
  <div class="meter-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card power">
          <div class="icon"><el-icon :size="24"><Lightning /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.power }} kWh</div>
            <div class="label">今日电量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card water">
          <div class="icon"><el-icon :size="24"><Watermelon /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.water }} m³</div>
            <div class="label">今日水量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card gas">
          <div class="icon"><el-icon :size="24"><GobletSquare /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.gas }} m³</div>
            <div class="label">今日燃气</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card normal">
          <div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.online }}/{{ stats.total }}</div>
            <div class="label">在线表计</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="7">
        <div class="panel">
          <div class="panel-header">
            <span>分区与回路</span>
            <el-input v-model="treeKeyword" size="small" placeholder="搜索" prefix-icon="Search" clearable />
          </div>
          <div class="tree">
            <el-tree
              :data="meterTree"
              :props="treeProps"
              node-key="id"
              default-expand-all
              @node-click="handleTreeClick"
            />
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>采集任务</span></div>
          <div class="task-list">
            <div v-for="task in taskList" :key="task.id" class="task-item">
              <div>
                <div class="name">{{ task.name }}</div>
                <div class="meta">{{ task.time }} · {{ task.cycle }}</div>
              </div>
              <el-tag :type="task.status === 'running' ? 'success' : 'info'" size="small">{{ task.status === 'running' ? '运行中' : '暂停' }}</el-tag>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="10">
        <div class="panel">
          <div class="panel-header">
            <span>表计数据</span>
            <el-button type="primary" size="small" @click="handleSync"><el-icon><Refresh /></el-icon>同步</el-button>
          </div>
          <el-table :data="meterList" height="320" stripe>
            <el-table-column prop="name" label="表计" width="160" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="value" label="当前读数" width="120" />
            <el-table-column prop="time" label="抄表时间" width="160" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">{{ row.status === 'online' ? '在线' : '离线' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
                <el-button type="warning" link size="small" @click="handleRead(row)">补采</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>历史趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="7">
        <div class="panel">
          <div class="panel-header"><span>异常记录</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="item in abnormalList" :key="item.id" :timestamp="item.time" type="danger">
              <div class="alarm-title">{{ item.title }}</div>
              <div class="alarm-meta">{{ item.meter }} · {{ item.desc }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>采集成功率</span></div>
          <div class="success-rate">
            <el-progress type="dashboard" :percentage="successRate" :width="180" :color="'#67C23A'">
              <template #default>
                <span class="rate-value">{{ successRate }}%</span>
              </template>
            </el-progress>
            <div class="rate-meta">
              <div>今日任务 {{ taskList.length }} 个</div>
              <div>在线表计 {{ stats.online }}/{{ stats.total }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Lightning, Watermelon, GobletSquare, CircleCheck, Refresh } from '@element-plus/icons-vue'

const stats = reactive({ power: 1860, water: 120, gas: 42, online: 236, total: 260 })

const treeKeyword = ref('')
const meterTree = ref([
  { id: 1, label: '园区', children: [{ id: 11, label: '研发楼A', children: [{ id: 111, label: 'A楼-电表' }, { id: 112, label: 'A楼-水表' }] }, { id: 12, label: '研发楼B', children: [{ id: 121, label: 'B楼-电表' }] }] },
  { id: 2, label: '综合楼', children: [{ id: 21, label: '综合楼-电表' }, { id: 22, label: '综合楼-水表' }] }
])
const treeProps = { children: 'children', label: 'label' }

const taskList = ref([
  { id: 1, name: '电表日采集', time: '01:00', cycle: '每天', status: 'running' },
  { id: 2, name: '水表日采集', time: '02:00', cycle: '每天', status: 'running' },
  { id: 3, name: '燃气日采集', time: '03:00', cycle: '每天', status: 'pause' }
])

const meterList = ref([
  { id: 1, name: 'A楼-电表-01', type: '电', value: '15236.6', time: '2025-01-15 10:10', status: 'online' },
  { id: 2, name: 'A楼-水表-02', type: '水', value: '862.4', time: '2025-01-15 10:09', status: 'online' },
  { id: 3, name: 'B楼-电表-01', type: '电', value: '12346.1', time: '2025-01-15 10:06', status: 'offline' },
  { id: 4, name: '综合楼-燃气-01', type: '气', value: '652.2', time: '2025-01-15 10:02', status: 'online' }
])

const abnormalList = ref([
  { id: 1, title: '电表离线', meter: 'B楼-电表-01', desc: '通信中断', time: '10:06' },
  { id: 2, title: '功率突增', meter: 'A楼-电表-01', desc: '+40%', time: '09:42' }
])

const successRate = computed(() => Math.round((stats.online / stats.total) * 100))

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const handleTreeClick = () => { ElMessage.info('已选择分区') }
const handleSync = () => { ElMessage.success('同步完成') }
const handleView = (row: any) => { ElMessage.info(`查看 ${row.name}`) }
const handleRead = (row: any) => { ElMessage.success(`补采 ${row.name}`) }

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    legend: { data: ['电', '水', '气'], top: 0, textStyle: { fontSize: 10 } },
    grid: { left: 40, right: 16, top: 28, bottom: 30 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '电', type: 'line', smooth: true, data: [260, 280, 300, 320, 310, 280, 250], areaStyle: { color: 'rgba(64,158,255,0.15)' } },
      { name: '水', type: 'line', smooth: true, data: [18, 16, 20, 19, 18, 17, 16], areaStyle: { color: 'rgba(103,194,58,0.15)' } },
      { name: '气', type: 'line', smooth: true, data: [8, 7, 9, 10, 9, 8, 7], areaStyle: { color: 'rgba(230,162,60,0.15)' } }
    ]
  })
}

onMounted(() => { initChart() })
</script>

<style lang="scss" scoped>
.meter-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.power .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.water .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.gas .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.normal .icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
  }
}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.tree { padding: 10px 12px; max-height: 380px; overflow: auto; }
.task-list { padding: 12px; display: flex; flex-direction: column; gap: 10px; .task-item { display: flex; align-items: center; justify-content: space-between; background: #f8f9fb; border-radius: 8px; padding: 10px; .name { font-weight: 500; } .meta { color: #909399; font-size: 12px; } } }

.chart { height: 220px; padding: 8px 12px 12px; }
.timeline { padding: 12px 16px; .alarm-title { font-weight: 500; } .alarm-meta { color: #909399; font-size: 12px; } }

.success-rate { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 12px; .rate-value { font-size: 24px; font-weight: 600; color: #67C23A; } .rate-meta { color: #606266; line-height: 20px; } }

.main-content { flex: 1; }

.el-table { padding: 0 8px 12px; }
</style>
