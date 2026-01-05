<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <div class="page-card search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="规则名称">
          <el-input v-model="searchForm.name" placeholder="请输入规则名称" clearable style="width: 160px" />
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
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增规则
          </el-button>
        </div>
        <div class="header-right">
          <el-tag type="info">共 {{ pagination.total }} 条规则</el-tag>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" style="width: 100%" v-loading="loading" row-key="id">
        <el-table-column prop="id" label="规则ID" width="100" />
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="type" label="报警类型" width="120">
          <template #default="{ row }">
            {{ getTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="报警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" effect="dark">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="触发条件" min-width="200" show-overflow-tooltip />
        <el-table-column prop="threshold" label="阈值设置" width="150" />
        <el-table-column prop="notifyWay" label="通知方式" width="150">
          <template #default="{ row }">
            <div class="notify-tags">
              <el-tag v-for="way in row.notifyWay" :key="way" size="small" class="notify-tag">
                {{ getNotifyText(way) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch 
              v-model="row.status" 
              active-value="enabled" 
              inactive-value="disabled"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="info" link size="small" @click="handleCopy(row)">
              <el-icon><CopyDocument /></el-icon>复制
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择报警类型" style="width: 100%">
                <el-option label="设备故障" value="device_fault" />
                <el-option label="温度异常" value="temperature" />
                <el-option label="入侵报警" value="intrusion" />
                <el-option label="消防报警" value="fire" />
                <el-option label="湿度异常" value="humidity" />
                <el-option label="电力异常" value="power" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报警级别" prop="level">
              <el-select v-model="formData.level" placeholder="请选择报警级别" style="width: 100%">
                <el-option label="高危" value="high" />
                <el-option label="中危" value="medium" />
                <el-option label="低危" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio label="enabled">启用</el-radio>
                <el-radio label="disabled">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">阈值设置</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="触发条件" prop="conditionType">
              <el-select v-model="formData.conditionType" placeholder="请选择触发条件" style="width: 100%">
                <el-option label="大于" value="gt" />
                <el-option label="小于" value="lt" />
                <el-option label="等于" value="eq" />
                <el-option label="大于等于" value="gte" />
                <el-option label="小于等于" value="lte" />
                <el-option label="区间内" value="between" />
                <el-option label="区间外" value="outside" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="阈值" prop="thresholdValue">
              <el-input-number 
                v-model="formData.thresholdValue" 
                :min="0" 
                :max="1000" 
                style="width: 100%"
                v-if="formData.conditionType !== 'between' && formData.conditionType !== 'outside'"
              />
              <el-row :gutter="10" v-else>
                <el-col :span="11">
                  <el-input-number v-model="formData.thresholdMin" :min="0" size="small" style="width: 100%" />
                </el-col>
                <el-col :span="2" class="text-center">-</el-col>
                <el-col :span="11">
                  <el-input-number v-model="formData.thresholdMax" :min="0" size="small" style="width: 100%" />
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%">
                <el-option label="℃ (温度)" value="℃" />
                <el-option label="% (百分比)" value="%" />
                <el-option label="V (电压)" value="V" />
                <el-option label="A (电流)" value="A" />
                <el-option label="kWh (电量)" value="kWh" />
                <el-option label="次 (次数)" value="次" />
                <el-option label="秒 (时间)" value="秒" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="持续时间" prop="duration">
              <el-input-number v-model="formData.duration" :min="0" :max="3600" style="width: 100%">
                <template #append>秒</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">通知设置</el-divider>
        
        <el-form-item label="通知方式" prop="notifyWay">
          <el-checkbox-group v-model="formData.notifyWay">
            <el-checkbox label="app">APP推送</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="voice">语音通知</el-checkbox>
            <el-checkbox label="wechat">微信通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="通知人员" prop="notifyUsers">
          <el-select v-model="formData.notifyUsers" multiple placeholder="请选择通知人员" style="width: 100%">
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
            <el-option label="王五" value="wangwu" />
            <el-option label="赵六" value="zhaoliu" />
            <el-option label="运维组" value="ops_group" />
            <el-option label="安保组" value="security_group" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="通知频率" prop="notifyFrequency">
          <el-select v-model="formData.notifyFrequency" placeholder="请选择通知频率" style="width: 100%">
            <el-option label="每次触发" value="every" />
            <el-option label="每5分钟" value="5min" />
            <el-option label="每15分钟" value="15min" />
            <el-option label="每30分钟" value="30min" />
            <el-option label="每小时" value="1hour" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="规则描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入规则描述" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, CopyDocument } from '@element-plus/icons-vue'

// 接口定义
interface AlarmConfig {
  id: string
  name: string
  type: string
  level: 'high' | 'medium' | 'low'
  condition: string
  conditionType: string
  threshold: string
  thresholdValue: number
  thresholdMin?: number
  thresholdMax?: number
  unit: string
  duration: number
  notifyWay: string[]
  notifyUsers: string[]
  notifyFrequency: string
  status: 'enabled' | 'disabled'
  updateTime: string
  description: string
}

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
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
const tableData = ref<AlarmConfig[]>([])
const dialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

// 表单数据
const formData = reactive<Partial<AlarmConfig>>({
  name: '',
  type: '',
  level: 'medium',
  conditionType: 'gt',
  thresholdValue: 0,
  thresholdMin: 0,
  thresholdMax: 0,
  unit: '',
  duration: 0,
  notifyWay: [],
  notifyUsers: [],
  notifyFrequency: 'every',
  status: 'enabled',
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择报警类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择报警级别', trigger: 'change' }],
  conditionType: [{ required: true, message: '请选择触发条件', trigger: 'change' }],
  notifyWay: [{ required: true, message: '请选择通知方式', trigger: 'change' }]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑报警规则' : '新增报警规则')

// 测试数据
const mockData: AlarmConfig[] = [
  {
    id: 'CFG001',
    name: '机房高温报警',
    type: 'temperature',
    level: 'high',
    condition: '温度 > 28℃ 持续5分钟',
    conditionType: 'gt',
    threshold: '> 28℃',
    thresholdValue: 28,
    unit: '℃',
    duration: 300,
    notifyWay: ['app', 'sms'],
    notifyUsers: ['zhangsan', 'lisi'],
    notifyFrequency: '5min',
    status: 'enabled',
    updateTime: '2025-12-23 10:30:00',
    description: '服务器机房温度过高报警，防止设备过热'
  },
  {
    id: 'CFG002',
    name: '机房低温报警',
    type: 'temperature',
    level: 'medium',
    condition: '温度 < 18℃',
    conditionType: 'lt',
    threshold: '< 18℃',
    thresholdValue: 18,
    unit: '℃',
    duration: 60,
    notifyWay: ['app'],
    notifyUsers: ['ops_group'],
    notifyFrequency: '15min',
    status: 'enabled',
    updateTime: '2025-12-23 10:25:00',
    description: '机房温度过低报警'
  },
  {
    id: 'CFG003',
    name: '档案室湿度异常',
    type: 'humidity',
    level: 'medium',
    condition: '湿度 < 45% 或 > 65%',
    conditionType: 'outside',
    threshold: '45% - 65%',
    thresholdMin: 45,
    thresholdMax: 65,
    thresholdValue: 0,
    unit: '%',
    duration: 600,
    notifyWay: ['app', 'email'],
    notifyUsers: ['zhangsan'],
    notifyFrequency: '30min',
    status: 'enabled',
    updateTime: '2025-12-22 14:20:00',
    description: '档案室需要保持适当湿度，防止文件损坏'
  },
  {
    id: 'CFG004',
    name: '电压异常波动',
    type: 'power',
    level: 'high',
    condition: '电压 > 240V 或 < 200V',
    conditionType: 'outside',
    threshold: '200V - 240V',
    thresholdMin: 200,
    thresholdMax: 240,
    thresholdValue: 0,
    unit: 'V',
    duration: 10,
    notifyWay: ['app', 'sms', 'voice'],
    notifyUsers: ['lisi', 'ops_group'],
    notifyFrequency: 'every',
    status: 'enabled',
    updateTime: '2025-12-22 11:15:00',
    description: '电压异常可能导致设备损坏，需立即处理'
  },
  {
    id: 'CFG005',
    name: '消防烟感报警',
    type: 'fire',
    level: 'high',
    condition: '烟雾浓度 > 阈值',
    conditionType: 'gt',
    threshold: '> 触发值',
    thresholdValue: 1,
    unit: '次',
    duration: 0,
    notifyWay: ['app', 'sms', 'voice', 'wechat'],
    notifyUsers: ['security_group', 'zhangsan', 'lisi', 'wangwu'],
    notifyFrequency: 'every',
    status: 'enabled',
    updateTime: '2025-12-21 09:30:00',
    description: '消防烟感触发立即报警，通知所有相关人员'
  },
  {
    id: 'CFG006',
    name: '入侵检测报警',
    type: 'intrusion',
    level: 'high',
    condition: '红外对射触发',
    conditionType: 'gt',
    threshold: '> 0次',
    thresholdValue: 0,
    unit: '次',
    duration: 0,
    notifyWay: ['app', 'sms'],
    notifyUsers: ['security_group'],
    notifyFrequency: 'every',
    status: 'enabled',
    updateTime: '2025-12-20 16:45:00',
    description: '周界入侵检测报警'
  },
  {
    id: 'CFG007',
    name: '设备离线报警',
    type: 'device_fault',
    level: 'medium',
    condition: '设备离线时间 > 5分钟',
    conditionType: 'gt',
    threshold: '> 300秒',
    thresholdValue: 300,
    unit: '秒',
    duration: 300,
    notifyWay: ['app', 'email'],
    notifyUsers: ['ops_group'],
    notifyFrequency: '15min',
    status: 'enabled',
    updateTime: '2025-12-20 14:30:00',
    description: '设备持续离线超过5分钟触发报警'
  },
  {
    id: 'CFG008',
    name: '电梯故障报警',
    type: 'device_fault',
    level: 'high',
    condition: '电梯运行异常',
    conditionType: 'gt',
    threshold: '异常检测',
    thresholdValue: 1,
    unit: '次',
    duration: 0,
    notifyWay: ['app', 'sms', 'voice'],
    notifyUsers: ['wangwu', 'ops_group'],
    notifyFrequency: 'every',
    status: 'enabled',
    updateTime: '2025-12-19 11:20:00',
    description: '电梯运行异常立即通知维保人员'
  },
  {
    id: 'CFG009',
    name: '空调故障报警',
    type: 'device_fault',
    level: 'low',
    condition: '空调运行异常',
    conditionType: 'gt',
    threshold: '异常检测',
    thresholdValue: 1,
    unit: '次',
    duration: 60,
    notifyWay: ['app'],
    notifyUsers: ['ops_group'],
    notifyFrequency: '1hour',
    status: 'enabled',
    updateTime: '2025-12-19 09:15:00',
    description: '空调设备故障报警'
  },
  {
    id: 'CFG010',
    name: '非工作时间门禁报警',
    type: 'intrusion',
    level: 'medium',
    condition: '非工作时间(22:00-06:00)刷卡',
    conditionType: 'gt',
    threshold: '非工作时间',
    thresholdValue: 1,
    unit: '次',
    duration: 0,
    notifyWay: ['app', 'sms'],
    notifyUsers: ['security_group'],
    notifyFrequency: 'every',
    status: 'disabled',
    updateTime: '2025-12-18 15:40:00',
    description: '非工作时间有人刷卡进入触发报警（已禁用）'
  },
  {
    id: 'CFG011',
    name: '用电量超标报警',
    type: 'power',
    level: 'low',
    condition: '日用电量 > 1000kWh',
    conditionType: 'gt',
    threshold: '> 1000kWh',
    thresholdValue: 1000,
    unit: 'kWh',
    duration: 0,
    notifyWay: ['email'],
    notifyUsers: ['zhaoliu'],
    notifyFrequency: '1hour',
    status: 'enabled',
    updateTime: '2025-12-18 10:30:00',
    description: '日用电量超标提醒'
  },
  {
    id: 'CFG012',
    name: '仓库湿度过高',
    type: 'humidity',
    level: 'medium',
    condition: '湿度 > 70%',
    conditionType: 'gt',
    threshold: '> 70%',
    thresholdValue: 70,
    unit: '%',
    duration: 600,
    notifyWay: ['app', 'wechat'],
    notifyUsers: ['zhaoliu'],
    notifyFrequency: '30min',
    status: 'enabled',
    updateTime: '2025-12-17 16:20:00',
    description: '仓库湿度过高可能导致货物受潮'
  }
]

// 获取级别类型
const getLevelType = (level: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[level] || 'info'
}

// 获取级别文本
const getLevelText = (level: string) => {
  const texts: Record<string, string> = {
    high: '高危',
    medium: '中危',
    low: '低危'
  }
  return texts[level] || level
}

// 获取类型文本
const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    device_fault: '设备故障',
    temperature: '温度异常',
    intrusion: '入侵报警',
    fire: '消防报警',
    humidity: '湿度异常',
    power: '电力异常'
  }
  return texts[type] || type
}

// 获取通知方式文本
const getNotifyText = (way: string) => {
  const texts: Record<string, string> = {
    app: 'APP',
    sms: '短信',
    email: '邮件',
    voice: '语音',
    wechat: '微信'
  }
  return texts[way] || way
}

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    let filteredData = [...mockData]
    
    // 筛选
    if (searchForm.name) {
      filteredData = filteredData.filter(item => item.name.includes(searchForm.name))
    }
    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
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
  searchForm.name = ''
  searchForm.type = ''
  searchForm.status = ''
  pagination.currentPage = 1
  loadData()
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.type = ''
  formData.level = 'medium'
  formData.conditionType = 'gt'
  formData.thresholdValue = 0
  formData.thresholdMin = 0
  formData.thresholdMax = 0
  formData.unit = ''
  formData.duration = 0
  formData.notifyWay = []
  formData.notifyUsers = []
  formData.notifyFrequency = 'every'
  formData.status = 'enabled'
  formData.description = ''
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: AlarmConfig) => {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 复制
const handleCopy = (row: AlarmConfig) => {
  isEdit.value = false
  Object.assign(formData, row)
  formData.name = row.name + ' - 副本'
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: AlarmConfig) => {
  ElMessageBox.confirm(`确定要删除规则"${row.name}"吗？`, '删除确认', {
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      pagination.total--
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (row: AlarmConfig) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`规则已${statusText}`)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  
  ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
  dialogVisible.value = false
  loadData()
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
}

.notify-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  
  .notify-tag {
    margin: 0;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.text-center {
  text-align: center;
  line-height: 32px;
}

:deep(.el-divider__text) {
  font-size: 14px;
  color: #606266;
}
</style>
