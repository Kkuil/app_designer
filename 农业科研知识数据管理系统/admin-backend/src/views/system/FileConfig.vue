<template>
  <div class="file-config-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="配置名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="存储类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="本地存储" value="local" /><el-option label="阿里云OSS" value="oss" /><el-option label="腾讯云COS" value="cos" /><el-option label="七牛云" value="qiniu" /><el-option label="MinIO" value="minio" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="启用" value="1" /><el-option label="禁用" value="0" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="配置名称" width="150" />
        <el-table-column prop="typeName" label="存储类型" width="120"><template #default="{ row }"><el-tag size="small">{{ row.typeName }}</el-tag></template></el-table-column>
        <el-table-column prop="bucket" label="Bucket" width="150" />
        <el-table-column prop="endpoint" label="Endpoint" min-width="200" />
        <el-table-column prop="domain" label="访问域名" min-width="200" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" /></template></el-table-column>
        <el-table-column prop="isDefault" label="默认" width="80"><template #default="{ row }"><el-tag v-if="row.isDefault" type="success" size="small">是</el-tag><el-tag v-else type="info" size="small">否</el-tag></template></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="success" link size="small" @click="handleSetDefault(row)" :disabled="row.isDefault">设为默认</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '新增配置'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="配置名称"><el-input v-model="form.name" placeholder="请输入配置名称" /></el-form-item>
        <el-form-item label="存储类型"><el-select v-model="form.type" placeholder="请选择" style="width: 100%"><el-option label="本地存储" value="local" /><el-option label="阿里云OSS" value="oss" /><el-option label="腾讯云COS" value="cos" /><el-option label="七牛云" value="qiniu" /><el-option label="MinIO" value="minio" /></el-select></el-form-item>
        <el-form-item label="AccessKey" v-if="form.type !== 'local'"><el-input v-model="form.accessKey" placeholder="请输入AccessKey" /></el-form-item>
        <el-form-item label="SecretKey" v-if="form.type !== 'local'"><el-input v-model="form.secretKey" type="password" show-password placeholder="请输入SecretKey" /></el-form-item>
        <el-form-item label="Bucket"><el-input v-model="form.bucket" placeholder="请输入Bucket名称" /></el-form-item>
        <el-form-item label="Endpoint"><el-input v-model="form.endpoint" placeholder="请输入Endpoint地址" /></el-form-item>
        <el-form-item label="访问域名"><el-input v-model="form.domain" placeholder="请输入访问域名" /></el-form-item>
        <el-form-item label="存储路径"><el-input v-model="form.path" placeholder="请输入存储路径前缀" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const dialogVisible = ref(false), isEdit = ref(false)
const searchForm = reactive({ name: '', type: '', status: '' })
const form = reactive({ name: '', type: 'local', accessKey: '', secretKey: '', bucket: '', endpoint: '', domain: '', path: '', status: 1, remark: '' })
const tableData = ref([
  { id: 1, name: '本地存储', type: 'local', typeName: '本地存储', bucket: 'uploads', endpoint: '/data/files', domain: 'http://localhost:8080/files', status: 1, isDefault: true },
  { id: 2, name: '阿里云OSS', type: 'oss', typeName: '阿里云OSS', bucket: 'agri-research', endpoint: 'oss-cn-beijing.aliyuncs.com', domain: 'https://agri-research.oss-cn-beijing.aliyuncs.com', status: 1, isDefault: false },
  { id: 3, name: '腾讯云COS', type: 'cos', typeName: '腾讯云COS', bucket: 'agri-1234567890', endpoint: 'cos.ap-beijing.myqcloud.com', domain: 'https://agri-1234567890.cos.ap-beijing.myqcloud.com', status: 0, isDefault: false },
  { id: 4, name: 'MinIO存储', type: 'minio', typeName: 'MinIO', bucket: 'agri-data', endpoint: 'http://192.168.1.100:9000', domain: 'http://192.168.1.100:9000/agri-data', status: 1, isDefault: false }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', type: '', status: '' }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { name: '', type: 'local', accessKey: '', secretKey: '', bucket: '', endpoint: '', domain: '', path: '', status: 1, remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleStatusChange = (row: any) => ElMessage.success(`${row.name}已${row.status === 1 ? '启用' : '禁用'}`)
const handleSetDefault = (row: any) => { tableData.value.forEach(item => item.isDefault = item.id === row.id); ElMessage.success(`已将"${row.name}"设为默认存储`) }
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除配置"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
</script>
<style scoped>.file-config-page { height: 100%; }</style>
