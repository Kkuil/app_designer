<template>
  <div class="research-group-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课题组管理</span>
          <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新建课题组</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true">
          <el-form-item label="课题组名称">
            <el-input v-model="searchForm.name" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="searchForm.leader" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="研究方向">
            <el-select v-model="searchForm.direction" placeholder="全部" clearable>
              <el-option label="智慧农业" value="smart" />
              <el-option label="作物育种" value="breeding" />
              <el-option label="植物保护" value="protection" />
              <el-option label="土壤环境" value="soil" />
              <el-option label="农产品加工" value="processing" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
            <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 课题组卡片列表 -->
      <el-row :gutter="20">
        <el-col :span="8" v-for="group in groupList" :key="group.id">
          <el-card class="group-card" shadow="hover">
            <template #header>
              <div class="group-header">
                <span class="group-name">{{ group.name }}</span>
                <el-dropdown @command="(cmd: string) => handleCommand(cmd, group)">
                  <el-icon class="more-btn"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="members">成员管理</el-dropdown-item>
                      <el-dropdown-item command="budget">经费管理</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div class="group-info">
              <p><el-icon><User /></el-icon> 负责人：{{ group.leader }}</p>
              <p><el-icon><Folder /></el-icon> 研究方向：{{ group.direction }}</p>
              <p><el-icon><Calendar /></el-icon> 成立日期：{{ group.createDate }}</p>
            </div>
            <el-divider />
            <div class="group-stats">
              <div class="stat-item">
                <span class="stat-value">{{ group.memberCount }}</span>
                <span class="stat-label">成员</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ group.projectCount }}</span>
                <span class="stat-label">项目</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ group.equipmentHours }}h</span>
                <span class="stat-label">仪器使用</span>
              </div>
            </div>
            <el-divider />
            <div class="group-budget">
              <div class="budget-info">
                <span>经费情况</span>
                <span class="budget-value">¥{{ (group.usedBudget / 10000).toFixed(1) }}万 / {{ (group.totalBudget / 10000).toFixed(0) }}万</span>
              </div>
              <el-progress :percentage="Math.round(group.usedBudget / group.totalBudget * 100)" :color="getBudgetColor(group.usedBudget / group.totalBudget)" />
            </div>
            <div class="group-actions">
              <el-button type="primary" text @click="handleViewDetail(group)">查看详情</el-button>
              <el-button type="success" text @click="handleViewMembers(group)">成员列表</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[6, 12, 24]" :total="total" layout="total, sizes, prev, pager, next" />
      </div>
    </el-card>

    <!-- 新建/编辑课题组对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课题组' : '新建课题组'" width="700px">
      <el-form :model="form" label-width="100px" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课题组名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入课题组名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课题组编号">
              <el-input v-model="form.code" placeholder="自动生成或手动输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人(PI)" prop="leaderId">
              <el-select v-model="form.leaderId" placeholder="请选择负责人" style="width: 100%" filterable>
                <el-option v-for="u in leaderOptions" :key="u.id" :label="u.name" :value="u.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="成立日期">
              <el-date-picker v-model="form.createDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="研究方向">
              <el-select v-model="form.direction" placeholder="请选择" style="width: 100%">
                <el-option label="智慧农业" value="智慧农业" />
                <el-option label="作物育种" value="作物育种" />
                <el-option label="植物保护" value="植物保护" />
                <el-option label="土壤环境" value="土壤环境" />
                <el-option label="农产品加工" value="农产品加工" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属单位">
              <el-input v-model="form.department" placeholder="请输入所属单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年度经费">
              <el-input-number v-model="form.totalBudget" :min="0" :step="10000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="联系邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="课题组简介">
          <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入课题组简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 课题组详情对话框 -->
    <el-dialog v-model="detailVisible" :title="currentGroup?.name" width="800px">
      <el-descriptions :column="2" border v-if="currentGroup">
        <el-descriptions-item label="课题组编号">{{ currentGroup.code }}</el-descriptions-item>
        <el-descriptions-item label="课题组名称">{{ currentGroup.name }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentGroup.leader }}</el-descriptions-item>
        <el-descriptions-item label="研究方向">{{ currentGroup.direction }}</el-descriptions-item>
        <el-descriptions-item label="成立日期">{{ currentGroup.createDate }}</el-descriptions-item>
        <el-descriptions-item label="所属单位">{{ currentGroup.department }}</el-descriptions-item>
        <el-descriptions-item label="成员数量">{{ currentGroup.memberCount }} 人</el-descriptions-item>
        <el-descriptions-item label="在研项目">{{ currentGroup.projectCount }} 个</el-descriptions-item>
        <el-descriptions-item label="年度经费">¥{{ currentGroup.totalBudget?.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="已使用经费">¥{{ currentGroup.usedBudget?.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="仪器使用时长">{{ currentGroup.equipmentHours }} 小时</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag type="success">正常运行</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ currentGroup.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 成员管理对话框 -->
    <el-dialog v-model="memberVisible" :title="`${currentGroup?.name} - 成员管理`" width="900px">
      <div class="member-actions">
        <el-button type="primary" size="small" @click="handleAddMember"><el-icon><Plus /></el-icon>添加成员</el-button>
      </div>
      <el-table :data="memberList" stripe border>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="roleName" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'pi' ? 'success' : row.role === 'researcher' ? 'primary' : 'info'">{{ row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="joinDate" label="加入日期" width="110" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" link size="small" @click="handleEditMember(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleRemoveMember(row)" :disabled="row.role === 'pi'">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(12)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const memberVisible = ref(false)
const isEdit = ref(false)
const currentGroup = ref<any>(null)

const searchForm = reactive({
  name: '',
  leader: '',
  direction: ''
})

const form = reactive({
  name: '',
  code: '',
  leaderId: '',
  createDate: null,
  direction: '',
  department: '',
  totalBudget: 500000,
  phone: '',
  email: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入课题组名称', trigger: 'blur' }],
  leaderId: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

const leaderOptions = ref([
  { id: 1, name: '张教授' },
  { id: 2, name: '李教授' },
  { id: 3, name: '王教授' }
])

const groupList = ref([
  { id: 1, code: 'GRP001', name: '智慧农业研究组', leader: '张教授', direction: '智慧农业', createDate: '2020-03-15', department: '农业科学研究院', memberCount: 12, projectCount: 5, equipmentHours: 580, totalBudget: 1200000, usedBudget: 680000, description: '主要从事农业物联网、智能监测、精准农业等方向的研究工作' },
  { id: 2, code: 'GRP002', name: '作物遗传育种组', leader: '李教授', direction: '作物育种', createDate: '2018-09-01', department: '农业科学研究院', memberCount: 18, projectCount: 8, equipmentHours: 920, totalBudget: 2000000, usedBudget: 1500000, description: '专注于玉米、小麦等主要粮食作物的遗传改良与新品种选育' },
  { id: 3, code: 'GRP003', name: '植物保护研究组', leader: '王教授', direction: '植物保护', createDate: '2019-06-20', department: '农业科学研究院', memberCount: 10, projectCount: 4, equipmentHours: 420, totalBudget: 800000, usedBudget: 350000, description: '开展植物病虫害防治、农药减量化、绿色防控等研究工作' },
  { id: 4, code: 'GRP004', name: '土壤环境研究组', leader: '赵教授', direction: '土壤环境', createDate: '2021-01-10', department: '农业科学研究院', memberCount: 8, projectCount: 3, equipmentHours: 280, totalBudget: 600000, usedBudget: 200000, description: '研究土壤改良、污染修复、可持续农业等领域' }
])

const memberList = ref([
  { id: 1, name: '张教授', role: 'pi', roleName: 'PI负责人', title: '教授', email: 'zhang@example.com', joinDate: '2020-03-15' },
  { id: 2, name: '李研究员', role: 'researcher', roleName: '研究员', title: '副研究员', email: 'li@example.com', joinDate: '2020-06-01' },
  { id: 3, name: '王博士', role: 'student', roleName: '博士生', title: '在读博士', email: 'wang@example.com', joinDate: '2022-09-01' },
  { id: 4, name: '赵硕士', role: 'student', roleName: '硕士生', title: '在读硕士', email: 'zhao@example.com', joinDate: '2023-09-01' }
])

const getBudgetColor = (ratio: number) => {
  if (ratio >= 0.9) return '#f56c6c'
  if (ratio >= 0.7) return '#e6a23c'
  return '#67c23a'
}

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
  Object.assign(searchForm, { name: '', leader: '', direction: '' })
  ElMessage.info('已重置')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { name: '', code: '', leaderId: '', createDate: null, direction: '', department: '', totalBudget: 500000, phone: '', email: '', description: '' })
  dialogVisible.value = true
}

const handleCommand = (command: string, group: any) => {
  currentGroup.value = group
  switch (command) {
    case 'edit':
      isEdit.value = true
      Object.assign(form, group)
      dialogVisible.value = true
      break
    case 'members':
      memberVisible.value = true
      break
    case 'budget':
      ElMessage.info(`管理 ${group.name} 的经费`)
      break
    case 'delete':
      ElMessageBox.confirm(`确定删除课题组"${group.name}"吗？`, '提示', { type: 'warning' })
        .then(() => ElMessage.success('删除成功'))
        .catch(() => {})
      break
  }
}

const handleViewDetail = (group: any) => {
  currentGroup.value = group
  detailVisible.value = true
}

const handleViewMembers = (group: any) => {
  currentGroup.value = group
  memberVisible.value = true
}

const handleSubmit = () => {
  ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
  dialogVisible.value = false
}

const handleAddMember = () => ElMessage.info('添加成员')
const handleEditMember = (row: any) => ElMessage.info(`编辑成员：${row.name}`)
const handleRemoveMember = (row: any) => {
  ElMessageBox.confirm(`确定将"${row.name}"移出课题组吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('移除成功'))
    .catch(() => {})
}
</script>

<style scoped>
.research-group-page {
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

.group-card {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  font-size: 16px;
  font-weight: 600;
}

.more-btn {
  cursor: pointer;
  color: #909399;
}

.group-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.group-budget {
  margin-bottom: 10px;
}

.budget-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.budget-value {
  color: #f56c6c;
}

.group-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.member-actions {
  margin-bottom: 15px;
}
</style>
