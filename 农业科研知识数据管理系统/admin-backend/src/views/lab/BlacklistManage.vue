<template>
  <div class="blacklist-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>黑名单管理</span>
          <el-button type="danger" @click="handleAdd"><el-icon><Plus /></el-icon>添加黑名单</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true">
          <el-form-item label="姓名/工号">
            <el-input v-model="searchForm.keyword" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="黑名单类型">
            <el-select v-model="searchForm.type" placeholder="全部" clearable>
              <el-option label="预约违约" value="violation" />
              <el-option label="设备损坏" value="damage" />
              <el-option label="费用拖欠" value="overdue" />
              <el-option label="违规操作" value="misconduct" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option label="生效中" value="active" />
              <el-option label="已解除" value="released" />
              <el-option label="已过期" value="expired" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
            <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-row">
        <el-statistic title="黑名单总数" :value="blacklistStats.total" />
        <el-statistic title="生效中" :value="blacklistStats.active" class="danger" />
        <el-statistic title="已解除" :value="blacklistStats.released" class="success" />
        <el-statistic title="本月新增" :value="blacklistStats.thisMonth" />
      </div>

      <!-- 黑名单列表 -->
      <el-table :data="blacklist" stripe border>
        <el-table-column prop="empNo" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="所属部门" width="150" />
        <el-table-column prop="groupName" label="课题组" width="150" />
        <el-table-column prop="typeName" label="黑名单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="startDate" label="生效日期" width="110" />
        <el-table-column prop="endDate" label="结束日期" width="110" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button v-if="row.status === 'active'" type="success" link size="small" @click="handleRelease(row)">解除</el-button>
            <el-button v-if="row.status === 'active'" type="warning" link size="small" @click="handleExtend(row)">延期</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" />
      </div>
    </el-card>

    <!-- 添加黑名单对话框 -->
    <el-dialog v-model="dialogVisible" title="添加黑名单" width="600px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="选择人员" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择或搜索人员" style="width: 100%" filterable remote :remote-method="searchUser">
            <el-option v-for="u in userOptions" :key="u.id" :label="`${u.name} (${u.empNo})`" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="黑名单类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option label="预约违约" value="violation" />
            <el-option label="设备损坏" value="damage" />
            <el-option label="费用拖欠" value="overdue" />
            <el-option label="违规操作" value="misconduct" />
          </el-select>
        </el-form-item>
        <el-form-item label="限制范围">
          <el-checkbox-group v-model="form.restrictions">
            <el-checkbox value="reservation">禁止预约</el-checkbox>
            <el-checkbox value="reagent">禁止领用试剂</el-checkbox>
            <el-checkbox value="project">禁止参与项目</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="生效日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="date" placeholder="选择生效日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原因说明" prop="reason">
          <el-input v-model="form.reason" type="textarea" rows="3" placeholder="请详细说明加入黑名单的原因" />
        </el-form-item>
        <el-form-item label="附件证明">
          <el-upload action="#" :auto-upload="false" :limit="3">
            <el-button type="primary" plain><el-icon><Upload /></el-icon>上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleSubmit">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="黑名单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentRecord">
        <el-descriptions-item label="工号">{{ currentRecord.empNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentRecord.name }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentRecord.department }}</el-descriptions-item>
        <el-descriptions-item label="课题组">{{ currentRecord.groupName }}</el-descriptions-item>
        <el-descriptions-item label="黑名单类型">
          <el-tag :type="getTypeColor(currentRecord.type)">{{ currentRecord.typeName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRecord.status)">{{ currentRecord.statusName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="生效日期">{{ currentRecord.startDate }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ currentRecord.endDate }}</el-descriptions-item>
        <el-descriptions-item label="原因说明" :span="2">{{ currentRecord.reason }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentRecord.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentRecord.createTime }}</el-descriptions-item>
      </el-descriptions>
      <el-divider>违规历史</el-divider>
      <el-timeline>
        <el-timeline-item v-for="item in violationHistory" :key="item.id" :timestamp="item.time" placement="top" :type="item.type">
          {{ item.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(30)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentRecord = ref<any>(null)

const blacklistStats = ref({
  total: 30,
  active: 12,
  released: 15,
  thisMonth: 3
})

const searchForm = reactive({
  keyword: '',
  type: '',
  status: ''
})

const form = reactive({
  userId: '',
  type: '',
  restrictions: ['reservation'],
  startDate: null,
  endDate: null,
  reason: ''
})

const rules = {
  userId: [{ required: true, message: '请选择人员', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  reason: [{ required: true, message: '请填写原因', trigger: 'blur' }]
}

const userOptions = ref([
  { id: 1, name: '张三', empNo: 'EMP001' },
  { id: 2, name: '李四', empNo: 'EMP002' },
  { id: 3, name: '王五', empNo: 'EMP003' }
])

const blacklist = ref([
  { id: 1, empNo: 'EMP006', name: '周八', department: '农业科学研究院', groupName: '智慧农业研究组', type: 'violation', typeName: '预约违约', reason: '连续3次预约未到，严重影响设备使用效率', startDate: '2024-12-01', endDate: '2025-01-31', status: 'active', statusName: '生效中', operator: '管理员', createTime: '2024-12-01 10:00' },
  { id: 2, empNo: 'EMP007', name: '吴九', department: '农业科学研究院', groupName: '作物遗传育种组', type: 'damage', typeName: '设备损坏', reason: '操作不当导致高效液相色谱仪色谱柱损坏', startDate: '2024-11-15', endDate: '2025-02-15', status: 'active', statusName: '生效中', operator: '管理员', createTime: '2024-11-15 14:30' },
  { id: 3, empNo: 'EMP008', name: '郑十', department: '外校访问', groupName: '-', type: 'overdue', typeName: '费用拖欠', reason: '拖欠仪器使用费用超过3个月', startDate: '2024-10-01', endDate: '2024-12-31', status: 'released', statusName: '已解除', operator: '管理员', createTime: '2024-10-01 09:00' },
  { id: 4, empNo: 'EMP009', name: '冯十一', department: '农业科学研究院', groupName: '植物保护研究组', type: 'misconduct', typeName: '违规操作', reason: '未经授权使用仪器，违反安全操作规程', startDate: '2024-09-01', endDate: '2024-11-30', status: 'expired', statusName: '已过期', operator: '管理员', createTime: '2024-09-01 11:00' }
])

const violationHistory = ref([
  { id: 1, time: '2024-12-01', content: '预约高效液相色谱仪未到', type: 'warning' },
  { id: 2, time: '2024-11-25', content: '预约气相色谱仪未到', type: 'warning' },
  { id: 3, time: '2024-11-15', content: '预约紫外分光光度计未到', type: 'warning' },
  { id: 4, time: '2024-12-01', content: '加入黑名单', type: 'danger' }
])

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    violation: 'warning',
    damage: 'danger',
    overdue: 'info',
    misconduct: 'danger'
  }
  return colors[type] || 'info'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'danger',
    released: 'success',
    expired: 'info'
  }
  return types[status] || 'info'
}

const searchUser = (query: string) => {
  console.log('搜索用户:', query)
}

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
  Object.assign(searchForm, { keyword: '', type: '', status: '' })
  ElMessage.info('已重置')
}

const handleAdd = () => {
  Object.assign(form, { userId: '', type: '', restrictions: ['reservation'], startDate: null, endDate: null, reason: '' })
  dialogVisible.value = true
}

const handleView = (row: any) => {
  currentRecord.value = row
  detailVisible.value = true
}

const handleRelease = (row: any) => {
  ElMessageBox.confirm(`确定要解除"${row.name}"的黑名单吗？`, '解除确认', { type: 'warning' })
    .then(() => ElMessage.success('已解除黑名单'))
    .catch(() => {})
}

const handleExtend = (row: any) => {
  ElMessage.info(`延期 ${row.name} 的黑名单`)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除该黑名单记录吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const handleSubmit = () => {
  ElMessage.success('添加黑名单成功')
  dialogVisible.value = false
}
</script>

<style scoped>
.blacklist-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.stats-row {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stats-row .danger :deep(.el-statistic__number) {
  color: #f56c6c;
}

.stats-row .success :deep(.el-statistic__number) {
  color: #67c23a;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
