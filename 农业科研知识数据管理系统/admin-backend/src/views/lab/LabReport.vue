<template>
  <div class="lab-report-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="报表类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="设备使用报表" value="usage" />
            <el-option label="预约统计报表" value="reservation" />
            <el-option label="维护保养报表" value="maintenance" />
            <el-option label="故障统计报表" value="fault" />
            <el-option label="费用统计报表" value="cost" />
          </el-select>
        </el-form-item>
        <el-form-item label="统计周期">
          <el-select v-model="searchForm.period" placeholder="请选择">
            <el-option label="日报" value="day" />
            <el-option label="周报" value="week" />
            <el-option label="月报" value="month" />
            <el-option label="季报" value="quarter" />
            <el-option label="年报" value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <!-- 统计概览 -->
      <el-tab-pane label="统计概览" name="overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-card">
                <div class="stat-icon" style="background: #409EFF"><el-icon><Monitor /></el-icon></div>
                <div class="stat-content"><div class="stat-value">{{ overviewData.totalEquipment }}</div><div class="stat-label">设备总数</div></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-card">
                <div class="stat-icon" style="background: #67C23A"><el-icon><Calendar /></el-icon></div>
                <div class="stat-content"><div class="stat-value">{{ overviewData.totalReservation }}</div><div class="stat-label">本月预约数</div></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-card">
                <div class="stat-icon" style="background: #E6A23C"><el-icon><Tools /></el-icon></div>
                <div class="stat-content"><div class="stat-value">{{ overviewData.maintenanceCount }}</div><div class="stat-label">维护次数</div></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-card">
                <div class="stat-icon" style="background: #F56C6C"><el-icon><Money /></el-icon></div>
                <div class="stat-content"><div class="stat-value">¥{{ overviewData.totalCost }}</div><div class="stat-label">维护费用</div></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <el-card header="设备使用率排行">
              <div ref="usageRankChart" style="height: 300px"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="预约趋势">
              <div ref="reservationTrendChart" style="height: 300px"></div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <el-card header="故障类型分布">
              <div ref="faultTypeChart" style="height: 300px"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="各部门设备使用情况">
              <div ref="deptUsageChart" style="height: 300px"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 报表列表 -->
      <el-tab-pane label="报表列表" name="list">
        <div class="action-bar" style="margin-bottom: 15px">
          <el-button type="primary" @click="handleGenerateReport"><el-icon><Document /></el-icon>生成报表</el-button>
          <el-button type="success" @click="handleExportAll"><el-icon><Download /></el-icon>批量导出</el-button>
        </div>
        <el-table :data="reportList" stripe border>
          <el-table-column prop="id" label="报表编号" width="120" />
          <el-table-column prop="name" label="报表名称" min-width="200" />
          <el-table-column prop="typeName" label="报表类型" width="120">
            <template #default="{ row }"><el-tag size="small">{{ row.typeName }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="periodName" label="统计周期" width="80" />
          <el-table-column prop="dateRange" label="统计时间" width="200" />
          <el-table-column prop="creator" label="生成人" width="100" />
          <el-table-column prop="createTime" label="生成时间" width="160" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewReport(row)">查看</el-button>
              <el-button type="success" link size="small" @click="handleDownloadReport(row)">下载</el-button>
              <el-button type="danger" link size="small" @click="handleDeleteReport(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 生成报表 -->
      <el-tab-pane label="生成报表" name="generate">
        <el-form :model="generateForm" label-width="120px" style="max-width: 600px">
          <el-form-item label="报表类型">
            <el-select v-model="generateForm.type" placeholder="请选择" style="width: 100%">
              <el-option label="设备使用报表" value="usage" />
              <el-option label="预约统计报表" value="reservation" />
              <el-option label="维护保养报表" value="maintenance" />
              <el-option label="故障统计报表" value="fault" />
              <el-option label="费用统计报表" value="cost" />
              <el-option label="综合分析报表" value="comprehensive" />
            </el-select>
          </el-form-item>
          <el-form-item label="统计周期">
            <el-select v-model="generateForm.period" placeholder="请选择" style="width: 100%">
              <el-option label="日报" value="day" />
              <el-option label="周报" value="week" />
              <el-option label="月报" value="month" />
              <el-option label="季报" value="quarter" />
              <el-option label="年报" value="year" />
            </el-select>
          </el-form-item>
          <el-form-item label="统计时间">
            <el-date-picker v-model="generateForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" style="width: 100%" />
          </el-form-item>
          <el-form-item label="包含设备">
            <el-select v-model="generateForm.equipment" placeholder="全部设备" style="width: 100%" multiple>
              <el-option label="高效液相色谱仪" value="1" />
              <el-option label="气相色谱质谱联用仪" value="2" />
              <el-option label="紫外可见分光光度计" value="3" />
              <el-option label="原子吸收光谱仪" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="报表格式">
            <el-radio-group v-model="generateForm.format">
              <el-radio value="pdf">PDF</el-radio>
              <el-radio value="excel">Excel</el-radio>
              <el-radio value="word">Word</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="包含图表">
            <el-switch v-model="generateForm.includeChart" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleGenerate"><el-icon><Document /></el-icon>生成报表</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

const activeTab = ref('overview')
const usageRankChart = ref<HTMLElement>()
const reservationTrendChart = ref<HTMLElement>()
const faultTypeChart = ref<HTMLElement>()
const deptUsageChart = ref<HTMLElement>()

const searchForm = reactive({ type: '', period: 'month', dateRange: null })
const generateForm = reactive({ type: 'usage', period: 'month', dateRange: null, equipment: [], format: 'pdf', includeChart: true })

const overviewData = reactive({
  totalEquipment: 45,
  totalReservation: 328,
  maintenanceCount: 18,
  totalCost: '52,800'
})

const reportList = ref([
  { id: 'RPT202412001', name: '2024年12月设备使用统计报表', type: 'usage', typeName: '设备使用', periodName: '月报', dateRange: '2024-12-01 ~ 2024-12-31', creator: '管理员', createTime: '2024-12-22 10:00:00' },
  { id: 'RPT202412002', name: '2024年12月预约统计报表', type: 'reservation', typeName: '预约统计', periodName: '月报', dateRange: '2024-12-01 ~ 2024-12-31', creator: '管理员', createTime: '2024-12-22 11:00:00' },
  { id: 'RPT202412003', name: '2024年第四季度维护保养报表', type: 'maintenance', typeName: '维护保养', periodName: '季报', dateRange: '2024-10-01 ~ 2024-12-31', creator: '张三', createTime: '2024-12-20 14:00:00' },
  { id: 'RPT202412004', name: '2024年故障统计报表', type: 'fault', typeName: '故障统计', periodName: '年报', dateRange: '2024-01-01 ~ 2024-12-31', creator: '李四', createTime: '2024-12-22 09:00:00' }
])

const initCharts = () => {
  if (usageRankChart.value) {
    const chart = echarts.init(usageRankChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['色谱仪', '质谱仪', '光谱仪', '离心机', '培养箱'] },
      yAxis: { type: 'value', name: '使用率(%)' },
      series: [{ type: 'bar', data: [92, 85, 78, 65, 45], itemStyle: { color: '#409EFF' } }]
    })
  }
  if (reservationTrendChart.value) {
    const chart = echarts.init(reservationTrendChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value', name: '预约数' },
      series: [{ type: 'line', data: [45, 52, 38, 65, 48, 20, 15], smooth: true, areaStyle: { opacity: 0.3 } }]
    })
  }
  if (faultTypeChart.value) {
    const chart = echarts.init(faultTypeChart.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [{ value: 35, name: '机械故障' }, { value: 28, name: '电气故障' }, { value: 20, name: '软件故障' }, { value: 12, name: '光源故障' }, { value: 5, name: '其他' }] }]
    })
  }
  if (deptUsageChart.value) {
    const chart = echarts.init(deptUsageChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['研发一部', '研发二部', '实验中心', '设备科', '质检中心'] },
      yAxis: { type: 'value', name: '使用时长(小时)' },
      series: [{ type: 'bar', data: [520, 480, 620, 380, 290], itemStyle: { color: '#67C23A' } }]
    })
  }
}

onMounted(() => { setTimeout(() => { initCharts() }, 300) })

const handleTabChange = () => { if (activeTab.value === 'overview') setTimeout(() => { initCharts() }, 300) }
const handleQuery = () => ElMessage.success('查询完成')
const handleReset = () => { Object.assign(searchForm, { type: '', period: 'month', dateRange: null }); ElMessage.info('已重置') }
const handleGenerateReport = () => { activeTab.value = 'generate' }
const handleExportAll = () => ElMessage.success('批量导出成功')
const handleViewReport = (row: any) => ElMessage.success(`查看报表：${row.name}`)
const handleDownloadReport = (row: any) => ElMessage.success(`下载报表：${row.name}`)
const handleDeleteReport = (row: any) => { ElMessageBox.confirm(`确定删除报表"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleGenerate = () => ElMessage.success('报表生成成功')
</script>

<style scoped>
.lab-report-page { height: 100%; }
.stat-card { display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; }
.stat-content { flex: 1; }
.stat-value { font-size: 24px; font-weight: bold; color: #303133; }
.stat-label { font-size: 14px; color: #909399; margin-top: 5px; }
</style>
