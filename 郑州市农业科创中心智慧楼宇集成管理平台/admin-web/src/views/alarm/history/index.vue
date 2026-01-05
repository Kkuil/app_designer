<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <div class="page-card search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="报警级别">
          <el-select v-model="searchForm.level" placeholder="请选择" clearable style="width: 120px">
            <el-option label="高危" value="high" />
            <el-option label="中危" value="medium" />
            <el-option label="低危" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="报警类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 140px">
            <el-option label="设备故障" value="device_fault" />
            <el-option label="温度异常" value="temperature" />
            <el-option label="入侵报警" value="intrusion" />
            <el-option label="消防报警" value="fire" />
            <el-option label="湿度异常" value="humidity" />
            <el-option label="电力异常" value="power" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果">
          <el-select v-model="searchForm.result" placeholder="请选择" clearable style="width: 120px">
            <el-option label="已处理" value="resolved" />
            <el-option label="已忽略" value="ignored" />
            <el-option label="误报" value="false_alarm" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计图表 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">报警趋势统计</span>
            <el-radio-group v-model="chartTimeRange" size="small">
              <el-radio-button label="week">近7天</el-radio-button>
              <el-radio-button label="month">近30天</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="6">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">报警类型分布</span>
          </div>
          <div ref="typeChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="6">
        <div class="page-card">
          <div class="card-header">
            <span class="card-title">报警级别分布</span>
          </div>
          <div ref="levelChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <div class="page-card">
      <div class="table-header">
        <span class="table-title">历史报警记录</span>
        <div class="header-stats">
          <el-statistic title="总报警数" :value="pagination.total" />
          <el-divider direction="vertical" />
          <el-statistic title="高危报警" :value="stats.highCount" class="stat-danger" />
          <el-divider direction="vertical" />
          <el-statistic title="平均处理时长" :value="stats.avgProcessTime" suffix="分钟" />
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="报警ID" width="140" />
        <el-table-column prop="level" label="报警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" effect="dark">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="报警类型" width="120">
          <template #default="{ row }">
            {{ getTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="source" label="报警来源" min-width="150" />
        <el-table-column prop="content" label="报警内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="alarmTime" label="报警时间" width="170" />
        <el-table-column prop="processTime" label="处理时间" width="170" />
        <el-table-column prop="result" label="处理结果" width="100">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)">
              {{ getResultText(row.result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="100" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="报警详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报警ID">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="报警级别">
          <el-tag :type="getLevelType(currentRow?.level)" effect="dark">
            {{ getLevelText(currentRow?.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报警类型">{{ getTypeText(currentRow?.type) }}</el-descriptions-item>
        <el-descriptions-item label="报警来源">{{ currentRow?.source }}</el-descriptions-item>
        <el-descriptions-item label="报警时间">{{ currentRow?.alarmTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ currentRow?.processTime }}</el-descriptions-item>
        <el-descriptions-item label="处理结果">
          <el-tag :type="getResultType(currentRow?.result)">
            {{ getResultText(currentRow?.result) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentRow?.handler }}</el-descriptions-item>
        <el-descriptions-item label="报警内容" :span="2">{{ currentRow?.content }}</el-descriptions-item>
        <el-descriptions-item label="设备信息" :span="2">{{ currentRow?.deviceInfo }}</el-descriptions-item>
        <el-descriptions-item label="位置信息" :span="2">{{ currentRow?.location }}</el-descriptions-item>
        <el-descriptions-item label="处理说明" :span="2">{{ currentRow?.processRemark }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 处理时间线 -->
      <div class="timeline-section">
        <h4>处理流程</h4>
        <el-timeline>
          <el-timeline-item 
            v-for="(item, index) in currentRow?.timeline" 
            :key="index"
            :timestamp="item.time"
            :type="item.type"
            placement="top"
          >
            <p>{{ item.content }}</p>
            <p class="timeline-operator" v-if="item.operator">操作人：{{ item.operator }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, View } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 接口定义
interface TimelineItem {
  time: string
  content: string
  operator?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

interface AlarmHistoryRecord {
  id: string
  level: 'high' | 'medium' | 'low'
  type: string
  source: string
  content: string
  alarmTime: string
  processTime: string
  result: 'resolved' | 'ignored' | 'false_alarm'
  handler: string
  deviceInfo: string
  location: string
  processRemark: string
  timeline: TimelineItem[]
}

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  level: '',
  type: '',
  result: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const stats = reactive({
  highCount: 28,
  avgProcessTime: 15.6
})

// 状态
const loading = ref(false)
const tableData = ref<AlarmHistoryRecord[]>([])
const detailVisible = ref(false)
const currentRow = ref<AlarmHistoryRecord | null>(null)
const chartTimeRange = ref('week')

// 图表引用
const trendChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()
const levelChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let levelChart: echarts.ECharts | null = null

// 测试数据
const mockData: AlarmHistoryRecord[] = [
  {
    id: 'ALM20251223001',
    level: 'high',
    type: 'fire',
    source: '1号楼5层消防感应器',
    content: '检测到烟雾浓度超标，经核实为厨房油烟',
    alarmTime: '2025-12-23 14:23:15',
    processTime: '2025-12-23 14:35:42',
    result: 'false_alarm',
    handler: '张三',
    deviceInfo: '烟雾传感器 SM-5F-002',
    location: '1号楼5层茶水间',
    processRemark: '经现场核实，为员工使用微波炉加热食物产生的油烟，非火情，已加强通风',
    timeline: [
      { time: '2025-12-23 14:23:15', content: '系统检测到烟雾浓度超标，自动生成报警', type: 'danger' },
      { time: '2025-12-23 14:25:30', content: '报警推送至值班人员', type: 'warning' },
      { time: '2025-12-23 14:28:00', content: '值班人员张三前往现场核实', operator: '张三', type: 'primary' },
      { time: '2025-12-23 14:35:42', content: '确认为误报，关闭报警', operator: '张三', type: 'success' }
    ]
  },
  {
    id: 'ALM20251223002',
    level: 'medium',
    type: 'temperature',
    source: '2号楼服务器机房',
    content: '机房温度达到30℃，超过设定阈值28℃',
    alarmTime: '2025-12-23 10:15:30',
    processTime: '2025-12-23 10:45:22',
    result: 'resolved',
    handler: '李四',
    deviceInfo: '温湿度传感器 TH-2F-003',
    location: '2号楼2层服务器机房',
    processRemark: '已调整空调温度设置，增加制冷功率，温度已恢复正常',
    timeline: [
      { time: '2025-12-23 10:15:30', content: '系统检测到温度超标', type: 'warning' },
      { time: '2025-12-23 10:18:00', content: '报警推送至运维人员', type: 'warning' },
      { time: '2025-12-23 10:25:00', content: '运维人员李四开始处理', operator: '李四', type: 'primary' },
      { time: '2025-12-23 10:45:22', content: '温度恢复正常，报警解除', operator: '李四', type: 'success' }
    ]
  },
  {
    id: 'ALM20251222003',
    level: 'high',
    type: 'intrusion',
    source: '周界防范系统',
    content: '东侧围墙红外对射触发',
    alarmTime: '2025-12-22 22:35:28',
    processTime: '2025-12-22 22:52:15',
    result: 'false_alarm',
    handler: '王五',
    deviceInfo: '红外对射 IR-E-002',
    location: '园区东侧围墙',
    processRemark: '经查看监控，为野猫穿越围墙触发，非人员入侵',
    timeline: [
      { time: '2025-12-22 22:35:28', content: '红外对射触发报警', type: 'danger' },
      { time: '2025-12-22 22:36:00', content: '安保人员收到报警通知', type: 'warning' },
      { time: '2025-12-22 22:40:00', content: '安保人员王五查看监控录像', operator: '王五', type: 'primary' },
      { time: '2025-12-22 22:52:15', content: '确认为动物触发，标记为误报', operator: '王五', type: 'success' }
    ]
  },
  {
    id: 'ALM20251222004',
    level: 'medium',
    type: 'device_fault',
    source: '空调控制系统',
    content: '3号楼中央空调主机运行异常',
    alarmTime: '2025-12-22 15:10:22',
    processTime: '2025-12-22 16:30:45',
    result: 'resolved',
    handler: '赵六',
    deviceInfo: '空调主机 HVAC-3F-001',
    location: '3号楼设备层',
    processRemark: '空调过滤网堵塞导致压缩机频繁启停，已清洗过滤网并恢复正常运行',
    timeline: [
      { time: '2025-12-22 15:10:22', content: '系统检测到空调运行异常', type: 'warning' },
      { time: '2025-12-22 15:15:00', content: '派发维修工单', type: 'primary' },
      { time: '2025-12-22 15:40:00', content: '维修人员赵六到达现场', operator: '赵六', type: 'primary' },
      { time: '2025-12-22 16:30:45', content: '故障排除，设备恢复正常', operator: '赵六', type: 'success' }
    ]
  },
  {
    id: 'ALM20251221005',
    level: 'low',
    type: 'humidity',
    source: '档案室',
    content: '档案室湿度偏低，当前42%',
    alarmTime: '2025-12-21 09:05:18',
    processTime: '2025-12-21 09:30:00',
    result: 'resolved',
    handler: '张三',
    deviceInfo: '温湿度传感器 TH-1F-008',
    location: '1号楼1层档案室',
    processRemark: '已开启加湿器，湿度恢复至正常范围',
    timeline: [
      { time: '2025-12-21 09:05:18', content: '系统检测到湿度低于阈值', type: 'info' },
      { time: '2025-12-21 09:10:00', content: '值班人员收到提醒', type: 'warning' },
      { time: '2025-12-21 09:30:00', content: '开启加湿器，湿度恢复正常', operator: '张三', type: 'success' }
    ]
  },
  {
    id: 'ALM20251221006',
    level: 'high',
    type: 'power',
    source: '配电室',
    content: 'B相电压异常波动',
    alarmTime: '2025-12-21 08:55:33',
    processTime: '2025-12-21 10:20:18',
    result: 'resolved',
    handler: '李四',
    deviceInfo: '智能电表 PM-B1-001',
    location: 'B1层配电室',
    processRemark: '经检查为进线端子松动导致，已重新紧固端子并监测运行正常',
    timeline: [
      { time: '2025-12-21 08:55:33', content: '系统检测到电压异常波动', type: 'danger' },
      { time: '2025-12-21 09:00:00', content: '紧急通知电气维护人员', type: 'danger' },
      { time: '2025-12-21 09:15:00', content: '电气工程师李四到达配电室', operator: '李四', type: 'primary' },
      { time: '2025-12-21 10:20:18', content: '故障排除，电压恢复稳定', operator: '李四', type: 'success' }
    ]
  },
  {
    id: 'ALM20251220007',
    level: 'medium',
    type: 'device_fault',
    source: '电梯监控系统',
    content: '1号电梯运行异常',
    alarmTime: '2025-12-20 16:48:15',
    processTime: '2025-12-20 18:15:30',
    result: 'resolved',
    handler: '王五',
    deviceInfo: '电梯控制器 EL-001',
    location: '1号楼1号电梯',
    processRemark: '电梯导靴磨损导致运行抖动，已更换导靴并通过检测',
    timeline: [
      { time: '2025-12-20 16:48:15', content: '系统检测到电梯运行异常', type: 'warning' },
      { time: '2025-12-20 16:50:00', content: '电梯暂停运行，通知维保单位', type: 'danger' },
      { time: '2025-12-20 17:30:00', content: '维保人员到达现场检修', operator: '外部维保', type: 'primary' },
      { time: '2025-12-20 18:15:30', content: '更换导靴后恢复运行', operator: '王五', type: 'success' }
    ]
  },
  {
    id: 'ALM20251220008',
    level: 'low',
    type: 'temperature',
    source: '会议室B201',
    content: '会议室温度偏高，当前26℃',
    alarmTime: '2025-12-20 14:42:50',
    processTime: '2025-12-20 14:55:00',
    result: 'ignored',
    handler: '赵六',
    deviceInfo: '温湿度传感器 TH-2F-005',
    location: '2号楼2层会议室B201',
    processRemark: '会议进行中，人员较多导致温度偏高，会议结束后自动恢复',
    timeline: [
      { time: '2025-12-20 14:42:50', content: '系统检测到温度偏高', type: 'info' },
      { time: '2025-12-20 14:50:00', content: '确认会议室正在使用中', operator: '赵六', type: 'primary' },
      { time: '2025-12-20 14:55:00', content: '暂时忽略此报警', operator: '赵六', type: 'info' }
    ]
  },
  {
    id: 'ALM20251219009',
    level: 'medium',
    type: 'intrusion',
    source: '门禁系统',
    content: '非工作时间有人刷卡进入',
    alarmTime: '2025-12-19 21:35:28',
    processTime: '2025-12-19 21:42:15',
    result: 'false_alarm',
    handler: '张三',
    deviceInfo: '门禁控制器 AC-1F-003',
    location: '1号楼1层大厅',
    processRemark: '经核实为加班员工正常进入，已在系统中登记加班信息',
    timeline: [
      { time: '2025-12-19 21:35:28', content: '非工作时间刷卡记录触发报警', type: 'warning' },
      { time: '2025-12-19 21:38:00', content: '安保人员核实刷卡人员身份', operator: '张三', type: 'primary' },
      { time: '2025-12-19 21:42:15', content: '确认为加班员工，标记为误报', operator: '张三', type: 'success' }
    ]
  },
  {
    id: 'ALM20251219010',
    level: 'low',
    type: 'device_fault',
    source: '照明控制系统',
    content: '地下车库A区部分灯具通信中断',
    alarmTime: '2025-12-19 08:28:40',
    processTime: '2025-12-19 10:15:22',
    result: 'resolved',
    handler: '李四',
    deviceInfo: '照明控制器 LC-B1-001',
    location: 'B1层停车场A区',
    processRemark: '控制器网络模块故障，已更换模块恢复通信',
    timeline: [
      { time: '2025-12-19 08:28:40', content: '系统检测到灯具通信中断', type: 'info' },
      { time: '2025-12-19 08:35:00', content: '派发维修工单', type: 'primary' },
      { time: '2025-12-19 09:30:00', content: '维修人员李四到达现场', operator: '李四', type: 'primary' },
      { time: '2025-12-19 10:15:22', content: '更换网络模块，恢复通信', operator: '李四', type: 'success' }
    ]
  },
  {
    id: 'ALM20251218011',
    level: 'high',
    type: 'fire',
    source: '消防喷淋系统',
    content: '地下车库喷淋头意外触发',
    alarmTime: '2025-12-18 11:20:15',
    processTime: '2025-12-18 11:45:30',
    result: 'resolved',
    handler: '王五',
    deviceInfo: '消防喷淋 SP-B1-015',
    location: 'B1层停车场C区',
    processRemark: '喷淋头老化导致意外触发，已关闭区域阀门并更换喷淋头',
    timeline: [
      { time: '2025-12-18 11:20:15', content: '消防喷淋触发报警', type: 'danger' },
      { time: '2025-12-18 11:22:00', content: '消防联动启动，通知消防部门', type: 'danger' },
      { time: '2025-12-18 11:30:00', content: '确认非火情，关闭区域阀门', operator: '王五', type: 'warning' },
      { time: '2025-12-18 11:45:30', content: '更换故障喷淋头，恢复正常', operator: '王五', type: 'success' }
    ]
  },
  {
    id: 'ALM20251218012',
    level: 'medium',
    type: 'humidity',
    source: '仓库管理系统',
    content: '仓库湿度达到72%，超过设定阈值70%',
    alarmTime: '2025-12-18 08:15:33',
    processTime: '2025-12-18 09:00:00',
    result: 'resolved',
    handler: '赵六',
    deviceInfo: '温湿度传感器 TH-W-001',
    location: '园区仓库',
    processRemark: '已开启除湿机，并检查门窗密封情况',
    timeline: [
      { time: '2025-12-18 08:15:33', content: '系统检测到湿度超标', type: 'warning' },
      { time: '2025-12-18 08:20:00', content: '通知仓库管理员', type: 'warning' },
      { time: '2025-12-18 08:35:00', content: '开启除湿设备', operator: '赵六', type: 'primary' },
      { time: '2025-12-18 09:00:00', content: '湿度恢复正常范围', operator: '赵六', type: 'success' }
    ]
  }
]

// 获取级别类型
const getLevelType = (level: string | undefined) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level || ''] || 'info'
}

// 获取级别文本
const getLevelText = (level: string | undefined) => {
  const texts: Record<string, string> = {
    high: '高危',
    medium: '中危',
    low: '低危'
  }
  return texts[level || ''] || level
}

// 获取类型文本
const getTypeText = (type: string | undefined) => {
  const texts: Record<string, string> = {
    device_fault: '设备故障',
    temperature: '温度异常',
    intrusion: '入侵报警',
    fire: '消防报警',
    humidity: '湿度异常',
    power: '电力异常'
  }
  return texts[type || ''] || type
}

// 获取结果类型
const getResultType = (result: string | undefined) => {
  const types: Record<string, string> = {
    resolved: 'success',
    ignored: 'info',
    false_alarm: 'warning'
  }
  return types[result || ''] || 'info'
}

// 获取结果文本
const getResultText = (result: string | undefined) => {
  const texts: Record<string, string> = {
    resolved: '已处理',
    ignored: '已忽略',
    false_alarm: '误报'
  }
  return texts[result || ''] || result
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['高危', '中危', '低危']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['12-18', '12-19', '12-20', '12-21', '12-22', '12-23', '12-24']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '高危',
        type: 'line',
        data: [5, 3, 4, 6, 2, 4, 3],
        itemStyle: { color: '#f56c6c' },
        areaStyle: { color: 'rgba(245, 108, 108, 0.1)' }
      },
      {
        name: '中危',
        type: 'line',
        data: [8, 10, 7, 9, 12, 8, 6],
        itemStyle: { color: '#e6a23c' },
        areaStyle: { color: 'rgba(230, 162, 60, 0.1)' }
      },
      {
        name: '低危',
        type: 'line',
        data: [12, 8, 15, 10, 9, 11, 8],
        itemStyle: { color: '#909399' },
        areaStyle: { color: 'rgba(144, 147, 153, 0.1)' }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化类型图表
const initTypeChart = () => {
  if (!typeChartRef.value) return
  typeChart = echarts.init(typeChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data: [
          { value: 35, name: '设备故障', itemStyle: { color: '#909399' } },
          { value: 28, name: '温度异常', itemStyle: { color: '#e6a23c' } },
          { value: 18, name: '入侵报警', itemStyle: { color: '#f56c6c' } },
          { value: 12, name: '消防报警', itemStyle: { color: '#f56c6c' } },
          { value: 15, name: '湿度异常', itemStyle: { color: '#409eff' } },
          { value: 8, name: '电力异常', itemStyle: { color: '#e6a23c' } }
        ]
      }
    ]
  }
  
  typeChart.setOption(option)
}

// 初始化级别图表
const initLevelChart = () => {
  if (!levelChartRef.value) return
  levelChart = echarts.init(levelChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data: [
          { value: 28, name: '高危', itemStyle: { color: '#f56c6c' } },
          { value: 45, name: '中危', itemStyle: { color: '#e6a23c' } },
          { value: 43, name: '低危', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }
  
  levelChart.setOption(option)
}

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]
    
    // 筛选
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      filteredData = filteredData.filter(item => {
        const date = item.alarmTime.split(' ')[0]
        return date >= searchForm.dateRange[0] && date <= searchForm.dateRange[1]
      })
    }
    if (searchForm.level) {
      filteredData = filteredData.filter(item => item.level === searchForm.level)
    }
    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
    }
    if (searchForm.result) {
      filteredData = filteredData.filter(item => item.result === searchForm.result)
    }
    
    pagination.total = filteredData.length
    const start = (pagination.currentPage - 1) * pagination.pageSize
    tableData.value = filteredData.slice(start, start + pagination.pageSize)
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.dateRange = []
  searchForm.level = ''
  searchForm.type = ''
  searchForm.result = ''
  pagination.currentPage = 1
  loadData()
}

// 导出
const handleExport = () => {
  ElMessage.success('正在导出报警数据...')
}

// 查看详情
const handleView = (row: AlarmHistoryRecord) => {
  currentRow.value = row
  detailVisible.value = true
}

// 分页变化
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  trendChart?.resize()
  typeChart?.resize()
  levelChart?.resize()
}

onMounted(() => {
  loadData()
  nextTick(() => {
    initTrendChart()
    initTypeChart()
    initLevelChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  typeChart?.dispose()
  levelChart?.dispose()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.search-card {
  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 16px;
  }
}

.chart-row {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.chart-container {
  height: 280px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .table-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  
  .header-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    
    :deep(.el-statistic) {
      .el-statistic__head {
        font-size: 12px;
        color: #909399;
      }
      .el-statistic__content {
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .stat-danger {
      :deep(.el-statistic__content) {
        color: #f56c6c;
      }
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.timeline-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  
  h4 {
    margin-bottom: 16px;
    color: #303133;
  }
  
  .timeline-operator {
    font-size: 12px;
    color: #909399;
  }
}
</style>
