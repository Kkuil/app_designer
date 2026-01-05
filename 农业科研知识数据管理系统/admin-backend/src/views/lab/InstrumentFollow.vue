<template>
  <div class="instrument-follow-page">
    <div class="follow-container">
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>未关注的仪器</span>
              </div>
            </template>
            <div class="instrument-list">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索仪器"
                clearable
                style="margin-bottom: 10px"
              />
              <div class="available-instruments">
                <el-tag
                  v-for="instrument in availableInstruments"
                  :key="instrument.id"
                  @click="handleAddFollow(instrument)"
                  style="margin: 5px; cursor: pointer"
                  effect="light"
                >
                  <el-icon style="margin-right: 5px"><Plus /></el-icon>
                  {{ instrument.name }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card header="我的关注仪器">
            <el-table :data="followedInstruments" stripe border size="small" max-height="500">
              <el-table-column prop="name" label="仪器名称" min-width="150" />
              <el-table-column prop="code" label="设备编号" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastUser" label="最后使用人" width="100" />
              <el-table-column prop="lastTime" label="最后使用时间" width="150" />
              <el-table-column prop="nextMaintenance" label="下次保养时间" width="150" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button type="info" link size="small" @click="handleViewDetail(row)">详情</el-button>
                  <el-button type="danger" link size="small" @click="handleRemoveFollow(row)">取消关注</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 设置关注提醒 -->
    <el-card header="关注提醒设置">
      <el-form :model="notificationSettings" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备故障提醒">
              <el-switch v-model="notificationSettings.equipmentError" />
            </el-form-item>
            <el-form-item label="保养周期提醒">
              <el-switch v-model="notificationSettings.maintenanceReminder" />
            </el-form-item>
            <el-form-item label="校准提醒">
              <el-switch v-model="notificationSettings.calibrationReminder" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障修复提醒">
              <el-switch v-model="notificationSettings.repairCompletion" />
            </el-form-item>
            <el-form-item label="预约状态变更">
              <el-switch v-model="notificationSettings.reservationStatus" />
            </el-form-item>
            <el-form-item label="使用统计提醒">
              <el-switch v-model="notificationSettings.usageStats" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="提醒方式">
          <el-checkbox-group v-model="notificationSettings.methods">
            <el-checkbox label="站内消息" value="message" />
            <el-checkbox label="邮件通知" value="email" />
            <el-checkbox label="短信通知" value="sms" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提醒记录 -->
    <el-card header="关注提醒记录" style="margin-top: 20px">
      <el-table :data="reminderRecords" stripe border max-height="400">
        <el-table-column prop="time" label="提醒时间" width="160" />
        <el-table-column prop="instrumentName" label="仪器名称" min-width="150" />
        <el-table-column prop="type" label="提醒类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getReminderTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="提醒内容" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'read' ? 'info' : 'warning'" size="small">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleMarkAsRead(row)" v-if="row.status === 'unread'">标记已读</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchKeyword = ref('')

const allInstruments = [
  { id: 1, name: '高效液相色谱仪', code: 'EQ20240001', status: '正常' },
  { id: 2, name: '气相色谱质谱联用仪', code: 'EQ20240002', status: '正常' },
  { id: 3, name: '紫外可见分光光度计', code: 'EQ20240003', status: '维修中' },
  { id: 4, name: '原子吸收光谱仪', code: 'EQ20240004', status: '正常' },
  { id: 5, name: '电子天平', code: 'EQ20240005', status: '正常' },
  { id: 6, name: '酸度计', code: 'EQ20240006', status: '正常' },
  { id: 7, name: '培养箱', code: 'EQ20240007', status: '正常' },
  { id: 8, name: '离心机', code: 'EQ20240008', status: '闲置' }
]

const followedInstruments = ref([
  { id: 1, name: '高效液相色谱仪', code: 'EQ20240001', status: '正常', lastUser: '李四', lastTime: '2024-12-22 14:30', nextMaintenance: '2025-01-15' },
  { id: 2, name: '气相色谱质谱联用仪', code: 'EQ20240002', status: '正常', lastUser: '王五', lastTime: '2024-12-22 10:15', nextMaintenance: '2025-02-01' },
  { id: 4, name: '原子吸收光谱仪', code: 'EQ20240004', status: '正常', lastUser: '赵六', lastTime: '2024-12-21 09:00', nextMaintenance: '2025-01-20' }
])

const availableInstruments = computed(() => {
  const followedIds = followedInstruments.value.map(i => i.id)
  return allInstruments
    .filter(i => !followedIds.includes(i.id))
    .filter(i => i.name.includes(searchKeyword.value))
})

const notificationSettings = reactive({
  equipmentError: true,
  maintenanceReminder: true,
  calibrationReminder: true,
  repairCompletion: true,
  reservationStatus: true,
  usageStats: false,
  methods: ['message', 'email']
})

const reminderRecords = ref([
  { id: 1, time: '2024-12-22 14:30:00', instrumentName: '高效液相色谱仪', type: 'maintenance', typeName: '保养提醒', content: '该仪器将在7天后进行定期保养，请提前做好安排', status: 'read', statusName: '已读' },
  { id: 2, time: '2024-12-21 10:00:00', instrumentName: '气相色谱质谱联用仪', type: 'repair', typeName: '维修完成', content: '该仪器的维修已完成，已恢复正常使用', status: 'read', statusName: '已读' },
  { id: 3, time: '2024-12-20 15:30:00', instrumentName: '紫外可见分光光度计', type: 'error', typeName: '故障提醒', content: '检测到该仪器异常，建议立即检查', status: 'unread', statusName: '未读' },
  { id: 4, time: '2024-12-19 09:00:00', instrumentName: '原子吸收光谱仪', type: 'calibration', typeName: '校准提醒', content: '该仪器将在15天后进行年度校准', status: 'read', statusName: '已读' }
])

const handleAddFollow = (instrument: any) => {
  const newInstrument = {
    ...instrument,
    lastUser: '未使用',
    lastTime: '-',
    nextMaintenance: '待定'
  }
  followedInstruments.value.push(newInstrument)
  ElMessage.success(`已关注：${instrument.name}`)
}

const handleRemoveFollow = (row: any) => {
  ElMessageBox.confirm(`确定取消关注"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => {
      const index = followedInstruments.value.findIndex(i => i.id === row.id)
      if (index !== -1) {
        followedInstruments.value.splice(index, 1)
        ElMessage.success('已取消关注')
      }
    })
    .catch(() => {})
}

const handleViewDetail = (row: any) => {
  ElMessage.success(`查看仪器详情：${row.name}`)
}

const getReminderTypeTag = (type: string) => {
  const map: Record<string, string> = {
    'error': 'danger',
    'maintenance': 'warning',
    'calibration': 'info',
    'repair': 'success'
  }
  return map[type] || 'info'
}

const handleMarkAsRead = (row: any) => {
  row.status = 'read'
  row.statusName = '已读'
  ElMessage.success('已标记为已读')
}

const handleSaveSettings = () => {
  ElMessage.success('提醒设置已保存')
}
</script>

<style scoped>
.instrument-follow-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instrument-list {
  padding: 10px;
}

.available-instruments {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
