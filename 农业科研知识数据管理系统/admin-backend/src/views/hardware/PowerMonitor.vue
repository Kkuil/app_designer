<template>
  <div class="power-monitor">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>电气功率监测器</span>
          <div>
            <el-button type="primary" @click="handleAddDevice">添加设备</el-button>
            <el-button @click="handleExport">导出数据</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="总设备数" :value="statistics.totalDevices">
              <template #suffix>台</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="实时功率" :value="statistics.totalPower" :precision="2">
              <template #suffix>kW</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="今日用电量" :value="statistics.todayUsage" :precision="2">
              <template #suffix>kWh</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="本月用电量" :value="statistics.monthUsage" :precision="2">
              <template #suffix>kWh</template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="设备编号">
          <el-input v-model="searchForm.deviceCode" placeholder="请输入设备编号" clearable />
        </el-form-item>

        <el-form-item label="监测位置">
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
            <el-option label="超载" value="overload" />
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
        <el-table-column prop="location" label="监测位置" />
        <el-table-column prop="voltage" label="电压(V)" width="100">
          <template #default="{ row }">
            <span :style="{ color: getVoltageColor(row.voltage) }">
              {{ row.voltage }}V
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="current" label="电流(A)" width="100">
          <template #default="{ row }">
            {{ row.current }}A
          </template>
        </el-table-column>
        <el-table-column prop="power" label="功率(kW)" width="120">
          <template #default="{ row }">
            <span style="font-weight: bold; color: #409eff">
              {{ row.power }}kW
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="powerFactor" label="功率因数" width="120">
          <template #default="{ row }">
            {{ row.powerFactor }}
          </template>
        </el-table-column>
        <el-table-column prop="todayUsage" label="今日用电(kWh)" width="140">
          <template #default="{ row }">
            {{ row.todayUsage }}kWh
          </template>
        </el-table-column>
        <el-table-column prop="maxPower" label="功率上限(kW)" width="140" />
        <el-table-column prop="status" label="运行状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewHistory(row)">
              历史数据
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

        <el-form-item label="监测位置">
          <el-input v-model="deviceForm.location" placeholder="请输入监测位置" />
        </el-form-item>

        <el-form-item label="功率上限">
          <el-input-number v-model="deviceForm.maxPower" :min="0" :max="1000" :step="0.1" />
          <span style="margin-left: 10px">kW</span>
        </el-form-item>

        <el-form-item label="电压上限">
          <el-input-number v-model="deviceForm.maxVoltage" :min="0" :max="500" />
          <span style="margin-left: 10px">V</span>
        </el-form-item>

        <el-form-item label="电压下限">
          <el-input-number v-model="deviceForm.minVoltage" :min="0" :max="500" />
          <span style="margin-left: 10px">V</span>
        </el-form-item>

        <el-form-item label="采集间隔">
          <el-input-number v-model="deviceForm.interval" :min="1" :max="3600" />
          <span style="margin-left: 10px">秒</span>
        </el-form-item>

        <el-form-item label="启用报警">
          <el-switch v-model="deviceForm.alarmEnabled" />
        </el-form-item>

        <el-form-item label="报警联系人" v-if="deviceForm.alarmEnabled">
          <el-input v-model="deviceForm.alarmContact" placeholder="请输入联系人" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="deviceDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmDevice">确定</el-button>
      </template>
    </el-dialog>

    <!-- 历史数据对话框 -->
    <el-dialog v-model="historyDialog" title="历史数据" width="1200px">
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

      <div id="powerChart" style="width: 100%; height: 400px; margin-bottom: 20px"></div>

      <el-table :data="historyData" border>
        <el-table-column prop="recordTime" label="记录时间" width="180" />
        <el-table-column prop="voltage" label="电压(V)" />
        <el-table-column prop="current" label="电流(A)" />
        <el-table-column prop="power" label="功率(kW)" />
        <el-table-column prop="powerFactor" label="功率因数" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const statistics = ref({
  totalDevices: 12,
  totalPower: 45.8,
  todayUsage: 328.5,
  monthUsage: 9856.3
})

const searchForm = reactive({
  deviceCode: '',
  location: '',
  status: ''
})

const deviceList = ref([
  {
    id: 1,
    deviceCode: 'PM-001',
    location: 'A栋实验室-301',
    voltage: 220,
    current: 15.2,
    power: 3.34,
    powerFactor: 0.98,
    todayUsage: 25.6,
    maxPower: 5.0,
    status: 'normal',
    updateTime: '2024-12-25 10:30:00'
  },
  {
    id: 2,
    deviceCode: 'PM-002',
    location: 'B栋实验室-205',
    voltage: 218,
    current: 28.5,
    power: 6.21,
    powerFactor: 0.97,
    todayUsage: 48.2,
    maxPower: 5.0,
    status: 'overload',
    updateTime: '2024-12-25 10:29:55'
  },
  {
    id: 3,
    deviceCode: 'PM-003',
    location: 'C栋实验室-101',
    voltage: 222,
    current: 10.8,
    power: 2.40,
    powerFactor: 0.99,
    todayUsage: 18.5,
    maxPower: 5.0,
    status: 'normal',
    updateTime: '2024-12-25 10:30:02'
  }
])

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
  maxPower: 5.0,
  maxVoltage: 240,
  minVoltage: 200,
  interval: 10,
  alarmEnabled: true,
  alarmContact: ''
})

const historyDialog = ref(false)
const historySearchForm = reactive({
  dateRange: []
})
const historyData = ref([
  {
    recordTime: '2024-12-25 10:00:00',
    voltage: 220,
    current: 15.0,
    power: 3.30,
    powerFactor: 0.98,
    status: '正常'
  },
  {
    recordTime: '2024-12-25 10:01:00',
    voltage: 220,
    current: 15.1,
    power: 3.32,
    powerFactor: 0.98,
    status: '正常'
  },
  {
    recordTime: '2024-12-25 10:02:00',
    voltage: 220,
    current: 15.2,
    power: 3.34,
    powerFactor: 0.98,
    status: '正常'
  }
])

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

const getVoltageColor = (voltage: number) => {
  if (voltage < 200 || voltage > 240) return '#f56c6c'
  return '#67c23a'
}

const getStatusType = (status: string) => {
  const map: any = {
    normal: 'success',
    overload: 'danger',
    offline: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    normal: '正常',
    overload: '超载',
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
</script>

<style scoped>
.power-monitor {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
