<template>
  <div class="billing-manage-page">
    <!-- ★重点项目：支持对经费进行全方位管理 -->
    <el-card class="stats-card">
      <template #header>
        <span>★ 计费管理概览（重点功能）</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="本月计费总额" :value="156800" prefix="¥">
            <template #suffix><span class="trend up">↑ 12%</span></template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="待结算金额" :value="45600" prefix="¥">
            <template #suffix><span class="trend down">↓ 5%</span></template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="已结算金额" :value="111200" prefix="¥" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="本月账单数" :value="328" suffix="笔" />
        </el-col>
      </el-row>
    </el-card>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 账单管理 -->
      <el-tab-pane label="账单管理" name="bills">
        <div class="search-bar">
          <el-form :inline="true">
            <el-form-item label="账单编号">
              <el-input v-model="billSearchForm.billNo" placeholder="请输入" clearable />
            </el-form-item>
            <el-form-item label="课题组">
              <el-select v-model="billSearchForm.groupId" placeholder="全部" clearable>
                <el-option label="智慧农业研究组" value="1" />
                <el-option label="作物遗传育种组" value="2" />
                <el-option label="植物保护研究组" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="billSearchForm.status" placeholder="全部" clearable>
                <el-option label="待确认" value="pending" />
                <el-option label="已确认" value="confirmed" />
                <el-option label="已结算" value="settled" />
                <el-option label="有争议" value="disputed" />
              </el-select>
            </el-form-item>
            <el-form-item label="账期">
              <el-date-picker v-model="billSearchForm.period" type="month" placeholder="选择账期" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBillSearch"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="handleBillReset"><el-icon><Refresh /></el-icon>重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="action-bar">
          <el-button type="primary" @click="handleGenerateBill"><el-icon><DocumentAdd /></el-icon>生成账单</el-button>
          <el-button type="success" @click="handleBatchConfirm"><el-icon><Check /></el-icon>批量确认</el-button>
          <el-button type="warning" @click="handleExportBill"><el-icon><Download /></el-icon>导出账单</el-button>
        </div>

        <el-table :data="billList" stripe border @selection-change="handleBillSelect">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="billNo" label="账单编号" width="150" />
          <el-table-column prop="groupName" label="课题组" width="150" />
          <el-table-column prop="period" label="账期" width="100" />
          <el-table-column prop="usageCount" label="使用次数" width="100" />
          <el-table-column prop="totalHours" label="总时长(小时)" width="110" />
          <el-table-column prop="amount" label="应付金额" width="120">
            <template #default="{ row }">
              <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getBillStatusType(row.status)">{{ row.statusName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="生成时间" width="160" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewBill(row)">详情</el-button>
              <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="handleConfirmBill(row)">确认</el-button>
              <el-button v-if="row.status === 'confirmed'" type="warning" link size="small" @click="handleSettleBill(row)">结算</el-button>
              <el-button type="info" link size="small" @click="handlePrintBill(row)">打印</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 费用明细 -->
      <el-tab-pane label="费用明细" name="details">
        <el-table :data="feeDetailList" stripe border>
          <el-table-column prop="recordNo" label="记录编号" width="150" />
          <el-table-column prop="instrumentName" label="仪器名称" min-width="150" />
          <el-table-column prop="userName" label="使用人" width="100" />
          <el-table-column prop="groupName" label="课题组" width="150" />
          <el-table-column prop="date" label="使用日期" width="110" />
          <el-table-column prop="timeSlot" label="时间段" width="130" />
          <el-table-column prop="duration" label="时长(小时)" width="100" />
          <el-table-column prop="unitPrice" label="单价(元/时)" width="110" />
          <el-table-column prop="fee" label="费用" width="100">
            <template #default="{ row }">¥{{ row.fee }}</template>
          </el-table-column>
          <el-table-column prop="billNo" label="关联账单" width="150" />
        </el-table>
      </el-tab-pane>

      <!-- 计费规则 -->
      <el-tab-pane label="计费规则" name="rules">
        <div class="action-bar">
          <el-button type="primary" @click="handleAddRule"><el-icon><Plus /></el-icon>新增规则</el-button>
        </div>
        <el-table :data="billingRules" stripe border>
          <el-table-column prop="name" label="规则名称" width="150" />
          <el-table-column prop="instrumentType" label="适用仪器类型" width="150" />
          <el-table-column prop="userType" label="适用用户类型" width="120" />
          <el-table-column prop="priceType" label="计费方式" width="100" />
          <el-table-column prop="basePrice" label="基准价格" width="100">
            <template #default="{ row }">¥{{ row.basePrice }}</template>
          </el-table-column>
          <el-table-column prop="discount" label="折扣率" width="80" />
          <el-table-column prop="effectiveDate" label="生效日期" width="110" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status ? 'success' : 'info'">{{ row.status ? '启用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditRule(row)">编辑</el-button>
              <el-button :type="row.status ? 'warning' : 'success'" link size="small" @click="handleToggleRule(row)">
                {{ row.status ? '停用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 账期设置 -->
      <el-tab-pane label="账期设置" name="period">
        <el-form :model="periodForm" label-width="150px" style="max-width: 600px">
          <el-form-item label="账期周期">
            <el-radio-group v-model="periodForm.cycle">
              <el-radio value="monthly">按月</el-radio>
              <el-radio value="quarterly">按季度</el-radio>
              <el-radio value="yearly">按年</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="账单生成日">
            <el-input-number v-model="periodForm.generateDay" :min="1" :max="28" />
            <span style="margin-left: 10px; color: #909399">日（每月）</span>
          </el-form-item>
          <el-form-item label="自动确认天数">
            <el-input-number v-model="periodForm.autoConfirmDays" :min="1" :max="30" />
            <span style="margin-left: 10px; color: #909399">天后自动确认</span>
          </el-form-item>
          <el-form-item label="结算截止日">
            <el-input-number v-model="periodForm.settleDeadline" :min="1" :max="28" />
            <span style="margin-left: 10px; color: #909399">日（次月）</span>
          </el-form-item>
          <el-form-item label="逾期提醒">
            <el-switch v-model="periodForm.overdueRemind" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSavePeriod">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 账单详情对话框 -->
    <el-dialog v-model="billDetailVisible" title="账单详情" width="800px">
      <el-descriptions :column="3" border v-if="currentBill">
        <el-descriptions-item label="账单编号">{{ currentBill.billNo }}</el-descriptions-item>
        <el-descriptions-item label="课题组">{{ currentBill.groupName }}</el-descriptions-item>
        <el-descriptions-item label="账期">{{ currentBill.period }}</el-descriptions-item>
        <el-descriptions-item label="使用次数">{{ currentBill.usageCount }} 次</el-descriptions-item>
        <el-descriptions-item label="总时长">{{ currentBill.totalHours }} 小时</el-descriptions-item>
        <el-descriptions-item label="应付金额">
          <span class="amount">¥{{ currentBill.amount?.toLocaleString() }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <el-divider>费用明细</el-divider>
      <el-table :data="billDetailItems" stripe border max-height="300">
        <el-table-column prop="instrumentName" label="仪器名称" />
        <el-table-column prop="date" label="日期" width="100" />
        <el-table-column prop="duration" label="时长(小时)" width="100" />
        <el-table-column prop="fee" label="费用" width="100">
          <template #default="{ row }">¥{{ row.fee }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('bills')
const billDetailVisible = ref(false)
const currentBill = ref<any>(null)

const billSearchForm = reactive({
  billNo: '',
  groupId: '',
  status: '',
  period: null
})

const periodForm = reactive({
  cycle: 'monthly',
  generateDay: 1,
  autoConfirmDays: 7,
  settleDeadline: 15,
  overdueRemind: true
})

const billList = ref([
  { billNo: 'BILL202412001', groupName: '智慧农业研究组', period: '2024-12', usageCount: 45, totalHours: 156, amount: 31200, status: 'confirmed', statusName: '已确认', createTime: '2025-01-01 00:00' },
  { billNo: 'BILL202412002', groupName: '作物遗传育种组', period: '2024-12', usageCount: 32, totalHours: 98, amount: 19600, status: 'pending', statusName: '待确认', createTime: '2025-01-01 00:00' },
  { billNo: 'BILL202412003', groupName: '植物保护研究组', period: '2024-12', usageCount: 28, totalHours: 85, amount: 17000, status: 'settled', statusName: '已结算', createTime: '2025-01-01 00:00' },
  { billNo: 'BILL202411001', groupName: '智慧农业研究组', period: '2024-11', usageCount: 52, totalHours: 180, amount: 36000, status: 'settled', statusName: '已结算', createTime: '2024-12-01 00:00' }
])

const feeDetailList = ref([
  { recordNo: 'FEE20241230001', instrumentName: '高效液相色谱仪', userName: '张三', groupName: '智慧农业研究组', date: '2024-12-30', timeSlot: '09:00-12:00', duration: 3, unitPrice: 200, fee: 600, billNo: 'BILL202412001' },
  { recordNo: 'FEE20241229001', instrumentName: '气相色谱质谱联用仪', userName: '李四', groupName: '智慧农业研究组', date: '2024-12-29', timeSlot: '14:00-17:00', duration: 3, unitPrice: 300, fee: 900, billNo: 'BILL202412001' },
  { recordNo: 'FEE20241228001', instrumentName: '紫外可见分光光度计', userName: '王五', groupName: '作物遗传育种组', date: '2024-12-28', timeSlot: '10:00-11:00', duration: 1, unitPrice: 50, fee: 50, billNo: 'BILL202412002' }
])

const billingRules = ref([
  { name: '大型仪器标准计费', instrumentType: '大型精密仪器', userType: '校内用户', priceType: '按时', basePrice: 200, discount: '0.8', effectiveDate: '2024-01-01', status: true },
  { name: '常规仪器计费', instrumentType: '常规分析仪器', userType: '校内用户', priceType: '按时', basePrice: 50, discount: '1.0', effectiveDate: '2024-01-01', status: true },
  { name: '校外用户标准', instrumentType: '全部仪器', userType: '校外用户', priceType: '按时', basePrice: 300, discount: '1.0', effectiveDate: '2024-01-01', status: true }
])

const billDetailItems = ref([
  { instrumentName: '高效液相色谱仪', date: '2024-12-30', duration: 3, fee: 600 },
  { instrumentName: '气相色谱质谱联用仪', date: '2024-12-29', duration: 3, fee: 900 },
  { instrumentName: '紫外可见分光光度计', date: '2024-12-28', duration: 2, fee: 100 }
])

const getBillStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    settled: 'success',
    disputed: 'danger'
  }
  return types[status] || 'info'
}

const handleBillSearch = () => ElMessage.success('搜索完成')
const handleBillReset = () => {
  Object.assign(billSearchForm, { billNo: '', groupId: '', status: '', period: null })
  ElMessage.info('已重置')
}

const handleGenerateBill = () => ElMessage.success('账单生成任务已提交')
const handleBatchConfirm = () => ElMessage.success('批量确认成功')
const handleExportBill = () => ElMessage.success('账单导出成功')

const handleViewBill = (row: any) => {
  currentBill.value = row
  billDetailVisible.value = true
}

const handleConfirmBill = (row: any) => ElMessage.success(`账单 ${row.billNo} 已确认`)
const handleSettleBill = (row: any) => ElMessage.success(`账单 ${row.billNo} 已结算`)
const handlePrintBill = (row: any) => ElMessage.success(`打印账单 ${row.billNo}`)

const handleBillSelect = (selection: any[]) => {
  console.log('选中账单:', selection)
}

const handleAddRule = () => ElMessage.info('打开新增规则对话框')
const handleEditRule = (row: any) => ElMessage.info(`编辑规则：${row.name}`)
const handleToggleRule = (row: any) => {
  row.status = !row.status
  ElMessage.success(`规则已${row.status ? '启用' : '停用'}`)
}

const handleSavePeriod = () => ElMessage.success('账期设置保存成功')
</script>

<style scoped>
.billing-manage-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  margin-bottom: 0;
}

.trend {
  font-size: 12px;
  margin-left: 5px;
}

.trend.up { color: #67c23a; }
.trend.down { color: #f56c6c; }

.search-bar {
  margin-bottom: 15px;
}

.action-bar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.amount {
  color: #f56c6c;
  font-weight: bold;
}
</style>
