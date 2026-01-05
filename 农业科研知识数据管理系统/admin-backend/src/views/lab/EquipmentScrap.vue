<template>
  <div class="equipment-scrap-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="设备名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="报废原因"><el-select v-model="searchForm.reason" placeholder="全部" clearable><el-option label="达到使用年限" value="expired" /><el-option label="无法维修" value="unrepairable" /><el-option label="技术淘汰" value="obsolete" /><el-option label="安全隐患" value="safety" /></el-select></el-form-item>
        <el-form-item label="审批状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="待审批" value="0" /><el-option label="已通过" value="1" /><el-option label="已驳回" value="2" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>申请报废</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button></div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="申请编号" width="120" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="equipmentCode" label="设备编号" width="120" />
        <el-table-column prop="purchaseDate" label="购置日期" width="100" />
        <el-table-column prop="originalValue" label="原值(元)" width="100" />
        <el-table-column prop="reasonName" label="报废原因" width="110"><template #default="{ row }"><el-tag type="danger" size="small">{{ row.reasonName }}</el-tag></template></el-table-column>
        <el-table-column prop="applicant" label="申请人" width="80" />
        <el-table-column prop="applyDate" label="申请日期" width="100" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button v-if="row.status === 0" type="success" link size="small" @click="handleApprove(row)">通过</el-button><el-button v-if="row.status === 0" type="danger" link size="small" @click="handleReject(row)">驳回</el-button><el-button v-if="row.status === 1" type="warning" link size="small" @click="handleDispose(row)">处置</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" title="设备报废申请" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择设备"><el-select v-model="form.equipmentId" placeholder="请选择要报废的设备" style="width: 100%" filterable><el-option label="原子吸收光谱仪 (EQ20240004) - 2021年购置" value="4" /><el-option label="老旧离心机 (EQ20190001) - 2019年购置" value="old1" /><el-option label="旧型号显微镜 (EQ20180005) - 2018年购置" value="old2" /></el-select></el-form-item>
        <el-form-item label="报废原因"><el-select v-model="form.reason" placeholder="请选择" style="width: 100%"><el-option label="达到使用年限" value="expired" /><el-option label="无法维修" value="unrepairable" /><el-option label="技术淘汰" value="obsolete" /><el-option label="安全隐患" value="safety" /><el-option label="其他原因" value="other" /></el-select></el-form-item>
        <el-form-item label="详细说明"><el-input v-model="form.description" type="textarea" rows="4" placeholder="请详细说明报废原因" /></el-form-item>
        <el-form-item label="处置建议"><el-select v-model="form.disposalMethod" placeholder="请选择" style="width: 100%"><el-option label="变卖" value="sell" /><el-option label="捐赠" value="donate" /><el-option label="报废销毁" value="destroy" /><el-option label="拆解利用" value="disassemble" /></el-select></el-form-item>
        <el-form-item label="残值评估"><el-input-number v-model="form.residualValue" :min="0" :precision="2" style="width: 200px" /><span style="margin-left: 8px">元</span></el-form-item>
        <el-form-item label="附件材料"><el-upload action="#" :limit="5" :before-upload="handleUpload"><el-button type="primary"><el-icon><Upload /></el-icon>上传附件</el-button><template #tip><div class="el-upload__tip">可上传鉴定报告、维修记录等材料</div></template></el-upload></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交申请</el-button></template>
    </el-dialog>
    <el-dialog v-model="disposeVisible" title="报废处置" width="500px">
      <el-form :model="disposeForm" label-width="100px">
        <el-form-item label="处置方式"><el-select v-model="disposeForm.method" placeholder="请选择" style="width: 100%"><el-option label="变卖" value="sell" /><el-option label="捐赠" value="donate" /><el-option label="报废销毁" value="destroy" /><el-option label="拆解利用" value="disassemble" /></el-select></el-form-item>
        <el-form-item label="处置金额" v-if="disposeForm.method === 'sell'"><el-input-number v-model="disposeForm.amount" :min="0" :precision="2" style="width: 100%" /></el-form-item>
        <el-form-item label="接收单位" v-if="disposeForm.method === 'sell' || disposeForm.method === 'donate'"><el-input v-model="disposeForm.receiver" placeholder="请输入接收单位名称" /></el-form-item>
        <el-form-item label="处置日期"><el-date-picker v-model="disposeForm.date" type="date" style="width: 100%" /></el-form-item>
        <el-form-item label="处置说明"><el-input v-model="disposeForm.remark" type="textarea" rows="3" placeholder="请输入处置说明" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="disposeVisible = false">取消</el-button><el-button type="primary" @click="handleSubmitDispose">确认处置</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(20), dialogVisible = ref(false), disposeVisible = ref(false)
const searchForm = reactive({ name: '', reason: '', status: '' })
const form = reactive({ equipmentId: '', reason: '', description: '', disposalMethod: '', residualValue: 0 })
const disposeForm = reactive({ method: '', amount: 0, receiver: '', date: '', remark: '' })
const tableData = ref([
  { id: 'SC20241201', equipmentName: '老旧离心机', equipmentCode: 'EQ20190001', purchaseDate: '2019-03-15', originalValue: 25000, reason: 'expired', reasonName: '达到使用年限', applicant: '张三', applyDate: '2024-12-20', status: 0, statusName: '待审批' },
  { id: 'SC20241202', equipmentName: '旧型号显微镜', equipmentCode: 'EQ20180005', purchaseDate: '2018-06-20', originalValue: 15000, reason: 'obsolete', reasonName: '技术淘汰', applicant: '李四', applyDate: '2024-12-18', status: 1, statusName: '已通过' },
  { id: 'SC20241203', equipmentName: '故障电子天平', equipmentCode: 'EQ20200012', purchaseDate: '2020-01-10', originalValue: 8000, reason: 'unrepairable', reasonName: '无法维修', applicant: '王五', applyDate: '2024-12-15', status: 2, statusName: '已驳回' },
  { id: 'SC20241204', equipmentName: '老式培养箱', equipmentCode: 'EQ20170003', purchaseDate: '2017-09-25', originalValue: 35000, reason: 'safety', reasonName: '安全隐患', applicant: '张三', applyDate: '2024-12-10', status: 1, statusName: '已通过' }
])
const getStatusType = (status: number) => { const m: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger' }; return m[status] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', reason: '', status: '' }); ElMessage.info('已重置') }
const handleAdd = () => { Object.assign(form, { equipmentId: '', reason: '', description: '', disposalMethod: '', residualValue: 0 }); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看报废申请：${row.id}`)
const handleApprove = (row: any) => { ElMessageBox.confirm(`确定通过设备"${row.equipmentName}"的报废申请吗？`, '审批确认', { type: 'info' }).then(() => { row.status = 1; row.statusName = '已通过'; ElMessage.success('审批通过') }).catch(() => {}) }
const handleReject = (row: any) => { ElMessageBox.prompt('请输入驳回原因', '驳回申请', { type: 'warning' }).then(() => { row.status = 2; row.statusName = '已驳回'; ElMessage.success('已驳回') }).catch(() => {}) }
const handleDispose = (row: any) => { Object.assign(disposeForm, { method: '', amount: 0, receiver: '', date: '', remark: '' }); disposeVisible.value = true }
const handleUpload = () => { ElMessage.success('附件上传成功'); return false }
const handleSubmit = () => { ElMessage.success('报废申请已提交'); dialogVisible.value = false }
const handleSubmitDispose = () => { ElMessage.success('处置完成'); disposeVisible.value = false }
const handleExport = () => ElMessage.success('导出成功')
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.equipment-scrap-page { height: 100%; }</style>
