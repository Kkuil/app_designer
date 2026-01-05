<template>
  <div class="oper-log-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="系统模块"><el-input v-model="searchForm.module" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="操作人员"><el-input v-model="searchForm.operator" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="操作类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="新增" value="1" /><el-option label="修改" value="2" /><el-option label="删除" value="3" /><el-option label="查询" value="4" /><el-option label="导出" value="5" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="成功" value="1" /><el-option label="失败" value="0" /></el-select></el-form-item>
        <el-form-item label="操作时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="danger" @click="handleClean"><el-icon><Delete /></el-icon>清空</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="日志编号" width="80" />
        <el-table-column prop="module" label="系统模块" width="120" />
        <el-table-column prop="type" label="操作类型" width="80"><template #default="{ row }"><el-tag :type="getTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag></template></el-table-column>
        <el-table-column prop="operator" label="操作人员" width="100" />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="location" label="操作地点" width="120" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '成功' : '失败' }}</el-tag></template></el-table-column>
        <el-table-column prop="operTime" label="操作时间" min-width="160" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" title="操作日志详情" width="700px">
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="日志编号">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="系统模块">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ currentLog.typeName }}</el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ currentLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作地点">{{ currentLog.location }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog.operTime }}</el-descriptions-item>
        <el-descriptions-item label="操作状态"><el-tag :type="currentLog.status === 1 ? 'success' : 'danger'" size="small">{{ currentLog.status === 1 ? '成功' : '失败' }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="请求方法" :span="2">{{ currentLog.method }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">{{ currentLog.params }}</el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">{{ currentLog.result }}</el-descriptions-item>
        <el-descriptions-item label="异常信息" :span="2" v-if="currentLog.errorMsg"><el-alert :title="currentLog.errorMsg" type="error" :closable="false" /></el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(200), dialogVisible = ref(false), currentLog = ref<any>(null)
const searchForm = reactive({ module: '', operator: '', type: '', status: '', dateRange: null })
const tableData = ref([
  { id: 1001, module: '用户管理', type: '1', typeName: '新增', operator: '管理员', ip: '192.168.1.100', location: '北京市', status: 1, operTime: '2024-12-22 14:30:25', method: 'POST /api/system/user', params: '{"username":"test"}', result: '{"code":200}', errorMsg: '' },
  { id: 1002, module: '角色管理', type: '2', typeName: '修改', operator: '管理员', ip: '192.168.1.100', location: '北京市', status: 1, operTime: '2024-12-22 14:25:18', method: 'PUT /api/system/role', params: '{"id":1}', result: '{"code":200}', errorMsg: '' },
  { id: 1003, module: '设备管理', type: '3', typeName: '删除', operator: '张三', ip: '192.168.1.101', location: '上海市', status: 1, operTime: '2024-12-22 13:45:30', method: 'DELETE /api/lab/equipment/5', params: '{}', result: '{"code":200}', errorMsg: '' },
  { id: 1004, module: '试剂管理', type: '5', typeName: '导出', operator: '李四', ip: '192.168.1.102', location: '广州市', status: 1, operTime: '2024-12-22 11:20:15', method: 'GET /api/reagent/export', params: '{}', result: '文件下载成功', errorMsg: '' },
  { id: 1005, module: '项目管理', type: '1', typeName: '新增', operator: '王五', ip: '192.168.1.103', location: '深圳市', status: 0, operTime: '2024-12-22 10:15:42', method: 'POST /api/project', params: '{"name":"test"}', result: '{"code":500,"msg":"参数错误"}', errorMsg: '系统异常：请求参数格式错误，缺少必填字段name' }
])
const getTypeTag = (type: string) => { const m: Record<string, string> = { '1': 'success', '2': 'primary', '3': 'danger', '4': 'info', '5': 'warning' }; return m[type] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { module: '', operator: '', type: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleClean = () => { ElMessageBox.confirm('确定清空所有操作日志吗？', '警告', { type: 'warning' }).then(() => ElMessage.success('清空成功')).catch(() => {}) }
const handleExport = () => ElMessage.success('导出成功')
const handleView = (row: any) => { currentLog.value = row; dialogVisible.value = true }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.oper-log-page { height: 100%; }</style>
