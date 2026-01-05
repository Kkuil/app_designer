<template>
  <div class="pi-workbench-page">
    <!-- 角色切换 -->
    <el-card class="role-switch-card">
      <div class="role-header">
        <div class="user-info">
          <el-avatar :size="60" icon="UserFilled" />
          <div class="user-detail">
            <h2>{{ userInfo.name }}</h2>
            <p>当前身份：<el-tag :type="currentRole === 'pi' ? 'success' : 'primary'">{{ currentRole === 'pi' ? '课题组PI' : '普通用户' }}</el-tag></p>
            <p>所属单位：{{ userInfo.department }}</p>
          </div>
        </div>
        <div class="role-actions">
          <el-button :type="currentRole === 'pi' ? 'default' : 'primary'" @click="switchRole('user')" :disabled="currentRole === 'user'">
            <el-icon><User /></el-icon> 切换为使用者
          </el-button>
          <el-button :type="currentRole === 'pi' ? 'primary' : 'default'" @click="switchRole('pi')" :disabled="currentRole === 'pi'">
            <el-icon><Avatar /></el-icon> 切换为PI身份
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- PI数据概览 -->
    <div class="stats-section" v-if="currentRole === 'pi'">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="4" v-for="stat in piStats" :key="stat.title">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <el-icon :size="28"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-title">{{ stat.title }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 课题组选择 -->
    <el-card class="group-card" v-if="currentRole === 'pi'">
      <template #header>
        <div class="card-header">
          <span>我负责的课题组</span>
          <el-select v-model="selectedGroup" placeholder="选择课题组" @change="handleGroupChange" style="width: 200px">
            <el-option v-for="group in researchGroups" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="16">
          <el-descriptions :column="3" border title="课题组基本信息">
            <el-descriptions-item label="课题组名称">{{ currentGroup.name }}</el-descriptions-item>
            <el-descriptions-item label="成立日期">{{ currentGroup.createDate }}</el-descriptions-item>
            <el-descriptions-item label="研究方向">{{ currentGroup.direction }}</el-descriptions-item>
            <el-descriptions-item label="成员总数">{{ currentGroup.memberCount }} 人</el-descriptions-item>
            <el-descriptions-item label="在研项目">{{ currentGroup.projectCount }} 个</el-descriptions-item>
            <el-descriptions-item label="仪器使用总时长">{{ currentGroup.totalHours }} 小时</el-descriptions-item>
            <el-descriptions-item label="经费预算总额">¥{{ currentGroup.totalBudget?.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="经费已使用">¥{{ currentGroup.usedBudget?.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="经费剩余">
              <span :class="currentGroup.remainBudget < 50000 ? 'text-danger' : 'text-success'">
                ¥{{ currentGroup.remainBudget?.toLocaleString() }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="8">
          <div class="budget-chart">
            <h4>经费使用情况</h4>
            <el-progress type="dashboard" :percentage="budgetPercentage" :color="budgetColor">
              <template #default>
                <span class="percentage-value">{{ budgetPercentage }}%</span>
                <span class="percentage-label">已使用</span>
              </template>
            </el-progress>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 课题组成员列表 -->
    <el-card class="member-card" v-if="currentRole === 'pi'">
      <template #header>
        <div class="card-header">
          <span>课题组成员</span>
          <el-button type="primary" size="small" @click="handleAddMember">
            <el-icon><Plus /></el-icon> 添加成员
          </el-button>
        </div>
      </template>
      <el-table :data="memberList" stripe border>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column prop="usageHours" label="仪器使用(小时)" width="130" />
        <el-table-column prop="projectCount" label="参与项目数" width="110" />
        <el-table-column prop="joinDate" label="加入日期" width="110" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewMember(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleEditMember(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleRemoveMember(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 仪器使用统计 -->
    <el-card class="usage-card" v-if="currentRole === 'pi'">
      <template #header>
        <div class="card-header">
          <span>仪器使用统计</span>
          <el-radio-group v-model="usagePeriod" size="small">
            <el-radio-button value="week">本周</el-radio-button>
            <el-radio-button value="month">本月</el-radio-button>
            <el-radio-button value="year">本年</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-table :data="usageStats" stripe border>
        <el-table-column prop="instrumentName" label="仪器名称" min-width="150" />
        <el-table-column prop="hours" label="使用时长(小时)" width="130" />
        <el-table-column prop="times" label="使用次数" width="100" />
        <el-table-column prop="cost" label="费用(元)" width="100">
          <template #default="{ row }">¥{{ row.cost.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.percentage" :stroke-width="10" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 普通用户视图 -->
    <el-card v-if="currentRole === 'user'" class="user-view-card">
      <template #header><span>我的工作台</span></template>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic title="我的预约" :value="12" suffix="次" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="仪器使用时长" :value="86" suffix="小时" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="待处理事项" :value="3" suffix="项" />
        </el-col>
      </el-row>
      <el-divider />
      <h4>快捷操作</h4>
      <el-space wrap>
        <el-button type="primary" @click="handleQuickReserve">仪器预约</el-button>
        <el-button type="success" @click="handleMyReservations">我的预约</el-button>
        <el-button type="warning" @click="handleReagentApply">试剂申领</el-button>
        <el-button type="info" @click="handleProjectProgress">项目进度</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentRole = ref<'pi' | 'user'>('pi')

const userInfo = ref({
  name: '张教授',
  department: '农业科学研究院',
  title: '教授',
  avatar: ''
})

const piStats = ref([
  { title: '仪器使用总时长', value: '1,256h', icon: 'Timer', color: '#409eff' },
  { title: '课题组成员总数', value: '28人', icon: 'User', color: '#67c23a' },
  { title: '负责课题组总数', value: '3个', icon: 'OfficeBuilding', color: '#e6a23c' },
  { title: '经费使用总计', value: '¥156万', icon: 'Money', color: '#f56c6c' },
  { title: '经费剩余总数', value: '¥89万', icon: 'Wallet', color: '#909399' },
  { title: '在研项目数', value: '12个', icon: 'Folder', color: '#00d1b2' }
])

const selectedGroup = ref(1)
const researchGroups = ref([
  { id: 1, name: '智慧农业研究组' },
  { id: 2, name: '作物遗传育种组' },
  { id: 3, name: '植物保护研究组' }
])

const currentGroup = ref({
  name: '智慧农业研究组',
  createDate: '2020-03-15',
  direction: '农业物联网、智能监测、精准农业',
  memberCount: 12,
  projectCount: 5,
  totalHours: 580,
  totalBudget: 1200000,
  usedBudget: 680000,
  remainBudget: 520000
})

const budgetPercentage = computed(() => {
  return Math.round((currentGroup.value.usedBudget / currentGroup.value.totalBudget) * 100)
})

const budgetColor = computed(() => {
  if (budgetPercentage.value >= 90) return '#f56c6c'
  if (budgetPercentage.value >= 70) return '#e6a23c'
  return '#67c23a'
})

const usagePeriod = ref('month')

const memberList = ref([
  { id: 1, name: '张三', role: 'researcher', roleName: '研究员', title: '副研究员', email: 'zhangsan@example.com', phone: '13800138001', usageHours: 86, projectCount: 3, joinDate: '2021-03-15' },
  { id: 2, name: '李四', role: 'student', roleName: '博士生', title: '在读博士', email: 'lisi@example.com', phone: '13800138002', usageHours: 120, projectCount: 2, joinDate: '2022-09-01' },
  { id: 3, name: '王五', role: 'student', roleName: '硕士生', title: '在读硕士', email: 'wangwu@example.com', phone: '13800138003', usageHours: 65, projectCount: 1, joinDate: '2023-09-01' },
  { id: 4, name: '赵六', role: 'technician', roleName: '技术员', title: '工程师', email: 'zhaoliu@example.com', phone: '13800138004', usageHours: 200, projectCount: 4, joinDate: '2020-06-20' },
  { id: 5, name: '钱七', role: 'postdoc', roleName: '博士后', title: '博士后', email: 'qianqi@example.com', phone: '13800138005', usageHours: 95, projectCount: 2, joinDate: '2023-01-10' }
])

const usageStats = ref([
  { instrumentName: '高效液相色谱仪', hours: 156, times: 45, cost: 31200, percentage: 27 },
  { instrumentName: '气相色谱质谱联用仪', hours: 120, times: 32, cost: 36000, percentage: 21 },
  { instrumentName: '紫外可见分光光度计', hours: 98, times: 65, cost: 4900, percentage: 17 },
  { instrumentName: '原子吸收光谱仪', hours: 85, times: 28, cost: 21250, percentage: 15 },
  { instrumentName: '超速离心机', hours: 72, times: 24, cost: 10800, percentage: 12 },
  { instrumentName: '荧光显微镜', hours: 49, times: 18, cost: 4900, percentage: 8 }
])

const getRoleType = (role: string) => {
  const types: Record<string, string> = {
    researcher: 'success',
    student: 'primary',
    technician: 'warning',
    postdoc: 'info'
  }
  return types[role] || 'info'
}

const switchRole = (role: 'pi' | 'user') => {
  currentRole.value = role
  ElMessage.success(`已切换为${role === 'pi' ? '课题组PI' : '普通用户'}身份，无需重新登录`)
}

const handleGroupChange = (groupId: number) => {
  const group = researchGroups.value.find(g => g.id === groupId)
  if (group) {
    ElMessage.success(`已切换到${group.name}`)
    // 这里可以加载对应课题组的数据
  }
}

const handleAddMember = () => {
  ElMessage.info('打开添加成员对话框')
}

const handleViewMember = (row: any) => {
  ElMessage.info(`查看成员详情：${row.name}`)
}

const handleEditMember = (row: any) => {
  ElMessage.info(`编辑成员信息：${row.name}`)
}

const handleRemoveMember = (row: any) => {
  ElMessageBox.confirm(`确定要将"${row.name}"移出课题组吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('移除成功')
  }).catch(() => {})
}

const handleQuickReserve = () => ElMessage.info('跳转到仪器预约页面')
const handleMyReservations = () => ElMessage.info('跳转到我的预约')
const handleReagentApply = () => ElMessage.info('跳转到试剂申领')
const handleProjectProgress = () => ElMessage.info('跳转到项目进度')
</script>

<style scoped>
.pi-workbench-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.role-switch-card {
  margin-bottom: 0;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-detail h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.user-detail p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}

.role-actions {
  display: flex;
  gap: 12px;
}

.stats-section {
  margin-bottom: 0;
}

.stat-card {
  margin-bottom: 0;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.stat-title {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.budget-chart h4 {
  margin: 0 0 20px 0;
  color: #606266;
}

.percentage-value {
  font-size: 24px;
  font-weight: bold;
  display: block;
}

.percentage-label {
  font-size: 12px;
  color: #909399;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.user-view-card h4 {
  margin: 0 0 15px 0;
  color: #303133;
}
</style>
