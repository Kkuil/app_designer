<template>
  <div class="param-manage-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="参数名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="参数键名"><el-input v-model="searchForm.key" placeholder="请输入" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增参数</el-button><el-button type="success" @click="handleRefreshCache"><el-icon><Refresh /></el-icon>刷新缓存</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="参数ID" width="80" />
        <el-table-column prop="name" label="参数名称" min-width="150" />
        <el-table-column prop="key" label="参数键名" min-width="200" />
        <el-table-column prop="value" label="参数键值" min-width="150" />
        <el-table-column prop="type" label="系统内置" width="100"><template #default="{ row }"><el-tag :type="row.type === 'Y' ? 'danger' : 'info'" size="small">{{ row.type === 'Y' ? '是' : '否' }}</el-tag></template></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="danger" link size="small" @click="handleDelete(row)" :disabled="row.type === 'Y'">删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="参数名称"><el-input v-model="form.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="参数键名"><el-input v-model="form.key" placeholder="请输入" /></el-form-item>
        <el-form-item label="参数键值"><el-input v-model="form.value" placeholder="请输入" /></el-form-item>
        <el-form-item label="系统内置"><el-radio-group v-model="form.type"><el-radio label="Y">是</el-radio><el-radio label="N">否</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const dialogVisible = ref(false), dialogTitle = ref('新增参数')
const searchForm = reactive({ name: '', key: '' })
const form = reactive({ id: 0, name: '', key: '', value: '', type: 'N', remark: '' })
const tableData = ref([
  { id: 1, name: '系统名称', key: 'sys.name', value: '农业科研知识数据管理系统', type: 'Y', createTime: '2024-01-01' },
  { id: 2, name: '系统版本', key: 'sys.version', value: 'V2.0.0', type: 'Y', createTime: '2024-01-01' },
  { id: 3, name: '用户默认密码', key: 'sys.user.initPassword', value: '123456', type: 'Y', createTime: '2024-01-01' },
  { id: 4, name: '验证码开关', key: 'sys.captcha.enabled', value: 'true', type: 'N', createTime: '2024-01-01' },
  { id: 5, name: '账户锁定次数', key: 'sys.user.lockCount', value: '5', type: 'N', createTime: '2024-01-01' }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', key: '' }); ElMessage.info('已重置') }
const handleRefreshCache = () => ElMessage.success('缓存刷新成功')
const handleAdd = () => { dialogTitle.value = '新增参数'; Object.assign(form, { id: 0, name: '', key: '', value: '', type: 'N', remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { dialogTitle.value = '编辑参数'; Object.assign(form, row); dialogVisible.value = true }
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleSubmit = () => { ElMessage.success('保存成功'); dialogVisible.value = false }
</script>
<style scoped>.param-manage-page { height: 100%; }</style>
