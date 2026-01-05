<template>
  <div class="maintenance-container">
    <!-- 页面头部统计 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total">
          <div class="stat-icon">
            <el-icon :size="28"><Tools /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">保养计划总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card completed">
          <div class="stat-icon">
            <el-icon :size="28"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pending">
          <div class="stat-icon">
            <el-icon :size="28"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待执行</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card overdue">
          <div class="stat-icon">
            <el-icon :size="28"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.overdue }}</div>
            <div class="stat-label">即将到期</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 主体内容 -->
    <div class="page-card">
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="保养计划" name="plan">
          <!-- 搜索表单 -->
          <el-form :model="searchForm" inline class="search-form">
            <el-form-item label="计划名称">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入计划名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="设备名称">
              <el-input
                v-model="searchForm.deviceName"
                placeholder="请输入设备名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="保养周期">
              <el-select v-model="searchForm.cycle" placeholder="请选择" clearable style="width: 120px">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="每季度" value="quarterly" />
                <el-option label="每年" value="yearly" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
                <el-option label="启用" value="enabled" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 操作按钮 -->
          <div class="table-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" @click="handleAddPlan">
                <el-icon><Plus /></el-icon>
                新增计划
              </el-button>
              <el-button type="danger" :disabled="!selectedPlans.length" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
            <div class="toolbar-right">
              <el-tooltip content="刷新">
                <el-button circle @click="fetchPlanList">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>

          <!-- 数据表格 -->
          <el-table
            v-loading="loading"
            :data="planList"
            border
            stripe
            @selection-change="handlePlanSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="code" label="计划编号" width="140" />
            <el-table-column prop="name" label="计划名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="deviceName" label="关联设备" min-width="150" show-overflow-tooltip />
            <el-table-column prop="cycle" label="保养周期" width="100" align="center">
              <template #default="{ row }">
                <el-tag>{{ getCycleText(row.cycle) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastDate" label="上次保养" width="120" />
            <el-table-column prop="nextDate" label="下次保养" width="120">
              <template #default="{ row }">
                <span :class="{ 'text-danger': isOverdue(row.nextDate) }">
                  {{ row.nextDate }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="responsible" label="负责人" width="100" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  active-value="enabled"
                  inactive-value="disabled"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleExecute(row)">
                  <el-icon><VideoPlay /></el-icon>
                  执行
                </el-button>
                <el-button type="warning" link size="small" @click="handleEditPlan(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="handleDeletePlan(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="保养记录" name="record">
          <!-- 搜索表单 -->
          <el-form :model="recordSearchForm" inline class="search-form">
            <el-form-item label="设备名称">
              <el-input
                v-model="recordSearchForm.deviceName"
                placeholder="请输入设备名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="执行人">
              <el-input
                v-model="recordSearchForm.executor"
                placeholder="请输入执行人"
                clearable
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="执行时间">
              <el-date-picker
                v-model="recordSearchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item label="保养结果">
              <el-select v-model="recordSearchForm.result" placeholder="请选择" clearable style="width: 120px">
                <el-option label="正常" value="normal" />
                <el-option label="异常" value="abnormal" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleRecordSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleRecordReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 操作按钮 -->
          <div class="table-toolbar">
            <div class="toolbar-left">
              <el-button type="success" @click="handleExportRecord">
                <el-icon><Download /></el-icon>
                导出记录
              </el-button>
            </div>
          </div>

          <!-- 数据表格 -->
          <el-table
            v-loading="recordLoading"
            :data="recordList"
            border
            stripe
          >
            <el-table-column prop="recordNo" label="记录编号" width="160" />
            <el-table-column prop="planName" label="保养计划" min-width="150" show-overflow-tooltip />
            <el-table-column prop="deviceName" label="设备名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="content" label="保养内容" min-width="200" show-overflow-tooltip />
            <el-table-column prop="executor" label="执行人" width="100" />
            <el-table-column prop="executeDate" label="执行时间" width="160" />
            <el-table-column prop="duration" label="耗时(分钟)" width="100" align="center" />
            <el-table-column prop="result" label="保养结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.result === 'normal' ? 'success' : 'danger'">
                  {{ row.result === 'normal' ? '正常' : '异常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewRecord(row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="recordPagination.current"
              v-model:page-size="recordPagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="recordPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="即将到期" name="expiring">
          <el-alert
            title="以下保养计划将在7天内到期，请及时处理"
            type="warning"
            show-icon
            :closable="false"
            style="margin-bottom: 16px"
          />
          
          <el-table :data="expiringList" border stripe>
            <el-table-column prop="code" label="计划编号" width="140" />
            <el-table-column prop="name" label="计划名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="deviceName" label="关联设备" min-width="150" show-overflow-tooltip />
            <el-table-column prop="nextDate" label="到期日期" width="120">
              <template #default="{ row }">
                <span class="text-danger">{{ row.nextDate }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="daysLeft" label="剩余天数" width="100" align="center">
              <template #default="{ row }">
                <el-tag type="danger">{{ row.daysLeft }}天</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="responsible" label="负责人" width="100" />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleExecute(row)">
                  立即执行
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增/编辑计划弹窗 -->
    <el-dialog
      v-model="planFormVisible"
      :title="isEditPlan ? '编辑保养计划' : '新增保养计划'"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="planFormRef"
        :model="planForm"
        :rules="planFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划编号" prop="code">
              <el-input v-model="planForm.code" placeholder="请输入计划编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划名称" prop="name">
              <el-input v-model="planForm.name" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联设备" prop="deviceId">
              <el-select v-model="planForm.deviceId" placeholder="请选择设备" style="width: 100%">
                <el-option
                  v-for="device in deviceOptions"
                  :key="device.id"
                  :label="device.name"
                  :value="device.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保养周期" prop="cycle">
              <el-select v-model="planForm.cycle" placeholder="请选择周期" style="width: 100%">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="每季度" value="quarterly" />
                <el-option label="每半年" value="halfYearly" />
                <el-option label="每年" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="planForm.startDate"
                type="date"
                placeholder="请选择开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsible">
              <el-input v-model="planForm.responsible" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提前提醒" prop="remindDays">
              <el-input-number
                v-model="planForm.remindDays"
                :min="1"
                :max="30"
                placeholder="天"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="planForm.status">
                <el-radio value="enabled">启用</el-radio>
                <el-radio value="disabled">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="保养内容" prop="content">
              <el-input
                v-model="planForm.content"
                type="textarea"
                :rows="4"
                placeholder="请输入保养内容"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="planFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPlan">确定</el-button>
      </template>
    </el-dialog>

    <!-- 执行保养弹窗 -->
    <el-dialog
      v-model="executeVisible"
      title="执行保养"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="executeFormRef"
        :model="executeForm"
        :rules="executeFormRules"
        label-width="100px"
      >
        <el-form-item label="计划名称">
          <el-input v-model="executeForm.planName" disabled />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="executeForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="执行人" prop="executor">
          <el-input v-model="executeForm.executor" placeholder="请输入执行人" />
        </el-form-item>
        <el-form-item label="执行时间" prop="executeDate">
          <el-date-picker
            v-model="executeForm.executeDate"
            type="datetime"
            placeholder="请选择执行时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="耗时(分钟)" prop="duration">
          <el-input-number v-model="executeForm.duration" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="保养结果" prop="result">
          <el-radio-group v-model="executeForm.result">
            <el-radio value="normal">正常</el-radio>
            <el-radio value="abnormal">异常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="保养说明" prop="remark">
          <el-input
            v-model="executeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入保养说明"
          />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="executeVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitExecute">提交</el-button>
      </template>
    </el-dialog>

    <!-- 记录详情弹窗 -->
    <el-dialog
      v-model="recordDetailVisible"
      title="保养记录详情"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录编号">{{ currentRecord.recordNo }}</el-descriptions-item>
        <el-descriptions-item label="保养计划">{{ currentRecord.planName }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="执行人">{{ currentRecord.executor }}</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ currentRecord.executeDate }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentRecord.duration }}分钟</el-descriptions-item>
        <el-descriptions-item label="保养结果">
          <el-tag :type="currentRecord.result === 'normal' ? 'success' : 'danger'">
            {{ currentRecord.result === 'normal' ? '正常' : '异常' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRecord.createTime }}</el-descriptions-item>
        <el-descriptions-item label="保养内容" :span="2">{{ currentRecord.content }}</el-descriptions-item>
        <el-descriptions-item label="保养说明" :span="2">{{ currentRecord.remark }}</el-descriptions-item>
      </el-descriptions>

      <template v-if="currentRecord.images?.length">
        <el-divider content-position="left">现场图片</el-divider>
        <div class="image-list">
          <el-image
            v-for="(img, index) in currentRecord.images"
            :key="index"
            :src="img"
            :preview-src-list="currentRecord.images"
            :initial-index="index"
            fit="cover"
            class="record-image"
          />
        </div>
      </template>

      <template #footer>
        <el-button @click="recordDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Tools, CircleCheck, Clock, Warning, Search, Refresh, Plus, Delete,
  Download, Edit, VideoPlay, View
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

// 接口定义
interface MaintenancePlan {
  id: number
  code: string
  name: string
  deviceId: number
  deviceName: string
  cycle: string
  startDate: string
  lastDate: string
  nextDate: string
  responsible: string
  remindDays: number
  content: string
  status: 'enabled' | 'disabled'
}

interface MaintenanceRecord {
  id: number
  recordNo: string
  planId: number
  planName: string
  deviceName: string
  content: string
  executor: string
  executeDate: string
  duration: number
  result: 'normal' | 'abnormal'
  remark: string
  createTime: string
  images?: string[]
}

// 统计数据
const stats = computed(() => ({
  total: 45,
  completed: 128,
  pending: 12,
  overdue: 3
}))

// Tab切换
const activeTab = ref('plan')

// 搜索表单
const searchForm = reactive({
  name: '',
  deviceName: '',
  cycle: '',
  status: ''
})

const recordSearchForm = reactive({
  deviceName: '',
  executor: '',
  dateRange: [],
  result: ''
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const recordPagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 状态
const loading = ref(false)
const recordLoading = ref(false)
const planList = ref<MaintenancePlan[]>([])
const recordList = ref<MaintenanceRecord[]>([])
const expiringList = ref<any[]>([])
const selectedPlans = ref<MaintenancePlan[]>([])
const planFormVisible = ref(false)
const executeVisible = ref(false)
const recordDetailVisible = ref(false)
const isEditPlan = ref(false)
const currentRecord = ref<MaintenanceRecord>({} as MaintenanceRecord)
const planFormRef = ref<FormInstance>()
const executeFormRef = ref<FormInstance>()

// 设备选项
const deviceOptions = ref([
  { id: 1, name: '1号中央空调主机' },
  { id: 2, name: '2号中央空调主机' },
  { id: 3, name: '生活水泵1号' },
  { id: 4, name: '消防水泵主泵' },
  { id: 5, name: '1号客梯' },
  { id: 6, name: '2号客梯' },
  { id: 7, name: '1号配电柜' },
  { id: 8, name: '应急发电机组' }
])

// 表单数据
const planForm = reactive<Partial<MaintenancePlan>>({
  code: '',
  name: '',
  deviceId: undefined,
  cycle: '',
  startDate: '',
  responsible: '',
  remindDays: 7,
  content: '',
  status: 'enabled'
})

const executeForm = reactive({
  planId: 0,
  planName: '',
  deviceName: '',
  executor: '',
  executeDate: '',
  duration: 30,
  result: 'normal' as 'normal' | 'abnormal',
  remark: ''
})

// 表单验证规则
const planFormRules: FormRules = {
  code: [{ required: true, message: '请输入计划编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请选择关联设备', trigger: 'change' }],
  cycle: [{ required: true, message: '请选择保养周期', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  responsible: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
}

const executeFormRules: FormRules = {
  executor: [{ required: true, message: '请输入执行人', trigger: 'blur' }],
  executeDate: [{ required: true, message: '请选择执行时间', trigger: 'change' }],
  result: [{ required: true, message: '请选择保养结果', trigger: 'change' }]
}

// 测试数据 - 保养计划
const mockPlanData: MaintenancePlan[] = [
  { id: 1, code: 'MP-2025-001', name: '中央空调季度保养', deviceId: 1, deviceName: '1号中央空调主机', cycle: 'quarterly', startDate: '2025-01-01', lastDate: '2025-12-01', nextDate: '2025-03-01', responsible: '张伟', remindDays: 7, content: '1. 检查制冷剂压力\n2. 清洗冷凝器\n3. 检查电气连接\n4. 润滑运动部件', status: 'enabled' },
  { id: 2, code: 'MP-2025-002', name: '水泵月度保养', deviceId: 3, deviceName: '生活水泵1号', cycle: 'monthly', startDate: '2025-01-01', lastDate: '2025-12-10', nextDate: '2025-01-10', responsible: '李明', remindDays: 3, content: '1. 检查密封件\n2. 检查轴承温度\n3. 清理进水口', status: 'enabled' },
  { id: 3, code: 'MP-2025-003', name: '电梯月度保养', deviceId: 5, deviceName: '1号客梯', cycle: 'monthly', startDate: '2025-01-01', lastDate: '2025-12-15', nextDate: '2025-01-15', responsible: '赵六', remindDays: 5, content: '1. 检查钢丝绳\n2. 检查制动器\n3. 润滑导轨\n4. 测试安全装置', status: 'enabled' },
  { id: 4, code: 'MP-2025-004', name: '配电柜半年保养', deviceId: 7, deviceName: '1号配电柜', cycle: 'halfYearly', startDate: '2025-01-01', lastDate: '2025-11-01', nextDate: '2025-05-01', responsible: '钱七', remindDays: 14, content: '1. 检查接线端子\n2. 测试断路器\n3. 清洁柜内灰尘\n4. 检查接地', status: 'enabled' },
  { id: 5, code: 'MP-2025-005', name: '发电机月度保养', deviceId: 8, deviceName: '应急发电机组', cycle: 'monthly', startDate: '2025-01-01', lastDate: '2025-12-01', nextDate: '2025-01-01', responsible: '钱七', remindDays: 7, content: '1. 检查燃油系统\n2. 检查冷却液\n3. 测试启动功能\n4. 检查蓄电池', status: 'enabled' },
  { id: 6, code: 'MP-2025-006', name: '消防泵季度保养', deviceId: 4, deviceName: '消防水泵主泵', cycle: 'quarterly', startDate: '2025-01-01', lastDate: '2025-12-05', nextDate: '2025-03-05', responsible: '王强', remindDays: 7, content: '1. 手动盘车检查\n2. 检查密封性\n3. 测试自动启动\n4. 检查电气', status: 'enabled' },
  { id: 7, code: 'MP-2025-007', name: '新风机组月度保养', deviceId: 2, deviceName: '2号中央空调主机', cycle: 'monthly', startDate: '2025-01-01', lastDate: '2025-11-20', nextDate: '2025-12-20', responsible: '张伟', remindDays: 3, content: '1. 更换过滤网\n2. 清洗表冷器\n3. 检查风机皮带', status: 'enabled' },
  { id: 8, code: 'MP-2025-008', name: '2号客梯保养', deviceId: 6, deviceName: '2号客梯', cycle: 'monthly', startDate: '2025-01-01', lastDate: '2025-12-15', nextDate: '2025-01-15', responsible: '赵六', remindDays: 5, content: '1. 检查门机系统\n2. 检查轿厢照明\n3. 检查通话系统', status: 'disabled' },
  { id: 9, code: 'MP-2025-009', name: 'UPS电源月度保养', deviceId: 1, deviceName: '数据中心UPS', cycle: 'monthly', startDate: '2025-01-01', lastDate: '2025-10-15', nextDate: '2025-12-25', responsible: '孙八', remindDays: 7, content: '1. 检查蓄电池\n2. 清洁散热风扇\n3. 检查输入输出电压', status: 'enabled' },
  { id: 10, code: 'MP-2025-010', name: '变压器年度保养', deviceId: 7, deviceName: '1号变压器', cycle: 'yearly', startDate: '2025-01-01', lastDate: '2025-09-01', nextDate: '2025-09-01', responsible: '钱七', remindDays: 30, content: '1. 绝缘电阻测试\n2. 变比测试\n3. 油品检测\n4. 外观检查', status: 'enabled' }
]

// 测试数据 - 保养记录
const mockRecordData: MaintenanceRecord[] = [
  { id: 1, recordNo: 'MR-2025-001', planId: 1, planName: '中央空调季度保养', deviceName: '1号中央空调主机', content: '1. 检查制冷剂压力\n2. 清洗冷凝器', executor: '张伟', executeDate: '2025-12-01 09:30:00', duration: 120, result: 'normal', remark: '设备运行正常，已完成全部保养项目', createTime: '2025-12-01 11:30:00' },
  { id: 2, recordNo: 'MR-2025-002', planId: 2, planName: '水泵月度保养', deviceName: '生活水泵1号', content: '1. 检查密封件\n2. 检查轴承温度', executor: '李明', executeDate: '2025-12-10 14:00:00', duration: 60, result: 'normal', remark: '轴承温度正常，密封良好', createTime: '2025-12-10 15:00:00' },
  { id: 3, recordNo: 'MR-2025-003', planId: 3, planName: '电梯月度保养', deviceName: '1号客梯', content: '1. 检查钢丝绳\n2. 检查制动器', executor: '赵六', executeDate: '2025-12-15 10:00:00', duration: 90, result: 'normal', remark: '钢丝绳无磨损，制动器正常', createTime: '2025-12-15 11:30:00' },
  { id: 4, recordNo: 'MR-2025-004', planId: 5, planName: '发电机月度保养', deviceName: '应急发电机组', content: '1. 检查燃油系统\n2. 测试启动功能', executor: '钱七', executeDate: '2025-12-01 08:00:00', duration: 45, result: 'normal', remark: '发电机启动正常，燃油充足', createTime: '2025-12-01 08:45:00' },
  { id: 5, recordNo: 'MR-2025-005', planId: 6, planName: '消防泵季度保养', deviceName: '消防水泵主泵', content: '1. 手动盘车检查\n2. 测试自动启动', executor: '王强', executeDate: '2025-12-05 15:00:00', duration: 60, result: 'normal', remark: '消防泵运行正常', createTime: '2025-12-05 16:00:00' },
  { id: 6, recordNo: 'MR-2025-006', planId: 7, planName: '新风机组月度保养', deviceName: '2号中央空调主机', content: '1. 更换过滤网\n2. 清洗表冷器', executor: '张伟', executeDate: '2025-11-20 09:00:00', duration: 80, result: 'abnormal', remark: '发现风机皮带有磨损，已更换', createTime: '2025-11-20 10:20:00' },
  { id: 7, recordNo: 'MR-2025-007', planId: 4, planName: '配电柜半年保养', deviceName: '1号配电柜', content: '1. 检查接线端子\n2. 测试断路器', executor: '钱七', executeDate: '2025-11-01 14:00:00', duration: 180, result: 'normal', remark: '所有断路器测试正常', createTime: '2025-11-01 17:00:00' },
  { id: 8, recordNo: 'MR-2025-008', planId: 3, planName: '电梯月度保养', deviceName: '1号客梯', content: '1. 检查钢丝绳\n2. 润滑导轨', executor: '赵六', executeDate: '2025-11-15 10:00:00', duration: 90, result: 'normal', remark: '已完成导轨润滑', createTime: '2025-11-15 11:30:00' },
  { id: 9, recordNo: 'MR-2025-009', planId: 9, planName: 'UPS电源月度保养', deviceName: '数据中心UPS', content: '1. 检查蓄电池\n2. 清洁散热风扇', executor: '孙八', executeDate: '2025-10-15 09:00:00', duration: 60, result: 'abnormal', remark: '发现2块蓄电池内阻偏高，建议更换', createTime: '2025-10-15 10:00:00' },
  { id: 10, recordNo: 'MR-2025-010', planId: 10, planName: '变压器年度保养', deviceName: '1号变压器', content: '1. 绝缘电阻测试\n2. 变比测试', executor: '钱七', executeDate: '2025-09-01 08:00:00', duration: 240, result: 'normal', remark: '绝缘电阻合格，油品正常', createTime: '2025-09-01 12:00:00' }
]

// 即将到期数据
const mockExpiringData = [
  { id: 7, code: 'MP-2025-007', name: '新风机组月度保养', deviceName: '2号中央空调主机', nextDate: '2025-12-20', daysLeft: 1, responsible: '张伟' },
  { id: 9, code: 'MP-2025-009', name: 'UPS电源月度保养', deviceName: '数据中心UPS', nextDate: '2025-12-25', daysLeft: 6, responsible: '孙八' },
  { id: 5, code: 'MP-2025-005', name: '发电机月度保养', deviceName: '应急发电机组', nextDate: '2025-01-01', daysLeft: 8, responsible: '钱七' }
]

// 获取周期文本
const getCycleText = (cycle: string) => {
  const map: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    quarterly: '每季度',
    halfYearly: '每半年',
    yearly: '每年'
  }
  return map[cycle] || cycle
}

// 判断是否过期
const isOverdue = (date: string) => {
  return new Date(date) < new Date()
}

// 获取计划列表
const fetchPlanList = () => {
  loading.value = true
  setTimeout(() => {
    planList.value = mockPlanData
    pagination.total = mockPlanData.length
    loading.value = false
  }, 500)
}

// 获取记录列表
const fetchRecordList = () => {
  recordLoading.value = true
  setTimeout(() => {
    recordList.value = mockRecordData
    recordPagination.total = mockRecordData.length
    recordLoading.value = false
  }, 500)
}

// 获取即将到期列表
const fetchExpiringList = () => {
  expiringList.value = mockExpiringData
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchPlanList()
}

const handleReset = () => {
  Object.assign(searchForm, { name: '', deviceName: '', cycle: '', status: '' })
  handleSearch()
}

const handleRecordSearch = () => {
  recordPagination.current = 1
  fetchRecordList()
}

const handleRecordReset = () => {
  Object.assign(recordSearchForm, { deviceName: '', executor: '', dateRange: [], result: '' })
  handleRecordSearch()
}

// 选择变化
const handlePlanSelectionChange = (rows: MaintenancePlan[]) => {
  selectedPlans.value = rows
}

// 状态变化
const handleStatusChange = (row: MaintenancePlan) => {
  ElMessage.success(`已${row.status === 'enabled' ? '启用' : '禁用'}计划`)
}

// 新增计划
const handleAddPlan = () => {
  isEditPlan.value = false
  Object.assign(planForm, {
    code: '',
    name: '',
    deviceId: undefined,
    cycle: '',
    startDate: '',
    responsible: '',
    remindDays: 7,
    content: '',
    status: 'enabled'
  })
  planFormVisible.value = true
}

// 编辑计划
const handleEditPlan = (row: MaintenancePlan) => {
  isEditPlan.value = true
  Object.assign(planForm, row)
  planFormVisible.value = true
}

// 删除计划
const handleDeletePlan = (row: MaintenancePlan) => {
  ElMessageBox.confirm(`确定要删除计划"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchPlanList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedPlans.value.length}个计划吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchPlanList()
  })
}

// 执行保养
const handleExecute = (row: MaintenancePlan) => {
  Object.assign(executeForm, {
    planId: row.id,
    planName: row.name,
    deviceName: row.deviceName,
    executor: '',
    executeDate: '',
    duration: 30,
    result: 'normal',
    remark: ''
  })
  executeVisible.value = true
}

// 提交计划
const handleSubmitPlan = async () => {
  if (!planFormRef.value) return
  await planFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEditPlan.value ? '编辑成功' : '新增成功')
      planFormVisible.value = false
      fetchPlanList()
    }
  })
}

// 提交执行
const handleSubmitExecute = async () => {
  if (!executeFormRef.value) return
  await executeFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('保养已完成')
      executeVisible.value = false
      fetchPlanList()
      fetchRecordList()
    }
  })
}

// 查看记录详情
const handleViewRecord = (row: MaintenanceRecord) => {
  currentRecord.value = row
  recordDetailVisible.value = true
}

// 导出记录
const handleExportRecord = () => {
  ElMessage.success('正在导出...')
}

onMounted(() => {
  fetchPlanList()
  fetchRecordList()
  fetchExpiringList()
})
</script>

<style lang="scss" scoped>
.maintenance-container {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: #fff;
  }

  .stat-content {
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
  }

  &.total .stat-icon {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  }

  &.completed .stat-icon {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  }

  &.pending .stat-icon {
    background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
  }

  &.overdue .stat-icon {
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  }
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.main-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.search-form {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .toolbar-left {
    display: flex;
    gap: 10px;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.record-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  cursor: pointer;
}

:deep(.el-table) {
  .el-button + .el-button {
    margin-left: 4px;
  }
}
</style>
