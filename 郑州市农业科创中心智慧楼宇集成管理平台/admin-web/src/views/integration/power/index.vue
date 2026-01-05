<template>
  <div class="power-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card load">
          <div class="icon"><el-icon :size="24"><Histogram /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.load }} kW</div>
            <div class="label">当前总负荷</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pue">
          <div class="icon"><el-icon :size="24"><TrendCharts /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.pue }}</div>
            <div class="label">PUE</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card alarm">
          <div class="icon"><el-icon :size="24"><BellFilled /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.alarm }}</div>
            <div class="label">告警</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card power">
          <div class="icon"><el-icon :size="24"><Lightning /></el-icon></div>
          <div class="content">
            <div class="value">{{ stats.quality }}%</div>
            <div class="label">供电质量</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="7">
        <div class="panel">
          <div class="panel-header"><span>配电一次图</span></div>
          <div class="single-line">
            <div class="bus">母线A</div>
            <div class="breaker-list">
              <div v-for="breaker in breakerList" :key="breaker.id" class="breaker" :class="breaker.status">
                <div class="name">{{ breaker.name }}</div>
                <div class="meta">{{ breaker.load }} kW</div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>主供电参数</span></div>
          <div class="parameter">
            <div class="param-item"><span>A相电压</span><strong>{{ params.uA }} V</strong></div>
            <div class="param-item"><span>B相电压</span><strong>{{ params.uB }} V</strong></div>
            <div class="param-item"><span>C相电压</span><strong>{{ params.uC }} V</strong></div>
            <div class="param-item"><span>线电压AB</span><strong>{{ params.uAB }} V</strong></div>
            <div class="param-item"><span>A相电流</span><strong>{{ params.iA }} A</strong></div>
            <div class="param-item"><span>B相电流</span><strong>{{ params.iB }} A</strong></div>
            <div class="param-item"><span>C相电流</span><strong>{{ params.iC }} A</strong></div>
            <div class="param-item"><span>总电流</span><strong>{{ params.iTotal }} A</strong></div>
            <div class="param-item"><span>有功功率</span><strong>{{ params.activePower }} kW</strong></div>
            <div class="param-item"><span>无功功率</span><strong>{{ params.reactivePower }} kVar</strong></div>
            <div class="param-item"><span>视在功率</span><strong>{{ params.apparentPower }} kVA</strong></div>
            <div class="param-item"><span>功率因数</span><strong>{{ params.cos }}</strong></div>
            <div class="param-item"><span>频率</span><strong>{{ params.f }} Hz</strong></div>
            <div class="param-item"><span>电压谐波</span><strong>{{ params.voltageHarmonic }}%</strong></div>
            <div class="param-item"><span>电流谐波</span><strong>{{ params.currentHarmonic }}%</strong></div>
            <div class="param-item"><span>零序电流</span><strong>{{ params.zeroSequence }} A</strong></div>
          </div>
        </div>
      </el-col>

      <el-col :span="10">
        <div class="panel">
          <div class="panel-header">
            <span>回路监测</span>
            <el-button type="primary" size="small" @click="handleRefresh"><el-icon><Refresh /></el-icon>刷新</el-button>
          </div>
          <el-table :data="circuitList" height="320" stripe>
            <el-table-column prop="name" label="回路" width="140" />
            <el-table-column prop="voltage" label="电压(V)" width="100" />
            <el-table-column prop="current" label="电流(A)" width="100" />
            <el-table-column prop="power" label="有功(kW)" width="110" />
            <el-table-column prop="pf" label="功率因数" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">{{ row.status === 'normal' ? '正常' : '异常' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
                <el-button type="success" link size="small" @click="handleDeviceOn(row)">合闸</el-button>
                <el-button type="danger" link size="small" @click="handleDeviceOff(row)">分闸</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>电能质量</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="7">
        <div class="panel">
          <div class="panel-header"><span>告警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="item in alarmList" :key="item.id" :timestamp="item.time" :type="item.level === 'high' ? 'danger' : 'warning'">
              <div class="alarm-title">{{ item.title }}</div>
              <div class="alarm-meta">{{ item.device }} · {{ item.desc }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>设备在线</span></div>
          <div class="status-card">
            <div class="status-item"><span>变压器</span><strong>{{ deviceStatus.tx }} / 3</strong></div>
            <div class="status-item"><span>开关柜</span><strong>{{ deviceStatus.switch }} / 24</strong></div>
            <div class="status-item"><span>电表</span><strong>{{ deviceStatus.meter }} / 60</strong></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { Histogram, TrendCharts, BellFilled, Lightning, Refresh } from '@element-plus/icons-vue'

const stats = reactive({ load: 1268, pue: 1.49, alarm: 2, quality: 99.2 })

const breakerList = ref([
  { id: 1, name: 'A1', load: 120, status: 'on' },
  { id: 2, name: 'A2', load: 96, status: 'on' },
  { id: 3, name: 'A3', load: 42, status: 'off' },
  { id: 4, name: 'A4', load: 88, status: 'on' }
])

const params = reactive({
  uA: 228, uB: 225, uC: 227,
  uAB: 397, uBC: 394, uCA: 396,
  iA: 52, iB: 48, iC: 50, iTotal: 152,
  activePower: 1268, reactivePower: 425, apparentPower: 1340,
  cos: 0.96, f: 49.98,
  voltageHarmonic: 2.1, currentHarmonic: 3.2,
  zeroSequence: 1.5
})

const circuitList = ref([
  { id: 1, name: '空调回路', voltage: 380, current: 64, power: 82, pf: 0.95, status: 'normal' },
  { id: 2, name: '照明回路', voltage: 220, current: 42, power: 32, pf: 0.93, status: 'normal' },
  { id: 3, name: '电梯回路', voltage: 380, current: 28, power: 45, pf: 0.9, status: 'alert' },
  { id: 4, name: 'IT机房', voltage: 380, current: 84, power: 110, pf: 0.98, status: 'normal' }
])

const alarmList = ref([
  { id: 1, title: 'A3 开关过载', level: 'high', device: 'A3', desc: '120% 负载', time: '10:12' },
  { id: 2, title: '电压波动', level: 'mid', device: 'IT机房', desc: 'UAB 5% 波动', time: '09:55' }
])

const deviceStatus = reactive({ tx: 3, switch: 23, meter: 58 })

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const handleRefresh = () => { ElMessage.success('数据已刷新') }
const handleView = (row: any) => { ElMessage.info(`查看 ${row.name}`) }

const handleDeviceOn = (row: any) => {
  ElMessageBox.confirm(`确认对 ${row.name} 执行合闸操作？`, '合闸确认', {
    confirmButtonText: '确认合闸',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'normal'
    ElMessage.success(`${row.name} 合闸成功`)
  }).catch(() => {})
}

const handleDeviceOff = (row: any) => {
  ElMessageBox.confirm(`确认对 ${row.name} 执行分闸操作？此操作将断开回路供电。`, '分闸确认', {
    confirmButtonText: '确认分闸',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'off'
    ElMessage.success(`${row.name} 分闸成功`)
  }).catch(() => {})
}

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['电压谐波', '电流谐波'], top: 0, textStyle: { fontSize: 10 } },
    grid: { left: 40, right: 16, top: 28, bottom: 30 },
    xAxis: { type: 'category', data: ['A', 'B', 'C'], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '电压谐波', type: 'bar', data: [2.1, 1.8, 1.6], barWidth: 14, itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] } },
      { name: '电流谐波', type: 'bar', data: [3.2, 2.8, 3.0], barWidth: 14, itemStyle: { color: '#E6A23C', borderRadius: [4, 4, 0, 0] } }
    ]
  })
}

onMounted(() => { initChart() })
</script>

<style lang="scss" scoped>
.power-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.load .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.pue .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.alarm .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  &.power .icon { background: linear-gradient(135deg, #909399, #b4b4b4); }
  }
}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.single-line { padding: 12px 16px; .bus { background: #f0f5ff; padding: 8px 10px; border-radius: 6px; font-weight: 600; color: #409EFF; text-align: center; margin-bottom: 10px; } .breaker-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; .breaker { border: 1px solid #ebeef5; border-radius: 8px; padding: 10px; &.on { border-color: #67C23A; } &.off { border-color: #c0c4cc; } .name { font-weight: 600; } .meta { color: #909399; font-size: 12px; } } } }

.parameter { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 12px 16px 16px; .param-item { background: #f8f9fb; border-radius: 8px; padding: 10px; span { color: #909399; font-size: 12px; } strong { display: block; margin-top: 6px; font-size: 16px; } } }

.chart { height: 200px; padding: 8px 12px 12px; }
.timeline { padding: 12px 16px; .alarm-title { font-weight: 500; } .alarm-meta { color: #909399; font-size: 12px; } }

.status-card { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; .status-item { display: flex; align-items: center; justify-content: space-between; background: #f8f9fb; border-radius: 8px; padding: 10px; } }

.main-content { flex: 1; }

.el-table { padding: 0 8px 12px; }
</style>
