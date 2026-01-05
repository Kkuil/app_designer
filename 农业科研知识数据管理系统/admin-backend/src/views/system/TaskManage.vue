<template>
  <div class="task-manage-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="任务名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="任务组名"><el-select v-model="searchForm.group" placeholder="全部" clearable><el-option
              label="默认组" value="DEFAULT" /><el-option label="系统组" value="SYSTEM" /><el-option label="数据组"
              value="DATA" /></el-select></el-form-item>
        <el-form-item label="任务状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option
              label="运行中" value="1" /><el-option label="暂停" value="0" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon>
              <Search />
            </el-icon>搜索</el-button><el-button @click="handleReset"><el-icon>
              <Refresh />
            </el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon>
            <Plus />
          </el-icon>新增</el-button><el-button type="success" @click="handleViewLog"><el-icon>
            <Document />
          </el-icon>执行日志</el-button><el-button type="info" @click="handleViewReport"><el-icon>
            <BarChart />
          </el-icon>任务报表</el-button><el-button type="warning" @click="handleExecutor"><el-icon>
            <Setting />
          </el-icon>执行器管理</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="任务编号" width="80" />
        <el-table-column prop="name" label="任务名称" min-width="150" />
        <el-table-column prop="groupName" label="任务组名" width="100" />
        <el-table-column prop="invokeTarget" label="调用目标" min-width="200" />
        <el-table-column prop="cronExpression" label="Cron表达式" width="130" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-switch
              v-model="row.status" :active-value="1" :inactive-value="0"
              @change="handleStatusChange(row)" /></template></el-table-column>
        <el-table-column prop="nextTime" label="下次执行时间" width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small"
              @click="handleEdit(row)">编辑</el-button><el-button type="success" link size="small"
              @click="handleRun(row)">执行</el-button><el-button type="info" link size="small"
              @click="handleView(row)">详情</el-button><el-button type="danger" link size="small"
              @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑任务' : '新增任务'" width="650px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="任务名称"><el-input v-model="form.name"
                placeholder="请输入任务名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="任务组名"><el-select v-model="form.group" placeholder="请选择"
                style="width: 100%"><el-option label="默认组" value="DEFAULT" /><el-option label="系统组"
                  value="SYSTEM" /><el-option label="数据组" value="DATA" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="调用目标"><el-input v-model="form.invokeTarget"
            placeholder="如：com.example.task.DataSyncTask.execute" /></el-form-item>
        <el-form-item label="Cron表达式"><el-input v-model="form.cronExpression" placeholder="如：0 0 2 * * ?" />
          <div class="cron-help">常用：每天凌晨2点(0 0 2 * * ?)，每小时(0 0 * * * ?)，每分钟(0 * * * * ?)</div>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="执行策略"><el-radio-group v-model="form.misfirePolicy"><el-radio
                  value="1">立即执行</el-radio><el-radio value="2">执行一次</el-radio><el-radio
                  value="3">放弃执行</el-radio></el-radio-group></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="是否并发"><el-radio-group v-model="form.concurrent"><el-radio
                  value="0">允许</el-radio><el-radio value="1">禁止</el-radio></el-radio-group></el-form-item></el-col>
        </el-row>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">运行</el-radio><el-radio
              :value="0">暂停</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary"
          @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="detailVisible" title="任务详情" width="600px">
      <el-descriptions :column="2" border v-if="currentTask">
        <el-descriptions-item label="任务编号">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
        <el-descriptions-item label="任务组名">{{ currentTask.groupName }}</el-descriptions-item>
        <el-descriptions-item label="Cron表达式">{{ currentTask.cronExpression }}</el-descriptions-item>
        <el-descriptions-item label="调用目标" :span="2">{{ currentTask.invokeTarget }}</el-descriptions-item>
        <el-descriptions-item label="下次执行时间">{{ currentTask.nextTime }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag :type="currentTask.status === 1 ? 'success' : 'info'" size="small">{{
          currentTask.status === 1 ? '运行中' : '暂停' }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <el-dialog v-model="logVisible" title="任务执行日志" width="900px">
      <el-table :data="logData" stripe border max-height="400">
        <el-table-column prop="id" label="日志编号" width="80" />
        <el-table-column prop="taskName" label="任务名称" width="150" />
        <el-table-column prop="invokeTarget" label="调用目标" min-width="200" />
        <el-table-column prop="status" label="执行状态" width="90"><template #default="{ row }"><el-tag
              :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '成功' : '失败'
              }}</el-tag></template></el-table-column>
        <el-table-column prop="executeTime" label="执行时间" width="160" />
        <el-table-column prop="duration" label="耗时(ms)" width="90" />
      </el-table>
    </el-dialog>
    <el-dialog v-model="reportVisible" title="任务报表" width="950px">
      <el-tabs>
        <el-tab-pane label="执行统计">
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-col :span="6"><el-card>
                <div class="stat-item">
                  <div class="stat-number">{{ totalTasks }}</div>
                  <div class="stat-label">总任务数</div>
                </div>
              </el-card></el-col>
            <el-col :span="6"><el-card>
                <div class="stat-item">
                  <div class="stat-number" style="color: #67C23A">{{ runningTasks }}</div>
                  <div class="stat-label">运行中</div>
                </div>
              </el-card></el-col>
            <el-col :span="6"><el-card>
                <div class="stat-item">
                  <div class="stat-number" style="color: #E6A23C">{{ pausedTasks }}</div>
                  <div class="stat-label">已暂停</div>
                </div>
              </el-card></el-col>
            <el-col :span="6"><el-card>
                <div class="stat-item">
                  <div class="stat-number" style="color: #909399">{{ failedTasks }}</div>
                  <div class="stat-label">执行失败</div>
                </div>
              </el-card></el-col>
          </el-row>
          <el-table :data="reportTableData" stripe border max-height="400">
            <el-table-column prop="taskName" label="任务名称" width="150" />
            <el-table-column prop="totalCount" label="执行次数" width="100" />
            <el-table-column prop="successCount" label="成功次数" width="100" />
            <el-table-column prop="failCount" label="失败次数" width="100" />
            <el-table-column prop="lastExecuteTime" label="最后执行时间" width="160" />
            <el-table-column prop="avgDuration" label="平均耗时(ms)" width="120" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="执行趋势">
          <div ref="executionTrendChart" style="height: 350px"></div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <el-dialog v-model="executorVisible" title="执行器管理" width="800px">
      <el-form :inline="true" style="margin-bottom: 15px">
        <el-form-item label="执行器名称"><el-input v-model="executorSearch" placeholder="请输入" clearable
            style="width: 200px" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearchExecutor">搜索</el-button></el-form-item>
      </el-form>
      <el-table :data="executorData" stripe border max-height="400">
        <el-table-column prop="name" label="执行器名称" width="120" />
        <el-table-column prop="ipAddress" label="IP地址" width="120" />
        <el-table-column prop="port" label="端口" width="80" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag
              :type="row.status === 'online' ? 'success' : 'danger'" size="small">{{ row.status === 'online' ? '在线' :
              '离线' }}</el-tag></template></el-table-column>
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="lastHeartbeat" label="最后心跳" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small"
              @click="handleConfigExecutor(row)">配置</el-button><el-button type="danger" link size="small"
              @click="handleDeleteExecutor(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
const currentPage = ref(1), pageSize = ref(10), total = ref(20), dialogVisible = ref(false), detailVisible = ref(false), logVisible = ref(false), reportVisible = ref(false), executorVisible = ref(false), isEdit = ref(false), currentTask = ref<any>(null)
const searchForm = reactive({ name: '', group: '', status: '' })
const form = reactive({ name: '', group: 'DEFAULT', invokeTarget: '', cronExpression: '', misfirePolicy: '1', concurrent: '1', status: 1 })
const executorSearch = ref('')
const totalTasks = ref(5)
const runningTasks = ref(3)
const pausedTasks = ref(1)
const failedTasks = ref(5)
const tableData = ref([
  { id: 1, name: '数据同步任务', groupName: 'DATA', invokeTarget: 'com.agri.task.DataSyncTask.execute', cronExpression: '0 0 2 * * ?', status: 1, nextTime: '2024-12-23 02:00:00', createTime: '2024-01-01 00:00:00' },
  { id: 2, name: '系统备份任务', groupName: 'SYSTEM', invokeTarget: 'com.agri.task.BackupTask.run', cronExpression: '0 0 3 * * ?', status: 1, nextTime: '2024-12-23 03:00:00', createTime: '2024-01-01 00:00:00' },
  { id: 3, name: '日志清理任务', groupName: 'SYSTEM', invokeTarget: 'com.agri.task.LogCleanTask.clean', cronExpression: '0 0 4 1 * ?', status: 1, nextTime: '2025-01-01 04:00:00', createTime: '2024-01-01 00:00:00' },
  { id: 4, name: '设备状态检查', groupName: 'DEFAULT', invokeTarget: 'com.agri.task.EquipmentCheckTask.check', cronExpression: '0 0 * * * ?', status: 1, nextTime: '2024-12-22 17:00:00', createTime: '2024-02-15 10:00:00' },
  { id: 5, name: '试剂库存预警', groupName: 'DEFAULT', invokeTarget: 'com.agri.task.ReagentAlertTask.alert', cronExpression: '0 0 8 * * ?', status: 0, nextTime: '-', createTime: '2024-03-01 08:00:00' }
])
const logData = ref([
  { id: 101, taskName: '数据同步任务', invokeTarget: 'com.agri.task.DataSyncTask.execute', status: 1, executeTime: '2024-12-22 02:00:00', duration: 1523 },
  { id: 102, taskName: '系统备份任务', invokeTarget: 'com.agri.task.BackupTask.run', status: 1, executeTime: '2024-12-22 03:00:00', duration: 45632 },
  { id: 103, taskName: '设备状态检查', invokeTarget: 'com.agri.task.EquipmentCheckTask.check', status: 1, executeTime: '2024-12-22 16:00:00', duration: 856 },
  { id: 104, taskName: '设备状态检查', invokeTarget: 'com.agri.task.EquipmentCheckTask.check', status: 0, executeTime: '2024-12-22 15:00:00', duration: 125 }
])
const reportTableData = ref([
  { taskName: '数据同步任务', totalCount: 45, successCount: 44, failCount: 1, lastExecuteTime: '2024-12-22 02:00:00', avgDuration: 1523 },
  { taskName: '系统备份任务', totalCount: 30, successCount: 30, failCount: 0, lastExecuteTime: '2024-12-22 03:00:00', avgDuration: 45632 },
  { taskName: '日志清理任务', totalCount: 12, successCount: 12, failCount: 0, lastExecuteTime: '2024-12-21 04:00:00', avgDuration: 2156 },
  { taskName: '设备状态检查', totalCount: 168, successCount: 163, failCount: 5, lastExecuteTime: '2024-12-22 16:00:00', avgDuration: 856 }
])
const executorData = ref([
  { id: 1, name: '执行器-001', ipAddress: '192.168.1.100', port: 8080, status: 'online', version: '2.5.1', lastHeartbeat: '2024-12-22 14:30:25', taskCount: 12 },
  { id: 2, name: '执行器-002', ipAddress: '192.168.1.101', port: 8080, status: 'online', version: '2.5.1', lastHeartbeat: '2024-12-22 14:30:20', taskCount: 8 },
  { id: 3, name: '执行器-003', ipAddress: '192.168.1.102', port: 8080, status: 'offline', version: '2.5.1', lastHeartbeat: '2024-12-22 12:15:00', taskCount: 0 }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', group: '', status: '' }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { name: '', group: 'DEFAULT', invokeTarget: '', cronExpression: '', misfirePolicy: '1', concurrent: '1', status: 1 }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleStatusChange = (row: any) => ElMessage.success(`任务"${row.name}"已${row.status === 1 ? '启动' : '暂停'}`)
const handleRun = (row: any) => { ElMessageBox.confirm(`确定立即执行任务"${row.name}"吗？`, '提示', { type: 'info' }).then(() => ElMessage.success('任务执行成功')).catch(() => { }) }
const handleView = (row: any) => { currentTask.value = row; detailVisible.value = true }
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除任务"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => { }) }
const handleViewLog = () => { logVisible.value = true }
const handleViewReport = () => { reportVisible.value = true; setTimeout(() => { initReportChart() }, 300) }
const handleExecutor = () => { executorVisible.value = true }
const handleSearchExecutor = () => ElMessage.success('执行器搜索完成')
const handleConfigExecutor = (row: any) => ElMessage.success(`配置执行器${row.name}`)
const handleDeleteExecutor = (row: any) => { ElMessageBox.confirm(`确定删除执行器"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => { }) }
const initReportChart = () => {
  const chartElement = document.querySelector('[style*="height: 350px"]') as HTMLElement
  if (chartElement && chartElement.id !== 'initialized') {
    const chart = echarts.init(chartElement)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value', name: '执行次数' },
      series: [
        { name: '成功', type: 'bar', data: [120, 132, 101, 134, 90, 130, 110], itemStyle: { color: '#67C23A' } },
        { name: '失败', type: 'bar', data: [10, 8, 5, 12, 6, 4, 9], itemStyle: { color: '#F56C6C' } }
      ]
    })
    chartElement.id = 'initialized'
  }
}
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>
.task-manage-page {
  height: 100%;
}

.cron-help {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
}
</style>
