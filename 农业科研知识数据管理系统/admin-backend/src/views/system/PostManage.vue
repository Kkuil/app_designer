<template>
  <div class="post-manage-page">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="岗位名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="岗位编码">
          <el-input v-model="searchForm.code" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="正常" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar">
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增岗位</el-button>
        <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
      </div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="岗位ID" width="80" />
        <el-table-column prop="code" label="岗位编码" width="120" />
        <el-table-column prop="name" label="岗位名称" width="150" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" />
      </div>
    </div>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="岗位名称"><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="岗位编码"><el-input v-model="form.code" placeholder="请输入" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="1">正常</el-radio><el-radio :label="0">停用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(50), dialogVisible = ref(false), dialogTitle = ref('新增岗位')
const searchForm = reactive({ name: '', code: '', status: '' })
const form = reactive({ id: 0, name: '', code: '', sort: 0, status: 1, remark: '' })
const tableData = ref([
  { id: 1, code: 'CEO', name: '院长', sort: 1, status: 1, createTime: '2024-01-01' },
  { id: 2, code: 'RESEARCHER', name: '研究员', sort: 2, status: 1, createTime: '2024-01-01' },
  { id: 3, code: 'ASSOCIATE', name: '副研究员', sort: 3, status: 1, createTime: '2024-01-01' },
  { id: 4, code: 'ASSISTANT', name: '助理研究员', sort: 4, status: 1, createTime: '2024-01-01' },
  { id: 5, code: 'TECHNICIAN', name: '技术员', sort: 5, status: 1, createTime: '2024-01-01' }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', code: '', status: '' }); ElMessage.info('已重置') }
const handleAdd = () => { dialogTitle.value = '新增岗位'; Object.assign(form, { id: 0, name: '', code: '', sort: 0, status: 1, remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { dialogTitle.value = '编辑岗位'; Object.assign(form, row); dialogVisible.value = true }
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleExport = () => ElMessage.success('导出成功')
const handleSubmit = () => { ElMessage.success(form.id ? '更新成功' : '新增成功'); dialogVisible.value = false }
</script>
<style scoped>.post-manage-page { height: 100%; }</style>
