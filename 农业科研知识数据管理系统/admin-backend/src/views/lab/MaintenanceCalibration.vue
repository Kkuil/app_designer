<template>
  <div class="maintenance-calibration-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="设备名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="校准状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="待校准" value="0" /><el-option label="校准中" value="1" /><el-option label="已完成" value="2" /></el-select></el-form-item>
        <el-form-item label="校准时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar">
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增校准记录</el-button>
        <el-button type="warning" @click="handleSchedule"><el-icon><Calendar /></el-icon>校准计划</el-button>
        <el-button type="info" @click="handleCycleSettings"><el-icon><Setting /></el-icon>校准周期设置</el-button>
        <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
      </div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="记录编号" width="100" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="equipmentCode" label="设备编号" width="120" />
        <el-table-column prop="calibrationType" label="校准类型" width="100">
          <template #default="{ row }"><el-tag :type="getCalibrationTypeTag(row.calibrationType)" size="small">{{ row.calibrationTypeName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="calibrationOrg" label="校准机构" min-width="150" show-overflow-tooltip />
        <el-table-column prop="calibrator" label="校准人员" width="100" />
        <el-table-column prop="calibrationDate" label="校准日期" width="100" />
        <el-table-column prop="validUntil" label="有效期至" width="100" />
        <el-table-column prop="cost" label="费用(元)" width="90" />
        <el-table-column prop="result" label="校准结果" width="90">
          <template #default="{ row }"><el-tag :type="row.result === 'pass' ? 'success' : 'danger'" size="small">{{ row.resultName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button type="info" link size="small" @click="handleViewCert(row)" v-if="row.status === 2">证书</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)" v-if="row.status !== 2">编辑</el-button>
            <el-button type="success" link size="small" @click="handleComplete(row)" v-if="row.status === 1">完成</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <!-- 校准周期设置对话框 -->
    <el-dialog v-model="cycleDialogVisible" title="校准周期设置" width="850px">
      <el-alert title="设定仪器的校准周期，系统会根据有效期自动提醒。按照国家计量法规，精密仪器需定期进行计量检定。" type="warning" style="margin-bottom: 20px" :closable="false" />
      <el-table :data="cycleSettings" stripe border>
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="equipmentCode" label="设备编号" width="120" />
        <el-table-column prop="lastCalibration" label="上次校准日期" width="120" />
        <el-table-column prop="cycleValue" label="校准周期(月)" width="120">
          <template #default="{ row }"><el-input-number v-model="row.cycleValue" :min="1" size="small" style="width: 100px" /></template>
        </el-table-column>
        <el-table-column prop="remindDays" label="提前提醒(天)" width="120">
          <template #default="{ row }"><el-input-number v-model="row.remindDays" :min="1" size="small" style="width: 100px" /></template>
        </el-table-column>
        <el-table-column prop="calibrationOrg" label="校准机构" width="150">
          <template #default="{ row }"><el-input v-model="row.calibrationOrg" size="small" style="width: 140px" /></template>
        </el-table-column>
        <el-table-column prop="nextCalibration" label="下次校准日期" width="120" />
      </el-table>
      <template #footer><el-button @click="cycleDialogVisible = false">取消</el-button><el-button type="primary" @click="handleSaveCycle">保存</el-button></template>
    </el-dialog>
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑校准记录' : '新增校准记录'" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择设备"><el-select v-model="form.equipmentId" placeholder="请选择设备" style="width: 100%" filterable><el-option label="高效液相色谱仪 (EQ20240001)" value="1" /><el-option label="气相色谱质谱联用仪 (EQ20240002)" value="2" /><el-option label="紫外可见分光光度计 (EQ20240003)" value="3" /><el-option label="原子吸收光谱仪 (EQ20240004)" value="4" /></el-select></el-form-item>
        <el-form-item label="校准类型"><el-select v-model="form.calibrationType" placeholder="请选择" style="width: 100%"><el-option label="首次校准" value="first" /><el-option label="周期校准" value="periodic" /><el-option label="维修后校准" value="afterRepair" /><el-option label="强制检定" value="mandatory" /></el-select></el-form-item>
        <el-form-item label="校准机构"><el-input v-model="form.calibrationOrg" placeholder="如：省计量院" /></el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="校准人员"><el-input v-model="form.calibrator" placeholder="请输入" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="请输入" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="校准日期"><el-date-picker v-model="form.calibrationDate" type="date" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="有效期至"><el-date-picker v-model="form.validUntil" type="date" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="校准费用"><el-input-number v-model="form.cost" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="校准结果"><el-select v-model="form.result" placeholder="请选择" style="width: 100%"><el-option label="合格" value="pass" /><el-option label="不合格" value="fail" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="校准证书"><el-upload action="#" list-type="text" :auto-upload="false"><el-button size="small" type="primary">上传证书</el-button></el-upload></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(30), dialogVisible = ref(false), cycleDialogVisible = ref(false), isEdit = ref(false)
const searchForm = reactive({ name: '', status: '', dateRange: null })
const form = reactive({ equipmentId: '', calibrationType: '', calibrationOrg: '', calibrator: '', phone: '', calibrationDate: '', validUntil: '', cost: 0, result: '', remark: '' })
const tableData = ref([
  { id: 'JZ20241201', equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', calibrationType: 'periodic', calibrationTypeName: '周期校准', calibrationOrg: '省计量院', calibrator: '李工程师', calibrationDate: '2024-12-15', validUntil: '2025-12-15', cost: 3500, result: 'pass', resultName: '合格', status: 2, statusName: '已完成' },
  { id: 'JZ20241202', equipmentName: '气相色谱质谱联用仪', equipmentCode: 'EQ20240002', calibrationType: 'periodic', calibrationTypeName: '周期校准', calibrationOrg: '省计量院', calibrator: '王工程师', calibrationDate: '2024-12-25', validUntil: '2025-12-25', cost: 5000, result: '', resultName: '', status: 0, statusName: '待校准' },
  { id: 'JZ20241203', equipmentName: '紫外可见分光光度计', equipmentCode: 'EQ20240003', calibrationType: 'afterRepair', calibrationTypeName: '维修后校准', calibrationOrg: '厂家', calibrator: '赵工程师', calibrationDate: '2024-12-20', validUntil: '2025-06-20', cost: 1500, result: 'pass', resultName: '合格', status: 1, statusName: '校准中' }
])
const cycleSettings = ref([
  { equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', lastCalibration: '2024-12-15', cycleValue: 12, remindDays: 30, calibrationOrg: '省计量院', nextCalibration: '2025-12-15' },
  { equipmentName: '气相色谱质谱联用仪', equipmentCode: 'EQ20240002', lastCalibration: '2023-12-20', cycleValue: 12, remindDays: 30, calibrationOrg: '省计量院', nextCalibration: '2024-12-20' },
  { equipmentName: '紫外可见分光光度计', equipmentCode: 'EQ20240003', lastCalibration: '2024-06-10', cycleValue: 6, remindDays: 14, calibrationOrg: '厂家', nextCalibration: '2024-12-10' },
  { equipmentName: '原子吸收光谱仪', equipmentCode: 'EQ20240004', lastCalibration: '2024-08-15', cycleValue: 12, remindDays: 30, calibrationOrg: '省计量院', nextCalibration: '2025-08-15' }
])
const getCalibrationTypeTag = (type: string) => { const m: Record<string, string> = { first: 'info', periodic: 'primary', afterRepair: 'warning', mandatory: 'danger' }; return m[type] || 'info' }
const getStatusType = (status: number) => { const m: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success' }; return m[status] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { equipmentId: '', calibrationType: '', calibrationOrg: '', calibrator: '', phone: '', calibrationDate: '', validUntil: '', cost: 0, result: '', remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看校准记录：${row.id}`)
const handleViewCert = (row: any) => ElMessage.success(`查看校准证书：${row.id}`)
const handleComplete = (row: any) => { ElMessageBox.confirm(`确定将校准记录"${row.id}"标记为已完成吗？`, '提示', { type: 'info' }).then(() => { row.status = 2; row.statusName = '已完成'; ElMessage.success('操作成功') }).catch(() => {}) }
const handleSchedule = () => ElMessage.success('打开校准计划')
const handleCycleSettings = () => { cycleDialogVisible.value = true }
const handleSaveCycle = () => { ElMessage.success('校准周期设置已保存'); cycleDialogVisible.value = false }
const handleExport = () => ElMessage.success('导出成功')
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.maintenance-calibration-page { height: 100%; }</style>
