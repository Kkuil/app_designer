<template>
  <div class="notice-manage-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="公告标题"><el-input v-model="searchForm.title" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="公告类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="通知" value="1" /><el-option label="公告" value="2" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="正常" value="1" /><el-option label="关闭" value="0" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增公告</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="序号" width="60" />
        <el-table-column prop="title" label="公告标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="公告类型" width="100"><template #default="{ row }"><el-tag :type="row.type === '1' ? 'warning' : 'success'" size="small">{{ row.type === '1' ? '通知' : '公告' }}</el-tag></template></el-table-column>
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '正常' : '关闭' }}</el-tag></template></el-table-column>
        <el-table-column prop="createBy" label="创建者" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="primary" link size="small" @click="handleView(row)">查看</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" /></div>
    </div>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="公告标题"><el-input v-model="form.title" placeholder="请输入" /></el-form-item>
        <el-form-item label="公告类型"><el-select v-model="form.type" style="width: 100%"><el-option label="通知" value="1" /><el-option label="公告" value="2" /></el-select></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="1">正常</el-radio><el-radio :label="0">关闭</el-radio></el-radio-group></el-form-item>
        <el-form-item label="公告内容"><el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入公告内容" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(30), dialogVisible = ref(false), dialogTitle = ref('新增公告')
const searchForm = reactive({ title: '', type: '', status: '' })
const form = reactive({ id: 0, title: '', type: '2', status: 1, content: '' })
const tableData = ref([
  { id: 1, title: '系统V2.0版本正式上线公告', type: '2', status: 1, createBy: '管理员', createTime: '2024-12-20 10:00:00' },
  { id: 2, title: '关于年终科研成果统计的通知', type: '1', status: 1, createBy: '管理员', createTime: '2024-12-18 14:30:00' },
  { id: 3, title: '元旦假期系统维护通知', type: '1', status: 1, createBy: '管理员', createTime: '2024-12-15 09:00:00' },
  { id: 4, title: '新版移动端APP发布公告', type: '2', status: 1, createBy: '管理员', createTime: '2024-12-10 11:00:00' },
  { id: 5, title: '实验室安全培训通知', type: '1', status: 0, createBy: '管理员', createTime: '2024-12-05 16:00:00' }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { title: '', type: '', status: '' }); ElMessage.info('已重置') }
const handleAdd = () => { dialogTitle.value = '新增公告'; Object.assign(form, { id: 0, title: '', type: '2', status: 1, content: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { dialogTitle.value = '编辑公告'; Object.assign(form, row); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.info(`查看公告: ${row.title}`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除"${row.title}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleSubmit = () => { ElMessage.success('保存成功'); dialogVisible.value = false }
</script>
<style scoped>.notice-manage-page { height: 100%; }</style>
