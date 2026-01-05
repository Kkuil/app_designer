<template>
  <div class="temperature-humidity">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>温湿度采集记录器</span>
          <div>
            <el-button type="primary" @click="handleAddDevice">添加设备</el-button>
            <el-button @click="handleExport">导出数据</el-button>
          </div>
        </div>
      </template>

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
        <el-table-column prop="temperature" label="当前温度(℃)" width="140">
          <template #default="{ row }">
            <span :style="{ color: getTemperatureColor(row.temperature) }">
              {{ row.temperature }}°C
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="humidity" label="当前湿度(%)" width="140">
          <template #default="{ row }">
            <span :style="{ color: getHumidityColor(row.humidity) }">
              {{ row.humidity }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="tempRange" label="温度阈值" width="140" />
        <el-table-column prop="humidityRange" label="湿度阈值" width="140" />
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

        <el-form-item label="安装位置">
          <el-input v-model="deviceForm.location" placeholder="请输入安装位置" />
        </el-form-item>

        <el-form-item label="温度下限">
          <el-input-number v-model="deviceForm.tempMin" :min="-50" :max="100" />
          <span style="margin-left: 10px">℃</span>
        </el-form-item>

        <el-form-item label="温度上限">
          <el-input-number v-model="deviceForm.tempMax" :min="-50" :max="100" />
          <span style="margin-left: 10px">℃</span>
        </el-form-item>

        <el-form-item label="湿度下限">
          <el-input-number v-model="deviceForm.humidityMin" :min="0" :max="100" />
          <span style="margin-left: 10px">%</span>
        </el-form-item>

        <el-form-item label="湿度上限">
          <el-input-number v-model="deviceForm.humidityMax" :min="0" :max="100" />
          <span style="margin-left: 10px">%</span>
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
    <el-dialog v-model="historyDialog" title="历史数据" width="1000px">
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

      <div id="tempChart" style="width: 100%; height: 300px; margin-bottom: 20px"></div>
      <div id="humidityChart" style="width: 100%; height: 300px"></div>

      <el-table :data="historyData" border style="margin-top: 20px">
        <el-table-column prop="recordTime" label="记录时间" width="180" />
        <el-table-column prop="temperature" label="温度(℃)" />
        <el-table-column prop="humidity" label="湿度(%)" />
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

const searchForm = reactive({
  deviceCode: '',
  location: '',
  status: ''
})

const deviceList = ref([
  {
    id: 1,
    deviceCode: 'TH-001',
    location: 'A栋实验室-301',
    temperature: 22.5,
    humidity: 55,
    tempRange: '18-25',
    humidityRange: '40-70',
    status: 'normal',
    updateTime: '2024-12-25 10:30:00'
  },
  {
    id: 2,
    deviceCode: 'TH-002',
    location: 'B栋实验室-205',
    temperature: 28.5,
    humidity: 75,
    tempRange: '18-25',
    humidityRange: '40-70',
    status: 'alarm',
    updateTime: '2024-12-25 10:29:55'
  },
  {
    id: 3,
    deviceCode: 'TH-003',
    location: 'C栋实验室-101',
    temperature: 20.0,
    humidity: 50,
    tempRange: '18-25',
    humidityRange: '40-70',
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
  tempMin: 18,
  tempMax: 25,
  humidityMin: 40,
  humidityMax: 70,
  interval: 60,
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
    temperature: 22.3,
    humidity: 54,
    status: '正常'
  },
  {
    recordTime: '2024-12-25 10:01:00',
    temperature: 22.4,
    humidity: 55,
    status: '正常'
  },
  {
    recordTime: '2024-12-25 10:02:00',
    temperature: 22.5,
    humidity: 55,
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
  // 这里可以加载echarts图表
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

const getTemperatureColor = (temp: number) => {
  if (temp < 18 || temp > 25) return '#f56c6c'
  return '#67c23a'
}

const getHumidityColor = (humidity: number) => {
  if (humidity < 40 || humidity > 70) return '#f56c6c'
  return '#67c23a'
}

const getStatusType = (status: string) => {
  const map: any = {
    normal: 'success',
    alarm: 'danger',
    offline: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    normal: '正常',
    alarm: '报警',
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
.temperature-humidity {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
