<template>
  <div class="all-reservation-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="设备名称"><el-input v-model="searchForm.equipment" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="预约人"><el-input v-model="searchForm.user" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="预约状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="待审核" value="0" /><el-option label="已通过" value="1" /><el-option label="使用中" value="2" /><el-option label="已完成" value="3" /><el-option label="已取消" value="4" /><el-option label="已驳回" value="5" /></el-select></el-form-item>
        <el-form-item label="预约时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新建预约</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="预约编号" width="130" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="user" label="预约人" width="80" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="reserveDate" label="预约日期" width="100" />
        <el-table-column prop="timeSlot" label="时间段" width="110" />
        <el-table-column prop="purpose" label="使用目的" min-width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="150" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button v-if="row.status === 1" type="success" link size="small" @click="handleStart(row)">开始使用</el-button><el-button v-if="row.status === 2" type="warning" link size="small" @click="handleEnd(row)">结束使用</el-button><el-button v-if="row.status === 0 || row.status === 1" type="danger" link size="small" @click="handleCancel(row)">取消</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" title="新建预约" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择设备"><el-select v-model="form.equipmentId" placeholder="请选择设备" style="width: 100%" filterable><el-option label="高效液相色谱仪 (EQ20240001)" value="1" /><el-option label="气相色谱质谱联用仪 (EQ20240002)" value="2" /><el-option label="紫外可见分光光度计 (EQ20240003)" value="3" /><el-option label="原子吸收光谱仪 (EQ20240004)" value="4" /><el-option label="超速离心机 (EQ20240005)" value="5" /></el-select></el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="预约日期"><el-date-picker v-model="form.reserveDate" type="date" placeholder="请选择" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="时间段"><el-time-picker v-model="form.timeRange" is-range range-separator="-" start-placeholder="开始" end-placeholder="结束" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="使用目的"><el-input v-model="form.purpose" type="textarea" rows="2" placeholder="请描述使用目的" /></el-form-item>
        <el-form-item label="样品信息"><el-input v-model="form.sampleInfo" type="textarea" rows="2" placeholder="请描述样品信息" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="请输入联系电话" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交预约</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(80), dialogVisible = ref(false)
const searchForm = reactive({ equipment: '', user: '', status: '', dateRange: null })
const form = reactive({ equipmentId: '', reserveDate: '', timeRange: null, purpose: '', sampleInfo: '', phone: '', remark: '' })
const tableData = ref([
  { id: 'RSV20241222001', equipmentName: '高效液相色谱仪', user: '张三', department: '研发一部', reserveDate: '2024-12-22', timeSlot: '09:00-12:00', purpose: '农药残留检测', status: 3, statusName: '已完成', applyTime: '2024-12-20 10:30' },
  { id: 'RSV20241222002', equipmentName: '气相色谱质谱联用仪', user: '李四', department: '研发二部', reserveDate: '2024-12-22', timeSlot: '14:00-17:00', purpose: '有机物分析', status: 2, statusName: '使用中', applyTime: '2024-12-20 11:15' },
  { id: 'RSV20241223001', equipmentName: '紫外可见分光光度计', user: '王五', department: '实验中心', reserveDate: '2024-12-23', timeSlot: '10:00-12:00', purpose: '浓度测定', status: 1, statusName: '已通过', applyTime: '2024-12-21 09:00' },
  { id: 'RSV20241223002', equipmentName: '原子吸收光谱仪', user: '赵六', department: '质检部', reserveDate: '2024-12-24', timeSlot: '09:00-11:00', purpose: '金属含量测定', status: 0, statusName: '待审核', applyTime: '2024-12-22 08:30' },
  { id: 'RSV20241220001', equipmentName: '超速离心机', user: '孙七', department: '生物实验室', reserveDate: '2024-12-21', timeSlot: '08:00-10:00', purpose: '细胞分离', status: 4, statusName: '已取消', applyTime: '2024-12-19 14:00' },
  { id: 'RSV20241219001', equipmentName: '高效液相色谱仪', user: '周八', department: '研发一部', reserveDate: '2024-12-20', timeSlot: '14:00-16:00', purpose: '样品分析', status: 5, statusName: '已驳回', applyTime: '2024-12-18 16:30' }
])
const getStatusType = (status: number) => { const m: Record<number, string> = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'info', 4: 'info', 5: 'danger' }; return m[status] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { equipment: '', user: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleAdd = () => { Object.assign(form, { equipmentId: '', reserveDate: '', timeRange: null, purpose: '', sampleInfo: '', phone: '', remark: '' }); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看预约详情：${row.id}`)
const handleStart = (row: any) => { ElMessageBox.confirm(`确定开始使用设备"${row.equipmentName}"吗？`, '确认', { type: 'info' }).then(() => { row.status = 2; row.statusName = '使用中'; ElMessage.success('已开始使用') }).catch(() => {}) }
const handleEnd = (row: any) => { ElMessageBox.confirm(`确定结束使用设备"${row.equipmentName}"吗？`, '确认', { type: 'info' }).then(() => { row.status = 3; row.statusName = '已完成'; ElMessage.success('已结束使用') }).catch(() => {}) }
const handleCancel = (row: any) => { ElMessageBox.confirm(`确定取消预约"${row.id}"吗？`, '确认', { type: 'warning' }).then(() => { row.status = 4; row.statusName = '已取消'; ElMessage.success('已取消') }).catch(() => {}) }
const handleExport = () => ElMessage.success('导出成功')
const handleSubmit = () => { ElMessage.success('预约提交成功，等待审核'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.all-reservation-page { height: 100%; }</style>
