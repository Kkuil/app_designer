<template>
  <div class="user-manage-page">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="正常" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-tree-select v-model="searchForm.deptId" :data="deptOptions" placeholder="请选择部门" clearable
            check-strictly />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon>
              <Search />
            </el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon>
              <Refresh />
            </el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <div class="action-bar">
        <div>
          <el-button type="primary" @click="handleAdd"><el-icon>
              <Plus />
            </el-icon>新增用户</el-button>
          <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete"><el-icon>
              <Delete />
            </el-icon>批量删除</el-button>
          <el-button type="success" @click="handleExport"><el-icon>
              <Download />
            </el-icon>导出</el-button>
        </div>
        <el-button @click="handleRefresh"><el-icon>
            <Refresh />
          </el-icon></el-button>
      </div>

      <el-table :data="tableData" stripe border @selection-change="handleSelectionChange" v-loading="loading">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="100" />
        <el-table-column prop="dept" label="部门" width="120" />
        <el-table-column prop="position" label="岗位" width="120">
          <template #default="{ row }">
            <span>{{ row.position || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="role" label="角色" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="deptId">
              <el-tree-select v-model="form.deptId" :data="deptOptions" placeholder="请选择部门" style="width: 100%"
                check-strictly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位" prop="postId">
              <el-select v-model="form.postId" placeholder="请选择岗位" style="width: 100%">
                <el-option label="研究员" value="1" />
                <el-option label="副研究员" value="2" />
                <el-option label="助理研究员" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="roleId">
              <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
                <el-option label="管理员" value="1" />
                <el-option label="普通用户" value="2" />
                <el-option label="访客" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedIds = ref<number[]>([])
const formRef = ref<FormInstance>()

const searchForm = reactive({
  username: '',
  phone: '',
  status: '',
  deptId: ''
})

const form = reactive({
  id: 0,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  deptId: '',
  postId: '',
  roleId: '',
  status: 1,
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const deptOptions = ref([
  {
    value: '1', label: '农业研究院', children: [
      { value: '1-1', label: '作物研究所' },
      { value: '1-2', label: '植物保护所' },
      { value: '1-3', label: '土壤肥料所' }
    ]
  },
  {
    value: '2', label: '畜牧研究院', children: [
      { value: '2-1', label: '动物营养所' },
      { value: '2-2', label: '遗传育种所' }
    ]
  }
])

const tableData = ref([
  { id: 1, position: "研究员", username: 'admin', nickname: '管理员', dept: '农业研究院', phone: '13800138001', email: 'admin@example.com', role: '管理员', status: 1, createTime: '2024-01-01 10:00:00' },
  { id: 2, position: "研究员", username: 'zhangsan', nickname: '张三', dept: '作物研究所', phone: '13800138002', email: 'zhangsan@example.com', role: '研究员', status: 1, createTime: '2024-03-15 14:30:00' },
  { id: 3, position: "研究员", username: 'lisi', nickname: '李四', dept: '植物保护所', phone: '13800138003', email: 'lisi@example.com', role: '研究员', status: 1, createTime: '2024-05-20 09:15:00' },
  { id: 4, position: "研究员", username: 'wangwu', nickname: '王五', dept: '土壤肥料所', phone: '13800138004', email: 'wangwu@example.com', role: '普通用户', status: 0, createTime: '2024-06-10 16:45:00' },
  { id: 5, position: "研究员", username: 'zhaoliu', nickname: '赵六', dept: '动物营养所', phone: '13800138005', email: 'zhaoliu@example.com', role: '普通用户', status: 1, createTime: '2024-08-22 11:20:00' }
])

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  Object.assign(searchForm, { username: '', phone: '', status: '', deptId: '' })
  ElMessage.info('搜索条件已重置')
}

const handleAdd = () => {
  dialogTitle.value = '新增用户'
  Object.assign(form, { id: 0, username: '', nickname: '', phone: '', email: '', deptId: '', postId: '', roleId: '', status: 1, remark: '' })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑用户'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除用户"${row.username}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => { })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}个用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
  }).catch(() => { })
}

const handleResetPwd = (row: any) => {
  ElMessageBox.confirm(`确定重置用户"${row.username}"的密码吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置为123456')
  }).catch(() => { })
}

const handleStatusChange = (row: any) => {
  const status = row.status === 1 ? '启用' : '停用'
  ElMessage.success(`${row.username}已${status}`)
}

const handleExport = () => {
  ElMessage.success('正在导出数据...')
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

const handleSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map(row => row.id)
}

const handleSizeChange = () => {
  ElMessage.info(`每页显示${pageSize.value}条`)
}

const handleCurrentChange = () => {
  ElMessage.info(`跳转到第${currentPage.value}页`)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(form.id ? '更新成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.user-manage-page {
  height: 100%;
}
</style>
