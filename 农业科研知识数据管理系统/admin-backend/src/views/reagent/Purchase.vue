<template>
  <div class="reagent-purchase-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>申购管理</span>
          <div class="actions">
            <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增申购</el-button>
            <el-button @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="试剂名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="待审批" value="pending" /><el-option label="已通过" value="approved" /><el-option label="已驳回" value="rejected" /><el-option label="已采购" value="ordered" /></el-select></el-form-item>
        <el-form-item label="申请人"><el-input v-model="filters.applicant" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="通过时间"><el-date-picker v-model="filters.approveTimeRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="申购单号" width="120" />
        <el-table-column prop="name" label="试剂名称" min-width="150" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="budget" label="预算(¥)" width="100" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="time" label="申请时间" width="140" />
        <el-table-column prop="approveTime" label="通过时间" width="140" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleApprove(row)">审批</el-button><el-button type="success" link size="small" @click="handleOrder(row)">生成订单</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="新增申购" width="600px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="试剂名称"><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.spec" placeholder="如 500mL" /></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="form.quantity" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="预算(¥)"><el-input-number v-model="form.budget" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="用途"><el-input v-model="form.purpose" type="textarea" rows="3" placeholder="说明用途" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const filters = reactive({ name: '', status: '', applicant: '', approveTimeRange: null })
const tableData = ref([
  { code: 'PG202412001', name: '无水乙醇', spec: '500mL', quantity: 10, budget: 350, applicant: '张三', status: 'pending', statusName: '待审批', time: '2024-12-21 10:00', approveTime: '' },
  { code: 'PG202412002', name: '甲醇(色谱纯)', spec: '4L', quantity: 2, budget: 560, applicant: '李四', status: 'approved', statusName: '已通过', time: '2024-12-20 14:32', approveTime: '2024-12-21 09:15' },
  { code: 'PG202412003', name: 'Tris缓冲液', spec: '500g', quantity: 3, budget: 1560, applicant: '王五', status: 'ordered', statusName: '已采购', time: '2024-12-19 09:18', approveTime: '2024-12-20 10:30' }
])
const form = reactive({ name: '', spec: '', quantity: 1, budget: 0, purpose: '' })

const getStatusType = (status: string) => ({ pending: 'warning', approved: 'success', rejected: 'danger', ordered: 'info' }[status] || 'info')
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { name: '', status: '', applicant: '', approveTimeRange: null }); ElMessage.info('已重置') }
const handleAdd = () => { Object.assign(form, { name: '', spec: '', quantity: 1, budget: 0, purpose: '' }); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('提交成功') }
const handleApprove = (row: any) => ElMessage.success(`审批申购单 ${row.code}`)
const handleOrder = (row: any) => ElMessage.success(`为 ${row.name} 生成采购订单`)
const handleExport = () => ElMessage.success('导出成功')
</script>

<style scoped>
.reagent-purchase-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 10px; }
.filter-bar { margin-bottom: 10px; }
</style>
