<template>
  <div class="visitor-system-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card today">
          <div class="stat-icon"><el-icon :size="28"><User /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.today }}</div>
            <div class="stat-label">今日访客</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card visiting">
          <div class="stat-icon"><el-icon :size="28"><UserFilled /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.visiting }}</div>
            <div class="stat-label">在访中</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card reserved">
          <div class="stat-icon"><el-icon :size="28"><Calendar /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.reserved }}</div>
            <div class="stat-label">今日预约</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card left">
          <div class="stat-icon"><el-icon :size="28"><CircleCheck /></el-icon></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.left }}</div>
            <div class="stat-label">已离开</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchText" placeholder="搜索访客姓名/手机号" style="width: 240px" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="状态" style="width: 120px; margin-left: 12px" clearable>
          <el-option label="待到访" value="pending" />
          <el-option label="在访中" value="visiting" />
          <el-option label="已离开" value="left" />
          <el-option label="已过期" value="expired" />
        </el-select>
        <el-date-picker v-model="filterDate" type="date" placeholder="选择日期" style="width: 150px; margin-left: 12px" />
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAddVisitor"><el-icon><Plus /></el-icon>登记访客</el-button>
        <el-button @click="handleImport"><el-icon><Upload /></el-icon>批量导入</el-button>
        <el-button @click="handleExport"><el-icon><Download /></el-icon>导出记录</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 访客列表 -->
      <el-col :span="18">
        <div class="visitor-panel">
          <el-table :data="visitorList" height="500" stripe v-loading="loading">
            <el-table-column prop="name" label="访客姓名" width="100" />
            <el-table-column prop="phone" label="手机号" width="120" />
            <el-table-column prop="company" label="来访单位" width="150" />
            <el-table-column prop="purpose" label="来访事由" width="120" />
            <el-table-column prop="host" label="被访人" width="100" />
            <el-table-column prop="hostDept" label="被访部门" width="100" />
            <el-table-column prop="visitTime" label="预约时间" width="160" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
                <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="handleCheckIn(row)">签到</el-button>
                <el-button v-if="row.status === 'visiting'" type="warning" link size="small" @click="handleCheckOut(row)">签离</el-button>
                <el-button type="info" link size="small" @click="handlePrintPass(row)">打印</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-pagination">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next"
              :page-sizes="[10, 20, 50]"
            />
          </div>
        </div>
      </el-col>

      <!-- 右侧面板 -->
      <el-col :span="6">
        <!-- 快捷操作 -->
        <div class="quick-panel">
          <div class="panel-header"><span>快捷操作</span></div>
          <div class="quick-actions">
            <div class="action-item" @click="handleScanQR">
              <el-icon :size="28" color="#409EFF"><Iphone /></el-icon>
              <span>扫码签到</span>
            </div>
            <div class="action-item" @click="handleFaceCheck">
              <el-icon :size="28" color="#67C23A"><User /></el-icon>
              <span>人脸核验</span>
            </div>
            <div class="action-item" @click="handleBlacklist">
              <el-icon :size="28" color="#F56C6C"><Warning /></el-icon>
              <span>黑名单</span>
            </div>
            <div class="action-item" @click="handleSettings">
              <el-icon :size="28" color="#909399"><Setting /></el-icon>
              <span>访客设置</span>
            </div>
          </div>
        </div>

        <!-- 今日预约 -->
        <div class="appointment-panel">
          <div class="panel-header">
            <span>今日预约</span>
            <el-button type="primary" link @click="handleViewAllAppointments">全部</el-button>
          </div>
          <div class="appointment-list">
            <div v-for="appointment in appointmentList" :key="appointment.id" class="appointment-item">
              <div class="appointment-time">{{ appointment.time }}</div>
              <div class="appointment-info">
                <div class="visitor-name">{{ appointment.name }}</div>
                <div class="visitor-company">{{ appointment.company }}</div>
              </div>
              <el-tag :type="appointment.checked ? 'success' : 'info'" size="small">
                {{ appointment.checked ? '已到' : '待到' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 访客趋势 -->
        <div class="chart-panel">
          <div class="panel-header"><span>本周趋势</span></div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 访客登记弹窗 -->
    <el-dialog v-model="visitorDialogVisible" title="访客登记" width="600px">
      <el-form :model="visitorForm" label-width="100px" :rules="visitorRules" ref="visitorFormRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="访客姓名" prop="name">
              <el-input v-model="visitorForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="visitorForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="visitorForm.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来访单位" prop="company">
              <el-input v-model="visitorForm.company" placeholder="请输入来访单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被访人" prop="host">
              <el-select v-model="visitorForm.host" placeholder="请选择被访人" style="width: 100%">
                <el-option v-for="user in hostList" :key="user.id" :label="user.name" :value="user.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来访事由" prop="purpose">
              <el-select v-model="visitorForm.purpose" placeholder="请选择来访事由" style="width: 100%">
                <el-option label="商务洽谈" value="business" />
                <el-option label="技术交流" value="technical" />
                <el-option label="面试招聘" value="interview" />
                <el-option label="参观考察" value="visit" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约时间" prop="visitTime">
              <el-date-picker v-model="visitorForm.visitTime" type="datetime" placeholder="选择预约时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="随行人数" prop="companions">
              <el-input-number v-model="visitorForm.companions" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="visitorForm.remark" type="textarea" :rows="2" placeholder="备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="visitorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitVisitor">确认登记</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { User, UserFilled, Calendar, CircleCheck, Search, Plus, Upload, Download, Iphone, Warning, Setting } from '@element-plus/icons-vue'

const stats = reactive({ today: 45, visiting: 12, reserved: 28, left: 33 })

const searchText = ref('')
const filterStatus = ref('')
const filterDate = ref('')
const loading = ref(false)

const visitorList = ref([
  { id: 1, name: '张三', phone: '13800138001', company: 'ABC公司', purpose: '商务洽谈', host: '李经理', hostDept: '市场部', visitTime: '2025-01-15 09:00', status: 'visiting' },
  { id: 2, name: '李四', phone: '13800138002', company: 'XYZ科技', purpose: '技术交流', host: '王工', hostDept: '研发部', visitTime: '2025-01-15 10:00', status: 'pending' },
  { id: 3, name: '王五', phone: '13800138003', company: '个人', purpose: '面试招聘', host: '张HR', hostDept: '人力资源部', visitTime: '2025-01-15 14:00', status: 'pending' },
  { id: 4, name: '赵六', phone: '13800138004', company: '政府机关', purpose: '参观考察', host: '陈总', hostDept: '总经办', visitTime: '2025-01-15 08:30', status: 'left' },
  { id: 5, name: '钱七', phone: '13800138005', company: 'DEF集团', purpose: '商务洽谈', host: '吴经理', hostDept: '销售部', visitTime: '2025-01-14 16:00', status: 'expired' }
])

const pagination = reactive({ page: 1, size: 10, total: 50 })

const appointmentList = ref([
  { id: 1, time: '09:00', name: '张三', company: 'ABC公司', checked: true },
  { id: 2, time: '10:00', name: '李四', company: 'XYZ科技', checked: false },
  { id: 3, time: '14:00', name: '王五', company: '面试', checked: false },
  { id: 4, time: '15:30', name: '孙八', company: 'GHI有限公司', checked: false }
])

const visitorDialogVisible = ref(false)
const visitorFormRef = ref()
const visitorForm = reactive({
  name: '',
  phone: '',
  idCard: '',
  company: '',
  host: '',
  purpose: '',
  visitTime: '',
  companions: 0,
  remark: ''
})

const visitorRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  host: [{ required: true, message: '请选择被访人', trigger: 'change' }],
  purpose: [{ required: true, message: '请选择来访事由', trigger: 'change' }]
}

const hostList = ref([
  { id: 1, name: '李经理 - 市场部' },
  { id: 2, name: '王工 - 研发部' },
  { id: 3, name: '张HR - 人力资源部' },
  { id: 4, name: '陈总 - 总经办' }
])

const chartRef = ref()
let chartInstance: echarts.ECharts | null = null

const getStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'info', visiting: 'success', left: '', expired: 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = { pending: '待到访', visiting: '在访中', left: '已离开', expired: '已过期' }
  return map[status] || status
}

const handleAddVisitor = () => {
  Object.assign(visitorForm, { name: '', phone: '', idCard: '', company: '', host: '', purpose: '', visitTime: '', companions: 0, remark: '' })
  visitorDialogVisible.value = true
}

const handleImport = () => { ElMessage.info('批量导入访客') }
const handleExport = () => { ElMessage.success('导出成功') }

const handleViewDetail = (row: any) => { ElMessage.info(`查看 ${row.name} 详情`) }
const handleCheckIn = (row: any) => { row.status = 'visiting'; ElMessage.success('签到成功') }
const handleCheckOut = (row: any) => { row.status = 'left'; ElMessage.success('签离成功') }
const handlePrintPass = (row: any) => { ElMessage.info('打印访客证') }

const handleScanQR = () => { ElMessage.info('扫码签到') }
const handleFaceCheck = () => { ElMessage.info('人脸核验') }
const handleBlacklist = () => { ElMessage.info('黑名单管理') }
const handleSettings = () => { ElMessage.info('访客设置') }
const handleViewAllAppointments = () => { ElMessage.info('查看全部预约') }

const handleSubmitVisitor = async () => {
  await visitorFormRef.value?.validate()
  ElMessage.success('访客登记成功')
  visitorDialogVisible.value = false
}

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    const option = {
      grid: { left: 30, right: 10, top: 10, bottom: 25 },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ data: [35, 42, 38, 55, 48, 15, 8], type: 'bar', itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }, barWidth: 16 }]
    }
    chartInstance.setOption(option)
  }
}

onMounted(() => { initChart() })
</script>

<style lang="scss" scoped>
.visitor-system-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    &.today .stat-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
    &.visiting .stat-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
    &.reserved .stat-icon { background: linear-gradient(135deg, #E6A23C, #ebb563); }
    &.left .stat-icon { background: linear-gradient(135deg, #909399, #b4b4b4); }

    .stat-value { font-size: 28px; font-weight: 600; }
    .stat-label { font-size: 14px; color: #909399; }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
}

.main-content { flex: 1; }

.visitor-panel {
  background: #fff;
  border-radius: 8px;
  padding: 16px;

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.quick-panel, .appointment-panel, .chart-panel {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.quick-panel {
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover { background: #ecf5ff; transform: translateY(-2px); }

      span { font-size: 12px; color: #606266; }
    }
  }
}

.appointment-panel {
  .appointment-list { padding: 8px; max-height: 200px; overflow-y: auto; }

  .appointment-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: #f5f7fa;

    .appointment-time { font-weight: 600; color: #409EFF; min-width: 50px; }
    .appointment-info { flex: 1; .visitor-name { font-weight: 500; } .visitor-company { font-size: 12px; color: #909399; } }
  }
}

.chart-panel {
  .chart-container { height: 150px; padding: 12px; }
}
</style>
