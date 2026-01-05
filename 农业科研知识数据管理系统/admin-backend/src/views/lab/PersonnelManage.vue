<template>
  <div class="personnel-manage-page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 人员列表 -->
      <el-tab-pane label="人员管理" name="list">
        <div class="search-bar">
          <el-form :inline="true">
            <el-form-item label="姓名"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
            <el-form-item label="工号"><el-input v-model="searchForm.empNo" placeholder="请输入" clearable /></el-form-item>
            <el-form-item label="所属课题组">
              <el-select v-model="searchForm.groupId" placeholder="全部" clearable>
                <el-option label="智慧农业研究组" value="1" />
                <el-option label="作物遗传育种组" value="2" />
                <el-option label="植物保护研究组" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="人员类型">
              <el-select v-model="searchForm.type" placeholder="全部" clearable>
                <el-option label="教职工" value="staff" />
                <el-option label="博士后" value="postdoc" />
                <el-option label="博士生" value="phd" />
                <el-option label="硕士生" value="master" />
                <el-option label="本科生" value="undergraduate" />
                <el-option label="访问学者" value="visitor" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
              <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="action-bar">
          <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增人员</el-button>
          <el-button type="success" @click="handleImport"><el-icon><Upload /></el-icon>批量导入</el-button>
          <el-button type="warning" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
        </div>

        <el-table :data="personnelList" stripe border>
          <el-table-column prop="empNo" label="工号" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="gender" label="性别" width="60" />
          <el-table-column prop="typeName" label="人员类型" width="100" />
          <el-table-column prop="department" label="所属部门" width="150" />
          <el-table-column prop="groupName" label="课题组" width="150" />
          <el-table-column prop="title" label="职称" width="100" />
          <el-table-column prop="phone" label="联系电话" width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="creditScore" label="信用积分" width="90">
            <template #default="{ row }">
              <el-tag :type="getCreditType(row.creditScore)">{{ row.creditScore }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status ? 'success' : 'danger'">{{ row.status ? '正常' : '禁用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
              <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" />
        </div>
      </el-tab-pane>

      <!-- 认证审核 -->
      <el-tab-pane label="认证审核" name="audit">
        <el-table :data="auditList" stripe border>
          <el-table-column prop="applyTime" label="申请时间" width="160" />
          <el-table-column prop="name" label="申请人" width="100" />
          <el-table-column prop="idCard" label="身份证号" width="180" />
          <el-table-column prop="typeName" label="申请类型" width="100" />
          <el-table-column prop="department" label="所属单位" min-width="150" />
          <el-table-column prop="purpose" label="申请说明" min-width="150" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'pending' ? 'warning' : row.status === 'approved' ? 'success' : 'danger'">
                {{ row.statusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'pending'">
                <el-button type="success" link size="small" @click="handleApprove(row)">通过</el-button>
                <el-button type="danger" link size="small" @click="handleReject(row)">驳回</el-button>
              </template>
              <el-button type="primary" link size="small" @click="handleViewAudit(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 培训记录 -->
      <el-tab-pane label="培训记录" name="training">
        <el-table :data="trainingList" stripe border>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="instrumentName" label="培训仪器" min-width="150" />
          <el-table-column prop="trainDate" label="培训日期" width="110" />
          <el-table-column prop="trainer" label="培训人" width="100" />
          <el-table-column prop="score" label="考核成绩" width="100">
            <template #default="{ row }">
              <el-tag :type="row.score >= 80 ? 'success' : row.score >= 60 ? 'warning' : 'danger'">{{ row.score }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result" label="培训结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.result === 'pass' ? 'success' : 'danger'">{{ row.result === 'pass' ? '合格' : '不合格' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="validUntil" label="有效期至" width="110" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewTraining(row)">详情</el-button>
              <el-button type="warning" link size="small" @click="handleRetrain(row)">重新培训</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑人员对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑人员' : '新增人员'" width="700px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号"><el-input v-model="form.empNo" placeholder="请输入工号" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名"><el-input v-model="form.name" placeholder="请输入姓名" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人员类型">
              <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
                <el-option label="教职工" value="staff" />
                <el-option label="博士后" value="postdoc" />
                <el-option label="博士生" value="phd" />
                <el-option label="硕士生" value="master" />
                <el-option label="本科生" value="undergraduate" />
                <el-option label="访问学者" value="visitor" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属部门"><el-input v-model="form.department" placeholder="请输入" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课题组">
              <el-select v-model="form.groupId" placeholder="请选择" style="width: 100%">
                <el-option label="智慧农业研究组" value="1" />
                <el-option label="作物遗传育种组" value="2" />
                <el-option label="植物保护研究组" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职称"><el-input v-model="form.title" placeholder="请输入职称" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="请输入" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="邮箱"><el-input v-model="form.email" placeholder="请输入邮箱" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="正常" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('list')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const dialogVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
  name: '',
  empNo: '',
  groupId: '',
  type: ''
})

const form = reactive({
  empNo: '',
  name: '',
  gender: '男',
  type: '',
  department: '',
  groupId: '',
  title: '',
  phone: '',
  email: '',
  status: true
})

const personnelList = ref([
  { id: 1, empNo: 'EMP001', name: '张三', gender: '男', type: 'staff', typeName: '教职工', department: '农业科学研究院', groupName: '智慧农业研究组', title: '教授', phone: '13800138001', email: 'zhangsan@example.com', creditScore: 100, status: true },
  { id: 2, empNo: 'EMP002', name: '李四', gender: '男', type: 'phd', typeName: '博士生', department: '农业科学研究院', groupName: '智慧农业研究组', title: '在读博士', phone: '13800138002', email: 'lisi@example.com', creditScore: 95, status: true },
  { id: 3, empNo: 'EMP003', name: '王五', gender: '女', type: 'master', typeName: '硕士生', department: '农业科学研究院', groupName: '作物遗传育种组', title: '在读硕士', phone: '13800138003', email: 'wangwu@example.com', creditScore: 88, status: true },
  { id: 4, empNo: 'EMP004', name: '赵六', gender: '男', type: 'postdoc', typeName: '博士后', department: '农业科学研究院', groupName: '植物保护研究组', title: '博士后', phone: '13800138004', email: 'zhaoliu@example.com', creditScore: 72, status: true },
  { id: 5, empNo: 'EMP005', name: '孙七', gender: '女', type: 'visitor', typeName: '访问学者', department: '外校访问', groupName: '智慧农业研究组', title: '副教授', phone: '13800138005', email: 'sunqi@example.com', creditScore: 60, status: false }
])

const auditList = ref([
  { id: 1, applyTime: '2024-12-29 10:00', name: '新用户A', idCard: '110101199001010011', type: 'visitor', typeName: '访问学者', department: '北京大学', purpose: '开展科研合作', status: 'pending', statusName: '待审核' },
  { id: 2, applyTime: '2024-12-28 15:30', name: '新用户B', idCard: '110101199502020022', type: 'master', typeName: '硕士生', department: '本校', purpose: '入学注册', status: 'approved', statusName: '已通过' }
])

const trainingList = ref([
  { id: 1, name: '张三', instrumentName: '高效液相色谱仪', trainDate: '2024-12-20', trainer: '王教授', score: 92, result: 'pass', validUntil: '2025-12-20' },
  { id: 2, name: '李四', instrumentName: '气相色谱质谱联用仪', trainDate: '2024-12-18', trainer: '王教授', score: 85, result: 'pass', validUntil: '2025-12-18' },
  { id: 3, name: '王五', instrumentName: '原子吸收光谱仪', trainDate: '2024-12-15', trainer: '李教授', score: 58, result: 'fail', validUntil: '-' }
])

const getCreditType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
  Object.assign(searchForm, { name: '', empNo: '', groupId: '', type: '' })
  ElMessage.info('已重置')
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { empNo: '', name: '', gender: '男', type: '', department: '', groupId: '', title: '', phone: '', email: '', status: true })
  dialogVisible.value = true
}

const handleImport = () => ElMessage.info('打开批量导入')
const handleExport = () => ElMessage.success('导出成功')

const handleView = (row: any) => ElMessage.info(`查看人员详情：${row.name}`)
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除人员"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const handleSubmit = () => {
  ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
  dialogVisible.value = false
}

const handleApprove = (row: any) => ElMessage.success(`已通过 ${row.name} 的认证申请`)
const handleReject = (row: any) => ElMessage.warning(`已驳回 ${row.name} 的认证申请`)
const handleViewAudit = (row: any) => ElMessage.info(`查看申请详情：${row.name}`)

const handleViewTraining = (row: any) => ElMessage.info(`查看培训记录：${row.name}`)
const handleRetrain = (row: any) => ElMessage.info(`安排 ${row.name} 重新培训`)
</script>

<style scoped>
.personnel-manage-page {
  height: 100%;
}

.search-bar {
  margin-bottom: 15px;
}

.action-bar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
