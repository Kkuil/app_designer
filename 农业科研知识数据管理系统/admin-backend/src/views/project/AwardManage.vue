<template>
  <div class="award-manage-page">
    <!-- ★重点项目：系统支持对获奖荣誉的新增、删除、编辑、审核、导入、导出和统计分析功能 -->
    <el-card class="stats-card">
      <template #header>
        <span>★ 获奖荣誉管理（重点功能）</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="获奖总数" :value="awardStats.total" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="国家级奖项" :value="awardStats.national" class="national" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="省部级奖项" :value="awardStats.provincial" class="provincial" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="待审核" :value="awardStats.pending" class="pending" />
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>获奖荣誉列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增荣誉</el-button>
            <el-button type="success" @click="handleImport"><el-icon><Upload /></el-icon>批量导入</el-button>
            <el-button type="warning" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
            <el-button type="info" @click="handleStats"><el-icon><DataAnalysis /></el-icon>统计分析</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true">
          <el-form-item label="奖项名称">
            <el-input v-model="searchForm.name" placeholder="请输入" clearable />
          </el-form-item>
          <el-form-item label="奖项级别">
            <el-select v-model="searchForm.level" placeholder="全部" clearable>
              <el-option label="国家级" value="national" />
              <el-option label="省部级" value="provincial" />
              <el-option label="市厅级" value="municipal" />
              <el-option label="校级" value="school" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="获奖年度">
            <el-date-picker v-model="searchForm.year" type="year" placeholder="选择年度" />
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
            <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 奖项列表 -->
      <el-table :data="awardList" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="奖项名称" min-width="200" />
        <el-table-column prop="levelName" label="奖项级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">{{ row.levelName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="获奖等级" width="100" />
        <el-table-column prop="awardUnit" label="颁发单位" width="150" />
        <el-table-column prop="awardDate" label="获奖时间" width="110" />
        <el-table-column prop="winner" label="获奖人/团队" width="150" show-overflow-tooltip />
        <el-table-column prop="project" label="关联项目" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="handleAudit(row)">审核</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑获奖荣誉' : '新增获奖荣誉'" width="800px">
      <el-form :model="form" label-width="100px" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="奖项名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入完整的奖项名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="奖项级别" prop="level">
              <el-select v-model="form.level" placeholder="请选择" style="width: 100%">
                <el-option label="国家级" value="national" />
                <el-option label="省部级" value="provincial" />
                <el-option label="市厅级" value="municipal" />
                <el-option label="校级" value="school" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="获奖等级">
              <el-select v-model="form.rank" placeholder="请选择" style="width: 100%">
                <el-option label="特等奖" value="特等奖" />
                <el-option label="一等奖" value="一等奖" />
                <el-option label="二等奖" value="二等奖" />
                <el-option label="三等奖" value="三等奖" />
                <el-option label="优秀奖" value="优秀奖" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="获奖时间" prop="awardDate">
              <el-date-picker v-model="form.awardDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="颁发单位" prop="awardUnit">
              <el-input v-model="form.awardUnit" placeholder="请输入颁发机构名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖项类型">
              <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
                <el-option label="科技进步奖" value="tech" />
                <el-option label="自然科学奖" value="science" />
                <el-option label="发明奖" value="invention" />
                <el-option label="优秀成果奖" value="achievement" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="获奖人员" prop="winner">
          <el-input v-model="form.winner" placeholder="多人请用顿号分隔，如：张三、李四、王五" />
        </el-form-item>
        <el-form-item label="完成单位">
          <el-input v-model="form.completeUnit" placeholder="请输入完成单位" />
        </el-form-item>
        <el-form-item label="关联项目">
          <el-select v-model="form.projectId" placeholder="请选择关联项目（可选）" style="width: 100%" clearable>
            <el-option label="智慧农机监测系统研发" value="1" />
            <el-option label="玉米耐旱品种选育" value="2" />
            <el-option label="农药残留快速检测技术" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖项简介">
          <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入奖项简介" />
        </el-form-item>
        <el-form-item label="证书附件">
          <el-upload action="#" :auto-upload="false" :limit="3" list-type="picture-card">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditVisible" title="审核获奖荣誉" width="500px">
      <el-form :model="auditForm" label-width="100px" v-if="currentAward">
        <el-form-item label="奖项名称">
          <span>{{ currentAward.name }}</span>
        </el-form-item>
        <el-form-item label="奖项级别">
          <el-tag :type="getLevelType(currentAward.level)">{{ currentAward.levelName }}</el-tag>
        </el-form-item>
        <el-form-item label="审核结果" required>
          <el-radio-group v-model="auditForm.result">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.comment" type="textarea" rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAuditSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="获奖荣誉详情" width="700px">
      <el-descriptions :column="2" border v-if="currentAward">
        <el-descriptions-item label="奖项名称" :span="2">{{ currentAward.name }}</el-descriptions-item>
        <el-descriptions-item label="奖项级别">
          <el-tag :type="getLevelType(currentAward.level)">{{ currentAward.levelName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="获奖等级">{{ currentAward.rank }}</el-descriptions-item>
        <el-descriptions-item label="颁发单位">{{ currentAward.awardUnit }}</el-descriptions-item>
        <el-descriptions-item label="获奖时间">{{ currentAward.awardDate }}</el-descriptions-item>
        <el-descriptions-item label="获奖人员" :span="2">{{ currentAward.winner }}</el-descriptions-item>
        <el-descriptions-item label="完成单位" :span="2">{{ currentAward.completeUnit }}</el-descriptions-item>
        <el-descriptions-item label="关联项目">{{ currentAward.project || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getStatusType(currentAward.status)">{{ currentAward.statusName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="奖项简介" :span="2">{{ currentAward.description }}</el-descriptions-item>
      </el-descriptions>
      <el-divider>证书附件</el-divider>
      <el-image v-for="(img, index) in currentAward?.attachments || []" :key="index" :src="img" style="width: 150px; height: 100px; margin-right: 10px" fit="cover" />
    </el-dialog>

    <!-- 统计分析对话框 -->
    <el-dialog v-model="statsVisible" title="获奖荣誉统计分析" width="900px">
      <el-row :gutter="20">
        <el-col :span="12">
          <h4>按级别统计</h4>
          <div v-for="item in levelStats" :key="item.level" class="stat-bar">
            <span class="stat-label">{{ item.levelName }}</span>
            <el-progress :percentage="item.percent" :color="item.color" />
            <span class="stat-count">{{ item.count }}项</span>
          </div>
        </el-col>
        <el-col :span="12">
          <h4>按年度统计</h4>
          <el-table :data="yearStats" stripe size="small">
            <el-table-column prop="year" label="年度" />
            <el-table-column prop="count" label="获奖数量" />
            <el-table-column prop="nationalCount" label="国家级" />
            <el-table-column prop="provincialCount" label="省部级" />
          </el-table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)
const dialogVisible = ref(false)
const auditVisible = ref(false)
const detailVisible = ref(false)
const statsVisible = ref(false)
const isEdit = ref(false)
const currentAward = ref<any>(null)

const awardStats = ref({
  total: 156,
  national: 12,
  provincial: 45,
  pending: 8
})

const searchForm = reactive({
  name: '',
  level: '',
  year: null,
  status: ''
})

const form = reactive({
  name: '',
  level: '',
  rank: '',
  awardDate: null,
  awardUnit: '',
  type: '',
  winner: '',
  completeUnit: '',
  projectId: '',
  description: ''
})

const auditForm = reactive({
  result: 'approved',
  comment: ''
})

const rules = {
  name: [{ required: true, message: '请输入奖项名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择奖项级别', trigger: 'change' }],
  awardDate: [{ required: true, message: '请选择获奖时间', trigger: 'change' }],
  awardUnit: [{ required: true, message: '请输入颁发单位', trigger: 'blur' }],
  winner: [{ required: true, message: '请输入获奖人员', trigger: 'blur' }]
}

const awardList = ref([
  { id: 1, name: '智慧农业物联网关键技术研发与应用', level: 'national', levelName: '国家级', rank: '二等奖', awardUnit: '国务院', awardDate: '2024-01-15', winner: '张教授、李研究员、王博士', completeUnit: '农业科学研究院', project: '智慧农机监测系统研发', status: 'approved', statusName: '已通过', description: '该项目在智慧农业领域取得了重大突破...', attachments: [] },
  { id: 2, name: '耐旱玉米新品种选育', level: 'provincial', levelName: '省部级', rank: '一等奖', awardUnit: '农业农村部', awardDate: '2024-03-20', winner: '李教授、赵研究员', completeUnit: '农业科学研究院', project: '玉米耐旱品种选育', status: 'approved', statusName: '已通过', description: '成功选育出多个耐旱玉米新品种...', attachments: [] },
  { id: 3, name: '农药残留快速检测技术创新', level: 'provincial', levelName: '省部级', rank: '二等奖', awardUnit: '省科技厅', awardDate: '2024-06-10', winner: '王教授团队', completeUnit: '农业科学研究院', project: '农药残留快速检测技术', status: 'pending', statusName: '待审核', description: '开发了一种新型农药残留快速检测方法...', attachments: [] },
  { id: 4, name: '优秀科研团队奖', level: 'school', levelName: '校级', rank: '优秀奖', awardUnit: '本校', awardDate: '2024-09-01', winner: '智慧农业研究组', completeUnit: '农业科学研究院', project: '', status: 'approved', statusName: '已通过', description: '表彰在科研工作中表现突出的团队', attachments: [] }
])

const levelStats = ref([
  { level: 'national', levelName: '国家级', count: 12, percent: 8, color: '#f56c6c' },
  { level: 'provincial', levelName: '省部级', count: 45, percent: 29, color: '#e6a23c' },
  { level: 'municipal', levelName: '市厅级', count: 38, percent: 24, color: '#409eff' },
  { level: 'school', levelName: '校级', count: 52, percent: 33, color: '#67c23a' },
  { level: 'other', levelName: '其他', count: 9, percent: 6, color: '#909399' }
])

const yearStats = ref([
  { year: '2024', count: 35, nationalCount: 3, provincialCount: 12 },
  { year: '2023', count: 42, nationalCount: 4, provincialCount: 15 },
  { year: '2022', count: 38, nationalCount: 2, provincialCount: 10 },
  { year: '2021', count: 41, nationalCount: 3, provincialCount: 8 }
])

const getLevelType = (level: string) => {
  const types: Record<string, string> = {
    national: 'danger',
    provincial: 'warning',
    municipal: 'primary',
    school: 'success',
    other: 'info'
  }
  return types[level] || 'info'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
  Object.assign(searchForm, { name: '', level: '', year: null, status: '' })
  ElMessage.info('已重置')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { name: '', level: '', rank: '', awardDate: null, awardUnit: '', type: '', winner: '', completeUnit: '', projectId: '', description: '' })
  dialogVisible.value = true
}

const handleImport = () => ElMessage.info('打开批量导入')
const handleExport = () => ElMessage.success('导出成功')
const handleStats = () => { statsVisible.value = true }

const handleSelectionChange = (selection: any[]) => {
  console.log('选中项:', selection)
}

const handleView = (row: any) => {
  currentAward.value = row
  detailVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleAudit = (row: any) => {
  currentAward.value = row
  Object.assign(auditForm, { result: 'approved', comment: '' })
  auditVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const handleSubmit = () => {
  ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
  dialogVisible.value = false
}

const handleAuditSubmit = () => {
  ElMessage.success(`审核${auditForm.result === 'approved' ? '通过' : '驳回'}成功`)
  auditVisible.value = false
}
</script>

<style scoped>
.award-manage-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card .national :deep(.el-statistic__number) { color: #f56c6c; }
.stats-card .provincial :deep(.el-statistic__number) { color: #e6a23c; }
.stats-card .pending :deep(.el-statistic__number) { color: #409eff; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.stat-bar {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-label {
  width: 60px;
  font-size: 13px;
}

.stat-bar .el-progress {
  flex: 1;
  margin: 0 10px;
}

.stat-count {
  width: 50px;
  text-align: right;
  font-size: 13px;
  color: #909399;
}
</style>
