<template>
  <div class="bill-generation">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账单生成</span>
          <div>
            <el-button type="primary" @click="handleGenerate">生成账单</el-button>
            <el-button @click="handleExport">导出账单</el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="账期">
          <el-date-picker
            v-model="searchForm.billingPeriod"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            value-format="YYYY-MM"
          />
        </el-form-item>

        <el-form-item label="部门">
          <el-select v-model="searchForm.deptId" placeholder="请选择部门" clearable>
            <el-option label="全部部门" value="" />
            <el-option label="生物工程系" value="1" />
            <el-option label="化学系" value="2" />
            <el-option label="物理系" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="生成状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待生成" value="pending" />
            <el-option label="已生成" value="generated" />
            <el-option label="已确认" value="confirmed" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="billList" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="billNo" label="账单编号" width="160" />
        <el-table-column prop="period" label="账期" width="120" />
        <el-table-column prop="deptName" label="部门" />
        <el-table-column prop="userName" label="用户" />
        <el-table-column prop="equipmentCount" label="设备数量" width="100" />
        <el-table-column prop="usageHours" label="使用时长(h)" width="120" />
        <el-table-column prop="amount" label="金额(元)" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">
              ¥{{ row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="generateTime" label="生成时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button 
              link 
              type="success" 
              size="small" 
              @click="confirmBill(row)"
              v-if="row.status === 'generated'"
            >
              确认
            </el-button>
            <el-button 
              link 
              type="danger" 
              size="small" 
              @click="deleteBill(row)"
              v-if="row.status === 'pending'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        :total="page.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 生成账单对话框 -->
    <el-dialog v-model="generateDialog" title="生成账单" width="600px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="账期">
          <el-date-picker
            v-model="generateForm.period"
            type="month"
            placeholder="选择账期"
            value-format="YYYY-MM"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="生成范围">
          <el-radio-group v-model="generateForm.scope">
            <el-radio value="all">全部部门</el-radio>
            <el-radio value="dept">指定部门</el-radio>
            <el-radio value="user">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="选择部门" v-if="generateForm.scope === 'dept'">
          <el-select v-model="generateForm.deptIds" multiple placeholder="请选择部门" style="width: 100%">
            <el-option label="生物工程系" value="1" />
            <el-option label="化学系" value="2" />
            <el-option label="物理系" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择用户" v-if="generateForm.scope === 'user'">
          <el-select v-model="generateForm.userIds" multiple placeholder="请选择用户" style="width: 100%">
            <el-option label="张三" value="1" />
            <el-option label="李四" value="2" />
            <el-option label="王五" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="计费规则">
          <el-select v-model="generateForm.ruleId" placeholder="请选择计费规则" style="width: 100%">
            <el-option label="标准计费规则" value="1" />
            <el-option label="优惠计费规则" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="包含违约费">
          <el-switch v-model="generateForm.includePenalty" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="generateDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmGenerate">确认生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  billingPeriod: [],
  deptId: '',
  status: ''
})

const billList = ref([
  {
    id: 1,
    billNo: 'BILL202412001',
    period: '2024-12',
    deptName: '生物工程系',
    userName: '张三',
    equipmentCount: 3,
    usageHours: 24.5,
    amount: 1225.50,
    status: 'generated',
    generateTime: '2024-12-25 10:00:00'
  },
  {
    id: 2,
    billNo: 'BILL202412002',
    period: '2024-12',
    deptName: '化学系',
    userName: '李四',
    equipmentCount: 2,
    usageHours: 18.0,
    amount: 900.00,
    status: 'confirmed',
    generateTime: '2024-12-25 10:05:00'
  }
])

const page = reactive({
  current: 1,
  size: 10,
  total: 2
})

const generateDialog = ref(false)
const generateForm = reactive({
  period: '',
  scope: 'all',
  deptIds: [],
  userIds: [],
  ruleId: '',
  includePenalty: true
})

const handleGenerate = () => {
  generateDialog.value = true
}

const confirmGenerate = () => {
  ElMessage.success('账单生成成功')
  generateDialog.value = false
}

const handleExport = () => {
  ElMessage.success('账单导出成功')
}

const handleSearch = () => {
  console.log('搜索', searchForm)
}

const handleReset = () => {
  Object.assign(searchForm, {
    billingPeriod: [],
    deptId: '',
    status: ''
  })
}

const viewDetail = (row: any) => {
  console.log('查看详情', row)
}

const confirmBill = (row: any) => {
  ElMessageBox.confirm('确认该账单吗？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('账单已确认')
  })
}

const deleteBill = (row: any) => {
  ElMessageBox.confirm('确认删除该账单吗？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('账单已删除')
  })
}

const getStatusType = (status: string) => {
  const map: any = {
    pending: 'info',
    generated: 'warning',
    confirmed: 'success'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    pending: '待生成',
    generated: '已生成',
    confirmed: '已确认'
  }
  return map[status] || status
}

const handleSizeChange = (size: number) => {
  page.size = size
}

const handleCurrentChange = (current: number) => {
  page.current = current
}
</script>

<style scoped>
.bill-generation {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
