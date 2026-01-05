<template>
  <div class="usage-reservation-page">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon :size="40" color="#409EFF"><Calendar /></el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ reservationStats.myTotal }}</span>
            <span class="stat-label">我的预约总数</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon :size="40" color="#E6A23C"><Clock /></el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ reservationStats.pending }}</span>
            <span class="stat-label">待审核</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon :size="40" color="#67C23A"><Check /></el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ reservationStats.approved }}</span>
            <span class="stat-label">已通过</span>
          </div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <el-icon :size="40" color="#F56C6C"><Warning /></el-icon>
          <div class="stat-info">
            <span class="stat-value">{{ reservationStats.cancelled }}</span>
            <span class="stat-label">已取消/违约</span>
          </div>
        </div>
      </el-card>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>使用预约管理</span>
          <el-button type="primary" @click="handleNewReservation">
            <el-icon><Plus /></el-icon> 新建预约
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-bar">
        <el-form-item label="仪器名称">
          <el-input v-model="searchForm.instrumentName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="预约状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="使用中" value="using" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已违约" value="violated" />
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 预约列表 -->
      <el-table :data="reservationList" stripe border>
        <el-table-column prop="id" label="预约单号" width="120" />
        <el-table-column prop="instrumentName" label="仪器名称" min-width="160" />
        <el-table-column prop="location" label="仪器位置" width="120" />
        <el-table-column prop="date" label="预约日期" width="110" />
        <el-table-column prop="timeSlot" label="预约时段" width="130" />
        <el-table-column prop="duration" label="时长(小时)" width="100" />
        <el-table-column prop="purpose" label="使用目的" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="预计费用" width="100">
          <template #default="{ row }">¥{{ row.cost }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" type="warning" link size="small" @click="handleEdit(row)">修改</el-button>
            <el-button v-if="row.status === 'pending' || row.status === 'approved'" type="danger" link size="small" @click="handleCancel(row)">取消</el-button>
            <el-button v-if="row.status === 'approved'" type="success" link size="small" @click="handleCheckIn(row)">签到</el-button>
            <el-button v-if="row.status === 'using'" type="info" link size="small" @click="handleCheckOut(row)">签退</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- ★重点项目1: 仪器预约日历视图 -->
    <el-card class="calendar-card">
      <template #header>
        <div class="card-header">
          <span>★ 仪器预约日历（重点功能）</span>
          <el-radio-group v-model="calendarView" size="small">
            <el-radio-button value="week">周视图</el-radio-button>
            <el-radio-button value="month">月视图</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-calendar v-model="calendarDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell" @click="handleDateSelect(data)">
            <span class="date-num">{{ data.day.split('-')[2] }}</span>
            <div v-if="getDateReservations(data.day).length > 0" class="reservation-indicators">
              <el-tooltip v-for="r in getDateReservations(data.day).slice(0, 3)" :key="r.id" :content="r.instrumentName">
                <div class="indicator" :class="r.status"></div>
              </el-tooltip>
              <span v-if="getDateReservations(data.day).length > 3" class="more">+{{ getDateReservations(data.day).length - 3 }}</span>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>

    <!-- ★重点项目2: 快捷预约入口 -->
    <el-card class="quick-reserve-card">
      <template #header>
        <span>★ 快捷预约（重点功能）</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="inst in hotInstruments" :key="inst.id">
          <el-card class="instrument-quick-card" shadow="hover" @click="handleQuickReserve(inst)">
            <div class="instrument-icon">
              <el-icon :size="40"><Monitor /></el-icon>
            </div>
            <h4>{{ inst.name }}</h4>
            <p class="location">{{ inst.location }}</p>
            <div class="availability">
              <el-tag :type="inst.available ? 'success' : 'danger'" size="small">
                {{ inst.available ? '可预约' : '已满' }}
              </el-tag>
              <span class="price">¥{{ inst.price }}/小时</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 新建预约对话框 -->
    <el-dialog v-model="reserveDialogVisible" title="新建仪器预约" width="700px">
      <el-form :model="reserveForm" label-width="100px" :rules="reserveRules" ref="reserveFormRef">
        <el-form-item label="选择仪器" prop="instrumentId">
          <el-select v-model="reserveForm.instrumentId" placeholder="请选择仪器" style="width: 100%" filterable>
            <el-option v-for="inst in instrumentOptions" :key="inst.id" :label="inst.name" :value="inst.id">
              <span>{{ inst.name }}</span>
              <span style="float: right; color: #909399; font-size: 12px">¥{{ inst.price }}/小时</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预约日期" prop="date">
          <el-date-picker v-model="reserveForm.date" type="date" placeholder="选择日期" :disabled-date="disabledDate" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时间段" prop="timeSlot">
          <el-time-picker v-model="reserveForm.timeSlot" is-range range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="使用目的" prop="purpose">
          <el-input v-model="reserveForm.purpose" type="textarea" rows="3" placeholder="请输入使用目的，如：样品检测、课题实验等" />
        </el-form-item>
        <el-form-item label="课题组">
          <el-select v-model="reserveForm.groupId" placeholder="请选择课题组" style="width: 100%">
            <el-option label="智慧农业研究组" value="1" />
            <el-option label="作物遗传育种组" value="2" />
            <el-option label="植物保护研究组" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目关联">
          <el-select v-model="reserveForm.projectId" placeholder="请选择关联项目（可选）" style="width: 100%" clearable>
            <el-option label="智慧农机监测系统研发" value="1" />
            <el-option label="玉米耐旱品种选育" value="2" />
            <el-option label="农药残留快速检测" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="reserveForm.remark" placeholder="其他备注信息（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reserveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReservation">提交预约</el-button>
      </template>
    </el-dialog>

    <!-- 预约详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="预约详情" width="600px">
      <el-descriptions :column="2" border v-if="currentReservation">
        <el-descriptions-item label="预约单号">{{ currentReservation.id }}</el-descriptions-item>
        <el-descriptions-item label="预约状态">
          <el-tag :type="getStatusType(currentReservation.status)">{{ currentReservation.statusName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="仪器名称">{{ currentReservation.instrumentName }}</el-descriptions-item>
        <el-descriptions-item label="仪器位置">{{ currentReservation.location }}</el-descriptions-item>
        <el-descriptions-item label="预约日期">{{ currentReservation.date }}</el-descriptions-item>
        <el-descriptions-item label="预约时段">{{ currentReservation.timeSlot }}</el-descriptions-item>
        <el-descriptions-item label="使用时长">{{ currentReservation.duration }} 小时</el-descriptions-item>
        <el-descriptions-item label="预计费用">¥{{ currentReservation.cost }}</el-descriptions-item>
        <el-descriptions-item label="使用目的" :span="2">{{ currentReservation.purpose }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentReservation.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ currentReservation.auditTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)
const reserveDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const calendarDate = ref(new Date())
const calendarView = ref('month')
const currentReservation = ref<any>(null)

const reservationStats = ref({
  myTotal: 45,
  pending: 3,
  approved: 8,
  cancelled: 2
})

const searchForm = reactive({
  instrumentName: '',
  status: '',
  dateRange: null
})

const reserveForm = reactive({
  instrumentId: '',
  date: null,
  timeSlot: null,
  purpose: '',
  groupId: '',
  projectId: '',
  remark: ''
})

const reserveRules = {
  instrumentId: [{ required: true, message: '请选择仪器', trigger: 'change' }],
  date: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  timeSlot: [{ required: true, message: '请选择时间段', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入使用目的', trigger: 'blur' }]
}

const reservationList = ref([
  { id: 'RSV20241230001', instrumentName: '高效液相色谱仪', location: '实验楼A301', date: '2024-12-30', timeSlot: '09:00-12:00', duration: 3, purpose: '农药残留检测', status: 'approved', statusName: '已通过', cost: 600, submitTime: '2024-12-28 10:00', auditTime: '2024-12-28 14:00' },
  { id: 'RSV20241230002', instrumentName: '气相色谱质谱联用仪', location: '实验楼A302', date: '2024-12-31', timeSlot: '14:00-17:00', duration: 3, purpose: '挥发性成分分析', status: 'pending', statusName: '待审核', cost: 900, submitTime: '2024-12-29 09:00', auditTime: null },
  { id: 'RSV20241229001', instrumentName: '紫外可见分光光度计', location: '实验楼B201', date: '2024-12-29', timeSlot: '10:00-11:00', duration: 1, purpose: '样品浓度测定', status: 'completed', statusName: '已完成', cost: 50, submitTime: '2024-12-27 15:00', auditTime: '2024-12-27 16:00' },
  { id: 'RSV20241228001', instrumentName: '原子吸收光谱仪', location: '实验楼A305', date: '2024-12-28', timeSlot: '09:00-12:00', duration: 3, purpose: '重金属含量检测', status: 'cancelled', statusName: '已取消', cost: 750, submitTime: '2024-12-26 11:00', auditTime: null },
  { id: 'RSV20241230003', instrumentName: '超速离心机', location: '实验楼C101', date: '2024-12-30', timeSlot: '14:00-16:00', duration: 2, purpose: '细胞分离实验', status: 'using', statusName: '使用中', cost: 300, submitTime: '2024-12-28 08:00', auditTime: '2024-12-28 09:00' }
])

const hotInstruments = ref([
  { id: 1, name: '高效液相色谱仪', location: '实验楼A301', price: 200, available: true },
  { id: 2, name: '气相色谱质谱联用仪', location: '实验楼A302', price: 300, available: true },
  { id: 3, name: '紫外可见分光光度计', location: '实验楼B201', price: 50, available: true },
  { id: 4, name: '超速离心机', location: '实验楼C101', price: 150, available: false }
])

const instrumentOptions = ref([
  { id: 1, name: '高效液相色谱仪', price: 200 },
  { id: 2, name: '气相色谱质谱联用仪', price: 300 },
  { id: 3, name: '紫外可见分光光度计', price: 50 },
  { id: 4, name: '原子吸收光谱仪', price: 250 },
  { id: 5, name: '超速离心机', price: 150 },
  { id: 6, name: '荧光显微镜', price: 100 }
])

const calendarReservations = ref([
  { id: 1, date: '2024-12-30', instrumentName: '高效液相色谱仪', status: 'approved' },
  { id: 2, date: '2024-12-30', instrumentName: '超速离心机', status: 'using' },
  { id: 3, date: '2024-12-31', instrumentName: '气相色谱质谱联用仪', status: 'pending' }
])

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    using: 'primary',
    completed: 'info',
    cancelled: 'danger',
    violated: 'danger'
  }
  return types[status] || 'info'
}

const getDateReservations = (day: string) => {
  return calendarReservations.value.filter(r => r.date === day)
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
  Object.assign(searchForm, { instrumentName: '', status: '', dateRange: null })
  ElMessage.info('已重置')
}

const handleNewReservation = () => {
  Object.assign(reserveForm, { instrumentId: '', date: null, timeSlot: null, purpose: '', groupId: '', projectId: '', remark: '' })
  reserveDialogVisible.value = true
}

const handleView = (row: any) => {
  currentReservation.value = row
  detailDialogVisible.value = true
}

const handleEdit = (row: any) => {
  ElMessage.info(`编辑预约：${row.id}`)
}

const handleCancel = (row: any) => {
  ElMessageBox.confirm(`确定要取消预约"${row.id}"吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('取消成功'))
    .catch(() => {})
}

const handleCheckIn = (row: any) => {
  ElMessageBox.confirm(`确定要为预约"${row.id}"进行签到吗？`, '签到确认', { type: 'info' })
    .then(() => ElMessage.success('签到成功，请开始使用仪器'))
    .catch(() => {})
}

const handleCheckOut = (row: any) => {
  ElMessageBox.confirm(`确定要结束使用并签退吗？`, '签退确认', { type: 'info' })
    .then(() => ElMessage.success('签退成功'))
    .catch(() => {})
}

const handleDateSelect = (data: any) => {
  const reservations = getDateReservations(data.day)
  if (reservations.length > 0) {
    ElMessage.info(`${data.day} 有 ${reservations.length} 条预约记录`)
  }
}

const handleQuickReserve = (inst: any) => {
  if (inst.available) {
    reserveForm.instrumentId = inst.id
    reserveDialogVisible.value = true
  } else {
    ElMessage.warning('该仪器当前时段已满，请选择其他时间')
  }
}

const submitReservation = () => {
  ElMessage.success('预约提交成功，等待审核')
  reserveDialogVisible.value = false
}

const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>

<style scoped>
.usage-reservation-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-cards {
  display: flex;
  gap: 20px;
}

.stat-card {
  flex: 1;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  color: #909399;
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

.calendar-cell {
  height: 100%;
  cursor: pointer;
}

.date-num {
  font-size: 14px;
}

.reservation-indicators {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator.pending { background-color: #e6a23c; }
.indicator.approved { background-color: #67c23a; }
.indicator.using { background-color: #409eff; }
.indicator.completed { background-color: #909399; }

.more {
  font-size: 10px;
  color: #909399;
}

.instrument-quick-card {
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}

.instrument-quick-card:hover {
  transform: translateY(-5px);
}

.instrument-icon {
  color: #409eff;
  margin-bottom: 10px;
}

.instrument-quick-card h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.instrument-quick-card .location {
  font-size: 12px;
  color: #909399;
  margin: 0 0 10px 0;
}

.availability {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 12px;
  color: #f56c6c;
}
</style>
