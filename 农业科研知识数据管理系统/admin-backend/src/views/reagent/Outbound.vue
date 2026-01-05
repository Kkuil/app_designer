<template>
  <div class="reagent-outbound-page">
    <el-card>
      <template #header>
        <div class="card-header"><span>领用管理</span><el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新增领用</el-button></div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="领用人"><el-input v-model="filters.user" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="试剂名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="待领取" value="pending" /><el-option label="已领取" value="done" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="领用单号" width="140" />
        <el-table-column prop="name" label="试剂名称" min-width="140" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="user" label="领用人" width="100" />
        <el-table-column prop="purpose" label="用途" min-width="160" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'done' ? 'success' : 'warning'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="date" label="申请日期" width="140" />
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleConfirm(row)" :disabled="row.status === 'done'">确认领用</el-button><el-button type="info" link size="small" @click="handlePrint(row)">打印</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="新增领用" width="600px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="试剂名称"><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.spec" placeholder="如 500mL" /></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="form.quantity" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="领用人"><el-input v-model="form.user" placeholder="请输入" /></el-form-item>
        <el-form-item label="用途"><el-input v-model="form.purpose" type="textarea" rows="3" placeholder="请输入用途" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const filters = reactive({ user: '', name: '', status: '' })
const tableData = ref([
  { code: 'LY202412001', name: '无水乙醇', spec: '500mL', quantity: 1, user: '张三', purpose: '样品清洗', status: 'pending', statusName: '待领取', date: '2024-12-22' },
  { code: 'LY202412002', name: 'Tris缓冲液', spec: '500g', quantity: 1, user: '李四', purpose: '缓冲液配制', status: 'done', statusName: '已领取', date: '2024-12-21' }
])
const dialogVisible = ref(false)
const form = reactive({ name: '', spec: '', quantity: 1, user: '', purpose: '' })

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { user: '', name: '', status: '' }); ElMessage.info('已重置') }
const handleCreate = () => { Object.assign(form, { name: '', spec: '', quantity: 1, user: '', purpose: '' }); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('提交成功') }
const handleConfirm = (row: any) => ElMessage.success(`已确认 ${row.code}`)
const handlePrint = (row: any) => ElMessage.info(`打印领用单 ${row.code}`)
</script>

<style scoped>
.reagent-outbound-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
</style>
