<template>
  <div class="online-user-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="用户账号"><el-input v-model="searchForm.username" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="IP地址"><el-input v-model="searchForm.ip" placeholder="请输入" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button><el-button @click="handleRefresh"><el-icon><Refresh /></el-icon>刷新列表</el-button></el-form-item>
      </el-form>
    </div>
    <div class="stats-cards">
      <el-card class="stat-card"><div class="stat-content"><el-icon :size="40" color="#409EFF"><User /></el-icon><div class="stat-info"><span class="stat-value">{{ tableData.length }}</span><span class="stat-label">当前在线人数</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><el-icon :size="40" color="#67C23A"><Monitor /></el-icon><div class="stat-info"><span class="stat-value">5</span><span class="stat-label">PC端在线</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><el-icon :size="40" color="#E6A23C"><Cellphone /></el-icon><div class="stat-info"><span class="stat-value">2</span><span class="stat-label">移动端在线</span></div></div></el-card>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="danger" @click="handleBatchForceLogout"><el-icon><CircleClose /></el-icon>批量强退</el-button></div>
      <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="tokenId" label="会话编号" width="280" />
        <el-table-column prop="username" label="用户账号" width="120" />
        <el-table-column prop="nickname" label="用户昵称" width="120" />
        <el-table-column prop="deptName" label="所属部门" width="150" />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="location" label="登录地点" width="150" />
        <el-table-column prop="browser" label="浏览器" width="120" />
        <el-table-column prop="os" label="操作系统" width="120" />
        <el-table-column prop="loginTime" label="登录时间" min-width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }"><el-button type="danger" link size="small" @click="handleForceLogout(row)">强退</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const selectedRows = ref<any[]>([])
const searchForm = reactive({ username: '', ip: '' })
const tableData = ref([
  { tokenId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', username: 'admin', nickname: '超级管理员', deptName: '系统管理部', ip: '192.168.1.100', location: '北京市 海淀区', browser: 'Chrome 120', os: 'Windows 10', loginTime: '2024-12-22 08:30:00' },
  { tokenId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', username: 'zhangsan', nickname: '张三', deptName: '研发一部', ip: '192.168.1.101', location: '上海市 浦东新区', browser: 'Firefox 121', os: 'macOS 14', loginTime: '2024-12-22 09:15:30' },
  { tokenId: 'c3d4e5f6-a7b8-9012-cdef-123456789012', username: 'lisi', nickname: '李四', deptName: '研发二部', ip: '192.168.1.102', location: '广州市 天河区', browser: 'Edge 120', os: 'Windows 11', loginTime: '2024-12-22 10:20:45' },
  { tokenId: 'd4e5f6a7-b8c9-0123-def1-234567890123', username: 'wangwu', nickname: '王五', deptName: '实验中心', ip: '10.0.0.55', location: '内网', browser: 'Chrome 119', os: 'Linux', loginTime: '2024-12-22 11:05:20' },
  { tokenId: 'e5f6a7b8-c9d0-1234-ef12-345678901234', username: 'zhaoliu', nickname: '赵六', deptName: '设备管理科', ip: '192.168.1.103', location: '深圳市 南山区', browser: 'Safari 17', os: 'iOS 17', loginTime: '2024-12-22 13:45:00' },
  { tokenId: 'f6a7b8c9-d0e1-2345-f123-456789012345', username: 'sunqi', nickname: '孙七', deptName: '试剂管理科', ip: '192.168.1.104', location: '成都市 武侯区', browser: 'Chrome 120', os: 'Android 14', loginTime: '2024-12-22 14:30:15' },
  { tokenId: 'a7b8c9d0-e1f2-3456-0123-567890123456', username: 'zhouba', nickname: '周八', deptName: '项目管理部', ip: '192.168.1.105', location: '杭州市 西湖区', browser: 'Chrome 120', os: 'Windows 10', loginTime: '2024-12-22 15:00:00' }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { username: '', ip: '' }); ElMessage.info('已重置') }
const handleRefresh = () => ElMessage.success('列表已刷新')
const handleForceLogout = (row: any) => { ElMessageBox.confirm(`确定强制退出用户"${row.nickname}"吗？`, '提示', { type: 'warning' }).then(() => { tableData.value = tableData.value.filter(item => item.tokenId !== row.tokenId); ElMessage.success('强退成功') }).catch(() => {}) }
const handleBatchForceLogout = () => { if (selectedRows.value.length === 0) { ElMessage.warning('请选择要强退的用户'); return }; ElMessageBox.confirm(`确定强制退出选中的${selectedRows.value.length}个用户吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('批量强退成功')).catch(() => {}) }
const handleSelectionChange = (rows: any[]) => { selectedRows.value = rows }
</script>
<style scoped>.online-user-page { height: 100%; }.stats-cards { display: flex; gap: 20px; margin-bottom: 20px; }.stat-card { flex: 1; }.stat-content { display: flex; align-items: center; gap: 15px; }.stat-info { display: flex; flex-direction: column; }.stat-value { font-size: 28px; font-weight: bold; color: #303133; }.stat-label { font-size: 14px; color: #909399; }</style>
