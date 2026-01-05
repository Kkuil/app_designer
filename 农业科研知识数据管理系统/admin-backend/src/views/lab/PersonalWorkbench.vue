<template>
  <div class="personal-workbench-page">
    <el-row :gutter="20">
      <!-- 个人信息卡 -->
      <el-col :span="6">
        <el-card header="个人信息" class="info-card">
          <div class="user-info">
            <div class="avatar"><img src="https://via.placeholder.com/80" alt="avatar" /></div>
            <div class="user-details">
              <div class="name">张三</div>
              <div class="dept">作物研究所</div>
              <div class="post">副研究员</div>
            </div>
          </div>
          <el-button type="primary" style="width: 100%; margin-top: 10px">编辑信息</el-button>
        </el-card>
      </el-col>

      <!-- 待办任务 -->
      <el-col :span="6">
        <el-card header="待办任务" class="task-card">
          <div class="task-list">
            <div class="task-item pending">
              <span class="task-title">设备校准</span>
              <span class="task-count">3</span>
            </div>
            <div class="task-item">
              <span class="task-title">审核申购</span>
              <span class="task-count">5</span>
            </div>
            <div class="task-item">
              <span class="task-title">维护确认</span>
              <span class="task-count">2</span>
            </div>
            <div class="task-item">
              <span class="task-title">预约确认</span>
              <span class="task-count">8</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 关注设备 -->
      <el-col :span="12">
        <el-card header="我的关注设备" class="follow-card">
          <el-table :data="followEquipmentList" stripe border size="small" max-height="300">
            <el-table-column prop="name" label="设备名称" min-width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastUser" label="最后使用人" width="100" />
            <el-table-column prop="lastTime" label="最后使用时间" width="150" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewEquipment(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近预约 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card header="我的最近预约">
          <el-table :data="recentReservations" stripe border size="small" max-height="300">
            <el-table-column prop="equipmentName" label="设备名称" min-width="120" />
            <el-table-column prop="reserveTime" label="预约时间" width="150" />
            <el-table-column prop="duration" label="时长(小时)" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getReservationStatusType(row.status)" size="small">{{ row.statusName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleCancelReservation(row)" v-if="row.status === 'pending'">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 试剂申购 -->
      <el-col :span="12">
        <el-card header="我的试剂申购">
          <el-table :data="reagentPurchases" stripe border size="small" max-height="300">
            <el-table-column prop="reagentName" label="试剂名称" min-width="120" />
            <el-table-column prop="quantity" label="申购数量" width="100" />
            <el-table-column prop="applyTime" label="申请时间" width="140" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleViewPurchase(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 工作统计 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card header="工作统计">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-title">本月设备使用</div>
                <div class="stat-value">28</div>
                <div class="stat-unit">次</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-title">待审批申购</div>
                <div class="stat-value">3</div>
                <div class="stat-unit">项</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-title">设备关注</div>
                <div class="stat-value">12</div>
                <div class="stat-unit">台</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-box">
                <div class="stat-title">工作小时</div>
                <div class="stat-value">156</div>
                <div class="stat-unit">小时</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const followEquipmentList = ref([
  { id: 1, name: '高效液相色谱仪', status: '正常', lastUser: '李四', lastTime: '2024-12-22 14:30' },
  { id: 2, name: '气相色谱质谱联用仪', status: '正常', lastUser: '王五', lastTime: '2024-12-22 10:15' },
  { id: 3, name: '紫外可见分光光度计', status: '维修中', lastUser: '张三', lastTime: '2024-12-21 16:00' },
  { id: 4, name: '原子吸收光谱仪', status: '正常', lastUser: '赵六', lastTime: '2024-12-21 09:00' }
])

const recentReservations = ref([
  { id: 1, equipmentName: '高效液相色谱仪', reserveTime: '2024-12-23 09:00~12:00', duration: 3, status: 'pending', statusName: '待确认' },
  { id: 2, equipmentName: '气相色谱质谱联用仪', reserveTime: '2024-12-23 14:00~16:00', duration: 2, status: 'approved', statusName: '已批准' },
  { id: 3, equipmentName: '紫外可见分光光度计', reserveTime: '2024-12-24 10:00~12:00', duration: 2, status: 'pending', statusName: '待确认' }
])

const reagentPurchases = ref([
  { id: 1, reagentName: '无水乙醇', quantity: 10, applyTime: '2024-12-20 10:30', status: 'pending', statusName: '待审批' },
  { id: 2, reagentName: '甲醇(色谱纯)', quantity: 2, applyTime: '2024-12-18 14:00', status: 'approved', statusName: '已通过' },
  { id: 3, reagentName: 'Tris缓冲液', quantity: 3, applyTime: '2024-12-15 09:15', status: 'ordered', statusName: '已采购' }
])

const getReservationStatusType = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'completed': 'info'
  }
  return map[status] || 'info'
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'ordered': 'info'
  }
  return map[status] || 'info'
}

const handleViewEquipment = (row: any) => {
  ElMessage.success(`查看设备：${row.name}`)
}

const handleCancelReservation = (row: any) => {
  ElMessage.success(`取消预约：${row.equipmentName}`)
}

const handleViewPurchase = (row: any) => {
  ElMessage.success(`查看申购：${row.reagentName}`)
}
</script>

<style scoped>
.personal-workbench-page {
  height: 100%;
  background-color: #f5f7fa;
  padding: 20px;
}

.user-info {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.avatar {
  flex-shrink: 0;
}

.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.dept {
  font-size: 14px;
  color: #606266;
  margin: 5px 0;
}

.post {
  font-size: 12px;
  color: #909399;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.task-item.pending {
  background-color: #fef0f0;
  color: #f56c6c;
}

.task-title {
  font-size: 14px;
}

.task-count {
  font-weight: bold;
  font-size: 16px;
}

.stat-box {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}

.stat-unit {
  font-size: 12px;
  color: #909399;
  margin-left: 5px;
}

.info-card,
.task-card,
.follow-card {
  height: 100%;
}
</style>
