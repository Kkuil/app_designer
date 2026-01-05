<template>
  <div class="smart-gateway">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>智能网关</span>
          <div>
            <el-button type="primary" @click="handleAddGateway">添加网关</el-button>
            <el-button @click="handleRefresh">刷新</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="网关总数" :value="statistics.totalGateways">
              <template #suffix>台</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="在线网关" :value="statistics.onlineGateways">
              <template #suffix>台</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="接入设备" :value="statistics.connectedDevices">
              <template #suffix>个</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="今日数据量" :value="statistics.todayData">
              <template #suffix>条</template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="网关编号">
          <el-input v-model="searchForm.gatewayCode" placeholder="请输入网关编号" clearable />
        </el-form-item>

        <el-form-item label="位置">
          <el-select v-model="searchForm.location" placeholder="请选择位置" clearable>
            <el-option label="全部" value="" />
            <el-option label="A栋" value="A" />
            <el-option label="B栋" value="B" />
            <el-option label="C栋" value="C" />
          </el-select>
        </el-form-item>

        <el-form-item label="运行状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="故障" value="fault" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="gatewayList" border>
        <el-table-column prop="gatewayCode" label="网关编号" width="140" />
        <el-table-column prop="gatewayName" label="网关名称" />
        <el-table-column prop="location" label="安装位置" />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="macAddress" label="MAC地址" width="160" />
        <el-table-column prop="connectedDevices" label="接入设备数" width="120">
          <template #default="{ row }">
            <el-badge :value="row.connectedDevices" type="primary">
              <el-button size="small" @click="viewDevices(row)">查看设备</el-button>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="signalStrength" label="信号强度" width="120">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.signalStrength" 
              :color="getSignalColor(row.signalStrength)"
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
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button 
              link 
              :type="row.status === 'online' ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'online' ? '停用' : '启用' }}
            </el-button>
            <el-button link type="primary" size="small" @click="handleRestart(row)">
              重启
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

    <!-- 添加/编辑网关对话框 -->
    <el-dialog v-model="gatewayDialog" :title="dialogTitle" width="700px">
      <el-form :model="gatewayForm" label-width="140px">
        <el-form-item label="网关编号">
          <el-input v-model="gatewayForm.gatewayCode" placeholder="请输入网关编号" />
        </el-form-item>

        <el-form-item label="网关名称">
          <el-input v-model="gatewayForm.gatewayName" placeholder="请输入网关名称" />
        </el-form-item>

        <el-form-item label="安装位置">
          <el-input v-model="gatewayForm.location" placeholder="请输入安装位置" />
        </el-form-item>

        <el-form-item label="IP地址">
          <el-input v-model="gatewayForm.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>

        <el-form-item label="MAC地址">
          <el-input v-model="gatewayForm.macAddress" placeholder="请输入MAC地址" />
        </el-form-item>

        <el-form-item label="通信协议">
          <el-select v-model="gatewayForm.protocol" placeholder="请选择通信协议" style="width: 100%">
            <el-option label="MQTT" value="mqtt" />
            <el-option label="HTTP" value="http" />
            <el-option label="CoAP" value="coap" />
            <el-option label="Modbus" value="modbus" />
          </el-select>
        </el-form-item>

        <el-form-item label="通信端口">
          <el-input-number v-model="gatewayForm.port" :min="1" :max="65535" style="width: 100%" />
        </el-form-item>

        <el-form-item label="数据上报间隔">
          <el-input-number v-model="gatewayForm.reportInterval" :min="1" :max="3600" />
          <span style="margin-left: 10px">秒</span>
        </el-form-item>

        <el-form-item label="启用加密">
          <el-switch v-model="gatewayForm.encryptionEnabled" />
        </el-form-item>

        <el-form-item label="认证密钥" v-if="gatewayForm.encryptionEnabled">
          <el-input 
            v-model="gatewayForm.authKey" 
            type="password" 
            show-password
            placeholder="请输入认证密钥" 
          />
        </el-form-item>

        <el-form-item label="自动重连">
          <el-switch v-model="gatewayForm.autoReconnect" />
        </el-form-item>

        <el-form-item label="最大重连次数" v-if="gatewayForm.autoReconnect">
          <el-input-number v-model="gatewayForm.maxReconnectTimes" :min="1" :max="10" />
        </el-form-item>

        <el-form-item label="启用日志">
          <el-switch v-model="gatewayForm.logEnabled" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input 
            v-model="gatewayForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="gatewayDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmGateway">确定</el-button>
      </template>
    </el-dialog>

    <!-- 接入设备列表对话框 -->
    <el-dialog v-model="devicesDialog" title="接入设备列表" width="1000px">
      <el-table :data="connectedDevicesList" border>
        <el-table-column prop="deviceCode" label="设备编号" width="140" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="deviceType" label="设备类型" width="140">
          <template #default="{ row }">
            <el-tag>{{ row.deviceType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastDataTime" label="最后数据时间" width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const statistics = ref({
  totalGateways: 8,
  onlineGateways: 7,
  connectedDevices: 45,
  todayData: 12580
})

const searchForm = reactive({
  gatewayCode: '',
  location: '',
  status: ''
})

const gatewayList = ref([
  {
    id: 1,
    gatewayCode: 'GW-001',
    gatewayName: 'A栋主网关',
    location: 'A栋1楼设备间',
    ipAddress: '192.168.1.101',
    macAddress: '00:1A:2B:3C:4D:01',
    connectedDevices: 12,
    signalStrength: 95,
    status: 'online',
    updateTime: '2024-12-25 10:30:00'
  },
  {
    id: 2,
    gatewayCode: 'GW-002',
    gatewayName: 'B栋主网关',
    location: 'B栋1楼设备间',
    ipAddress: '192.168.1.102',
    macAddress: '00:1A:2B:3C:4D:02',
    connectedDevices: 15,
    signalStrength: 88,
    status: 'online',
    updateTime: '2024-12-25 10:29:55'
  },
  {
    id: 3,
    gatewayCode: 'GW-003',
    gatewayName: 'C栋主网关',
    location: 'C栋1楼设备间',
    ipAddress: '192.168.1.103',
    macAddress: '00:1A:2B:3C:4D:03',
    connectedDevices: 0,
    signalStrength: 0,
    status: 'offline',
    updateTime: '2024-12-24 18:30:00'
  }
])

const page = reactive({
  current: 1,
  size: 10,
  total: 3
})

const gatewayDialog = ref(false)
const dialogTitle = ref('添加网关')
const gatewayForm = reactive({
  gatewayCode: '',
  gatewayName: '',
  location: '',
  ipAddress: '',
  macAddress: '',
  protocol: 'mqtt',
  port: 1883,
  reportInterval: 60,
  encryptionEnabled: true,
  authKey: '',
  autoReconnect: true,
  maxReconnectTimes: 3,
  logEnabled: true,
  remark: ''
})

const devicesDialog = ref(false)
const connectedDevicesList = ref([
  {
    deviceCode: 'TH-001',
    deviceName: '温湿度传感器1',
    deviceType: '温湿度采集器',
    location: 'A栋实验室-301',
    status: '在线',
    lastDataTime: '2024-12-25 10:30:00'
  },
  {
    deviceCode: 'PM-001',
    deviceName: '功率监测器1',
    deviceType: '电气功率监测器',
    location: 'A栋实验室-301',
    status: '在线',
    lastDataTime: '2024-12-25 10:30:00'
  }
])

const handleAddGateway = () => {
  dialogTitle.value = '添加网关'
  Object.assign(gatewayForm, {
    gatewayCode: '',
    gatewayName: '',
    location: '',
    ipAddress: '',
    macAddress: '',
    protocol: 'mqtt',
    port: 1883,
    reportInterval: 60,
    encryptionEnabled: true,
    authKey: '',
    autoReconnect: true,
    maxReconnectTimes: 3,
    logEnabled: true,
    remark: ''
  })
  gatewayDialog.value = true
}

const handleConfig = (row: any) => {
  dialogTitle.value = '配置网关'
  Object.assign(gatewayForm, row)
  gatewayDialog.value = true
}

const confirmGateway = () => {
  ElMessage.success('保存成功')
  gatewayDialog.value = false
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该网关吗？删除后关联的设备将无法连接。', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleToggleStatus = (row: any) => {
  const action = row.status === 'online' ? '停用' : '启用'
  ElMessageBox.confirm(`确认${action}该网关吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  })
}

const handleRestart = (row: any) => {
  ElMessageBox.confirm('确认重启该网关吗？重启期间设备将暂时无法上报数据。', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('重启命令已发送')
  })
}

const viewDevices = (row: any) => {
  devicesDialog.value = true
}

const handleRefresh = () => {
  ElMessage.success('数据已刷新')
}

const handleSearch = () => {
  console.log('搜索', searchForm)
}

const handleReset = () => {
  Object.assign(searchForm, {
    gatewayCode: '',
    location: '',
    status: ''
  })
}

const getSignalColor = (strength: number) => {
  if (strength > 80) return '#67c23a'
  if (strength > 50) return '#e6a23c'
  return '#f56c6c'
}

const getStatusType = (status: string) => {
  const map: any = {
    online: 'success',
    offline: 'info',
    fault: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: any = {
    online: '在线',
    offline: '离线',
    fault: '故障'
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
.smart-gateway {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
