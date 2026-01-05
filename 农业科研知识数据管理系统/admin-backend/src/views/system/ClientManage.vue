<template>
  <div class="client-manage-page">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="客户端名称">
          <el-input v-model="searchForm.name" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="客户端类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="PC端" value="pc" />
            <el-option label="小程序" value="mini" />
            <el-option label="APP" value="app" />
            <el-option label="H5" value="h5" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="启用" value="1" />
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
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增客户端</el-button>
      </div>

      <el-table :data="tableData" stripe border v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="clientId" label="客户端ID" width="150" />
        <el-table-column prop="name" label="客户端名称" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="loginMethods" label="登录方式" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="method in row.loginMethods" :key="method" size="small" style="margin-right: 5px;">{{ method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tokenExpire" label="Token时效(小时)" width="130" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleConfig(row)">配置</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户端名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="客户端类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option label="PC端" value="pc" />
            <el-option label="小程序" value="mini" />
            <el-option label="APP" value="app" />
            <el-option label="H5" value="h5" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录方式" prop="loginMethods">
          <el-checkbox-group v-model="form.loginMethods">
            <el-checkbox label="密码登录" value="password" />
            <el-checkbox label="短信登录" value="sms" />
            <el-checkbox label="微信登录" value="wechat" />
            <el-checkbox label="扫码登录" value="qrcode" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Token时效" prop="tokenExpire">
          <el-input-number v-model="form.tokenExpire" :min="1" :max="720" /> 小时
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
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

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增客户端')

const searchForm = reactive({ name: '', type: '', status: '' })
const form = reactive({
  id: 0,
  name: '',
  type: '',
  loginMethods: [] as string[],
  tokenExpire: 24,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  loginMethods: [{ required: true, message: '请选择登录方式', trigger: 'change' }]
}

const tableData = ref([
  { id: 1, clientId: 'agri_pc_001', name: 'PC管理端', type: 'pc', typeName: 'PC端', loginMethods: ['密码登录', '短信登录'], tokenExpire: 24, status: 1, createTime: '2024-01-01 10:00:00' },
  { id: 2, clientId: 'agri_mini_001', name: '微信小程序', type: 'mini', typeName: '小程序', loginMethods: ['微信登录', '短信登录'], tokenExpire: 168, status: 1, createTime: '2024-02-15 14:30:00' },
  { id: 3, clientId: 'agri_app_001', name: '移动端APP', type: 'app', typeName: 'APP', loginMethods: ['密码登录', '短信登录', '微信登录'], tokenExpire: 720, status: 1, createTime: '2024-03-20 09:15:00' },
  { id: 4, clientId: 'agri_h5_001', name: 'H5移动端', type: 'h5', typeName: 'H5', loginMethods: ['密码登录', '短信登录'], tokenExpire: 12, status: 0, createTime: '2024-05-10 16:45:00' }
])

const getTypeTag = (type: string) => {
  const types: Record<string, string> = { pc: 'primary', mini: 'success', app: 'warning', h5: 'info' }
  return types[type] || 'info'
}

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', type: '', status: '' }); ElMessage.info('已重置') }
const handleAdd = () => { dialogTitle.value = '新增客户端'; Object.assign(form, { id: 0, name: '', type: '', loginMethods: [], tokenExpire: 24, status: 1 }); dialogVisible.value = true }
const handleEdit = (row: any) => { dialogTitle.value = '编辑客户端'; Object.assign(form, row); dialogVisible.value = true }
const handleConfig = (row: any) => ElMessage.info(`配置客户端: ${row.name}`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleStatusChange = (row: any) => ElMessage.success(`${row.name}已${row.status === 1 ? '启用' : '停用'}`)
const handleSubmit = () => { ElMessage.success(form.id ? '更新成功' : '新增成功'); dialogVisible.value = false }
</script>

<style scoped>
.client-manage-page { height: 100%; }
</style>
