<template>
  <div class="equipment-list-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="设备名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="设备编号"><el-input v-model="searchForm.code" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="设备类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="分析仪器" value="analysis" /><el-option label="光学仪器" value="optical" /><el-option label="电子仪器" value="electronic" /><el-option label="物理仪器" value="physical" /><el-option label="生物仪器" value="biology" /></el-select></el-form-item>
        <el-form-item label="设备状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="正常" value="1" /><el-option label="维修中" value="2" /><el-option label="已报废" value="3" /><el-option label="闲置" value="4" /></el-select></el-form-item>
        <el-form-item label="所属实验室"><el-select v-model="searchForm.lab" placeholder="全部" clearable><el-option label="实验室A" value="labA" /><el-option label="实验室B" value="labB" /><el-option label="实验室C" value="labC" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增设备</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button><el-button type="info" @click="handleImport"><el-icon><Upload /></el-icon>导入</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="code" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" min-width="180" />
        <el-table-column prop="typeName" label="设备类型" width="100" />
        <el-table-column prop="model" label="规格型号" width="120" />
        <el-table-column prop="brand" label="品牌厂家" width="120" />
        <el-table-column prop="lab" label="所属实验室" width="100" />
        <el-table-column prop="manager" label="负责人" width="80" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="purchaseDate" label="购置日期" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="success" link size="small" @click="handleMaintain(row)">维护</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑设备' : '新增设备'" width="700px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="设备编号"><el-input v-model="form.code" placeholder="请输入设备编号" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="设备名称"><el-input v-model="form.name" placeholder="请输入设备名称" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="设备类型"><el-select v-model="form.type" placeholder="请选择" style="width: 100%"><el-option label="分析仪器" value="analysis" /><el-option label="光学仪器" value="optical" /><el-option label="电子仪器" value="electronic" /><el-option label="物理仪器" value="physical" /><el-option label="生物仪器" value="biology" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="规格型号"><el-input v-model="form.model" placeholder="请输入规格型号" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="品牌厂家"><el-input v-model="form.brand" placeholder="请输入品牌厂家" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="所属实验室"><el-select v-model="form.lab" placeholder="请选择" style="width: 100%"><el-option label="实验室A" value="labA" /><el-option label="实验室B" value="labB" /><el-option label="实验室C" value="labC" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="负责人"><el-input v-model="form.manager" placeholder="请输入负责人" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="购置日期"><el-date-picker v-model="form.purchaseDate" type="date" placeholder="请选择" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="购置金额"><el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="设备状态"><el-select v-model="form.status" placeholder="请选择" style="width: 100%"><el-option label="正常" :value="1" /><el-option label="维修中" :value="2" /><el-option label="已报废" :value="3" /><el-option label="闲置" :value="4" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="设备描述"><el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入设备描述" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="detailVisible" title="设备详情" width="700px">
      <el-descriptions :column="2" border v-if="currentEquipment">
        <el-descriptions-item label="设备编号">{{ currentEquipment.code }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentEquipment.name }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentEquipment.typeName }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">{{ currentEquipment.model }}</el-descriptions-item>
        <el-descriptions-item label="品牌厂家">{{ currentEquipment.brand }}</el-descriptions-item>
        <el-descriptions-item label="所属实验室">{{ currentEquipment.lab }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentEquipment.manager }}</el-descriptions-item>
        <el-descriptions-item label="设备状态"><el-tag :type="getStatusType(currentEquipment.status)" size="small">{{ currentEquipment.statusName }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="购置日期">{{ currentEquipment.purchaseDate }}</el-descriptions-item>
        <el-descriptions-item label="购置金额">¥{{ currentEquipment.price?.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="设备描述" :span="2">{{ currentEquipment.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(50), dialogVisible = ref(false), detailVisible = ref(false), isEdit = ref(false), currentEquipment = ref<any>(null)
const searchForm = reactive({ name: '', code: '', type: '', status: '', lab: '' })
const form = reactive({ code: '', name: '', type: '', model: '', brand: '', lab: '', manager: '', purchaseDate: '', price: 0, status: 1, description: '' })
const tableData = ref([
  { id: 1, code: 'EQ20240001', name: '高效液相色谱仪', type: 'analysis', typeName: '分析仪器', model: 'Agilent 1260', brand: '安捷伦', lab: '实验室A', manager: '张三', status: 1, statusName: '正常', purchaseDate: '2023-06-15', price: 450000, description: '用于化合物分离分析' },
  { id: 2, code: 'EQ20240002', name: '气相色谱质谱联用仪', type: 'analysis', typeName: '分析仪器', model: 'Shimadzu GCMS-QP2020', brand: '岛津', lab: '实验室A', manager: '张三', status: 1, statusName: '正常', purchaseDate: '2023-08-20', price: 680000, description: '用于挥发性化合物检测' },
  { id: 3, code: 'EQ20240003', name: '紫外可见分光光度计', type: 'optical', typeName: '光学仪器', model: 'UV-2600', brand: '岛津', lab: '实验室B', manager: '李四', status: 1, statusName: '正常', purchaseDate: '2022-03-10', price: 85000, description: '用于物质吸收光谱测定' },
  { id: 4, code: 'EQ20240004', name: '原子吸收光谱仪', type: 'optical', typeName: '光学仪器', model: 'AA-7000', brand: '岛津', lab: '实验室B', manager: '李四', status: 2, statusName: '维修中', purchaseDate: '2021-11-25', price: 320000, description: '用于金属元素分析' },
  { id: 5, code: 'EQ20240005', name: '超速离心机', type: 'physical', typeName: '物理仪器', model: 'Optima XE-100', brand: '贝克曼', lab: '实验室C', manager: '王五', status: 1, statusName: '正常', purchaseDate: '2024-01-08', price: 520000, description: '用于生物样品分离' }
])
const getStatusType = (status: number) => { const m: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger', 4: 'info' }; return m[status] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', code: '', type: '', status: '', lab: '' }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { code: '', name: '', type: '', model: '', brand: '', lab: '', manager: '', purchaseDate: '', price: 0, status: 1, description: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleView = (row: any) => { currentEquipment.value = row; detailVisible.value = true }
const handleMaintain = (row: any) => ElMessage.success(`进入${row.name}维护页面`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除设备"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleExport = () => ElMessage.success('导出成功')
const handleImport = () => ElMessage.success('导入功能已打开')
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.equipment-list-page { height: 100%; }</style>
