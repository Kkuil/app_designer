<template>
  <div class="role-manage-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="角色名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="权限字符"><el-input v-model="searchForm.key" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="正常" value="1" /><el-option label="停用" value="0" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增角色</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="角色ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="key" label="权限字符" width="150" />
        <el-table-column prop="scope" label="数据权限" width="120">
          <template #default="{ row }"><el-tag>{{ row.scope }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" /></template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleMenu(row)">菜单权限</el-button>
            <el-button type="primary" link size="small" @click="handleData(row)">数据权限</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="角色名称"><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="权限字符"><el-input v-model="form.key" placeholder="请输入" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="1">正常</el-radio><el-radio :label="0">停用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="menuDialogVisible" title="菜单权限" width="500px">
      <el-tree ref="menuTreeRef" :data="menuTreeData" show-checkbox node-key="id" default-expand-all :props="{ label: 'name' }" />
      <template #footer><el-button @click="menuDialogVisible = false">取消</el-button><el-button type="primary" @click="saveMenuPermission">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const dialogVisible = ref(false), menuDialogVisible = ref(false), dialogTitle = ref('新增角色')
const searchForm = reactive({ name: '', key: '', status: '' })
const form = reactive({ id: 0, name: '', key: '', sort: 0, status: 1, remark: '' })
const tableData = ref([
  { id: 1, name: '超级管理员', key: 'admin', scope: '全部数据', sort: 1, status: 1, createTime: '2024-01-01' },
  { id: 2, name: '普通角色', key: 'common', scope: '本部门数据', sort: 2, status: 1, createTime: '2024-01-01' },
  { id: 3, name: '访客', key: 'guest', scope: '仅本人数据', sort: 3, status: 1, createTime: '2024-01-01' }
])
const menuTreeData = ref([
  { id: 1, name: '平台管理', children: [{ id: 11, name: '用户管理' }, { id: 12, name: '角色管理' }, { id: 13, name: '菜单管理' }] },
  { id: 2, name: '实验室设备', children: [{ id: 21, name: '设备台账' }, { id: 22, name: '预约管理' }] }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', key: '', status: '' }); ElMessage.info('已重置') }
const handleAdd = () => { dialogTitle.value = '新增角色'; Object.assign(form, { id: 0, name: '', key: '', sort: 0, status: 1, remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { dialogTitle.value = '编辑角色'; Object.assign(form, row); dialogVisible.value = true }
const handleMenu = (row: any) => { menuDialogVisible.value = true; ElMessage.info(`配置"${row.name}"的菜单权限`) }
const handleData = (row: any) => ElMessage.info(`配置"${row.name}"的数据权限`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleStatusChange = (row: any) => ElMessage.success(`${row.name}已${row.status === 1 ? '启用' : '停用'}`)
const handleSubmit = () => { ElMessage.success(form.id ? '更新成功' : '新增成功'); dialogVisible.value = false }
const saveMenuPermission = () => { ElMessage.success('菜单权限保存成功'); menuDialogVisible.value = false }
</script>
<style scoped>.role-manage-page { height: 100%; }</style>
