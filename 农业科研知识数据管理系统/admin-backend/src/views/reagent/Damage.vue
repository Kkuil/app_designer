<template>
  <div class="reagent-damage-page">
    <el-card>
      <template #header>
        <div class="card-header"><span>报损管理</span><el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新增报损</el-button></div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="试剂名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="待审核" value="pending" /><el-option label="已通过" value="approved" /><el-option label="已驳回" value="rejected" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="报损单号" width="140" />
        <el-table-column prop="name" label="试剂名称" min-width="140" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="reason" label="报损原因" min-width="180" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="date" label="申请日期" width="140" />
        <el-table-column label="操作" width="180" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleApprove(row)">审批</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="新增报损" width="600px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="试剂名称"><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.spec" placeholder="如 500mL" /></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="form.quantity" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="报损原因"><el-input v-model="form.reason" type="textarea" rows="3" placeholder="说明原因" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const filters = reactive({ name: '', status: '' })
const tableData = ref([
  { code: 'BS202412001', name: '浓硫酸', spec: '2.5L', quantity: 1, reason: '瓶身破损', status: 'pending', statusName: '待审核', date: '2024-12-22' },
  { code: 'BS202412002', name: '甲醇(色谱纯)', spec: '4L', quantity: 1, reason: '过期', status: 'approved', statusName: '已通过', date: '2024-12-20' }
])
const dialogVisible = ref(false)
const form = reactive({ name: '', spec: '', quantity: 1, reason: '' })

const getStatusType = (status: string) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[status] || 'info')
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { name: '', status: '' }); ElMessage.info('已重置') }
const handleCreate = () => { Object.assign(form, { name: '', spec: '', quantity: 1, reason: '' }); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('提交成功') }
const handleApprove = (row: any) => ElMessage.success(`审批报损单 ${row.code}`)
const handleView = (row: any) => ElMessage.info(`查看报损单 ${row.code}`)
</script>

<style scoped>
.reagent-damage-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
</style>
