<template>
  <div class="bill-generate-page">
    <el-card>
      <template #header><div class="card-header"><span>账单生成</span><el-button type="primary" @click="handleGenerate"><el-icon><DocumentAdd /></el-icon>生成账单</el-button></div></template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="账期选择"><el-date-picker v-model="searchForm.period" type="month" placeholder="选择账期" format="YYYY年MM月" value-format="YYYY-MM" /></el-form-item>
        <el-form-item label="账单状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="待生成" value="pending" /><el-option label="已生成" value="generated" /><el-option label="已确认" value="confirmed" /><el-option label="已发送" value="sent" /></el-select></el-form-item>
        <el-form-item label="用户类型"><el-select v-model="searchForm.userType" placeholder="全部" clearable><el-option label="内部用户" value="internal" /><el-option label="外部用户" value="external" /><el-option label="合作单位" value="partner" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><div class="card-header"><span>账单列表</span><div><el-button type="success" @click="handleBatchConfirm">批量确认</el-button><el-button type="warning" @click="handleBatchSend">批量发送</el-button><el-button @click="handleExport">导出</el-button></div></div></template>
      <el-table :data="billList" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="billNo" label="账单编号" width="140" />
        <el-table-column prop="period" label="账期" width="100" />
        <el-table-column prop="userName" label="用户名称" min-width="120" />
        <el-table-column prop="userType" label="用户类型" width="90" />
        <el-table-column prop="deptName" label="所属单位" min-width="150" />
        <el-table-column prop="usageTimes" label="使用次数" width="90" />
        <el-table-column prop="totalHours" label="使用时长(h)" width="100" />
        <el-table-column prop="totalAmount" label="账单金额(元)" width="110"><template #default="{ row }"><span style="color: #409EFF; font-weight: bold">{{ row.totalAmount.toFixed(2) }}</span></template></el-table-column>
        <el-table-column prop="discount" label="优惠金额(元)" width="110"><template #default="{ row }"><span style="color: #67C23A">-{{ row.discount.toFixed(2) }}</span></template></el-table-column>
        <el-table-column prop="finalAmount" label="实付金额(元)" width="110"><template #default="{ row }"><span style="color: #F56C6C; font-weight: bold">{{ row.finalAmount.toFixed(2) }}</span></template></el-table-column>
        <el-table-column prop="status" label="状态" width="90"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button v-if="row.status === 'generated'" type="success" link size="small" @click="handleConfirm(row)">确认</el-button><el-button v-if="row.status === 'confirmed'" type="warning" link size="small" @click="handleSend(row)">发送</el-button><el-button type="info" link size="small" @click="handleDownload(row)">下载</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" /></div>
    </el-card>
    <el-dialog v-model="generateVisible" title="生成账单" width="500px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="账期"><el-date-picker v-model="generateForm.period" type="month" placeholder="选择账期" format="YYYY年MM月" value-format="YYYY-MM" style="width: 100%" /></el-form-item>
        <el-form-item label="用户范围"><el-radio-group v-model="generateForm.scope"><el-radio value="all">全部用户</el-radio><el-radio value="external">仅外部用户</el-radio><el-radio value="selected">指定用户</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="generateForm.scope === 'selected'" label="选择用户"><el-select v-model="generateForm.users" multiple filterable placeholder="选择用户" style="width: 100%"><el-option label="张研究员" value="u1" /><el-option label="李博士" value="u2" /><el-option label="外部单位A" value="u3" /></el-select></el-form-item>
        <el-form-item label="自动发送"><el-switch v-model="generateForm.autoSend" /><span style="margin-left: 10px; color: #909399">生成后自动发送给用户</span></el-form-item>
      </el-form>
      <template #footer><el-button @click="generateVisible = false">取消</el-button><el-button type="primary" @click="handleSubmitGenerate">确定生成</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(50), generateVisible = ref(false)
const searchForm = reactive({ period: '', status: '', userType: '' })
const generateForm = reactive({ period: '', scope: 'all', users: [] as string[], autoSend: false })
const selectedRows = ref<any[]>([])
const billList = ref([
  { billNo: 'BILL202412001', period: '2024-12', userName: '外部单位A', userType: '外部', deptName: '某科技有限公司', usageTimes: 15, totalHours: 48, totalAmount: 9600, discount: 960, finalAmount: 8640, status: 'confirmed', statusName: '已确认' },
  { billNo: 'BILL202412002', period: '2024-12', userName: '合作单位B', userType: '合作', deptName: '某农业大学', usageTimes: 22, totalHours: 65, totalAmount: 13000, discount: 1950, finalAmount: 11050, status: 'generated', statusName: '已生成' },
  { billNo: 'BILL202412003', period: '2024-12', userName: '外部用户C', userType: '外部', deptName: '个人用户', usageTimes: 5, totalHours: 12, totalAmount: 2400, discount: 0, finalAmount: 2400, status: 'sent', statusName: '已发送' },
  { billNo: 'BILL202412004', period: '2024-12', userName: '合作单位D', userType: '合作', deptName: '某研究院', usageTimes: 30, totalHours: 80, totalAmount: 16000, discount: 2400, finalAmount: 13600, status: 'pending', statusName: '待生成' }
])
const getStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'info', generated: 'warning', confirmed: 'success', sent: '' }
  return map[status] || 'info'
}
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { period: '', status: '', userType: '' }); ElMessage.info('已重置') }
const handleGenerate = () => { generateVisible.value = true }
const handleSubmitGenerate = () => { ElMessage.success('账单生成任务已提交'); generateVisible.value = false }
const handleSelectionChange = (rows: any[]) => { selectedRows.value = rows }
const handleView = (row: any) => ElMessage.success(`查看账单详情：${row.billNo}`)
const handleConfirm = (row: any) => { row.status = 'confirmed'; row.statusName = '已确认'; ElMessage.success('账单已确认') }
const handleSend = (row: any) => { row.status = 'sent'; row.statusName = '已发送'; ElMessage.success('账单已发送') }
const handleDownload = (row: any) => ElMessage.success(`下载账单：${row.billNo}`)
const handleBatchConfirm = () => { if (selectedRows.value.length === 0) return ElMessage.warning('请选择账单'); ElMessage.success(`已确认${selectedRows.value.length}条账单`) }
const handleBatchSend = () => { if (selectedRows.value.length === 0) return ElMessage.warning('请选择账单'); ElMessage.success(`已发送${selectedRows.value.length}条账单`) }
const handleExport = () => ElMessage.success('导出成功')
</script>
<style scoped>.bill-generate-page { height: 100%; overflow-y: auto; }.card-header { display: flex; justify-content: space-between; align-items: center; }.search-form { margin-bottom: 0; }.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }</style>
