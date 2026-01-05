<template>
  <div class="pending-audit-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="设备名称"><el-input v-model="searchForm.equipment" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="预约人"><el-input v-model="searchForm.user" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="申请时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="success" @click="handleBatchApprove"><el-icon><Check /></el-icon>批量通过</el-button><el-button type="danger" @click="handleBatchReject"><el-icon><Close /></el-icon>批量驳回</el-button></div>
      <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="预约编号" width="120" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="user" label="预约人" width="100" />
        <el-table-column prop="department" label="所属部门" width="120" />
        <el-table-column prop="reserveDate" label="预约日期" width="100" />
        <el-table-column prop="timeSlot" label="时间段" width="120" />
        <el-table-column prop="purpose" label="使用目的" min-width="150" show-overflow-tooltip />
        <el-table-column prop="applyTime" label="申请时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button type="success" link size="small" @click="handleApprove(row)">通过</el-button><el-button type="danger" link size="small" @click="handleReject(row)">驳回</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" title="预约详情" width="650px">
      <el-descriptions :column="2" border v-if="currentReservation">
        <el-descriptions-item label="预约编号">{{ currentReservation.id }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentReservation.equipmentName }}</el-descriptions-item>
        <el-descriptions-item label="预约人">{{ currentReservation.user }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentReservation.department }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentReservation.phone }}</el-descriptions-item>
        <el-descriptions-item label="预约日期">{{ currentReservation.reserveDate }}</el-descriptions-item>
        <el-descriptions-item label="时间段">{{ currentReservation.timeSlot }}</el-descriptions-item>
        <el-descriptions-item label="预计时长">{{ currentReservation.duration }}小时</el-descriptions-item>
        <el-descriptions-item label="使用目的" :span="2">{{ currentReservation.purpose }}</el-descriptions-item>
        <el-descriptions-item label="样品信息" :span="2">{{ currentReservation.sampleInfo }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentReservation.applyTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer><el-button @click="dialogVisible = false">关闭</el-button><el-button type="success" @click="handleApprove(currentReservation)">通过</el-button><el-button type="danger" @click="handleReject(currentReservation)">驳回</el-button></template>
    </el-dialog>
    <el-dialog v-model="rejectVisible" title="驳回原因" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因"><el-select v-model="rejectForm.reason" placeholder="请选择" style="width: 100%"><el-option label="设备已被预约" value="conflict" /><el-option label="预约时间不合理" value="time" /><el-option label="使用目的不明确" value="purpose" /><el-option label="资质不符合" value="qualification" /><el-option label="其他原因" value="other" /></el-select></el-form-item>
        <el-form-item label="详细说明"><el-input v-model="rejectForm.detail" type="textarea" rows="4" placeholder="请输入详细说明" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="rejectVisible = false">取消</el-button><el-button type="danger" @click="handleConfirmReject">确认驳回</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(15), dialogVisible = ref(false), rejectVisible = ref(false), currentReservation = ref<any>(null), selectedRows = ref<any[]>([])
const searchForm = reactive({ equipment: '', user: '', dateRange: null })
const rejectForm = reactive({ reason: '', detail: '' })
const tableData = ref([
  { id: 'RSV20241222001', equipmentName: '高效液相色谱仪', user: '张三', department: '研发一部', phone: '13800138001', reserveDate: '2024-12-25', timeSlot: '09:00-12:00', duration: 3, purpose: '农药残留检测分析', sampleInfo: '蔬菜样品10份', applyTime: '2024-12-22 10:30:00' },
  { id: 'RSV20241222002', equipmentName: '气相色谱质谱联用仪', user: '李四', department: '研发二部', phone: '13800138002', reserveDate: '2024-12-24', timeSlot: '14:00-17:00', duration: 3, purpose: '挥发性有机物检测', sampleInfo: '土壤样品5份', applyTime: '2024-12-22 09:15:00' },
  { id: 'RSV20241222003', equipmentName: '原子吸收光谱仪', user: '王五', department: '实验中心', phone: '13800138003', reserveDate: '2024-12-26', timeSlot: '09:00-11:00', duration: 2, purpose: '重金属含量测定', sampleInfo: '水样8份', applyTime: '2024-12-22 08:45:00' },
  { id: 'RSV20241221001', equipmentName: '紫外可见分光光度计', user: '赵六', department: '质检部', phone: '13800138004', reserveDate: '2024-12-23', timeSlot: '10:00-12:00', duration: 2, purpose: '蛋白质浓度测定', sampleInfo: '提取液样品15份', applyTime: '2024-12-21 16:20:00' },
  { id: 'RSV20241221002', equipmentName: '超速离心机', user: '孙七', department: '生物实验室', phone: '13800138005', reserveDate: '2024-12-24', timeSlot: '08:00-10:00', duration: 2, purpose: '细胞分离实验', sampleInfo: '细胞培养液', applyTime: '2024-12-21 14:30:00' }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { equipment: '', user: '', dateRange: null }); ElMessage.info('已重置') }
const handleSelectionChange = (rows: any[]) => { selectedRows.value = rows }
const handleView = (row: any) => { currentReservation.value = row; dialogVisible.value = true }
const handleApprove = (row: any) => { ElMessageBox.confirm(`确定通过"${row.user}"的设备预约申请吗？`, '审核确认', { type: 'info' }).then(() => { tableData.value = tableData.value.filter(r => r.id !== row.id); total.value--; ElMessage.success('审核通过，已通知预约人'); dialogVisible.value = false }).catch(() => {}) }
const handleReject = (row: any) => { currentReservation.value = row; rejectVisible.value = true; dialogVisible.value = false }
const handleConfirmReject = () => { tableData.value = tableData.value.filter(r => r.id !== currentReservation.value.id); total.value--; ElMessage.success('已驳回，已通知预约人'); rejectVisible.value = false }
const handleBatchApprove = () => { if (selectedRows.value.length === 0) { ElMessage.warning('请选择要审核的预约'); return }; ElMessageBox.confirm(`确定批量通过选中的${selectedRows.value.length}条预约申请吗？`, '批量审核', { type: 'info' }).then(() => ElMessage.success('批量审核通过')).catch(() => {}) }
const handleBatchReject = () => { if (selectedRows.value.length === 0) { ElMessage.warning('请选择要驳回的预约'); return }; rejectVisible.value = true }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.pending-audit-page { height: 100%; }</style>
