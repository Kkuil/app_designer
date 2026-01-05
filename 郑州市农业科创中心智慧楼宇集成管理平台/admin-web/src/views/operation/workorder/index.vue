<template>
  <div class="workorder-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Document /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">工单总数</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pending"><div class="icon"><el-icon :size="24"><Clock /></el-icon></div><div class="content"><div class="value">{{ stats.pending }}</div><div class="label">待处理</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card processing"><div class="icon"><el-icon :size="24"><Loading /></el-icon></div><div class="content"><div class="value">{{ stats.processing }}</div><div class="label">处理中</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card completed"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.completed }}</div><div class="label">已完成</div></div></div>
      </el-col>
    </el-row>

    <div class="panel">
      <div class="panel-header">
        <div class="filter-section">
          <el-input v-model="searchKeyword" placeholder="搜索工单" style="width:200px" @keyup.enter="handleSearch"><template #prefix><el-icon><Search /></el-icon></template></el-input>
          <el-select v-model="filterStatus" placeholder="工单状态" style="width:120px">
            <el-option label="全部" value="" /><el-option label="待处理" value="pending" /><el-option label="处理中" value="processing" /><el-option label="已完成" value="completed" /><el-option label="已关闭" value="closed" />
          </el-select>
          <el-select v-model="filterType" placeholder="工单类型" style="width:120px">
            <el-option label="全部" value="" /><el-option label="设备维修" value="repair" /><el-option label="巡检工单" value="inspection" /><el-option label="告警工单" value="alarm" />
          </el-select>
          <el-date-picker v-model="filterDate" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width:220px" />
        </div>
        <el-button type="primary" @click="handleCreateOrder"><el-icon><Plus /></el-icon>新建工单</el-button>
      </div>

      <el-table :data="orderList" stripe height="420">
        <el-table-column prop="orderNo" label="工单编号" width="150" />
        <el-table-column prop="title" label="工单标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag :type="typeTagType(row.type)" size="small">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }"><el-tag :type="priorityTagType(row.priority)" size="small">{{ row.priority }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }"><el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="90" />
        <el-table-column prop="handler" label="处理人" width="90" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button type="success" link size="small" @click="handleProcess(row)" v-if="row.status !== '已完成' && row.status !== '已关闭'">处理</el-button>
            <el-button type="warning" link size="small" @click="handleTransfer(row)" v-if="row.status === '处理中'">转派</el-button>
            <el-button type="primary" link size="small" @click="handleEvaluate(row)" v-if="row.status === '已完成' && !row.evaluated">评价</el-button>
            <el-button type="danger" link size="small" @click="handleClose(row)" v-if="row.status !== '已关闭'">关闭</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="120" :page-size="10" /></div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="orderForm" label-width="100px" v-if="dialogType === 'create'">
        <el-form-item label="工单标题"><el-input v-model="orderForm.title" placeholder="请输入工单标题" /></el-form-item>
        <el-form-item label="工单类型"><el-select v-model="orderForm.type" placeholder="选择类型" style="width:100%"><el-option label="设备维修" value="repair" /><el-option label="巡检工单" value="inspection" /><el-option label="告警工单" value="alarm" /></el-select></el-form-item>
        <el-form-item label="优先级"><el-radio-group v-model="orderForm.priority"><el-radio-button label="低" /><el-radio-button label="中" /><el-radio-button label="高" /><el-radio-button label="紧急" /></el-radio-group></el-form-item>
        <el-form-item label="处理人"><el-select v-model="orderForm.handler" placeholder="选择处理人" style="width:100%"><el-option label="张三" value="zhangsan" /><el-option label="李四" value="lisi" /><el-option label="王五" value="wangwu" /></el-select></el-form-item>
        <el-form-item label="关联设备"><el-input v-model="orderForm.device" placeholder="选择关联设备" /></el-form-item>
        <el-form-item label="问题描述"><el-input v-model="orderForm.description" type="textarea" :rows="4" placeholder="请描述问题详情" /></el-form-item>
      </el-form>

      <div v-else-if="dialogType === 'view'" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="工单状态"><el-tag :type="statusTagType(currentOrder.status)" size="small">{{ currentOrder.status }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="工单标题" :span="2">{{ currentOrder.title }}</el-descriptions-item>
          <el-descriptions-item label="工单类型">{{ currentOrder.type }}</el-descriptions-item>
          <el-descriptions-item label="优先级"><el-tag :type="priorityTagType(currentOrder.priority)" size="small">{{ currentOrder.priority }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentOrder.creator }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentOrder.handler }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentOrder.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="评价状态" v-if="currentOrder.status === '已完成'">
            <el-tag :type="currentOrder.evaluated ? 'success' : 'warning'" size="small">{{ currentOrder.evaluated ? '已评价' : '待评价' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评分" v-if="currentOrder.evaluated">
            <el-rate v-model="currentOrder.rating" disabled />
          </el-descriptions-item>
        </el-descriptions>

        <!-- 评价信息 -->
        <div class="evaluation-section" v-if="currentOrder.evaluated">
          <div class="section-title">服务评价</div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="服务评分">
              <el-rate v-model="currentOrder.rating" disabled show-score />
            </el-descriptions-item>
            <el-descriptions-item label="响应速度">
              <el-tag :type="getSpeedTag(currentOrder.responseSpeed)" size="small">{{ currentOrder.responseSpeed }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="解决效果">
              <el-tag :type="getEffectTag(currentOrder.solveEffect)" size="small">{{ currentOrder.solveEffect }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="服务态度">
              <el-tag :type="getAttitudeTag(currentOrder.serviceAttitude)" size="small">{{ currentOrder.serviceAttitude }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="评价内容">{{ currentOrder.evaluationContent || '暂无评价内容' }}</el-descriptions-item>
            <el-descriptions-item label="评价时间">{{ currentOrder.evaluationTime }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="timeline-section">
          <div class="section-title">处理记录</div>
          <el-timeline>
            <el-timeline-item v-for="record in processRecords" :key="record.id" :type="record.type" :timestamp="record.time">
              <div class="record-content">{{ record.content }}</div>
              <div class="record-operator">操作人: {{ record.operator }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" v-if="dialogType === 'create'">提交</el-button>
      </template>
    </el-dialog>

    <!-- 评价弹窗 -->
    <el-dialog v-model="evaluateDialogVisible" title="工单评价" width="550px">
      <el-form :model="evaluateForm" label-width="100px">
        <el-form-item label="服务评分">
          <el-rate v-model="evaluateForm.rating" show-score :colors="['#F56C6C', '#E6A23C', '#67C23A']" />
        </el-form-item>
        <el-form-item label="响应速度">
          <el-radio-group v-model="evaluateForm.responseSpeed">
            <el-radio-button label="非常及时" />
            <el-radio-button label="比较及时" />
            <el-radio-button label="一般" />
            <el-radio-button label="较慢" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="解决效果">
          <el-radio-group v-model="evaluateForm.solveEffect">
            <el-radio-button label="完全解决" />
            <el-radio-button label="基本解决" />
            <el-radio-button label="部分解决" />
            <el-radio-button label="未解决" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="服务态度">
          <el-radio-group v-model="evaluateForm.serviceAttitude">
            <el-radio-button label="非常满意" />
            <el-radio-button label="满意" />
            <el-radio-button label="一般" />
            <el-radio-button label="不满意" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="evaluateForm.content" type="textarea" :rows="4" placeholder="请输入您的评价内容（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitEvaluate">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Clock, Loading, CircleCheck, Search, Plus } from '@element-plus/icons-vue'

const stats = reactive({ total: 256, pending: 18, processing: 12, completed: 226 })
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const filterDate = ref([])

const orderList = ref([
  { id: 1, orderNo: 'WO20250115001', title: '空调主机运行异常需维修', type: '设备维修', priority: '高', status: '处理中', creator: '系统', handler: '张三', createTime: '2025-01-15 10:30:00', updateTime: '2025-01-15 11:00:00', evaluated: false },
  { id: 2, orderNo: 'WO20250115002', title: 'A座5层照明系统巡检', type: '巡检工单', priority: '中', status: '待处理', creator: '李四', handler: '王五', createTime: '2025-01-15 09:00:00', updateTime: '2025-01-15 09:00:00', evaluated: false },
  { id: 3, orderNo: 'WO20250114003', title: '烟感探测器报警处理', type: '告警工单', priority: '紧急', status: '已完成', creator: '系统', handler: '张三', createTime: '2025-01-14 16:20:00', updateTime: '2025-01-14 17:30:00', evaluated: true, rating: 5, responseSpeed: '非常及时', solveEffect: '完全解决', serviceAttitude: '非常满意', evaluationContent: '处理非常及时，问题解决彻底，服务态度很好！', evaluationTime: '2025-01-14 18:00:00' },
  { id: 4, orderNo: 'WO20250114004', title: 'B座电梯定期维护', type: '设备维修', priority: '低', status: '已关闭', creator: '王五', handler: '李四', createTime: '2025-01-14 08:00:00', updateTime: '2025-01-14 18:00:00', evaluated: false }
])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref('')
const currentOrder = ref<any>({})
const orderForm = reactive({ title: '', type: '', priority: '中', handler: '', device: '', description: '' })

const processRecords = ref([
  { id: 1, type: 'primary', content: '工单已创建', operator: '系统', time: '2025-01-15 10:30:00' },
  { id: 2, type: 'success', content: '工单已指派给张三', operator: '系统', time: '2025-01-15 10:30:05' },
  { id: 3, type: 'warning', content: '开始处理，已到达现场', operator: '张三', time: '2025-01-15 11:00:00' }
])

// 评价相关
const evaluateDialogVisible = ref(false)
const evaluatingOrder = ref<any>(null)
const evaluateForm = reactive({
  rating: 5,
  responseSpeed: '比较及时',
  solveEffect: '基本解决',
  serviceAttitude: '满意',
  content: ''
})

const typeTagType = (type: string) => {
  const map: Record<string, string> = { '设备维修': 'primary', '巡检工单': 'success', '告警工单': 'danger' }
  return map[type] || 'info'
}
const priorityTagType = (priority: string) => {
  const map: Record<string, string> = { '低': 'info', '中': '', '高': 'warning', '紧急': 'danger' }
  return map[priority] || ''
}
const statusTagType = (status: string) => {
  const map: Record<string, string> = { '待处理': 'warning', '处理中': 'primary', '已完成': 'success', '已关闭': 'info' }
  return map[status] || ''
}

const handleSearch = () => { ElMessage.success('搜索工单') }
const handleCreateOrder = () => { dialogTitle.value = '新建工单'; dialogType.value = 'create'; dialogVisible.value = true }
const handleView = (row: any) => { currentOrder.value = row; dialogTitle.value = '工单详情'; dialogType.value = 'view'; dialogVisible.value = true }
const handleProcess = (row: any) => { ElMessage.success(`处理工单: ${row.orderNo}`) }
const handleTransfer = (row: any) => { ElMessage.info(`转派工单: ${row.orderNo}`) }
const handleClose = (row: any) => { ElMessage.warning(`关闭工单: ${row.orderNo}`) }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('工单创建成功') }

// 评价相关方法
const handleEvaluate = (row: any) => {
  evaluatingOrder.value = row
  evaluateForm.rating = 5
  evaluateForm.responseSpeed = '比较及时'
  evaluateForm.solveEffect = '基本解决'
  evaluateForm.serviceAttitude = '满意'
  evaluateForm.content = ''
  evaluateDialogVisible.value = true
}

const handleSubmitEvaluate = () => {
  if (evaluatingOrder.value) {
    evaluatingOrder.value.evaluated = true
    evaluatingOrder.value.rating = evaluateForm.rating
    evaluatingOrder.value.responseSpeed = evaluateForm.responseSpeed
    evaluatingOrder.value.solveEffect = evaluateForm.solveEffect
    evaluatingOrder.value.serviceAttitude = evaluateForm.serviceAttitude
    evaluatingOrder.value.evaluationContent = evaluateForm.content
    evaluatingOrder.value.evaluationTime = new Date().toLocaleString()
  }
  evaluateDialogVisible.value = false
  ElMessage.success('评价提交成功')
}

const getSpeedTag = (speed: string) => {
  const map: Record<string, string> = { '非常及时': 'success', '比较及时': 'success', '一般': 'warning', '较慢': 'danger' }
  return map[speed] || 'info'
}

const getEffectTag = (effect: string) => {
  const map: Record<string, string> = { '完全解决': 'success', '基本解决': 'success', '部分解决': 'warning', '未解决': 'danger' }
  return map[effect] || 'info'
}

const getAttitudeTag = (attitude: string) => {
  const map: Record<string, string> = { '非常满意': 'success', '满意': 'success', '一般': 'warning', '不满意': 'danger' }
  return map[attitude] || 'info'
}
</script>

<style lang="scss" scoped>
.workorder-container { display: flex; flex-direction: column; gap: 12px; }

.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 14px; .icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 22px; font-weight: 600; } .label { color: #909399; font-size: 13px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.pending .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.processing .icon { background: linear-gradient(135deg, #909399, #c0c4cc); }
  &.completed .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
}}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; .filter-section { display: flex; gap: 12px; flex-wrap: wrap; } } }

.pagination { padding: 12px 16px; display: flex; justify-content: flex-end; }

.order-detail { .timeline-section { margin-top: 20px; .section-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #409EFF; } .record-content { font-weight: 500; } .record-operator { font-size: 12px; color: #909399; } }
  .evaluation-section { margin-top: 20px; .section-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #67C23A; } }
}
</style>
