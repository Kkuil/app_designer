<template>
  <div class="fund-manage-page">
    <!-- ★重点项目：科研项目管理-经费管理，支持经费预算、收入支出管理、时间维度查询 -->
    <el-card class="stats-card">
      <template #header>
        <span>★ 项目经费管理（重点功能）</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="4">
          <el-statistic title="项目总预算" :value="fundStats.totalBudget" suffix="万元" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="累计拨入" :value="fundStats.totalIncome" suffix="万元" class="income" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="累计支出" :value="fundStats.totalExpense" suffix="万元" class="expense" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="账户余额" :value="fundStats.balance" suffix="万元" class="balance" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="执行率" :value="fundStats.executeRate" suffix="%" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="在管项目数" :value="fundStats.projectCount" suffix="个" />
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <template #header>
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="经费预算" name="budget" />
          <el-tab-pane label="经费收入" name="income" />
          <el-tab-pane label="经费支出" name="expense" />
          <el-tab-pane label="项目经费" name="project" />
          <el-tab-pane label="报表分析" name="report" />
        </el-tabs>
      </template>

      <!-- 经费预算 -->
      <div v-if="activeTab === 'budget'">
        <div class="toolbar">
          <el-button type="primary" @click="handleAddBudget"><el-icon><Plus /></el-icon>新增预算</el-button>
          <el-button type="success" @click="handleExportBudget"><el-icon><Download /></el-icon>导出</el-button>
        </div>

        <el-table :data="budgetList" stripe border>
          <el-table-column prop="projectName" label="项目名称" min-width="200" />
          <el-table-column prop="year" label="年度" width="80" />
          <el-table-column prop="totalBudget" label="预算总额(万元)" width="120" />
          <el-table-column label="预算明细" width="400">
            <template #default="{ row }">
              <div class="budget-detail">
                <span>设备费: {{ row.equipmentBudget }}万</span>
                <span>材料费: {{ row.materialBudget }}万</span>
                <span>测试费: {{ row.testBudget }}万</span>
                <span>差旅费: {{ row.travelBudget }}万</span>
                <span>其他: {{ row.otherBudget }}万</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="used" label="已使用(万元)" width="110" />
          <el-table-column prop="remaining" label="剩余(万元)" width="100">
            <template #default="{ row }">
              <span :class="{ 'danger': row.remaining < row.totalBudget * 0.1 }">{{ row.remaining }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 'normal' ? 'success' : row.status === 'warning' ? 'warning' : 'danger'">
                {{ row.status === 'normal' ? '正常' : row.status === 'warning' ? '预警' : '超支' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewBudget(row)">详情</el-button>
              <el-button type="warning" link size="small" @click="handleEditBudget(row)">调整</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 经费收入 -->
      <div v-if="activeTab === 'income'">
        <div class="search-bar">
          <el-form :inline="true">
            <el-form-item label="项目">
              <el-select v-model="searchForm.projectId" placeholder="全部项目" clearable style="width: 200px">
                <el-option label="智慧农机监测系统研发" value="1" />
                <el-option label="玉米耐旱品种选育" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item label="收入类型">
              <el-select v-model="searchForm.incomeType" placeholder="全部" clearable>
                <el-option label="拨款到账" value="grant" />
                <el-option label="横向收入" value="horizontal" />
                <el-option label="配套资金" value="matching" />
                <el-option label="其他收入" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="toolbar">
          <el-button type="primary" @click="handleAddIncome"><el-icon><Plus /></el-icon>登记收入</el-button>
          <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出Excel</el-button>
        </div>

        <el-table :data="incomeList" stripe border show-summary :summary-method="getSummaries">
          <el-table-column prop="incomeDate" label="到账日期" width="110" />
          <el-table-column prop="projectName" label="项目名称" min-width="200" />
          <el-table-column prop="typeName" label="收入类型" width="100">
            <template #default="{ row }">
              <el-tag type="success">{{ row.typeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额(万元)" width="120" />
          <el-table-column prop="source" label="资金来源" width="150" />
          <el-table-column prop="voucherNo" label="凭证号" width="130" />
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column prop="recorder" label="登记人" width="80" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewIncome(row)">详情</el-button>
              <el-button type="warning" link size="small" @click="handleEditIncome(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" />
        </div>
      </div>

      <!-- 经费支出 -->
      <div v-if="activeTab === 'expense'">
        <div class="search-bar">
          <el-form :inline="true">
            <el-form-item label="项目">
              <el-select v-model="searchForm.projectId" placeholder="全部项目" clearable style="width: 200px">
                <el-option label="智慧农机监测系统研发" value="1" />
                <el-option label="玉米耐旱品种选育" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item label="支出类别">
              <el-select v-model="searchForm.expenseType" placeholder="全部" clearable>
                <el-option label="设备费" value="equipment" />
                <el-option label="材料费" value="material" />
                <el-option label="测试化验费" value="test" />
                <el-option label="差旅费" value="travel" />
                <el-option label="会议费" value="meeting" />
                <el-option label="劳务费" value="labor" />
                <el-option label="其他费用" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="toolbar">
          <el-button type="primary" @click="handleAddExpense"><el-icon><Plus /></el-icon>登记支出</el-button>
          <el-button type="info" @click="handleReimburse"><el-icon><Tickets /></el-icon>费用报销</el-button>
          <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出Excel</el-button>
        </div>

        <el-table :data="expenseList" stripe border show-summary :summary-method="getSummaries">
          <el-table-column prop="expenseDate" label="支出日期" width="110" />
          <el-table-column prop="projectName" label="项目名称" min-width="180" />
          <el-table-column prop="typeName" label="费用类别" width="100">
            <template #default="{ row }">
              <el-tag :type="getExpenseTagType(row.type)">{{ row.typeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额(万元)" width="110" />
          <el-table-column prop="payee" label="收款方" width="150" show-overflow-tooltip />
          <el-table-column prop="purpose" label="用途说明" min-width="180" show-overflow-tooltip />
          <el-table-column prop="voucherNo" label="凭证号" width="120" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'info'">
                {{ row.status === 'completed' ? '已完成' : row.status === 'pending' ? '待审核' : '处理中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewExpense(row)">详情</el-button>
              <el-button type="warning" link size="small" @click="handleEditExpense(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" />
        </div>
      </div>

      <!-- 项目经费 -->
      <div v-if="activeTab === 'project'">
        <el-table :data="projectFundList" stripe border row-key="id" default-expand-all>
          <el-table-column prop="projectName" label="项目名称" min-width="220" />
          <el-table-column prop="fundSource" label="资金来源" width="120" />
          <el-table-column prop="totalBudget" label="预算(万元)" width="100" />
          <el-table-column prop="totalIncome" label="到账(万元)" width="100" />
          <el-table-column prop="totalExpense" label="支出(万元)" width="100" />
          <el-table-column prop="balance" label="余额(万元)" width="100">
            <template #default="{ row }">
              <span :class="{ 'success': row.balance > 0, 'danger': row.balance < 0 }">{{ row.balance }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="executeRate" label="执行率" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.executeRate" :color="getProgressColor(row.executeRate)" :stroke-width="10" />
            </template>
          </el-table-column>
          <el-table-column prop="endDate" label="结题时间" width="110" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : row.status === 'finished' ? 'info' : 'warning'">
                {{ row.status === 'active' ? '进行中' : row.status === 'finished' ? '已结题' : '待启动' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewProject(row)">详情</el-button>
              <el-button type="success" link size="small" @click="handleViewFundFlow(row)">资金流水</el-button>
              <el-button type="warning" link size="small" @click="handleGenerateReport(row)">生成报表</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 报表分析 -->
      <div v-if="activeTab === 'report'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><span>支出结构分析</span></template>
              <div class="chart-placeholder">
                <div v-for="item in expenseStructure" :key="item.type" class="structure-item">
                  <span class="structure-label">{{ item.typeName }}</span>
                  <el-progress :percentage="item.percent" :color="item.color" />
                  <span class="structure-amount">{{ item.amount }}万元</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><span>月度收支趋势</span></template>
              <div class="chart-placeholder">
                <el-table :data="monthlyTrend" size="small">
                  <el-table-column prop="month" label="月份" width="80" />
                  <el-table-column prop="income" label="收入(万元)" />
                  <el-table-column prop="expense" label="支出(万元)" />
                  <el-table-column prop="balance" label="结余(万元)">
                    <template #default="{ row }">
                      <span :class="{ 'success': row.balance > 0, 'danger': row.balance < 0 }">{{ row.balance }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="24">
            <el-card shadow="hover">
              <template #header>
                <div class="report-header">
                  <span>项目经费执行情况</span>
                  <div>
                    <el-date-picker v-model="reportYear" type="year" placeholder="选择年度" style="width: 120px" />
                    <el-button type="primary" style="margin-left: 10px" @click="handleGenerateAnnualReport">生成年度报表</el-button>
                  </div>
                </div>
              </template>
              <el-table :data="projectExecutionList" stripe>
                <el-table-column prop="projectName" label="项目名称" min-width="200" />
                <el-table-column prop="budget" label="年度预算" width="100" />
                <el-table-column prop="actual" label="实际支出" width="100" />
                <el-table-column prop="rate" label="执行率" width="150">
                  <template #default="{ row }">
                    <el-progress :percentage="row.rate" :status="row.rate >= 80 ? 'success' : row.rate >= 50 ? '' : 'warning'" />
                  </template>
                </el-table-column>
                <el-table-column prop="variance" label="差异" width="100">
                  <template #default="{ row }">
                    <span :class="{ 'success': row.variance >= 0, 'danger': row.variance < 0 }">
                      {{ row.variance >= 0 ? '+' : '' }}{{ row.variance }}万
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="说明" min-width="150" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 收入登记对话框 -->
    <el-dialog v-model="incomeDialogVisible" :title="isEdit ? '编辑收入' : '登记收入'" width="600px">
      <el-form :model="incomeForm" label-width="100px" :rules="incomeRules">
        <el-form-item label="项目" prop="projectId">
          <el-select v-model="incomeForm.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option label="智慧农机监测系统研发" value="1" />
            <el-option label="玉米耐旱品种选育" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="收入类型" prop="type">
          <el-select v-model="incomeForm.type" placeholder="请选择" style="width: 100%">
            <el-option label="拨款到账" value="grant" />
            <el-option label="横向收入" value="horizontal" />
            <el-option label="配套资金" value="matching" />
            <el-option label="其他收入" value="other" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="金额(万元)" prop="amount">
              <el-input-number v-model="incomeForm.amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到账日期" prop="incomeDate">
              <el-date-picker v-model="incomeForm.incomeDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="资金来源">
          <el-input v-model="incomeForm.source" placeholder="请输入资金来源" />
        </el-form-item>
        <el-form-item label="凭证号">
          <el-input v-model="incomeForm.voucherNo" placeholder="请输入财务凭证号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="incomeForm.remark" type="textarea" rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="incomeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleIncomeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 支出登记对话框 -->
    <el-dialog v-model="expenseDialogVisible" :title="isEdit ? '编辑支出' : '登记支出'" width="700px">
      <el-form :model="expenseForm" label-width="100px" :rules="expenseRules">
        <el-form-item label="项目" prop="projectId">
          <el-select v-model="expenseForm.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option label="智慧农机监测系统研发" value="1" />
            <el-option label="玉米耐旱品种选育" value="2" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="费用类别" prop="type">
              <el-select v-model="expenseForm.type" placeholder="请选择" style="width: 100%">
                <el-option label="设备费" value="equipment" />
                <el-option label="材料费" value="material" />
                <el-option label="测试化验费" value="test" />
                <el-option label="差旅费" value="travel" />
                <el-option label="会议费" value="meeting" />
                <el-option label="劳务费" value="labor" />
                <el-option label="其他费用" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="金额(万元)" prop="amount">
              <el-input-number v-model="expenseForm.amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支出日期" prop="expenseDate">
              <el-date-picker v-model="expenseForm.expenseDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="凭证号">
              <el-input v-model="expenseForm.voucherNo" placeholder="请输入凭证号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="收款方">
          <el-input v-model="expenseForm.payee" placeholder="请输入收款单位或个人" />
        </el-form-item>
        <el-form-item label="用途说明" prop="purpose">
          <el-input v-model="expenseForm.purpose" type="textarea" rows="2" placeholder="请详细描述经费用途" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="5">
            <el-button type="primary" plain><el-icon><Upload /></el-icon>上传发票/凭证</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="expenseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExpenseSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 资金流水对话框 -->
    <el-dialog v-model="flowDialogVisible" title="资金流水" width="900px">
      <el-descriptions :column="3" border v-if="currentProject" class="mb-15">
        <el-descriptions-item label="项目名称">{{ currentProject.projectName }}</el-descriptions-item>
        <el-descriptions-item label="预算总额">{{ currentProject.totalBudget }}万元</el-descriptions-item>
        <el-descriptions-item label="账户余额">{{ currentProject.balance }}万元</el-descriptions-item>
      </el-descriptions>
      <el-table :data="fundFlowList" stripe size="small" max-height="400">
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="amount" label="金额(万元)" width="100">
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '+' : '-' }}{{ row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额(万元)" width="100" />
        <el-table-column prop="description" label="说明" />
        <el-table-column prop="operator" label="经办人" width="80" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('budget')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const incomeDialogVisible = ref(false)
const expenseDialogVisible = ref(false)
const flowDialogVisible = ref(false)
const isEdit = ref(false)
const currentProject = ref<any>(null)
const reportYear = ref(new Date())

const fundStats = ref({
  totalBudget: 1580,
  totalIncome: 1200,
  totalExpense: 856,
  balance: 344,
  executeRate: 71.3,
  projectCount: 12
})

const searchForm = reactive({
  projectId: '',
  dateRange: null,
  incomeType: '',
  expenseType: ''
})

const incomeForm = reactive({
  projectId: '',
  type: '',
  amount: 0,
  incomeDate: null,
  source: '',
  voucherNo: '',
  remark: ''
})

const expenseForm = reactive({
  projectId: '',
  type: '',
  amount: 0,
  expenseDate: null,
  payee: '',
  purpose: '',
  voucherNo: ''
})

const incomeRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  type: [{ required: true, message: '请选择收入类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  incomeDate: [{ required: true, message: '请选择到账日期', trigger: 'change' }]
}

const expenseRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  type: [{ required: true, message: '请选择费用类别', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  expenseDate: [{ required: true, message: '请选择支出日期', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入用途说明', trigger: 'blur' }]
}

const budgetList = ref([
  { id: 1, projectName: '智慧农机监测系统研发', year: '2024', totalBudget: 500, equipmentBudget: 200, materialBudget: 100, testBudget: 80, travelBudget: 50, otherBudget: 70, used: 320, remaining: 180, status: 'normal' },
  { id: 2, projectName: '玉米耐旱品种选育', year: '2024', totalBudget: 350, equipmentBudget: 80, materialBudget: 150, testBudget: 60, travelBudget: 30, otherBudget: 30, used: 280, remaining: 70, status: 'warning' },
  { id: 3, projectName: '农药残留快速检测技术', year: '2024', totalBudget: 280, equipmentBudget: 100, materialBudget: 80, testBudget: 50, travelBudget: 25, otherBudget: 25, used: 150, remaining: 130, status: 'normal' }
])

const incomeList = ref([
  { id: 1, incomeDate: '2024-01-15', projectName: '智慧农机监测系统研发', type: 'grant', typeName: '拨款到账', amount: 200, source: '国家科技部', voucherNo: 'SR202401001', remark: '第一批拨款', recorder: '财务李' },
  { id: 2, incomeDate: '2024-02-20', projectName: '玉米耐旱品种选育', type: 'grant', typeName: '拨款到账', amount: 150, source: '省科技厅', voucherNo: 'SR202402001', remark: '项目启动资金', recorder: '财务李' },
  { id: 3, incomeDate: '2024-03-10', projectName: '智慧农机监测系统研发', type: 'horizontal', typeName: '横向收入', amount: 50, source: '某农业公司', voucherNo: 'SR202403001', remark: '合作开发收入', recorder: '财务王' }
])

const expenseList = ref([
  { id: 1, expenseDate: '2024-01-20', projectName: '智慧农机监测系统研发', type: 'equipment', typeName: '设备费', amount: 80, payee: '科技仪器公司', purpose: '采购传感器设备', voucherNo: 'ZC202401001', status: 'completed' },
  { id: 2, expenseDate: '2024-02-15', projectName: '玉米耐旱品种选育', type: 'material', typeName: '材料费', amount: 35, payee: '试剂供应商', purpose: '购买实验试剂耗材', voucherNo: 'ZC202402001', status: 'completed' },
  { id: 3, expenseDate: '2024-03-05', projectName: '智慧农机监测系统研发', type: 'travel', typeName: '差旅费', amount: 12, payee: '张三', purpose: '项目调研出差费用', voucherNo: 'ZC202403001', status: 'pending' }
])

const projectFundList = ref([
  { id: 1, projectName: '智慧农机监测系统研发', fundSource: '国家级', totalBudget: 500, totalIncome: 400, totalExpense: 320, balance: 80, executeRate: 80, endDate: '2025-12-31', status: 'active' },
  { id: 2, projectName: '玉米耐旱品种选育', fundSource: '省级', totalBudget: 350, totalIncome: 300, totalExpense: 280, balance: 20, executeRate: 93, endDate: '2024-12-31', status: 'active' },
  { id: 3, projectName: '农药残留快速检测技术', fundSource: '横向', totalBudget: 280, totalIncome: 200, totalExpense: 150, balance: 50, executeRate: 75, endDate: '2025-06-30', status: 'active' }
])

const expenseStructure = ref([
  { type: 'equipment', typeName: '设备费', amount: 320, percent: 37, color: '#409eff' },
  { type: 'material', typeName: '材料费', amount: 210, percent: 25, color: '#67c23a' },
  { type: 'test', typeName: '测试化验费', amount: 120, percent: 14, color: '#e6a23c' },
  { type: 'travel', typeName: '差旅费', amount: 86, percent: 10, color: '#f56c6c' },
  { type: 'labor', typeName: '劳务费', amount: 70, percent: 8, color: '#909399' },
  { type: 'other', typeName: '其他费用', amount: 50, percent: 6, color: '#c0c4cc' }
])

const monthlyTrend = ref([
  { month: '1月', income: 200, expense: 80, balance: 120 },
  { month: '2月', income: 150, expense: 95, balance: 55 },
  { month: '3月', income: 50, expense: 120, balance: -70 },
  { month: '4月', income: 100, expense: 85, balance: 15 }
])

const projectExecutionList = ref([
  { projectName: '智慧农机监测系统研发', budget: 200, actual: 160, rate: 80, variance: 40, remark: '执行进度正常' },
  { projectName: '玉米耐旱品种选育', budget: 150, actual: 140, rate: 93, variance: 10, remark: '即将完成' },
  { projectName: '农药残留快速检测技术', budget: 120, actual: 60, rate: 50, variance: 60, remark: '需加快执行' }
])

const fundFlowList = ref([
  { date: '2024-03-10', type: 'income', category: '横向收入', amount: 50, balance: 130, description: '某农业公司合作开发收入', operator: '财务王' },
  { date: '2024-03-05', type: 'expense', category: '差旅费', amount: 12, balance: 80, description: '项目调研出差费用', operator: '张三' },
  { date: '2024-02-20', type: 'expense', category: '设备费', amount: 50, balance: 92, description: '采购监测设备', operator: '李四' },
  { date: '2024-01-20', type: 'expense', category: '设备费', amount: 80, balance: 142, description: '采购传感器设备', operator: '李四' },
  { date: '2024-01-15', type: 'income', category: '拨款到账', amount: 200, balance: 222, description: '国家科技部第一批拨款', operator: '财务李' }
])

const getExpenseTagType = (type: string) => {
  const types: Record<string, string> = {
    equipment: 'primary',
    material: 'success',
    test: 'warning',
    travel: 'danger',
    meeting: 'info',
    labor: '',
    other: 'info'
  }
  return types[type] || 'info'
}

const getProgressColor = (rate: number) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 50) return '#409eff'
  if (rate >= 30) return '#e6a23c'
  return '#f56c6c'
}

const getSummaries = (param: any) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (column.property === 'amount') {
      const sum = data.reduce((acc: number, row: any) => acc + (row.amount || 0), 0)
      sums[index] = sum.toFixed(2) + ' 万元'
    } else {
      sums[index] = ''
    }
  })
  return sums
}

const handleTabChange = (tab: string) => console.log('切换标签:', tab)
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
  Object.assign(searchForm, { projectId: '', dateRange: null, incomeType: '', expenseType: '' })
  ElMessage.info('已重置')
}

const handleAddBudget = () => ElMessage.info('新增预算')
const handleExportBudget = () => ElMessage.success('导出预算')
const handleViewBudget = (row: any) => ElMessage.info('查看预算详情')
const handleEditBudget = (row: any) => ElMessage.info('调整预算')

const handleAddIncome = () => {
  isEdit.value = false
  Object.assign(incomeForm, { projectId: '', type: '', amount: 0, incomeDate: null, source: '', voucherNo: '', remark: '' })
  incomeDialogVisible.value = true
}

const handleViewIncome = (row: any) => ElMessage.info('查看收入详情')
const handleEditIncome = (row: any) => {
  isEdit.value = true
  Object.assign(incomeForm, row)
  incomeDialogVisible.value = true
}

const handleIncomeSubmit = () => {
  ElMessage.success(isEdit.value ? '修改成功' : '登记成功')
  incomeDialogVisible.value = false
}

const handleAddExpense = () => {
  isEdit.value = false
  Object.assign(expenseForm, { projectId: '', type: '', amount: 0, expenseDate: null, payee: '', purpose: '', voucherNo: '' })
  expenseDialogVisible.value = true
}

const handleReimburse = () => ElMessage.info('费用报销')
const handleViewExpense = (row: any) => ElMessage.info('查看支出详情')
const handleEditExpense = (row: any) => {
  isEdit.value = true
  Object.assign(expenseForm, row)
  expenseDialogVisible.value = true
}

const handleExpenseSubmit = () => {
  ElMessage.success(isEdit.value ? '修改成功' : '登记成功')
  expenseDialogVisible.value = false
}

const handleExport = () => ElMessage.success('导出成功')

const handleViewProject = (row: any) => ElMessage.info('查看项目经费详情')
const handleViewFundFlow = (row: any) => {
  currentProject.value = row
  flowDialogVisible.value = true
}
const handleGenerateReport = (row: any) => ElMessage.success('报表生成中')
const handleGenerateAnnualReport = () => ElMessage.success('年度报表生成成功')
</script>

<style scoped>
.fund-manage-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card .income :deep(.el-statistic__number) { color: #67c23a; }
.stats-card .expense :deep(.el-statistic__number) { color: #f56c6c; }
.stats-card .balance :deep(.el-statistic__number) { color: #409eff; }

.toolbar, .search-bar {
  margin-bottom: 15px;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.budget-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #606266;
}

.success { color: #67c23a; }
.danger { color: #f56c6c; }

.structure-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.structure-label {
  width: 80px;
  font-size: 13px;
}

.structure-item .el-progress {
  flex: 1;
  margin: 0 10px;
}

.structure-amount {
  width: 80px;
  text-align: right;
  font-size: 13px;
  color: #606266;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-15 {
  margin-bottom: 15px;
}
</style>
