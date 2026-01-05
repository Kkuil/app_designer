<template>
  <div class="water-detector">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>浸水监测器</span>
          <div>
            <el-button type="primary" @click="handleAddDevice">添加设备</el-button>
            <el-button @click="handleExport">导出数据</el-button>
          </div>
        </div>
      </template>

      <el-alert
        v-if="waterAlarmCount > 0"
        :title="`当前有 ${waterAlarmCount} 个浸水监测器处于报警状态！`"
        type="error"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="设备编号">
          <el-input v-model="searchForm.deviceCode" placeholder="请输入设备编号" clearable />
        </el-form-item>

        <el-form-item label="安装位置">
          <el-select v-model="searchForm.location" placeholder="请选择位置" clearable>
            <el-option label="全部" value="" />
            <el-option label="A栋实验室" value="A" />
            <el-option label="B栋实验室" value="B" />
            <el-option label="C栋实验室" value="C" />
          </el-select>
        </el-form-item>

        <el-form-item label="运行状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="浸水报警" value="water" />
            <el-option label="故障" value="fault" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="deviceList" border>
        <el-table-column prop="deviceCode" label="设备编号" width="140" />
        <el-table-column prop="location" label="安装位置" />
        <el-table-column prop="waterLevel" label="水位检测" width="140">
          <template #default="{ row }">
            <div style="display: flex; align-items: center">
              <el-icon 
                :color="row.waterDetected ? '#f56c6c' : '#67c23a'" 
                :size="20"
                style="margin-right: 8px"
              >
                <component :is="row.waterDetected ? 'WarningFilled' : 'SuccessFilled'" />
              </el-icon>
              <span :style="{ color: row.waterDetected ? '#f56c6c' : '#67c23a', fontWeight: 'bold' }">
                {{ row.waterDetected ? '检测到积水' : '无积水' }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sensitivity" label="灵敏度" width="100">
          <template #default="{ row }">
            {{ row.sensitivity }}级
          </template>
        </el-table-column>
        <el-table-column prop="batteryLevel" label="电池电量" width="140">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.batteryLevel" 
              :color="getBatteryColor(row.batteryLevel)"
              :show-text="true"
              :format="() => row.batteryLevel + '%'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="运行状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastAlarmTime" label="最近报警" width="160" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="viewHistory(row)">
              历史记录
            </el-button>
            <el-button link type="warning" size="small" @click="handleConfig(row)">
              配置
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        :total="page.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 添加/编辑设备对话框 -->
    <el-dialog v-model="deviceDialog" :title="dialogTitle" width="600px">
      <el-form :model="deviceForm" label-width="120px">
        <el-form-item label="设备编号">
          <el-input v-model="deviceForm.deviceCode" placeholder="请输入设备编号" />
        </el-form-item>

        <el-form-item label="安装位置">
          <el-input v-model="deviceForm.location" placeholder="请输入安装位置" />
        </el-form-item>

        <el-form-item label="检测灵敏度">
          <el-radio-group v-model="deviceForm.sensitivity">
            <el-radio :value="1">低灵敏度</el-radio>
            <el-radio :value="2">中灵敏度</el-radio>
            <el-radio :value="3">高灵敏度</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="检测间隔">
          <el-input-number v-model="deviceForm.interval" :min="1" :max="60" />
          <span style="margin-left: 10px">秒</span>
        </el-form-item>

        <el-form-item label="启用报警">
          <el-switch v-model="deviceForm.alarmEnabled" />
        </el-form-item>

        <el-form-item label="报警方式" v-if="deviceForm.alarmEnabled">
          <el-checkbox-group v-model="deviceForm.alarmMethods">
            <el-checkbox value="sound">声音报警</el-checkbox>
            <el-checkbox value="light">灯光报警</el-checkbox>
            <el-checkbox value="sms">短信通知</el-checkbox>
            <el-checkbox value="system">系统通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="报警联系人" v-if="deviceForm.alarmEnabled">
          <el-input v-model="deviceForm.alarmContact" placeholder="请输入联系人手机号，多个用逗号分隔" />
        </el-form-item>

        <el-form-item label="自动关闭阀门">
          <el-switch v-model="deviceForm.autoCloseValve" />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">
            检测到浸水时自动关闭水阀
          </span>
        </el-form-item>

        <el-form-item label="备注">
          <el-input 
            v-model="deviceForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="deviceDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDevice">确定</el-button>
      </template>
    </el-dialog>

    <!-- 历史记录对话框 -->
    <el-dialog v-model="historyDialog" title="浸水报警历史记录" width="1000px">
      <el-form :inline="true">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="historySearchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadHistory">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="historyData" border>
        <el-table-column prop="alarmTime" label="报警时间" width="180" />
        <el-table-column prop="alarmType" label="报警类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.alarmType === '浸水报警' ? 'danger' : 'warning'">
              {{ row.alarmType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handleStatus" label="处理状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.handleStatus === '已处理' ? 'success' : 'warning'">
              {{ row.handleStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" />
        <el-table-column prop="handleTime" label="处理时间" width="180" />
        <el-table-column prop="handleMethod" label="处理方式" />
        <el-table-column prop="remark" label="备注" />
      </el-table>

      <el-pagination
        v-model:current-page="historyPage.current"
        v-model:page-size="historyPage.size"
        :total="historyPage.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleHistorySizeChange"
        @current-change="handleHistoryCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled, SuccessFilled } from '@element-plus/icons-vue'

const searchForm = reactive({
  deviceCode: '',
  location: '',
  status: ''
})

const deviceList = ref([
  {
    id: 1,
    deviceCode: 'WD-001',
    location: 'A栋实验室-301-地面',
    waterDetected: false,
    sensitivity: 2,
    batteryLevel: 85,
    status: 'normal',
    lastAlarmTime: '无',
    updateTime: '2024-12-25 10:30:00'
  },
  {
    id: 2,
    deviceCode: 'WD-002',
    location: 'B栋实验室-205-水池旁',
    waterDetected: true,
    sensitivity: 3,
    batteryLevel: 75,
    status: 'water',
    lastAlarmTime: '2024-12-25 10:25:30',
    updateTime: '2024-12-25 10:29:55'
  },
  {
    id: 3,
    deviceCode: 'WD-003',
    location: 'C栋实验室-101-管道下方',
    waterDetected: false,
    sensitivity: 2,
    batteryLevel: 90,
    status: 'normal',
    lastAlarmTime: '2024-12-20 15:20:00',
    updateTime: '2024-12-25 10:30:02'
  }
])

const waterAlarmCount = computed(() => {
  return deviceList.value.filter(d => d.status === 'water').length
})

const page = reactive({
  current: 1,
  size: 10,
  total: 3
})

const deviceDialog = ref(false)
const dialogTitle = ref('添加设备')
const deviceForm = reactive({
  deviceCode: '',
  location: '',
  sensitivity: 2,
  interval: 5,
  alarmEnabled: true,
  alarmMethods: ['sound', 'light', 'sms', 'system'],
  alarmContact: '',
  autoCloseValve: false,
  remark: ''
})

const historyDialog = ref(false)
const historySearchForm = reactive({
  dateRange: []
})
const historyData = ref([
  {
    alarmTime: '2024-12-25 10:25:30',
    alarmType: '浸水报警',
    handleStatus: '处理中',
    handler: '-',
    handleTime: '-',
    handleMethod: '-',
    remark: '积水较多，正在排水'
  },
  {
    alarmTime: '2024-12-20 15:20:00',
    alarmType: '浸水报警',
    handleStatus: '已处理',
    handler: '张三',
    handleTime: '2024-12-20 15:35:00',
    handleMethod: '清理积水，修复漏水管道',
    remark: '管道老化导致漏水'
  }
])

const historyPage = reactive({
  current: 1,
  size: 10,
  total: 2
})

const handleAddDevice = () => {
  dialogTitle.value = '添加设备'
  Object.assign(deviceForm, {
    deviceCode: '',
    location: '',
    sensitivity: 2,
    interval: 5,
    alarmEnabled: true,
    alarmMethods: ['sound', 'light', 'sms', 'system'],
    alarmContact: '',
    autoCloseValve: false,
    remark: ''
  })
  deviceDialog.value = true
}

const handleConfig = (row: any) => {
  dialogTitle.value = '配置设备'
  Object.assign(deviceForm, row)
  deviceDialog.value = true
}

const confirmDevice = () => {
  ElMessage.success('保存成功')
  deviceDialog.value = false
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该设备吗？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

const viewHistory = (row: any) => {
  historyDialog.value = true
}

const loadHistory = () => {
  ElMessage.success('数据已加载')
}

const handleExport = () => {
  ElMessage.success('数据导出成功')
}

const handleSearch = () => {
  console.log('搜索', searchForm)
}

const handleReset = () => {
  Object.assign(searchForm, {
    deviceCode: '',
    location: '',
    status: ''
  })
}

const getBatteryColor = (level: number) => {
  if (level > 50) return '#67c23a'
  if (level > 20) return '#e6a23c'
  return '#f56c6c'
}

const getStatusType = (status: string) => {
  const map: any = {
    normal: 'success',
    water: 'danger',
    fault: 'warning',
    offline: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    normal: '正常',
    water: '浸水报警',
    fault: '故障',
    offline: '离线'
  }
  return map[status] || status
}

const handleSizeChange = (size: number) => {
  page.size = size
}

const handleCurrentChange = (current: number) => {
  page.current = current
}

const handleHistorySizeChange = (size: number) => {
  historyPage.size = size
}

const handleHistoryCurrentChange = (current: number) => {
  historyPage.current = current
}
</script>

<style scoped>
.water-detector {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
