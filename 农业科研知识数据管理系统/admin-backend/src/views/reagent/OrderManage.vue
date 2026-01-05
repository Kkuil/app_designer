<template>
  <div class="reagent-order-page">
    <el-card>
      <template #header>
        <div class="card-header"><span>采购订单</span><el-button type="primary" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button></div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="订单号"><el-input v-model="filters.code" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="供应商"><el-input v-model="filters.supplier" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="待收货" value="pending" /><el-option label="部分收货" value="partial" /><el-option label="已完成" value="done" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="订单号" width="140" />
        <el-table-column prop="supplier" label="供应商" min-width="140" />
        <el-table-column prop="items" label="品项" width="80" />
        <el-table-column prop="amount" label="金额(¥)" width="120" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="eta" label="预计到货" width="140" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleReceive(row)">收货</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const filters = reactive({ code: '', supplier: '', status: '' })
const tableData = ref([
  { code: 'DD202412001', supplier: '国药集团', items: 5, amount: 5620, status: 'pending', statusName: '待收货', eta: '2024-12-27' },
  { code: 'DD202412002', supplier: 'Fisher', items: 3, amount: 2980, status: 'partial', statusName: '部分收货', eta: '2024-12-25' },
  { code: 'DD202412003', supplier: 'Sigma', items: 2, amount: 1650, status: 'done', statusName: '已完成', eta: '2024-12-20' }
])

const getStatusType = (status: string) => ({ pending: 'warning', partial: 'info', done: 'success' }[status] || 'info')
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { code: '', supplier: '', status: '' }); ElMessage.info('已重置') }
const handleExport = () => ElMessage.success('导出成功')
const handleReceive = (row: any) => ElMessage.success(`处理收货 ${row.code}`)
const handleView = (row: any) => ElMessage.info(`查看订单 ${row.code}`)
</script>

<style scoped>
.reagent-order-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
</style>
