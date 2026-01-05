<template>
  <div class="energy-saving-container">
    <!-- 节能目标概览 -->
    <el-row :gutter="20" class="target-row">
      <el-col :span="6">
        <el-card class="target-card" shadow="hover">
          <div class="target-header">
            <div class="target-icon electric">
              <el-icon :size="28"><TrendCharts /></el-icon>
            </div>
            <div class="target-info">
              <div class="target-title">年度节能目标</div>
              <div class="target-value">15<span class="unit">%</span></div>
            </div>
          </div>
          <div class="target-progress">
            <div class="progress-header">
              <span>完成进度</span>
              <span class="progress-value">68%</span>
            </div>
            <el-progress :percentage="68" :stroke-width="8" color="#67C23A" :show-text="false" />
          </div>
          <div class="target-footer">
            <span>剩余目标: 4.8%</span>
            <span class="days">剩余182天</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="target-card" shadow="hover">
          <div class="target-header">
            <div class="target-icon water">
              <el-icon :size="28"><Coin /></el-icon>
            </div>
            <div class="target-info">
              <div class="target-title">累计节约成本</div>
              <div class="target-value">28.6<span class="unit">万元</span></div>
            </div>
          </div>
          <div class="target-stats">
            <div class="stat-item">
              <span class="stat-label">电费节约</span>
              <span class="stat-value">18.2万</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">水费节约</span>
              <span class="stat-value">6.8万</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">气费节约</span>
              <span class="stat-value">3.6万</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="target-card" shadow="hover">
          <div class="target-header">
            <div class="target-icon gas">
              <el-icon :size="28"><Lightning /></el-icon>
            </div>
            <div class="target-info">
              <div class="target-title">节约能耗总量</div>
              <div class="target-value">125,680<span class="unit">kWh</span></div>
            </div>
          </div>
          <div class="target-compare">
            <el-row :gutter="10">
              <el-col :span="12">
                <div class="compare-item">
                  <span class="compare-label">同比去年</span>
                  <span class="compare-value down">-12.5%</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="compare-item">
                  <span class="compare-label">环比上月</span>
                  <span class="compare-value down">-5.8%</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="target-card" shadow="hover">
          <div class="target-header">
            <div class="target-icon env">
              <el-icon :size="28"><Sunny /></el-icon>
            </div>
            <div class="target-info">
              <div class="target-title">碳减排量</div>
              <div class="target-value">86.5<span class="unit">吨CO2</span></div>
            </div>
          </div>
          <div class="target-desc">
            <p>相当于种植 <strong>4,325</strong> 棵树木</p>
            <p>减少 <strong>28,680</strong> 公里汽车行驶</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 节能措施管理 -->
    <el-card class="measures-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">节能措施管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddMeasure">
              <el-icon><Plus /></el-icon>
              新增措施
            </el-button>
            <el-button @click="handleExportMeasures">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 筛选条件 -->
      <el-form :model="searchForm" inline class="filter-form">
        <el-form-item label="措施类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 140px">
            <el-option label="设备改造" value="equipment" />
            <el-option label="管理优化" value="management" />
            <el-option label="技术升级" value="technology" />
            <el-option label="行为节能" value="behavior" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="待启动" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="searchForm.area" placeholder="请选择区域" clearable style="width: 140px">
            <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 措施列表 -->
      <el-table :data="measuresData" border stripe style="width: 100%">
        <el-table-column prop="id" label="措施编号" width="100" />
        <el-table-column prop="name" label="措施名称" min-width="180" />
        <el-table-column prop="type" label="措施类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getMeasureTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="area" label="实施区域" width="120" />
        <el-table-column prop="targetSaving" label="预期节能(kWh)" width="130" />
        <el-table-column prop="actualSaving" label="实际节能(kWh)" width="130" />
        <el-table-column prop="savingRate" label="节能率" width="100">
          <template #default="{ row }">
            <span :class="row.savingRate >= 100 ? 'rate-success' : 'rate-warning'">{{ row.savingRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="investment" label="投资金额(万元)" width="130" />
        <el-table-column prop="paybackPeriod" label="回收期" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" :color="getProgressColor(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEditMeasure(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleViewMeasure(row)">详情</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteMeasure(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 节能效果统计 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">月度节能趋势</span>
              <el-radio-group v-model="trendYear" size="small">
                <el-radio-button label="2025">2025年</el-radio-button>
                <el-radio-button label="2023">2023年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">节能措施分类效果</span>
            </div>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">区域节能效果对比</span>
            </div>
          </template>
          <div ref="areaCompareChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="title">节能投资回报</span>
            </div>
          </template>
          <div ref="roiChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 节能建议 -->
    <el-card class="suggestion-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><InfoFilled /></el-icon>
            智能节能建议
          </span>
          <el-button type="primary" size="small" @click="handleRefreshSuggestions">
            <el-icon><Refresh /></el-icon>
            刷新建议
          </el-button>
        </div>
      </template>
      <div class="suggestion-list">
        <div class="suggestion-item" v-for="(item, index) in suggestions" :key="index">
          <div class="suggestion-icon" :class="item.priority">
            <el-icon><WarningFilled v-if="item.priority === 'high'" /><InfoFilled v-else /></el-icon>
          </div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ item.title }}</div>
            <div class="suggestion-desc">{{ item.description }}</div>
            <div class="suggestion-meta">
              <span class="potential">预期节能: {{ item.potential }}</span>
              <span class="area">适用区域: {{ item.area }}</span>
            </div>
          </div>
          <div class="suggestion-action">
            <el-button type="primary" size="small" @click="handleApplySuggestion(item)">采纳建议</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 能耗异常报警 -->
    <el-card class="alarm-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon color="#F56C6C"><Bell /></el-icon>
            能耗异常报警
            <el-badge :value="energyAlarms.filter(a => !a.handled).length" type="danger" class="alarm-badge" />
          </span>
          <div class="header-actions">
            <el-select v-model="alarmFilter.level" placeholder="告警级别" size="small" style="width: 100px" clearable>
              <el-option label="全部" value="" />
              <el-option label="严重" value="critical" />
              <el-option label="警告" value="warning" />
              <el-option label="提示" value="info" />
            </el-select>
            <el-select v-model="alarmFilter.status" placeholder="处理状态" size="small" style="width: 100px" clearable>
              <el-option label="全部" value="" />
              <el-option label="未处理" value="pending" />
              <el-option label="已处理" value="handled" />
            </el-select>
            <el-button type="primary" size="small" @click="handleExportAlarms">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="filteredEnergyAlarms" border stripe style="width: 100%">
        <el-table-column prop="time" label="告警时间" width="180" />
        <el-table-column prop="area" label="区域" width="120" />
        <el-table-column prop="device" label="设备" min-width="150" />
        <el-table-column prop="type" label="异常类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getAlarmTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getAlarmLevelTag(row.level)" size="small">{{ row.levelName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="异常值" width="120" />
        <el-table-column prop="threshold" label="阈值" width="100" />
        <el-table-column prop="deviation" label="偏差率" width="100">
          <template #default="{ row }">
            <span :class="row.deviation > 50 ? 'deviation-high' : 'deviation-mid'">{{ row.deviation }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="handled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.handled ? 'success' : 'danger'" size="small">{{ row.handled ? '已处理' : '未处理' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewAlarm(row)">详情</el-button>
            <el-button v-if="!row.handled" type="success" link size="small" @click="handleAlarm(row)">处理</el-button>
            <el-button type="warning" link size="small" @click="handleIgnoreAlarm(row)">忽略</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="alarmPagination.currentPage"
          v-model:page-size="alarmPagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="alarmPagination.total"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>

    <!-- 报警处理弹窗 -->
    <el-dialog v-model="alarmDialogVisible" title="处理能耗异常报警" width="500px">
      <el-form :model="alarmHandleForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="alarmHandleForm.handleType">
            <el-radio label="adjust">调整设备</el-radio>
            <el-radio label="repair">报修</el-radio>
            <el-radio label="ignore">忽略</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="alarmHandleForm.remark" type="textarea" :rows="3" placeholder="请输入处理说明" />
        </el-form-item>
        <el-form-item label="通知人员">
          <el-select v-model="alarmHandleForm.notifyUsers" multiple placeholder="选择通知人员" style="width: 100%">
            <el-option label="设备管理员" value="device_admin" />
            <el-option label="能源管理员" value="energy_admin" />
            <el-option label="运维人员" value="ops" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="alarmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAlarm">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑措施弹窗 -->
    <el-dialog v-model="measureDialogVisible" :title="measureDialogTitle" width="700px">
      <el-form :model="measureForm" :rules="measureRules" ref="measureFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="措施名称" prop="name">
              <el-input v-model="measureForm.name" placeholder="请输入措施名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="措施类型" prop="type">
              <el-select v-model="measureForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="设备改造" value="equipment" />
                <el-option label="管理优化" value="management" />
                <el-option label="技术升级" value="technology" />
                <el-option label="行为节能" value="behavior" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实施区域" prop="area">
              <el-select v-model="measureForm.area" placeholder="请选择区域" style="width: 100%">
                <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预期节能(kWh)" prop="targetSaving">
              <el-input-number v-model="measureForm.targetSaving" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="投资金额(万元)" prop="investment">
              <el-input-number v-model="measureForm.investment" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计回收期" prop="paybackPeriod">
              <el-input v-model="measureForm.paybackPeriod" placeholder="如: 1.5年" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="measureForm.startDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="measureForm.endDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="措施描述" prop="description">
          <el-input v-model="measureForm.description" type="textarea" :rows="4" placeholder="请输入措施描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="measureDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMeasure">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { TrendCharts, Coin, Lightning, Sunny, Plus, Download, Refresh, InfoFilled, WarningFilled, Bell } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = ref({
  type: '',
  status: '',
  area: ''
})

// 区域选项
const areaOptions = [
  { label: '1号实验楼', value: 'lab1' },
  { label: '2号实验楼', value: 'lab2' },
  { label: '温室大棚A区', value: 'greenhouse_a' },
  { label: '温室大棚B区', value: 'greenhouse_b' },
  { label: '办公楼', value: 'office' },
  { label: '仓储中心', value: 'warehouse' }
]

// 措施数据
const measuresData = ref([
  { id: 'ES-001', name: 'LED照明改造工程', type: 'equipment', typeName: '设备改造', area: '1号实验楼', targetSaving: 25000, actualSaving: 28500, savingRate: 114, investment: 12.5, paybackPeriod: '1.2年', status: 'completed', statusName: '已完成', progress: 100 },
  { id: 'ES-002', name: '空调系统智能控制升级', type: 'technology', typeName: '技术升级', area: '办公楼', targetSaving: 35000, actualSaving: 32800, savingRate: 94, investment: 18.6, paybackPeriod: '1.8年', status: 'ongoing', statusName: '进行中', progress: 75 },
  { id: 'ES-003', name: '温室能源管理优化', type: 'management', typeName: '管理优化', area: '温室大棚A区', targetSaving: 18000, actualSaving: 16500, savingRate: 92, investment: 5.2, paybackPeriod: '0.8年', status: 'ongoing', statusName: '进行中', progress: 60 },
  { id: 'ES-004', name: '节能意识培训推广', type: 'behavior', typeName: '行为节能', area: '全园区', targetSaving: 8000, actualSaving: 9200, savingRate: 115, investment: 1.5, paybackPeriod: '0.5年', status: 'completed', statusName: '已完成', progress: 100 },
  { id: 'ES-005', name: '变频器节能改造', type: 'equipment', typeName: '设备改造', area: '仓储中心', targetSaving: 15000, actualSaving: 8500, savingRate: 57, investment: 8.8, paybackPeriod: '2.5年', status: 'ongoing', statusName: '进行中', progress: 45 },
  { id: 'ES-006', name: '太阳能热水系统安装', type: 'equipment', typeName: '设备改造', area: '2号实验楼', targetSaving: 12000, actualSaving: 0, savingRate: 0, investment: 15.2, paybackPeriod: '3.2年', status: 'pending', statusName: '待启动', progress: 0 },
  { id: 'ES-007', name: '用能定额管理制度', type: 'management', typeName: '管理优化', area: '全园区', targetSaving: 20000, actualSaving: 18600, savingRate: 93, investment: 2.0, paybackPeriod: '0.3年', status: 'ongoing', statusName: '进行中', progress: 80 },
  { id: 'ES-008', name: '电机能效提升改造', type: 'equipment', typeName: '设备改造', area: '温室大棚B区', targetSaving: 22000, actualSaving: 12800, savingRate: 58, investment: 10.5, paybackPeriod: '2.0年', status: 'ongoing', statusName: '进行中', progress: 55 }
])

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 28
})

// 图表相关
const trendYear = ref('2025')
const trendChartRef = ref<HTMLElement | null>(null)
const categoryChartRef = ref<HTMLElement | null>(null)
const areaCompareChartRef = ref<HTMLElement | null>(null)
const roiChartRef = ref<HTMLElement | null>(null)

let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let areaCompareChart: echarts.ECharts | null = null
let roiChart: echarts.ECharts | null = null

// 节能建议
const suggestions = ref([
  { title: '空调温度设定优化', description: '建议将夏季空调温度设定提高1-2°C，可有效降低能耗约8%', potential: '约6,500 kWh/月', area: '办公楼、实验楼', priority: 'high' },
  { title: '照明系统分区控制', description: '建议在走廊、卫生间等区域安装人体感应控制，减少无效照明', potential: '约2,800 kWh/月', area: '全园区', priority: 'medium' },
  { title: '设备待机能耗管理', description: '建议对实验设备、办公电脑等实施待机自动断电管理', potential: '约1,500 kWh/月', area: '实验楼、办公楼', priority: 'medium' },
  { title: '温室通风策略优化', description: '建议根据室外温度自动调节通风时间，避免高温时段大量通风', potential: '约4,200 kWh/月', area: '温室大棚', priority: 'high' }
])

// 能耗异常报警数据
const energyAlarms = ref([
  { id: 1, time: '2025-01-15 14:30:00', area: '1号实验楼', device: '空调主机-01', type: 'overload', typeName: '能耗超标', level: 'critical', levelName: '严重', value: '285 kWh', threshold: '200 kWh', deviation: 42, handled: false },
  { id: 2, time: '2025-01-15 13:45:00', area: '温室大棚A区', device: '通风系统', type: 'abnormal', typeName: '异常波动', level: 'warning', levelName: '警告', value: '波动 ±35%', threshold: '±15%', deviation: 133, handled: false },
  { id: 3, time: '2025-01-15 12:20:00', area: '办公楼', device: '照明回路-3F', type: 'overload', typeName: '能耗超标', level: 'warning', levelName: '警告', value: '58 kWh', threshold: '45 kWh', deviation: 29, handled: true },
  { id: 4, time: '2025-01-15 11:00:00', area: '仓储中心', device: '冷库压缩机', type: 'continuous', typeName: '持续高耗', level: 'critical', levelName: '严重', value: '连续8小时', threshold: '4小时', deviation: 100, handled: false },
  { id: 5, time: '2025-01-15 10:15:00', area: '2号实验楼', device: '实验设备组', type: 'spike', typeName: '突增异常', level: 'info', levelName: '提示', value: '瞬时 450 kW', threshold: '300 kW', deviation: 50, handled: true },
  { id: 6, time: '2025-01-15 09:30:00', area: '温室大棚B区', device: '灌溉水泵', type: 'abnormal', typeName: '异常波动', level: 'warning', levelName: '警告', value: '波动 ±28%', threshold: '±15%', deviation: 87, handled: false }
])

// 报警筛选
const alarmFilter = ref({
  level: '',
  status: ''
})

// 计算筛选后的报警
const filteredEnergyAlarms = computed(() => {
  return energyAlarms.value.filter(alarm => {
    if (alarmFilter.value.level && alarm.level !== alarmFilter.value.level) return false
    if (alarmFilter.value.status === 'pending' && alarm.handled) return false
    if (alarmFilter.value.status === 'handled' && !alarm.handled) return false
    return true
  })
})

// 报警分页
const alarmPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 48
})

// 报警处理弹窗
const alarmDialogVisible = ref(false)
const currentAlarm = ref<any>(null)
const alarmHandleForm = ref({
  handleType: 'adjust',
  remark: '',
  notifyUsers: []
})

// 措施弹窗
const measureDialogVisible = ref(false)
const measureDialogTitle = ref('新增节能措施')
const measureFormRef = ref()
const measureForm = ref({
  name: '',
  type: '',
  area: '',
  targetSaving: 0,
  investment: 0,
  paybackPeriod: '',
  startDate: '',
  endDate: '',
  description: ''
})

const measureRules = {
  name: [{ required: true, message: '请输入措施名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择措施类型', trigger: 'change' }],
  area: [{ required: true, message: '请选择实施区域', trigger: 'change' }],
  targetSaving: [{ required: true, message: '请输入预期节能量', trigger: 'blur' }]
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const targetData = [8500, 9200, 10500, 11800, 12500, 13200, 14500, 15200, 13800, 12500, 11200, 10500]
  const actualData = [9200, 9800, 11200, 12500, 13800, 14500, 15800, 16500, 14200, 13500, 0, 0]
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['目标节能', '实际节能'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      name: '节能量(kWh)'
    },
    series: [
      {
        name: '目标节能',
        type: 'bar',
        barWidth: '35%',
        data: targetData,
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '实际节能',
        type: 'bar',
        barWidth: '35%',
        data: actualData,
        itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化分类效果图表
const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  
  categoryChart = echarts.init(categoryChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}kWh ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 52000, name: '设备改造', itemStyle: { color: '#409EFF' } },
          { value: 35100, name: '管理优化', itemStyle: { color: '#67C23A' } },
          { value: 32800, name: '技术升级', itemStyle: { color: '#E6A23C' } },
          { value: 9200, name: '行为节能', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  
  categoryChart.setOption(option)
}

// 初始化区域对比图表
const initAreaCompareChart = () => {
  if (!areaCompareChartRef.value) return
  
  areaCompareChart = echarts.init(areaCompareChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['节能目标', '实际节能', '节能率'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1号实验楼', '2号实验楼', '温室A区', '温室B区', '办公楼', '仓储中心']
    },
    yAxis: [
      {
        type: 'value',
        name: '能耗(kWh)',
        position: 'left'
      },
      {
        type: 'value',
        name: '节能率(%)',
        position: 'right',
        min: 0,
        max: 120
      }
    ],
    series: [
      {
        name: '节能目标',
        type: 'bar',
        data: [25000, 12000, 18000, 22000, 35000, 15000],
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '实际节能',
        type: 'bar',
        data: [28500, 0, 16500, 12800, 32800, 8500],
        itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '节能率',
        type: 'line',
        yAxisIndex: 1,
        data: [114, 0, 92, 58, 94, 57],
        itemStyle: { color: '#F56C6C' },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
  
  areaCompareChart.setOption(option)
}

// 初始化ROI图表
const initRoiChart = () => {
  if (!roiChartRef.value) return
  
  roiChart = echarts.init(roiChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '年'
    },
    yAxis: {
      type: 'category',
      data: ['LED改造', '空调升级', '温室优化', '培训推广', '变频改造']
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: 1.2, itemStyle: { color: '#67C23A' } },
          { value: 1.8, itemStyle: { color: '#67C23A' } },
          { value: 0.8, itemStyle: { color: '#67C23A' } },
          { value: 0.5, itemStyle: { color: '#67C23A' } },
          { value: 2.5, itemStyle: { color: '#E6A23C' } }
        ],
        label: {
          show: true,
          position: 'right',
          formatter: '{c}年'
        },
        barWidth: '50%'
      }
    ]
  }
  
  roiChart.setOption(option)
}

// 获取措施类型标签
const getMeasureTypeTag = (type: string) => {
  const types: { [key: string]: string } = {
    equipment: '',
    management: 'success',
    technology: 'warning',
    behavior: 'info'
  }
  return types[type] || ''
}

// 获取状态标签
const getStatusTag = (status: string) => {
  const types: { [key: string]: string } = {
    completed: 'success',
    ongoing: '',
    pending: 'info'
  }
  return types[status] || ''
}

// 获取进度颜色
const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#67C23A'
  if (progress >= 50) return '#409EFF'
  if (progress >= 20) return '#E6A23C'
  return '#F56C6C'
}

// 操作方法
const handleSearch = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  searchForm.value = {
    type: '',
    status: '',
    area: ''
  }
}

const handleAddMeasure = () => {
  measureDialogTitle.value = '新增节能措施'
  measureForm.value = {
    name: '',
    type: '',
    area: '',
    targetSaving: 0,
    investment: 0,
    paybackPeriod: '',
    startDate: '',
    endDate: '',
    description: ''
  }
  measureDialogVisible.value = true
}

const handleEditMeasure = (row: any) => {
  measureDialogTitle.value = '编辑节能措施'
  measureForm.value = { ...row }
  measureDialogVisible.value = true
}

const handleViewMeasure = (row: any) => {
  ElMessage.info(`查看 ${row.name} 的详细信息`)
}

const handleDeleteMeasure = (row: any) => {
  ElMessageBox.confirm(`确认删除措施 ${row.name}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSaveMeasure = () => {
  measureFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      measureDialogVisible.value = false
      ElMessage.success('保存成功')
    }
  })
}

const handleExportMeasures = () => {
  ElMessage.success('正在导出措施列表...')
}

const handleRefreshSuggestions = () => {
  ElMessage.success('建议已刷新')
}

const handleApplySuggestion = (item: any) => {
  ElMessage.success(`已采纳建议: ${item.title}`)
}

// 获取报警类型标签
const getAlarmTypeTag = (type: string) => {
  const types: { [key: string]: string } = {
    overload: 'danger',
    abnormal: 'warning',
    continuous: 'danger',
    spike: 'info'
  }
  return types[type] || ''
}

// 获取报警级别标签
const getAlarmLevelTag = (level: string) => {
  const types: { [key: string]: string } = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return types[level] || ''
}

// 导出报警
const handleExportAlarms = () => {
  ElMessage.success('正在导出报警记录...')
}

// 查看报警详情
const handleViewAlarm = (row: any) => {
  ElMessage.info(`查看报警详情: ${row.device}`)
}

// 处理报警
const handleAlarm = (row: any) => {
  currentAlarm.value = row
  alarmHandleForm.value = {
    handleType: 'adjust',
    remark: '',
    notifyUsers: []
  }
  alarmDialogVisible.value = true
}

// 忽略报警
const handleIgnoreAlarm = (row: any) => {
  ElMessageBox.confirm('确认忽略此报警?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.handled = true
    ElMessage.success('已忽略')
  }).catch(() => {})
}

// 提交报警处理
const handleSubmitAlarm = () => {
  if (currentAlarm.value) {
    currentAlarm.value.handled = true
  }
  alarmDialogVisible.value = false
  ElMessage.success('报警处理成功')
}

// 监听年份变化
watch(trendYear, () => {
  initTrendChart()
})

// 窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
  areaCompareChart?.resize()
  roiChart?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initTrendChart()
    initCategoryChart()
    initAreaCompareChart()
    initRoiChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  categoryChart?.dispose()
  areaCompareChart?.dispose()
  roiChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.energy-saving-container {
  padding: 0;
  
  .target-row {
    margin-bottom: 20px;
  }
  
  .target-card {
    .target-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      
      .target-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 14px;
        
        &.electric {
          background: rgba(64, 158, 255, 0.1);
          color: #409EFF;
        }
        
        &.water {
          background: rgba(103, 194, 58, 0.1);
          color: #67C23A;
        }
        
        &.gas {
          background: rgba(230, 162, 60, 0.1);
          color: #E6A23C;
        }
        
        &.env {
          background: rgba(245, 108, 108, 0.1);
          color: #F56C6C;
        }
      }
      
      .target-info {
        .target-title {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        .target-value {
          font-size: 28px;
          font-weight: 700;
          color: #303133;
          
          .unit {
            font-size: 14px;
            font-weight: normal;
            color: #909399;
            margin-left: 4px;
          }
        }
      }
    }
    
    .target-progress {
      margin-bottom: 12px;
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 13px;
        color: #606266;
        
        .progress-value {
          font-weight: 600;
          color: #67C23A;
        }
      }
    }
    
    .target-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #909399;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      
      .days {
        color: #E6A23C;
      }
    }
    
    .target-stats {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      
      .stat-item {
        text-align: center;
        
        .stat-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
    
    .target-compare {
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      
      .compare-item {
        text-align: center;
        
        .compare-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        .compare-value {
          font-size: 16px;
          font-weight: 600;
          
          &.down {
            color: #67C23A;
          }
          
          &.up {
            color: #F56C6C;
          }
        }
      }
    }
    
    .target-desc {
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      
      p {
        font-size: 13px;
        color: #606266;
        margin: 6px 0;
        
        strong {
          color: #409EFF;
        }
      }
    }
  }
  
  .measures-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .filter-form {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .rate-success {
      color: #67C23A;
      font-weight: 600;
    }
    
    .rate-warning {
      color: #E6A23C;
      font-weight: 600;
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
  
  .chart-row {
    margin-bottom: 20px;
  }
  
  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .chart-container {
      height: 300px;
    }
  }
  
  .suggestion-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
    
    .suggestion-list {
      .suggestion-item {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .suggestion-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          flex-shrink: 0;
          
          &.high {
            background: rgba(245, 108, 108, 0.1);
            color: #F56C6C;
          }
          
          &.medium {
            background: rgba(230, 162, 60, 0.1);
            color: #E6A23C;
          }
        }
        
        .suggestion-content {
          flex: 1;
          
          .suggestion-title {
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 6px;
          }
          
          .suggestion-desc {
            font-size: 13px;
            color: #606266;
            margin-bottom: 8px;
          }
          
          .suggestion-meta {
            display: flex;
            gap: 20px;
            font-size: 12px;
            color: #909399;
            
            .potential {
              color: #67C23A;
            }
          }
        }
        
        .suggestion-action {
          margin-left: 16px;
        }
      }
    }
  }
  
  .alarm-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        
        .alarm-badge {
          margin-left: 8px;
        }
      }
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .deviation-high {
      color: #F56C6C;
      font-weight: 600;
    }
    
    .deviation-mid {
      color: #E6A23C;
      font-weight: 600;
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}
</style>
