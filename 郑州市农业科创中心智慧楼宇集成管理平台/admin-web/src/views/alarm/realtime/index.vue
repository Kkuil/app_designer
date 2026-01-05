<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <div class="page-card search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="报警级别">
          <el-select v-model="searchForm.level" placeholder="请选择" clearable style="width: 120px">
            <el-option label="高危" value="high" />
            <el-option label="中危" value="medium" />
            <el-option label="低危" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="报警类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 140px">
            <el-option label="设备故障" value="device_fault" />
            <el-option label="温度异常" value="temperature" />
            <el-option label="入侵报警" value="intrusion" />
            <el-option label="消防报警" value="fire" />
            <el-option label="湿度异常" value="humidity" />
            <el-option label="电力异常" value="power" />
          </el-select>
        </el-form-item>
        <el-form-item label="报警来源">
          <el-input v-model="searchForm.source" placeholder="请输入设备/区域" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="未处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已确认" value="confirmed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作区域 -->
    <div class="page-card">
      <div class="table-header">
        <div class="header-left">
          <el-button type="success" :disabled="selectedRows.length === 0" @click="handleBatchConfirm">
            <el-icon><Check /></el-icon>批量确认
          </el-button>
          <el-button type="warning" :disabled="selectedRows.length === 0" @click="handleBatchProcess">
            <el-icon><Edit /></el-icon>批量处理
          </el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchIgnore">
            <el-icon><Close /></el-icon>批量忽略
          </el-button>
          <span class="selected-info" v-if="selectedRows.length > 0">
            已选择 {{ selectedRows.length }} 条报警
          </span>
        </div>
        <div class="header-right">
          <el-badge :value="unprocessedCount" :max="99" class="alarm-badge">
            <el-tag type="danger" effect="dark">
              <el-icon><Bell /></el-icon> 未处理报警
            </el-tag>
          </el-badge>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        v-loading="loading"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="报警ID" width="100" />
        <el-table-column prop="level" label="报警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" effect="dark">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="报警类型" width="120">
          <template #default="{ row }">
            <span class="alarm-type">
              <el-icon :class="getTypeIconClass(row.type)"><component :is="getTypeIcon(row.type)" /></el-icon>
              {{ getTypeText(row.type) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="报警来源" min-width="150" />
        <el-table-column prop="content" label="报警内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="alarmTime" label="报警时间" width="180" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button 
              type="success" 
              link 
              size="small" 
              @click="handleConfirm(row)"
              v-if="row.status === 'pending'"
            >
              <el-icon><Check /></el-icon>确认
            </el-button>
            <el-button 
              type="warning" 
              link 
              size="small" 
              @click="handleProcess(row)"
              v-if="row.status !== 'confirmed'"
            >
              <el-icon><Edit /></el-icon>处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="报警详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报警ID">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="报警级别">
          <el-tag :type="getLevelType(currentRow?.level)" effect="dark">
            {{ getLevelText(currentRow?.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报警类型">{{ getTypeText(currentRow?.type) }}</el-descriptions-item>
        <el-descriptions-item label="报警来源">{{ currentRow?.source }}</el-descriptions-item>
        <el-descriptions-item label="报警时间">{{ currentRow?.alarmTime }}</el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusType(currentRow?.status)">
            {{ getStatusText(currentRow?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报警内容" :span="2">{{ currentRow?.content }}</el-descriptions-item>
        <el-descriptions-item label="设备信息" :span="2">{{ currentRow?.deviceInfo }}</el-descriptions-item>
        <el-descriptions-item label="位置信息" :span="2">{{ currentRow?.location }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="handleConfirm(currentRow)" v-if="currentRow?.status === 'pending'">
          确认报警
        </el-button>
        <el-button type="primary" @click="handleProcess(currentRow)" v-if="currentRow?.status !== 'confirmed'">
          处理报警
        </el-button>
      </template>
    </el-dialog>

    <!-- 处理弹窗 -->
    <el-dialog v-model="processVisible" title="处理报警" width="500px">
      <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <el-form-item label="处理方式" prop="method">
          <el-select v-model="processForm.method" placeholder="请选择处理方式" style="width: 100%">
            <el-option label="现场处理" value="onsite" />
            <el-option label="远程处理" value="remote" />
            <el-option label="派发工单" value="workorder" />
            <el-option label="忽略报警" value="ignore" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人员" prop="handler">
          <el-select v-model="processForm.handler" placeholder="请选择处理人员" style="width: 100%">
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
            <el-option label="王五" value="wangwu" />
            <el-option label="赵六" value="zhaoliu" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明" prop="remark">
          <el-input 
            v-model="processForm.remark" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, Check, Edit, Close, Bell, View,
  Warning, Cpu, Key, Female, Cloudy, Lightning
} from '@element-plus/icons-vue'

// 接口定义
interface AlarmRecord {
  id: string
  level: 'high' | 'medium' | 'low'
  type: string
  source: string
  content: string
  alarmTime: string
  status: 'pending' | 'processing' | 'confirmed'
  deviceInfo: string
  location: string
}

// 搜索表单
const searchForm = reactive({
  level: '',
  type: '',
  source: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 状态
const loading = ref(false)
const tableData = ref<AlarmRecord[]>([])
const selectedRows = ref<AlarmRecord[]>([])
const detailVisible = ref(false)
const processVisible = ref(false)
const currentRow = ref<AlarmRecord | null>(null)
const processFormRef = ref()

// 处理表单
const processForm = reactive({
  method: '',
  handler: '',
  remark: ''
})

const processRules = {
  method: [{ required: true, message: '请选择处理方式', trigger: 'change' }],
  handler: [{ required: true, message: '请选择处理人员', trigger: 'change' }]
}

// 测试数据
const mockData: AlarmRecord[] = [
  {
    id: 'ALM20251224001',
    level: 'high',
    type: 'fire',
    source: '1号楼3层消防感应器',
    content: '检测到烟雾浓度超标，请立即确认是否发生火情',
    alarmTime: '2025-12-24 09:23:15',
    status: 'pending',
    deviceInfo: '烟雾传感器 SM-3F-001',
    location: '1号楼3层电梯厅'
  },
  {
    id: 'ALM20251224002',
    level: 'high',
    type: 'intrusion',
    source: '机房门禁系统',
    content: '非授权人员尝试进入核心机房，多次刷卡失败',
    alarmTime: '2025-12-24 09:18:42',
    status: 'pending',
    deviceInfo: '门禁控制器 AC-DC-001',
    location: 'B1层核心机房'
  },
  {
    id: 'ALM20251224003',
    level: 'medium',
    type: 'temperature',
    source: '2号楼服务器机房',
    content: '机房温度达到32℃，超过设定阈值28℃',
    alarmTime: '2025-12-24 09:15:30',
    status: 'processing',
    deviceInfo: '温湿度传感器 TH-2F-003',
    location: '2号楼2层服务器机房'
  },
  {
    id: 'ALM20251224004',
    level: 'medium',
    type: 'device_fault',
    source: '空调控制系统',
    content: '3号楼中央空调主机运行异常，压缩机频繁启停',
    alarmTime: '2025-12-24 09:10:22',
    status: 'pending',
    deviceInfo: '空调主机 HVAC-3F-001',
    location: '3号楼设备层'
  },
  {
    id: 'ALM20251224005',
    level: 'low',
    type: 'humidity',
    source: '档案室',
    content: '档案室湿度偏低，当前45%，低于推荐值50%',
    alarmTime: '2025-12-24 09:05:18',
    status: 'confirmed',
    deviceInfo: '温湿度传感器 TH-1F-008',
    location: '1号楼1层档案室'
  },
  {
    id: 'ALM20251224006',
    level: 'high',
    type: 'power',
    source: '配电室',
    content: 'A相电压异常波动，瞬时电压达到245V',
    alarmTime: '2025-12-24 08:55:33',
    status: 'processing',
    deviceInfo: '智能电表 PM-B1-001',
    location: 'B1层配电室'
  },
  {
    id: 'ALM20251224007',
    level: 'medium',
    type: 'device_fault',
    source: '电梯监控系统',
    content: '2号电梯运行异常，检测到轻微抖动',
    alarmTime: '2025-12-24 08:48:15',
    status: 'pending',
    deviceInfo: '电梯控制器 EL-002',
    location: '1号楼2号电梯'
  },
  {
    id: 'ALM20251224008',
    level: 'low',
    type: 'temperature',
    source: '会议室A301',
    content: '会议室温度偏高，当前27℃',
    alarmTime: '2025-12-24 08:42:50',
    status: 'confirmed',
    deviceInfo: '温湿度传感器 TH-3F-001',
    location: '3号楼3层会议室A301'
  },
  {
    id: 'ALM20251224009',
    level: 'medium',
    type: 'intrusion',
    source: '周界防范系统',
    content: '北侧围墙红外对射触发，疑似有物体穿越',
    alarmTime: '2025-12-24 08:35:28',
    status: 'processing',
    deviceInfo: '红外对射 IR-N-003',
    location: '园区北侧围墙'
  },
  {
    id: 'ALM20251224010',
    level: 'low',
    type: 'device_fault',
    source: '照明控制系统',
    content: '地下车库B区照明控制模块通信中断',
    alarmTime: '2025-12-24 08:28:40',
    status: 'pending',
    deviceInfo: '照明控制器 LC-B1-002',
    location: 'B1层停车场B区'
  },
  {
    id: 'ALM20251224011',
    level: 'high',
    type: 'fire',
    source: '厨房油烟系统',
    content: '餐厅厨房油烟浓度超标，风机运行异常',
    alarmTime: '2025-12-24 08:20:15',
    status: 'confirmed',
    deviceInfo: '油烟传感器 OS-1F-001',
    location: '1号楼1层餐厅厨房'
  },
  {
    id: 'ALM20251224012',
    level: 'medium',
    type: 'humidity',
    source: '仓库管理系统',
    content: '仓库湿度达到75%，超过设定阈值70%',
    alarmTime: '2025-12-24 08:15:33',
    status: 'pending',
    deviceInfo: '温湿度传感器 TH-W-001',
    location: '园区仓库'
  }
]

// 计算未处理报警数量
const unprocessedCount = computed(() => {
  return tableData.value.filter(item => item.status === 'pending').length
})

// 获取级别类型
const getLevelType = (level: string | undefined) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level || ''] || 'info'
}

// 获取级别文本
const getLevelText = (level: string | undefined) => {
  const texts: Record<string, string> = {
    high: '高危',
    medium: '中危',
    low: '低危'
  }
  return texts[level || ''] || level
}

// 获取类型图标
const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    device_fault: Cpu,
    temperature: Warning,
    intrusion: Key,
    fire: Female,
    humidity: Cloudy,
    power: Lightning
  }
  return icons[type] || Warning
}

// 获取类型图标样式
const getTypeIconClass = (type: string) => {
  const classes: Record<string, string> = {
    device_fault: 'icon-device',
    temperature: 'icon-temperature',
    intrusion: 'icon-intrusion',
    fire: 'icon-fire',
    humidity: 'icon-humidity',
    power: 'icon-power'
  }
  return classes[type] || ''
}

// 获取类型文本
const getTypeText = (type: string | undefined) => {
  const texts: Record<string, string> = {
    device_fault: '设备故障',
    temperature: '温度异常',
    intrusion: '入侵报警',
    fire: '消防报警',
    humidity: '湿度异常',
    power: '电力异常'
  }
  return texts[type || ''] || type
}

// 获取状态类型
const getStatusType = (status: string | undefined) => {
  const types: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    confirmed: 'success'
  }
  return types[status || ''] || 'info'
}

// 获取状态文本
const getStatusText = (status: string | undefined) => {
  const texts: Record<string, string> = {
    pending: '未处理',
    processing: '处理中',
    confirmed: '已确认'
  }
  return texts[status || ''] || status
}

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]
    
    // 筛选
    if (searchForm.level) {
      filteredData = filteredData.filter(item => item.level === searchForm.level)
    }
    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
    }
    if (searchForm.source) {
      filteredData = filteredData.filter(item => 
        item.source.includes(searchForm.source)
      )
    }
    if (searchForm.status) {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }
    
    pagination.total = filteredData.length
    const start = (pagination.currentPage - 1) * pagination.pageSize
    tableData.value = filteredData.slice(start, start + pagination.pageSize)
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.level = ''
  searchForm.type = ''
  searchForm.source = ''
  searchForm.status = ''
  pagination.currentPage = 1
  loadData()
}

// 选择变化
const handleSelectionChange = (rows: AlarmRecord[]) => {
  selectedRows.value = rows
}

// 查看详情
const handleView = (row: AlarmRecord) => {
  currentRow.value = row
  detailVisible.value = true
}

// 确认报警
const handleConfirm = (row: AlarmRecord | null) => {
  if (!row) return
  ElMessageBox.confirm('确定要确认该报警吗？', '确认报警', {
    type: 'warning'
  }).then(() => {
    row.status = 'confirmed'
    ElMessage.success('报警已确认')
    detailVisible.value = false
  }).catch(() => {})
}

// 处理报警
const handleProcess = (row: AlarmRecord | null) => {
  if (!row) return
  currentRow.value = row
  processForm.method = ''
  processForm.handler = ''
  processForm.remark = ''
  processVisible.value = true
}

// 提交处理
const submitProcess = async () => {
  if (!processFormRef.value) return
  await processFormRef.value.validate()
  
  if (currentRow.value) {
    currentRow.value.status = 'processing'
  }
  ElMessage.success('处理信息已提交')
  processVisible.value = false
  detailVisible.value = false
}

// 批量确认
const handleBatchConfirm = () => {
  ElMessageBox.confirm(`确定要确认选中的 ${selectedRows.value.length} 条报警吗？`, '批量确认', {
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'confirmed'
    })
    ElMessage.success('批量确认成功')
    selectedRows.value = []
  }).catch(() => {})
}

// 批量处理
const handleBatchProcess = () => {
  ElMessageBox.confirm(`确定要将选中的 ${selectedRows.value.length} 条报警标记为处理中吗？`, '批量处理', {
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'processing'
    })
    ElMessage.success('批量处理成功')
    selectedRows.value = []
  }).catch(() => {})
}

// 批量忽略
const handleBatchIgnore = () => {
  ElMessageBox.confirm(`确定要忽略选中的 ${selectedRows.value.length} 条报警吗？此操作将直接确认这些报警。`, '批量忽略', {
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'confirmed'
    })
    ElMessage.success('批量忽略成功')
    selectedRows.value = []
  }).catch(() => {})
}

// 分页变化
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 0;
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.search-card {
  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 16px;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .selected-info {
    color: #409eff;
    font-size: 14px;
    margin-left: 8px;
  }
  
  .alarm-badge {
    :deep(.el-badge__content) {
      top: 8px;
    }
  }
}

.alarm-type {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .el-icon {
    font-size: 16px;
  }
  
  .icon-device {
    color: #909399;
  }
  
  .icon-temperature {
    color: #e6a23c;
  }
  
  .icon-intrusion {
    color: #f56c6c;
  }
  
  .icon-fire {
    color: #f56c6c;
  }
  
  .icon-humidity {
    color: #409eff;
  }
  
  .icon-power {
    color: #e6a23c;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
