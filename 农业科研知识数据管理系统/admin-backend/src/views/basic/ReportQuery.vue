<template>
  <div class="report-query-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="报表类型"><el-select v-model="searchForm.type" placeholder="请选择" clearable><el-option label="设备统计报表" value="equipment" /><el-option label="试剂使用报表" value="reagent" /><el-option label="项目进度报表" value="project" /><el-option label="人员工作报表" value="staff" /><el-option label="运营分析报表" value="operation" /></el-select></el-form-item>
        <el-form-item label="统计周期"><el-select v-model="searchForm.period" placeholder="请选择"><el-option label="日报" value="day" /><el-option label="周报" value="week" /><el-option label="月报" value="month" /><el-option label="季报" value="quarter" /><el-option label="年报" value="year" /></el-select></el-form-item>
        <el-form-item label="时间范围"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="报表列表" name="list">
        <div class="table-container">
          <el-table :data="reportList" stripe border>
            <el-table-column prop="id" label="报表编号" width="120" />
            <el-table-column prop="name" label="报表名称" min-width="200" />
            <el-table-column prop="typeName" label="报表类型" width="120"><template #default="{ row }"><el-tag size="small">{{ row.typeName }}</el-tag></template></el-table-column>
            <el-table-column prop="periodName" label="统计周期" width="80" />
            <el-table-column prop="dateRange" label="统计时间" width="200" />
            <el-table-column prop="creator" label="生成人" width="100" />
            <el-table-column prop="createTime" label="生成时间" width="160" />
            <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">{{ row.status === 1 ? '已完成' : '生成中' }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">查看</el-button><el-button type="success" link size="small" @click="handleDownload(row)" :disabled="row.status !== 1">下载</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="图表展示" name="chart">
        <div class="chart-container">
          <el-row :gutter="20">
            <el-col :span="12"><el-card header="设备使用率统计"><div ref="equipmentChart" style="height: 300px"></div></el-card></el-col>
            <el-col :span="12"><el-card header="试剂消耗趋势"><div ref="reagentChart" style="height: 300px"></div></el-card></el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="12"><el-card header="项目进度分布"><div ref="projectChart" style="height: 300px"></div></el-card></el-col>
            <el-col :span="12"><el-card header="各部门工作量"><div ref="workloadChart" style="height: 300px"></div></el-card></el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="24"><el-card header="历史数据趋势图（选择时间范围查看）"><div ref="historyChart" style="height: 350px"></div></el-card></el-col>
          </el-row>
        </div>
      </el-tab-pane>
      <el-tab-pane label="生成报表" name="generate">
        <el-form :model="generateForm" label-width="120px" style="max-width: 600px">
          <el-form-item label="报表类型"><el-select v-model="generateForm.type" placeholder="请选择" style="width: 100%"><el-option label="设备统计报表" value="equipment" /><el-option label="试剂使用报表" value="reagent" /><el-option label="项目进度报表" value="project" /><el-option label="人员工作报表" value="staff" /><el-option label="综合运营报表" value="operation" /></el-select></el-form-item>
          <el-form-item label="统计周期"><el-select v-model="generateForm.period" placeholder="请选择" style="width: 100%"><el-option label="日报" value="day" /><el-option label="周报" value="week" /><el-option label="月报" value="month" /><el-option label="季报" value="quarter" /><el-option label="年报" value="year" /></el-select></el-form-item>
          <el-form-item label="统计时间"><el-date-picker v-model="generateForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" style="width: 100%" /></el-form-item>
          <el-form-item label="报表格式"><el-radio-group v-model="generateForm.format"><el-radio value="pdf">PDF</el-radio><el-radio value="excel">Excel</el-radio><el-radio value="word">Word</el-radio></el-radio-group></el-form-item>
          <el-form-item label="包含图表"><el-switch v-model="generateForm.includeChart" /></el-form-item>
          <el-form-item><el-button type="primary" @click="handleGenerate"><el-icon><Document /></el-icon>生成报表</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
const activeTab = ref('list')
const equipmentChart = ref<HTMLElement>()
const reagentChart = ref<HTMLElement>()
const projectChart = ref<HTMLElement>()
const workloadChart = ref<HTMLElement>()
const historyChart = ref<HTMLElement>()
let chartInstances: echarts.ECharts[] = []
const searchForm = reactive({ type: '', period: 'month', dateRange: null })
const generateForm = reactive({ type: 'equipment', period: 'month', dateRange: null, format: 'pdf', includeChart: true })
const reportList = ref([
  { id: 'RPT202412001', name: '2024年12月设备使用统计报表', type: 'equipment', typeName: '设备统计', periodName: '月报', dateRange: '2024-12-01 ~ 2024-12-31', creator: '管理员', createTime: '2024-12-22 10:00:00', status: 1 },
  { id: 'RPT202412002', name: '2024年12月试剂消耗分析报表', type: 'reagent', typeName: '试剂使用', periodName: '月报', dateRange: '2024-12-01 ~ 2024-12-31', creator: '管理员', createTime: '2024-12-22 11:00:00', status: 1 },
  { id: 'RPT202412003', name: '2024年第四季度项目进度报表', type: 'project', typeName: '项目进度', periodName: '季报', dateRange: '2024-10-01 ~ 2024-12-31', creator: '张三', createTime: '2024-12-20 14:00:00', status: 1 },
  { id: 'RPT202412004', name: '2024年12月人员工作统计报表', type: 'staff', typeName: '人员工作', periodName: '月报', dateRange: '2024-12-01 ~ 2024-12-31', creator: '李四', createTime: '2024-12-22 09:00:00', status: 0 },
  { id: 'RPT202412005', name: '2024年度综合运营分析报表', type: 'operation', typeName: '运营分析', periodName: '年报', dateRange: '2024-01-01 ~ 2024-12-31', creator: '管理员', createTime: '2024-12-21 16:00:00', status: 1 }
])
const initCharts = () => {
  // 先销毁已有实例
  chartInstances.forEach(chart => chart?.dispose())
  chartInstances = []
  
  nextTick(() => {
    if (equipmentChart.value) { 
      const chart = echarts.init(equipmentChart.value)
      chart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['色谱仪', '质谱仪', '光谱仪', '离心机', '培养箱'] }, yAxis: { type: 'value', name: '使用率(%)' }, series: [{ type: 'bar', data: [85, 72, 68, 90, 45], itemStyle: { color: '#409EFF' } }] })
      chartInstances.push(chart)
    }
    if (reagentChart.value) { 
      const chart = echarts.init(reagentChart.value)
      chart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] }, yAxis: { type: 'value', name: '消耗量(L)' }, series: [{ type: 'line', data: [120, 150, 180, 165, 200, 220], smooth: true, areaStyle: { opacity: 0.3 } }] })
      chartInstances.push(chart)
    }
    if (projectChart.value) { 
      const chart = echarts.init(projectChart.value)
      chart.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['40%', '70%'], data: [{ value: 15, name: '已完成' }, { value: 8, name: '进行中' }, { value: 3, name: '待启动' }, { value: 2, name: '已暂停' }] }] })
      chartInstances.push(chart)
    }
    if (workloadChart.value) { 
      const chart = echarts.init(workloadChart.value)
      chart.setOption({ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ['研发一部', '研发二部', '实验中心', '设备科', '试剂科'] }, yAxis: { type: 'value', name: '工作量(小时)' }, series: [{ type: 'bar', data: [520, 480, 620, 380, 290], itemStyle: { color: '#67C23A' } }] })
      chartInstances.push(chart)
    }
    if (historyChart.value) { 
      const chart = echarts.init(historyChart.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['设备使用', '试剂消耗', '项目数量'] },
        xAxis: { type: 'category', data: ['2024-10-01', '2024-10-15', '2024-11-01', '2024-11-15', '2024-12-01', '2024-12-15', '2024-12-22'] },
        yAxis: [{ type: 'value', name: '使用次数' }, { type: 'value', name: '消耗量(g)', position: 'right' }],
        series: [
          { name: '设备使用', type: 'line', data: [120, 145, 156, 168, 180, 192, 210], smooth: true, yAxisIndex: 0 },
          { name: '试剂消耗', type: 'line', data: [89, 105, 125, 142, 168, 195, 220], smooth: true, yAxisIndex: 1 },
          { name: '项目数量', type: 'bar', data: [8, 9, 11, 13, 15, 17, 19], yAxisIndex: 0 }
        ]
      })
      chartInstances.push(chart)
    }
  })
}
// 窗口resize时重新调整图表大小
const handleResize = () => { chartInstances.forEach(chart => chart?.resize()) }
onMounted(() => { window.addEventListener('resize', handleResize) })
onUnmounted(() => { 
  window.removeEventListener('resize', handleResize)
  chartInstances.forEach(chart => chart?.dispose())
})
const handleQuery = () => ElMessage.success('查询完成')
const handleReset = () => { Object.assign(searchForm, { type: '', period: 'month', dateRange: null }); ElMessage.info('已重置') }
const handleTabChange = (tab: any) => { if (tab.paneName === 'chart') { nextTick(() => { setTimeout(initCharts, 150) }) } }
const handleView = (row: any) => ElMessage.success(`查看报表：${row.name}`)
const handleDownload = (row: any) => ElMessage.success(`开始下载：${row.name}`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除报表"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleGenerate = () => { ElMessage.success('报表生成任务已提交，请稍后在报表列表中查看') }
</script>
<style scoped>.report-query-page { height: 100%; }</style>
