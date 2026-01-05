<template>
  <div class="smoke-detector">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>烟感监测器</span>
          <div>
            <el-button type="primary" @click="handleAddDevice">添加设备</el-button>
            <el-button @click="handleBatchTest">批量测试</el-button>
          </div>
        </div>
      </template>

      <el-alert
        v-if="alarmCount > 0"
        :title="`当前有 ${alarmCount} 个烟感设备处于报警状态！`"
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
            <el-option label="报警" value="alarm" />
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
        <el-table-column prop="smokeLevel" label="烟雾浓度" width="140">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.smokeLevel" 
              :color="getSmokeColor(row.smokeLevel)"
              :show-text="true"
              :format="() => row.smokeLevel + '%'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="报警阈值" width="120">
          <template #default="{ row }">
            {{ row.threshold }}%
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
        <el-table-column prop="status" label="运行状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastTestTime" label="上次测试" width="160" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleTest(row)">
              测试
            </el-button>
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

        <el-form-item label="报警阈值">
          <el-slider v-model="deviceForm.threshold" :min="10" :max="100" show-input />
          <span style="color: #909399; font-size: 12px">烟雾浓度超过此值时触发报警</span>
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
          <el-input v-model="deviceForm.alarmContact" placeholder="请输入联系人手机号" />
        </el-form-item>

        <el-form-item label="定期测试">
          <el-switch v-model="deviceForm.autoTest" />
        </el-form-item>

        <el-form-item label="测试周期" v-if="deviceForm.autoTest">
          <el-input-number v-model="deviceForm.testCycle" :min="1" :max="365" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="deviceDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDevice">确定</el-button>
      </template>
    </el-dialog>

    <!-- 历史记录对话框 -->
    <el-dialog v-model="historyDialog" title="报警历史记录" width="1000px">
      <el-table :data="historyData" border>
        <el-table-column prop="recordTime" label="报警时间" width="180" />
        <el-table-column prop="alarmType" label="报警类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.alarmType === '烟雾报警' ? 'danger' : 'warning'">
              {{ row.alarmType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="smokeLevel" label="烟雾浓度" width="120">
          <template #default="{ row }">
            {{ row.smokeLevel }}%
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

const searchForm = reactive({
  deviceCode: '',
  location: '',
  status: ''
})

const deviceList = ref([
  {
    id: 1,
    deviceCode: 'SM-001',
    location: 'A栋实验室-301',
    smokeLevel: 5,
    threshold: 30,
    batteryLevel: 85,
    status: 'normal',
    lastTestTime: '2024-12-20 10:00:00',
    updateTime: '2024-12-25 10:30:00'
  },
  {
    id: 2,
    deviceCode: 'SM-002',
    location: 'B栋实验室-205',
    smokeLevel: 45,
    threshold: 30,
    batteryLevel: 60,
    status: 'alarm',
    lastTestTime: '2024-12-20 10:00:00',
    updateTime: '2024-12-25 10:29:55'
  },
  {
    id: 3,
    deviceCode: 'SM-003',
    location: 'C栋实验室-101',
    smokeLevel: 8,
    threshold: 30,
    batteryLevel: 20,
    status: 'normal',
    lastTestTime: '2024-12-20 10:00:00',
    updateTime: '2024-12-25 10:30:02'
  }
])

const alarmCount = computed(() => {
  return deviceList.value.filter(d => d.status === 'alarm').length
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
  threshold: 30,
  interval: 5,
  alarmEnabled: true,
  alarmMethods: ['sound', 'light', 'sms', 'system'],
  alarmContact: '',
  autoTest: true,
  testCycle: 30
})

const historyDialog = ref(false)
const historyData = ref([
  {
    recordTime: '2024-12-25 10:25:30',
    alarmType: '烟雾报警',
    smokeLevel: 45,
    handleStatus: '已处理',
    handler: '张三',
    handleTime: '2024-12-25 10:30:00',
    remark: '误报警，已排查确认无火情'
  },
  {
    recordTime: '2024-12-20 15:20:10',
    alarmType: '低电量报警',
    smokeLevel: 8,
    handleStatus: '已处理',
    handler: '李四',
    handleTime: '2024-12-21 09:00:00',
    remark: '已更换电池'
  }
])

const historyPage = reactive({
  current: 1,
  size: 10,
  total: 2
})

const handleAddDevice = () => {
  dialogTitle.value = '添加设备'
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

const handleTest = (row: any) => {
  ElMessageBox.confirm('确认对该设备进行测试吗？', '设备测试', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('测试命令已发送')
  })
}

const handleBatchTest = () => {
  ElMessageBox.confirm('确认对所有设备进行测试吗？', '批量测试', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量测试命令已发送')
  })
}

const viewHistory = (row: any) => {
  historyDialog.value = true
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

const getSmokeColor = (level: number) => {
  if (level < 20) return '#67c23a'
  if (level < 30) return '#e6a23c'
  return '#f56c6c'
}

const getBatteryColor = (level: number) => {
  if (level > 50) return '#67c23a'
  if (level > 20) return '#e6a23c'
  return '#f56c6c'
}

const getStatusType = (status: string) => {
  const map: any = {
    normal: 'success',
    alarm: 'danger',
    fault: 'warning',
    offline: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    normal: '正常',
    alarm: '报警',
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
.smoke-detector {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
