<template>
  <div class="energy-vis-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card power"><div class="icon"><el-icon :size="24"><Lightning /></el-icon></div><div class="content"><div class="value">{{ stats.power }} kWh</div><div class="label">今日用电</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card water"><div class="icon"><el-icon :size="24"><Watermelon /></el-icon></div><div class="content"><div class="value">{{ stats.water }} m³</div><div class="label">今日用水</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card gas"><div class="icon"><el-icon :size="24"><GobletSquare /></el-icon></div><div class="content"><div class="value">{{ stats.gas }} m³</div><div class="label">今日燃气</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card cost"><div class="icon"><el-icon :size="24"><Money /></el-icon></div><div class="content"><div class="value">¥{{ stats.cost }}</div><div class="label">今日费用</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>分项能耗</span></div>
          <div ref="pieRef" class="pie-chart"></div>
          <div class="pie-legend">
            <div class="legend-item"><span class="dot" style="background:#409EFF"></span>空调</div>
            <div class="legend-item"><span class="dot" style="background:#67C23A"></span>照明</div>
            <div class="legend-item"><span class="dot" style="background:#E6A23C"></span>动力</div>
            <div class="legend-item"><span class="dot" style="background:#909399"></span>其他</div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>能效指标</span></div>
          <div class="kpi-list">
            <div class="kpi-item"><span>PUE</span><strong>{{ kpi.pue }}</strong></div>
            <div class="kpi-item"><span>EUI</span><strong>{{ kpi.eui }} kWh/m²</strong></div>
            <div class="kpi-item"><span>同比</span><strong :class="kpi.yoy > 0 ? 'up' : 'down'">{{ kpi.yoy > 0 ? '+' : '' }}{{ kpi.yoy }}%</strong></div>
            <div class="kpi-item"><span>环比</span><strong :class="kpi.mom > 0 ? 'up' : 'down'">{{ kpi.mom > 0 ? '+' : '' }}{{ kpi.mom }}%</strong></div>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>能耗流向</span>
            <el-radio-group v-model="flowType" size="small">
              <el-radio-button value="power">电</el-radio-button>
              <el-radio-button value="water">水</el-radio-button>
              <el-radio-button value="gas">气</el-radio-button>
            </el-radio-group>
          </div>
          <div class="sankey-container">
            <div ref="sankeyRef" class="sankey-chart"></div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header">
            <span>能耗趋势</span>
            <el-radio-group v-model="trendType" size="small">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="week">周</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>建筑能耗排名</span></div>
          <div class="rank-list">
            <div v-for="(item, index) in rankList" :key="item.id" class="rank-item">
              <div class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</div>
              <div class="rank-info"><div class="name">{{ item.name }}</div><el-progress :percentage="item.percent" :stroke-width="6" :show-text="false" /></div>
              <div class="rank-value">{{ item.value }} kWh</div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>异常告警</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="a in alarmList" :key="a.id" :type="a.level === 'high' ? 'danger' : 'warning'" :timestamp="a.time">
              <div class="alarm-title">{{ a.title }}</div>
              <div class="alarm-meta">{{ a.location }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { Lightning, Watermelon, GobletSquare, Money } from '@element-plus/icons-vue'

const stats = reactive({ power: 2860, water: 120, gas: 42, cost: 3680 })
const kpi = reactive({ pue: 1.49, eui: 86, yoy: -5.2, mom: 2.1 })
const flowType = ref('power')
const trendType = ref('day')

const rankList = ref([
  { id: 1, name: '研发楼A', value: 860, percent: 100 },
  { id: 2, name: '综合楼', value: 620, percent: 72 },
  { id: 3, name: '研发楼B', value: 580, percent: 67 },
  { id: 4, name: '宿舍楼', value: 420, percent: 49 }
])

const alarmList = ref([
  { id: 1, title: '用电异常增长', level: 'high', location: 'A栋5F', time: '10:25' },
  { id: 2, title: '水表离线', level: 'mid', location: 'B栋2F', time: '09:40' }
])

const chartRef = ref()
const pieRef = ref()
const sankeyRef = ref()

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['电', '水', '气'], top: 0, textStyle: { fontSize: 10 } },
      grid: { left: 40, right: 16, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: ['0h', '4h', '8h', '12h', '16h', '20h', '24h'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        { name: '电', type: 'line', data: [120, 180, 320, 420, 380, 280, 160], smooth: true, areaStyle: { color: 'rgba(64,158,255,0.2)' } },
        { name: '水', type: 'line', data: [8, 12, 18, 22, 20, 15, 10], smooth: true },
        { name: '气', type: 'line', data: [3, 4, 6, 8, 7, 5, 4], smooth: true }
      ]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 45, name: '空调', itemStyle: { color: '#409EFF' } },
        { value: 25, name: '照明', itemStyle: { color: '#67C23A' } },
        { value: 20, name: '动力', itemStyle: { color: '#E6A23C' } },
        { value: 10, name: '其他', itemStyle: { color: '#909399' } }
      ], label: { show: false } }]
    })
  }
  if (sankeyRef.value) {
    echarts.init(sankeyRef.value).setOption({
      series: [{ type: 'sankey', layout: 'none', emphasis: { focus: 'adjacency' },
        data: [{ name: '总配电' }, { name: 'A栋' }, { name: 'B栋' }, { name: '综合楼' }, { name: '空调' }, { name: '照明' }, { name: '动力' }],
        links: [
          { source: '总配电', target: 'A栋', value: 860 },
          { source: '总配电', target: 'B栋', value: 580 },
          { source: '总配电', target: '综合楼', value: 620 },
          { source: 'A栋', target: '空调', value: 400 },
          { source: 'A栋', target: '照明', value: 260 },
          { source: 'A栋', target: '动力', value: 200 },
          { source: 'B栋', target: '空调', value: 280 },
          { source: 'B栋', target: '照明', value: 180 },
          { source: 'B栋', target: '动力', value: 120 }
        ]
      }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.energy-vis-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.power .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.water .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.gas .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.cost .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.pie-chart { height: 200px; }
.pie-legend { display: flex; justify-content: center; gap: 16px; padding-bottom: 12px; .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; .dot { width: 10px; height: 10px; border-radius: 50%; } } }

.kpi-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 12px 16px; .kpi-item { background: #f8f9fb; border-radius: 8px; padding: 12px; span { color: #909399; font-size: 12px; } strong { display: block; margin-top: 6px; font-size: 18px; &.up { color: #F56C6C; } &.down { color: #67C23A; } } } }

.sankey-container { padding: 12px; .sankey-chart { height: 220px; } }

.chart { height: 180px; padding: 8px 12px 12px; }

.rank-list { padding: 12px; .rank-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; .rank-num { width: 24px; height: 24px; border-radius: 50%; background: #f5f7fa; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; &.top { background: #409EFF; color: #fff; } } .rank-info { flex: 1; .name { font-size: 13px; margin-bottom: 4px; } } .rank-value { font-weight: 600; font-size: 13px; } } }

.timeline { padding: 12px 16px; .alarm-title { font-weight: 500; } .alarm-meta { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }
</style>
