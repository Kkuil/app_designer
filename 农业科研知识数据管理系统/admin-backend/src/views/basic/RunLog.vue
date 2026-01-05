<template>
  <div class="run-log-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="日志级别"><el-select v-model="searchForm.level" placeholder="全部" clearable><el-option label="INFO" value="INFO" /><el-option label="WARN" value="WARN" /><el-option label="ERROR" value="ERROR" /><el-option label="DEBUG" value="DEBUG" /></el-select></el-form-item>
        <el-form-item label="日志来源"><el-input v-model="searchForm.source" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="关键词"><el-input v-model="searchForm.keyword" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="时间范围"><el-date-picker v-model="searchForm.dateRange" type="datetimerange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="stats-bar">
      <el-tag type="primary" size="large">总计: {{ tableData.length }}</el-tag>
      <el-tag type="success" size="large">INFO: {{ tableData.filter(r => r.level === 'INFO').length }}</el-tag>
      <el-tag type="warning" size="large">WARN: {{ tableData.filter(r => r.level === 'WARN').length }}</el-tag>
      <el-tag type="danger" size="large">ERROR: {{ tableData.filter(r => r.level === 'ERROR').length }}</el-tag>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="danger" @click="handleClear"><el-icon><Delete /></el-icon>清空日志</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出日志</el-button><el-button @click="handleRefresh"><el-icon><Refresh /></el-icon>刷新</el-button></div>
      <el-table :data="tableData" stripe border row-key="id" :row-class-name="getRowClass">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="80"><template #default="{ row }"><el-tag :type="getLevelType(row.level)" size="small">{{ row.level }}</el-tag></template></el-table-column>
        <el-table-column prop="source" label="来源" width="200" />
        <el-table-column prop="message" label="日志内容" min-width="300" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[20, 50, 100, 200]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" title="日志详情" width="800px">
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="日志编号">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="记录时间">{{ currentLog.time }}</el-descriptions-item>
        <el-descriptions-item label="日志级别"><el-tag :type="getLevelType(currentLog.level)" size="small">{{ currentLog.level }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="日志来源">{{ currentLog.source }}</el-descriptions-item>
        <el-descriptions-item label="线程名称">{{ currentLog.thread }}</el-descriptions-item>
        <el-descriptions-item label="日志内容"><pre style="white-space: pre-wrap; word-break: break-all; margin: 0">{{ currentLog.message }}</pre></el-descriptions-item>
        <el-descriptions-item label="堆栈信息" v-if="currentLog.stackTrace"><pre style="white-space: pre-wrap; word-break: break-all; margin: 0; color: #F56C6C">{{ currentLog.stackTrace }}</pre></el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(20), total = ref(500), dialogVisible = ref(false), currentLog = ref<any>(null)
const searchForm = reactive({ level: '', source: '', keyword: '', dateRange: null })
const tableData = ref([
  { id: 1001, time: '2024-12-22 16:30:25.123', level: 'INFO', source: 'com.agri.controller.UserController', message: '用户登录成功，用户名：admin，IP：192.168.1.100', thread: 'http-nio-8080-exec-1', stackTrace: '' },
  { id: 1002, time: '2024-12-22 16:28:15.456', level: 'INFO', source: 'com.agri.service.EquipmentService', message: '设备状态检查完成，在线设备：45，离线设备：3', thread: 'scheduled-task-1', stackTrace: '' },
  { id: 1003, time: '2024-12-22 16:25:42.789', level: 'WARN', source: 'com.agri.service.ReagentService', message: '试剂库存预警：无水乙醇当前库存低于安全库存，当前：50L，安全库存：100L', thread: 'scheduled-task-2', stackTrace: '' },
  { id: 1004, time: '2024-12-22 16:20:33.012', level: 'ERROR', source: 'com.agri.controller.ProjectController', message: '项目创建失败：java.lang.NullPointerException: 项目负责人不能为空', thread: 'http-nio-8080-exec-5', stackTrace: 'java.lang.NullPointerException: 项目负责人不能为空\n\tat com.agri.service.ProjectService.create(ProjectService.java:45)\n\tat com.agri.controller.ProjectController.add(ProjectController.java:32)' },
  { id: 1005, time: '2024-12-22 16:15:18.345', level: 'DEBUG', source: 'com.agri.mapper.DataMapper', message: 'Executing SQL: SELECT * FROM t_data WHERE status = 1 ORDER BY create_time DESC LIMIT 10', thread: 'http-nio-8080-exec-3', stackTrace: '' },
  { id: 1006, time: '2024-12-22 16:10:55.678', level: 'INFO', source: 'com.agri.task.DataSyncTask', message: '数据同步任务开始执行', thread: 'scheduled-task-1', stackTrace: '' },
  { id: 1007, time: '2024-12-22 16:05:22.901', level: 'WARN', source: 'com.agri.filter.SecurityFilter', message: '检测到异常登录尝试，IP：10.0.0.99，账号：test，连续失败3次', thread: 'http-nio-8080-exec-8', stackTrace: '' }
])
const getLevelType = (level: string) => { const m: Record<string, string> = { INFO: 'primary', WARN: 'warning', ERROR: 'danger', DEBUG: 'info' }; return m[level] || 'info' }
const getRowClass = ({ row }: any) => row.level === 'ERROR' ? 'error-row' : row.level === 'WARN' ? 'warn-row' : ''
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { level: '', source: '', keyword: '', dateRange: null }); ElMessage.info('已重置') }
const handleClear = () => { ElMessageBox.confirm('确定清空所有运行日志吗？此操作不可恢复！', '警告', { type: 'warning' }).then(() => ElMessage.success('清空成功')).catch(() => {}) }
const handleExport = () => ElMessage.success('日志导出成功')
const handleRefresh = () => ElMessage.success('已刷新')
const handleView = (row: any) => { currentLog.value = row; dialogVisible.value = true }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.run-log-page { height: 100%; }.stats-bar { margin-bottom: 15px; display: flex; gap: 15px; }:deep(.error-row) { background-color: #fef0f0 !important; }:deep(.warn-row) { background-color: #fdf6ec !important; }</style>
