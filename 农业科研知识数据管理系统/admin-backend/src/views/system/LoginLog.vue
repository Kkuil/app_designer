<template>
  <div class="login-log-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="登录账号"><el-input v-model="searchForm.username" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="IP地址"><el-input v-model="searchForm.ip" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="登录状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="成功" value="1" /><el-option label="失败" value="0" /></el-select></el-form-item>
        <el-form-item label="登录时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="danger" @click="handleClean"><el-icon><Delete /></el-icon>清空</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button><el-button type="info" @click="handleUnlock"><el-icon><Unlock /></el-icon>解锁</el-button></div>
      <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="访问编号" width="80" />
        <el-table-column prop="username" label="登录账号" width="120" />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="location" label="登录地点" width="150" />
        <el-table-column prop="browser" label="浏览器" width="150" />
        <el-table-column prop="os" label="操作系统" width="120" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '成功' : '失败' }}</el-tag></template></el-table-column>
        <el-table-column prop="msg" label="提示消息" min-width="150" />
        <el-table-column prop="loginTime" label="登录时间" width="160" />
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(500), selectedRows = ref<any[]>([])
const searchForm = reactive({ username: '', ip: '', status: '', dateRange: null })
const tableData = ref([
  { id: 2001, username: 'admin', ip: '192.168.1.100', location: '北京市 海淀区', browser: 'Chrome 120.0.0', os: 'Windows 10', status: 1, msg: '登录成功', loginTime: '2024-12-22 15:30:00' },
  { id: 2002, username: 'zhangsan', ip: '192.168.1.101', location: '上海市 浦东新区', browser: 'Firefox 121.0', os: 'Windows 11', status: 1, msg: '登录成功', loginTime: '2024-12-22 14:45:30' },
  { id: 2003, username: 'lisi', ip: '192.168.1.102', location: '广州市 天河区', browser: 'Edge 120.0.0', os: 'macOS 14', status: 1, msg: '登录成功', loginTime: '2024-12-22 13:20:15' },
  { id: 2004, username: 'wangwu', ip: '192.168.1.103', location: '深圳市 南山区', browser: 'Safari 17.2', os: 'iOS 17', status: 0, msg: '密码错误', loginTime: '2024-12-22 12:10:45' },
  { id: 2005, username: 'test', ip: '192.168.1.104', location: '成都市 武侯区', browser: 'Chrome 119.0.0', os: 'Android 14', status: 0, msg: '账号已锁定', loginTime: '2024-12-22 11:05:20' },
  { id: 2006, username: 'admin', ip: '10.0.0.1', location: '内网IP', browser: 'Chrome 120.0.0', os: 'Linux', status: 1, msg: '登录成功', loginTime: '2024-12-22 10:00:00' }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { username: '', ip: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleClean = () => { ElMessageBox.confirm('确定清空所有登录日志吗？', '警告', { type: 'warning' }).then(() => ElMessage.success('清空成功')).catch(() => {}) }
const handleExport = () => ElMessage.success('导出成功')
const handleUnlock = () => { if (selectedRows.value.length === 0) { ElMessage.warning('请选择要解锁的用户'); return }; ElMessage.success(`已解锁${selectedRows.value.length}个用户`) }
const handleSelectionChange = (rows: any[]) => { selectedRows.value = rows }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.login-log-page { height: 100%; }</style>
