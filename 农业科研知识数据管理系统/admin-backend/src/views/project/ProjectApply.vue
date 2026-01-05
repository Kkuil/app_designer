<template>
  <div class="project-apply-page">
    <el-card>
      <template #header>
        <div class="card-header"><span>项目申报</span><el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建申报</el-button></div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="项目名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="草稿" value="draft" /><el-option label="审核中" value="review" /><el-option label="已通过" value="approved" /><el-option label="退回" value="rejected" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="项目编号" width="140" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="leader" label="负责人" width="100" />
        <el-table-column prop="budget" label="预算(¥)" width="120" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="date" label="申报日期" width="140" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="新建申报" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="项目名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="负责人"><el-input v-model="form.leader" /></el-form-item>
        <el-form-item label="预算(¥)"><el-input-number v-model="form.budget" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="研究方向"><el-select v-model="form.field" placeholder="请选择" style="width: 100%"><el-option label="作物" value="crop" /><el-option label="畜牧" value="animal" /><el-option label="植保" value="plant" /></el-select></el-form-item>
        <el-form-item label="摘要"><el-input v-model="form.summary" type="textarea" rows="3" /></el-form-item>
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
  { code: 'XM202412001', name: '智慧农机监测', leader: '张三', budget: 1200000, status: 'review', statusName: '审核中', date: '2024-12-20' },
  { code: 'XM202412002', name: '玉米耐旱品种选育', leader: '李四', budget: 2000000, status: 'approved', statusName: '已通过', date: '2024-12-15' }
])
const dialogVisible = ref(false)
const form = reactive({ name: '', leader: '', budget: 0, field: '', summary: '' })

const getStatusType = (status: string) => ({ draft: 'info', review: 'warning', approved: 'success', rejected: 'danger' }[status] || 'info')
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { name: '', status: '' }); ElMessage.info('已重置') }
const handleCreate = () => { Object.assign(form, { name: '', leader: '', budget: 0, field: '', summary: '' }); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('提交成功') }
const handleEdit = (row: any) => ElMessage.success(`编辑 ${row.code}`)
const handleView = (row: any) => ElMessage.info(`查看 ${row.code}`)
</script>

<style scoped>
.project-apply-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
</style>
