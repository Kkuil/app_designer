<template>
  <div class="credit-score-page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 积分规则设置 -->
      <el-tab-pane label="积分规则设置" name="rules">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>信用积分规则配置</span>
              <el-button type="primary" @click="handleAddRule"><el-icon><Plus /></el-icon>新增规则</el-button>
            </div>
          </template>

          <el-table :data="scoreRules" stripe border>
            <el-table-column prop="name" label="规则名称" width="180" />
            <el-table-column prop="typeName" label="规则类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'add' ? 'success' : 'danger'">{{ row.typeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="积分值" width="100">
              <template #default="{ row }">
                <span :class="row.type === 'add' ? 'text-success' : 'text-danger'">
                  {{ row.type === 'add' ? '+' : '-' }}{{ row.score }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="condition" label="触发条件" min-width="200" />
            <el-table-column prop="frequency" label="频率限制" width="120" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.status" @change="handleStatusChange(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditRule(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 积分等级设置 -->
      <el-tab-pane label="积分等级" name="levels">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>积分等级配置</span>
              <el-button type="primary" @click="handleAddLevel"><el-icon><Plus /></el-icon>新增等级</el-button>
            </div>
          </template>

          <el-table :data="scoreLevels" stripe border>
            <el-table-column prop="level" label="等级" width="80">
              <template #default="{ row }">
                <el-tag :color="row.color" style="color: white">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="等级名称" width="120" />
            <el-table-column prop="minScore" label="最低积分" width="100" />
            <el-table-column prop="maxScore" label="最高积分" width="100" />
            <el-table-column prop="privileges" label="享有权益" min-width="250">
              <template #default="{ row }">
                <el-tag v-for="p in row.privileges" :key="p" size="small" style="margin-right: 5px">{{ p }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="restrictions" label="限制措施" min-width="200">
              <template #default="{ row }">
                <span v-if="row.restrictions.length === 0">无限制</span>
                <el-tag v-for="r in row.restrictions" :key="r" type="danger" size="small" style="margin-right: 5px">{{ r }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditLevel(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteLevel(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 用户积分查询 -->
      <el-tab-pane label="用户积分查询" name="query">
        <div class="search-bar">
          <el-form :inline="true">
            <el-form-item label="姓名/工号">
              <el-input v-model="queryForm.keyword" placeholder="请输入" clearable />
            </el-form-item>
            <el-form-item label="积分等级">
              <el-select v-model="queryForm.level" placeholder="全部" clearable>
                <el-option label="钻石" value="5" />
                <el-option label="铂金" value="4" />
                <el-option label="黄金" value="3" />
                <el-option label="白银" value="2" />
                <el-option label="青铜" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="课题组">
              <el-select v-model="queryForm.groupId" placeholder="全部" clearable>
                <el-option label="智慧农业研究组" value="1" />
                <el-option label="作物遗传育种组" value="2" />
                <el-option label="植物保护研究组" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>查询</el-button>
              <el-button @click="handleQueryReset"><el-icon><Refresh /></el-icon>重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="userScoreList" stripe border>
          <el-table-column prop="empNo" label="工号" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="groupName" label="课题组" width="150" />
          <el-table-column prop="score" label="当前积分" width="100">
            <template #default="{ row }">
              <span class="score-value">{{ row.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="levelName" label="积分等级" width="100">
            <template #default="{ row }">
              <el-tag :color="row.levelColor" style="color: white">{{ row.levelName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reservationRate" label="预约完成率" width="110">
            <template #default="{ row }">{{ row.reservationRate }}%</template>
          </el-table-column>
          <el-table-column prop="violationCount" label="违约次数" width="90" />
          <el-table-column prop="lastUpdate" label="最后更新" width="160" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
              <el-button type="success" link size="small" @click="handleAddScore(row)">加分</el-button>
              <el-button type="warning" link size="small" @click="handleDeductScore(row)">扣分</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" />
        </div>
      </el-tab-pane>

      <!-- 积分变动记录 -->
      <el-tab-pane label="变动记录" name="history">
        <div class="search-bar">
          <el-form :inline="true">
            <el-form-item label="用户">
              <el-input v-model="historyForm.userName" placeholder="请输入" clearable />
            </el-form-item>
            <el-form-item label="变动类型">
              <el-select v-model="historyForm.type" placeholder="全部" clearable>
                <el-option label="增加" value="add" />
                <el-option label="扣除" value="deduct" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker v-model="historyForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleHistorySearch"><el-icon><Search /></el-icon>查询</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="scoreHistory" stripe border>
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column prop="userName" label="用户" width="100" />
          <el-table-column prop="typeName" label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="row.type === 'add' ? 'success' : 'danger'" size="small">{{ row.typeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="积分变动" width="100">
            <template #default="{ row }">
              <span :class="row.type === 'add' ? 'text-success' : 'text-danger'">
                {{ row.type === 'add' ? '+' : '-' }}{{ row.score }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="beforeScore" label="变动前" width="80" />
          <el-table-column prop="afterScore" label="变动后" width="80" />
          <el-table-column prop="reason" label="变动原因" min-width="200" />
          <el-table-column prop="operator" label="操作人" width="100" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑规则对话框 -->
    <el-dialog v-model="ruleDialogVisible" :title="isEditRule ? '编辑规则' : '新增规则'" width="600px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称" required>
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型" required>
          <el-radio-group v-model="ruleForm.type">
            <el-radio value="add">加分规则</el-radio>
            <el-radio value="deduct">扣分规则</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="积分值" required>
          <el-input-number v-model="ruleForm.score" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="触发条件" required>
          <el-input v-model="ruleForm.condition" type="textarea" rows="2" placeholder="请描述触发该规则的条件" />
        </el-form-item>
        <el-form-item label="频率限制">
          <el-select v-model="ruleForm.frequency" style="width: 100%">
            <el-option label="无限制" value="none" />
            <el-option label="每日一次" value="daily" />
            <el-option label="每周一次" value="weekly" />
            <el-option label="每月一次" value="monthly" />
            <el-option label="仅一次" value="once" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="ruleForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRuleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户积分详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户积分详情" width="700px">
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="工号">{{ currentUser.empNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
        <el-descriptions-item label="课题组">{{ currentUser.groupName }}</el-descriptions-item>
        <el-descriptions-item label="当前积分">
          <span class="score-value">{{ currentUser.score }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="积分等级">
          <el-tag :color="currentUser.levelColor" style="color: white">{{ currentUser.levelName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预约完成率">{{ currentUser.reservationRate }}%</el-descriptions-item>
        <el-descriptions-item label="违约次数">{{ currentUser.violationCount }} 次</el-descriptions-item>
        <el-descriptions-item label="最后更新">{{ currentUser.lastUpdate }}</el-descriptions-item>
      </el-descriptions>
      <el-divider>近期积分变动</el-divider>
      <el-timeline>
        <el-timeline-item v-for="item in userScoreChanges" :key="item.id" :timestamp="item.time" :type="item.type === 'add' ? 'success' : 'danger'">
          <span :class="item.type === 'add' ? 'text-success' : 'text-danger'">
            {{ item.type === 'add' ? '+' : '-' }}{{ item.score }}
          </span>
          {{ item.reason }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('rules')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const ruleDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditRule = ref(false)
const currentUser = ref<any>(null)

const queryForm = reactive({
  keyword: '',
  level: '',
  groupId: ''
})

const historyForm = reactive({
  userName: '',
  type: '',
  dateRange: null
})

const ruleForm = reactive({
  name: '',
  type: 'add',
  score: 10,
  condition: '',
  frequency: 'none',
  status: true
})

const scoreRules = ref([
  { id: 1, name: '准时完成预约', type: 'add', typeName: '加分', score: 5, condition: '按预约时间准时签到并完成使用', frequency: '每次预约', status: true },
  { id: 2, name: '首次培训通过', type: 'add', typeName: '加分', score: 20, condition: '首次参加仪器培训并考核通过', frequency: '仅一次', status: true },
  { id: 3, name: '预约爽约', type: 'deduct', typeName: '扣分', score: 10, condition: '预约后未签到且未提前取消', frequency: '每次违规', status: true },
  { id: 4, name: '迟到超过30分钟', type: 'deduct', typeName: '扣分', score: 5, condition: '签到时间超过预约开始时间30分钟', frequency: '每次违规', status: true },
  { id: 5, name: '设备操作违规', type: 'deduct', typeName: '扣分', score: 20, condition: '未按操作规程使用设备', frequency: '每次违规', status: true },
  { id: 6, name: '完成满意度评价', type: 'add', typeName: '加分', score: 2, condition: '使用后完成满意度评价', frequency: '每次使用', status: true }
])

const scoreLevels = ref([
  { level: 5, name: '钻石', minScore: 90, maxScore: 100, color: '#9b59b6', privileges: ['优先预约', '免培训', '费用优惠20%'], restrictions: [] },
  { level: 4, name: '铂金', minScore: 80, maxScore: 89, color: '#3498db', privileges: ['优先预约', '费用优惠10%'], restrictions: [] },
  { level: 3, name: '黄金', minScore: 70, maxScore: 79, color: '#f1c40f', privileges: ['正常预约'], restrictions: [] },
  { level: 2, name: '白银', minScore: 60, maxScore: 69, color: '#95a5a6', privileges: ['限制预约数量'], restrictions: ['每日最多2次预约'] },
  { level: 1, name: '青铜', minScore: 0, maxScore: 59, color: '#e74c3c', privileges: ['需审批预约'], restrictions: ['预约需管理员审批', '禁止使用大型仪器'] }
])

const userScoreList = ref([
  { empNo: 'EMP001', name: '张三', groupName: '智慧农业研究组', score: 95, levelName: '钻石', levelColor: '#9b59b6', reservationRate: 98, violationCount: 0, lastUpdate: '2024-12-30 10:00' },
  { empNo: 'EMP002', name: '李四', groupName: '智慧农业研究组', score: 82, levelName: '铂金', levelColor: '#3498db', reservationRate: 92, violationCount: 2, lastUpdate: '2024-12-29 15:30' },
  { empNo: 'EMP003', name: '王五', groupName: '作物遗传育种组', score: 75, levelName: '黄金', levelColor: '#f1c40f', reservationRate: 85, violationCount: 3, lastUpdate: '2024-12-28 09:00' },
  { empNo: 'EMP004', name: '赵六', groupName: '植物保护研究组', score: 62, levelName: '白银', levelColor: '#95a5a6', reservationRate: 72, violationCount: 6, lastUpdate: '2024-12-27 14:20' },
  { empNo: 'EMP005', name: '孙七', groupName: '智慧农业研究组', score: 45, levelName: '青铜', levelColor: '#e74c3c', reservationRate: 58, violationCount: 12, lastUpdate: '2024-12-26 11:00' }
])

const scoreHistory = ref([
  { id: 1, time: '2024-12-30 10:00', userName: '张三', type: 'add', typeName: '增加', score: 5, beforeScore: 90, afterScore: 95, reason: '准时完成预约', operator: '系统' },
  { id: 2, time: '2024-12-29 15:30', userName: '李四', type: 'deduct', typeName: '扣除', score: 10, beforeScore: 92, afterScore: 82, reason: '预约爽约', operator: '系统' },
  { id: 3, time: '2024-12-28 09:00', userName: '王五', type: 'add', typeName: '增加', score: 5, beforeScore: 70, afterScore: 75, reason: '准时完成预约', operator: '系统' },
  { id: 4, time: '2024-12-27 14:20', userName: '赵六', type: 'deduct', typeName: '扣除', score: 5, beforeScore: 67, afterScore: 62, reason: '迟到超过30分钟', operator: '系统' }
])

const userScoreChanges = ref([
  { id: 1, time: '2024-12-30 10:00', type: 'add', score: 5, reason: '准时完成预约' },
  { id: 2, time: '2024-12-28 14:00', type: 'add', score: 5, reason: '准时完成预约' },
  { id: 3, time: '2024-12-25 09:30', type: 'add', score: 2, reason: '完成满意度评价' }
])

const handleAddRule = () => {
  isEditRule.value = false
  Object.assign(ruleForm, { name: '', type: 'add', score: 10, condition: '', frequency: 'none', status: true })
  ruleDialogVisible.value = true
}

const handleEditRule = (row: any) => {
  isEditRule.value = true
  Object.assign(ruleForm, row)
  ruleDialogVisible.value = true
}

const handleDeleteRule = (row: any) => {
  ElMessageBox.confirm(`确定删除规则"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const handleStatusChange = (row: any) => {
  ElMessage.success(`规则已${row.status ? '启用' : '停用'}`)
}

const handleRuleSubmit = () => {
  ElMessage.success(isEditRule.value ? '修改成功' : '添加成功')
  ruleDialogVisible.value = false
}

const handleAddLevel = () => ElMessage.info('添加等级')
const handleEditLevel = (row: any) => ElMessage.info(`编辑等级：${row.name}`)
const handleDeleteLevel = (row: any) => {
  ElMessageBox.confirm(`确定删除等级"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const handleQuery = () => ElMessage.success('查询完成')
const handleQueryReset = () => {
  Object.assign(queryForm, { keyword: '', level: '', groupId: '' })
  ElMessage.info('已重置')
}

const handleViewDetail = (row: any) => {
  currentUser.value = row
  detailDialogVisible.value = true
}

const handleAddScore = (row: any) => {
  ElMessageBox.prompt('请输入加分数值和原因', `为 ${row.name} 加分`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入正整数'
  }).then(({ value }) => {
    ElMessage.success(`已为 ${row.name} 加 ${value} 分`)
  }).catch(() => {})
}

const handleDeductScore = (row: any) => {
  ElMessageBox.prompt('请输入扣分数值和原因', `为 ${row.name} 扣分`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入正整数'
  }).then(({ value }) => {
    ElMessage.success(`已为 ${row.name} 扣 ${value} 分`)
  }).catch(() => {})
}

const handleHistorySearch = () => ElMessage.success('查询完成')
</script>

<style scoped>
.credit-score-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}
</style>
