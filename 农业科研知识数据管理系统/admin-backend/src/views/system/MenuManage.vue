<template>
  <div class="menu-manage-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="菜单名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="正常" value="1" /><el-option label="停用" value="0" />
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
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增菜单</el-button>
        <el-button @click="toggleExpand"><el-icon><Sort /></el-icon>{{ isExpand ? '折叠' : '展开' }}</el-button>
      </div>
      <el-table :data="tableData" row-key="id" :default-expand-all="isExpand" border>
        <el-table-column prop="name" label="菜单名称" min-width="150" />
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }"><el-icon v-if="row.icon"><component :is="row.icon" /></el-icon></template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'M' ? 'primary' : row.type === 'C' ? 'success' : 'warning'" size="small">
              {{ row.type === 'M' ? '目录' : row.type === 'C' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" width="150" />
        <el-table-column prop="path" label="路由地址" width="150" />
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '停用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleAdd(row)">新增</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24"><el-form-item label="上级菜单"><el-tree-select v-model="form.parentId" :data="menuTree" placeholder="请选择" style="width: 100%" check-strictly /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="菜单类型"><el-radio-group v-model="form.type"><el-radio label="M">目录</el-radio><el-radio label="C">菜单</el-radio><el-radio label="F">按钮</el-radio></el-radio-group></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="菜单图标"><el-input v-model="form.icon" placeholder="请输入图标名称" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="菜单名称"><el-input v-model="form.name" placeholder="请输入" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.type !== 'F'">
          <el-col :span="12"><el-form-item label="路由地址"><el-input v-model="form.path" placeholder="请输入" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组件路径"><el-input v-model="form.component" placeholder="请输入" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.type === 'F'">
          <el-col :span="12"><el-form-item label="权限标识"><el-input v-model="form.permission" placeholder="请输入" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="1">正常</el-radio><el-radio :label="0">停用</el-radio></el-radio-group></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const isExpand = ref(true), dialogVisible = ref(false), dialogTitle = ref('新增菜单')
const searchForm = reactive({ name: '', status: '' })
const form = reactive({ id: 0, parentId: '', type: 'C', name: '', icon: '', path: '', component: '', permission: '', sort: 0, status: 1 })
const menuTree = ref([{ value: '0', label: '根目录' }])
const tableData = ref([
  { id: 1, name: '平台管理', icon: 'Setting', type: 'M', permission: '', path: '/system', sort: 1, status: 1, children: [
    { id: 11, name: '用户管理', icon: 'User', type: 'C', permission: 'system:user:list', path: 'user', sort: 1, status: 1, children: [
      { id: 111, name: '用户查询', type: 'F', permission: 'system:user:query', sort: 1, status: 1 },
      { id: 112, name: '用户新增', type: 'F', permission: 'system:user:add', sort: 2, status: 1 },
      { id: 113, name: '用户修改', type: 'F', permission: 'system:user:edit', sort: 3, status: 1 },
      { id: 114, name: '用户删除', type: 'F', permission: 'system:user:delete', sort: 4, status: 1 }
    ]},
    { id: 12, name: '角色管理', icon: 'UserFilled', type: 'C', permission: 'system:role:list', path: 'role', sort: 2, status: 1 },
    { id: 13, name: '菜单管理', icon: 'Menu', type: 'C', permission: 'system:menu:list', path: 'menu', sort: 3, status: 1 }
  ]},
  { id: 2, name: '实验室设备', icon: 'Monitor', type: 'M', permission: '', path: '/lab', sort: 2, status: 1, children: [
    { id: 21, name: '设备台账', icon: 'List', type: 'C', permission: 'lab:equipment:list', path: 'equipment', sort: 1, status: 1 }
  ]}
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', status: '' }); ElMessage.info('已重置') }
const toggleExpand = () => { isExpand.value = !isExpand.value; ElMessage.info(isExpand.value ? '已展开' : '已折叠') }
const handleAdd = (row?: any) => { dialogTitle.value = '新增菜单'; Object.assign(form, { id: 0, parentId: row?.id || '', type: 'C', name: '', icon: '', path: '', component: '', permission: '', sort: 0, status: 1 }); dialogVisible.value = true }
const handleEdit = (row: any) => { dialogTitle.value = '编辑菜单'; Object.assign(form, row); dialogVisible.value = true }
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleSubmit = () => { ElMessage.success(form.id ? '更新成功' : '新增成功'); dialogVisible.value = false }
</script>
<style scoped>.menu-manage-page { height: 100%; }</style>
