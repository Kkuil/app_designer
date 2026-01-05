<template>
  <div class="maintenance-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="设备名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="维护类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="定期保养" value="regular" /><el-option label="故障维修" value="repair" /><el-option label="校准检定" value="calibration" /><el-option label="升级改造" value="upgrade" /></el-select></el-form-item>
        <el-form-item label="维护状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="待维护" value="0" /><el-option label="维护中" value="1" /><el-option label="已完成" value="2" /></el-select></el-form-item>
        <el-form-item label="维护时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增维护记录</el-button><el-button type="warning" @click="handleSchedule"><el-icon><Calendar /></el-icon>维护计划</el-button><el-button type="info" @click="handleMaintenanceCycle"><el-icon><Setting /></el-icon>保养周期设置</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="记录编号" width="100" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="equipmentCode" label="设备编号" width="120" />
        <el-table-column prop="typeName" label="维护类型" width="100"><template #default="{ row }"><el-tag :type="getTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag></template></el-table-column>
        <el-table-column prop="content" label="维护内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="maintainer" label="维护人员" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="100" />
        <el-table-column prop="endTime" label="结束时间" width="100" />
        <el-table-column prop="cost" label="费用(元)" width="90" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button type="warning" link size="small" @click="handleEdit(row)" v-if="row.status !== 2">编辑</el-button><el-button type="success" link size="small" @click="handleComplete(row)" v-if="row.status === 1">完成</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑维护记录' : '新增维护记录'" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择设备"><el-select v-model="form.equipmentId" placeholder="请选择设备" style="width: 100%" filterable><el-option label="高效液相色谱仪 (EQ20240001)" value="1" /><el-option label="气相色谱质谱联用仪 (EQ20240002)" value="2" /><el-option label="紫外可见分光光度计 (EQ20240003)" value="3" /><el-option label="原子吸收光谱仪 (EQ20240004)" value="4" /></el-select></el-form-item>
        <el-form-item label="维护类型"><el-select v-model="form.type" placeholder="请选择" style="width: 100%"><el-option label="定期保养" value="regular" /><el-option label="故障维修" value="repair" /><el-option label="校准检定" value="calibration" /><el-option label="升级改造" value="upgrade" /></el-select></el-form-item>
        <el-form-item label="维护内容"><el-input v-model="form.content" type="textarea" rows="3" placeholder="请描述维护内容" /></el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="维护人员"><el-input v-model="form.maintainer" placeholder="请输入" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="请输入" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="开始时间"><el-date-picker v-model="form.startTime" type="date" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="预计结束"><el-date-picker v-model="form.endTime" type="date" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="维护费用"><el-input-number v-model="form.cost" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="服务商"><el-input v-model="form.serviceProvider" placeholder="请输入" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(30), dialogVisible = ref(false), isEdit = ref(false)
const searchForm = reactive({ name: '', type: '', status: '', dateRange: null })
const form = reactive({ equipmentId: '', type: '', content: '', maintainer: '', phone: '', startTime: '', endTime: '', cost: 0, serviceProvider: '', remark: '' })
const tableData = ref([
  { id: 'MT20241201', equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', type: 'regular', typeName: '定期保养', content: '年度例行保养：清洁色谱柱、更换密封件、检查泵头', maintainer: '张工', startTime: '2024-12-20', endTime: '2024-12-20', cost: 2000, status: 2, statusName: '已完成' },
  { id: 'MT20241202', equipmentName: '原子吸收光谱仪', equipmentCode: 'EQ20240004', type: 'repair', typeName: '故障维修', content: '光源故障，需更换空心阴极灯', maintainer: '李工', startTime: '2024-12-18', endTime: '', cost: 5000, status: 1, statusName: '维护中' },
  { id: 'MT20241203', equipmentName: '气相色谱质谱联用仪', equipmentCode: 'EQ20240002', type: 'calibration', typeName: '校准检定', content: '年度计量检定，由省计量院进行', maintainer: '省计量院', startTime: '2024-12-25', endTime: '2024-12-26', cost: 3500, status: 0, statusName: '待维护' },
  { id: 'MT20241204', equipmentName: '紫外可见分光光度计', equipmentCode: 'EQ20240003', type: 'upgrade', typeName: '升级改造', content: '软件系统升级至最新版本', maintainer: '厂家工程师', startTime: '2024-12-22', endTime: '2024-12-22', cost: 0, status: 2, statusName: '已完成' }
])
const getTypeTag = (type: string) => { const m: Record<string, string> = { regular: 'primary', repair: 'danger', calibration: 'warning', upgrade: 'success' }; return m[type] || 'info' }
const getStatusType = (status: number) => { const m: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success' }; return m[status] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', type: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { equipmentId: '', type: '', content: '', maintainer: '', phone: '', startTime: '', endTime: '', cost: 0, serviceProvider: '', remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看维护记录：${row.id}`)
const handleComplete = (row: any) => { ElMessageBox.confirm(`确定将维护记录"${row.id}"标记为已完成吗？`, '提示', { type: 'info' }).then(() => { row.status = 2; row.statusName = '已完成'; ElMessage.success('操作成功') }).catch(() => {}) }
const handleSchedule = () => ElMessage.success('打开维护计划')
const handleExport = () => ElMessage.success('导出成功')
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.maintenance-page { height: 100%; }</style>
