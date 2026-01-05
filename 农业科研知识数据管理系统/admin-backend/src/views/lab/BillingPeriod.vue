<template>
  <div class="billing-period-page">
    <el-card>
      <template #header><div class="card-header"><span>计费周期管理</span><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增计费周期</el-button></div></template>
      <el-table :data="periodList" stripe border>
        <el-table-column prop="id" label="周期编号" width="100" />
        <el-table-column prop="name" label="周期名称" min-width="150" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="status" label="状态" width="100"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="totalAmount" label="总金额(元)" width="120" />
        <el-table-column prop="settledAmount" label="已结算(元)" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button v-if="row.status === 0" type="warning" link size="small" @click="handleSettle(row)">结算</el-button><el-button type="success" link size="small" @click="handleExport(row)">导出</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>当前周期账单明细</span></template>
      <div class="search-bar" style="margin-bottom: 15px">
        <el-form :inline="true">
          <el-form-item label="用户"><el-input v-model="searchForm.user" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="设备"><el-input v-model="searchForm.equipment" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="结算状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="待结算" value="0" /><el-option label="已结算" value="1" /></el-select></el-form-item>
          <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button></el-form-item>
        </el-form>
      </div>
      <el-table :data="billList" stripe border show-summary :summary-method="getSummary">
        <el-table-column prop="id" label="账单编号" width="130" />
        <el-table-column prop="user" label="用户" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="equipment" label="设备名称" min-width="150" />
        <el-table-column prop="useDate" label="使用日期" width="100" />
        <el-table-column prop="duration" label="时长(h)" width="80" />
        <el-table-column prop="unitPrice" label="单价(元/h)" width="100" />
        <el-table-column prop="discount" label="折扣" width="80" />
        <el-table-column prop="amount" label="金额(元)" width="100" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">{{ row.status === 1 ? '已结算' : '待结算' }}</el-tag></template></el-table-column>
      </el-table>
      <div class="pagination-container" style="margin-top: 15px"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>计费统计</span></template>
      <el-row :gutter="20">
        <el-col :span="6"><div class="stat-item"><span class="stat-label">本月收入</span><span class="stat-value">¥{{ monthStats.income.toLocaleString() }}</span></div></el-col>
        <el-col :span="6"><div class="stat-item"><span class="stat-label">待结算金额</span><span class="stat-value">¥{{ monthStats.pending.toLocaleString() }}</span></div></el-col>
        <el-col :span="6"><div class="stat-item"><span class="stat-label">总使用时长</span><span class="stat-value">{{ monthStats.hours }}h</span></div></el-col>
        <el-col :span="6"><div class="stat-item"><span class="stat-label">服务人次</span><span class="stat-value">{{ monthStats.users }}</span></div></el-col>
      </el-row>
    </el-card>
    <el-dialog v-model="dialogVisible" title="新增计费周期" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="周期名称"><el-input v-model="form.name" placeholder="如：2024年12月" /></el-form-item>
        <el-form-item label="周期类型"><el-select v-model="form.type" placeholder="请选择" style="width: 100%"><el-option label="月度" value="month" /><el-option label="季度" value="quarter" /><el-option label="年度" value="year" /><el-option label="自定义" value="custom" /></el-select></el-form-item>
        <el-form-item label="开始日期"><el-date-picker v-model="form.startDate" type="date" placeholder="请选择" style="width: 100%" /></el-form-item>
        <el-form-item label="结束日期"><el-date-picker v-model="form.endDate" type="date" placeholder="请选择" style="width: 100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="settleVisible" title="结算确认" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计费周期">{{ currentPeriod?.name }}</el-descriptions-item>
        <el-descriptions-item label="账单数量">{{ settleInfo.billCount }}笔</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ settleInfo.totalAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="已结算">¥{{ settleInfo.settledAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="待结算" :span="2"><span style="font-size: 20px; font-weight: bold; color: #F56C6C">¥{{ settleInfo.pendingAmount.toLocaleString() }}</span></el-descriptions-item>
      </el-descriptions>
      <el-alert title="确认结算后，该周期内所有待结算账单将标记为已结算状态。" type="warning" style="margin-top: 15px" :closable="false" />
      <template #footer><el-button @click="settleVisible = false">取消</el-button><el-button type="primary" @click="handleConfirmSettle">确认结算</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(50), dialogVisible = ref(false), settleVisible = ref(false), currentPeriod = ref<any>(null)
const searchForm = reactive({ user: '', equipment: '', status: '' })
const form = reactive({ name: '', type: 'month', startDate: '', endDate: '', remark: '' })
const settleInfo = reactive({ billCount: 45, totalAmount: 125600, settledAmount: 98500, pendingAmount: 27100 })
const monthStats = reactive({ income: 98500, pending: 27100, hours: 1280, users: 156 })
const periodList = ref([
  { id: 'P202412', name: '2024年12月', startDate: '2024-12-01', endDate: '2024-12-31', status: 0, statusName: '进行中', totalAmount: 125600, settledAmount: 98500 },
  { id: 'P202411', name: '2024年11月', startDate: '2024-11-01', endDate: '2024-11-30', status: 1, statusName: '已结算', totalAmount: 118900, settledAmount: 118900 },
  { id: 'P202410', name: '2024年10月', startDate: '2024-10-01', endDate: '2024-10-31', status: 1, statusName: '已结算', totalAmount: 135200, settledAmount: 135200 },
  { id: 'P202409', name: '2024年9月', startDate: '2024-09-01', endDate: '2024-09-30', status: 1, statusName: '已结算', totalAmount: 98700, settledAmount: 98700 }
])
const billList = ref([
  { id: 'BL20241222001', user: '张三', department: '研发一部', equipment: '高效液相色谱仪', useDate: '2024-12-22', duration: 3, unitPrice: 200, discount: '内部免费', amount: 0, status: 0 },
  { id: 'BL20241222002', user: '外部用户A', department: 'XX大学', equipment: '气相色谱质谱联用仪', useDate: '2024-12-22', duration: 4, unitPrice: 300, discount: '无', amount: 1200, status: 0 },
  { id: 'BL20241221001', user: '合作单位B', department: 'YY研究所', equipment: '原子吸收光谱仪', useDate: '2024-12-21', duration: 2, unitPrice: 200, discount: '8折', amount: 320, status: 1 },
  { id: 'BL20241220001', user: '外部用户C', department: 'ZZ公司', equipment: '紫外可见分光光度计', useDate: '2024-12-20', duration: 1, unitPrice: 50, discount: '无', amount: 50, status: 1 }
])
const getStatusType = (status: number) => status === 0 ? 'primary' : 'success'
const getSummary = (param: any) => { const { columns, data } = param; const sums: string[] = []; columns.forEach((column: any, index: number) => { if (index === 0) { sums[index] = '合计'; return } if (column.property === 'amount') { sums[index] = '¥' + data.reduce((prev: number, curr: any) => prev + curr.amount, 0).toLocaleString(); return } sums[index] = '' }); return sums }
const handleSearch = () => ElMessage.success('搜索完成')
const handleAdd = () => { Object.assign(form, { name: '', type: 'month', startDate: '', endDate: '', remark: '' }); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看${row.name}详情`)
const handleSettle = (row: any) => { currentPeriod.value = row; settleVisible.value = true }
const handleExport = (row: any) => ElMessage.success(`导出${row.name}账单`)
const handleConfirmSettle = () => { ElMessage.success('结算成功'); settleVisible.value = false }
const handleSubmit = () => { ElMessage.success('创建成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.billing-period-page { height: 100%; overflow-y: auto; }.card-header { display: flex; justify-content: space-between; align-items: center; }.stat-item { text-align: center; padding: 20px; background: #f5f7fa; border-radius: 8px; }.stat-label { display: block; font-size: 14px; color: #909399; margin-bottom: 10px; }.stat-value { font-size: 24px; font-weight: bold; color: #303133; }</style>
