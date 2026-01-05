<template>
  <div class="reservation-overview-page">
    <div class="stats-cards">
      <el-card class="stat-card"><div class="stat-content"><el-icon :size="40" color="#409EFF"><Calendar /></el-icon><div class="stat-info"><span class="stat-value">156</span><span class="stat-label">本月预约总数</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><el-icon :size="40" color="#67C23A"><Check /></el-icon><div class="stat-info"><span class="stat-value">128</span><span class="stat-label">已完成预约</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><el-icon :size="40" color="#E6A23C"><Clock /></el-icon><div class="stat-info"><span class="stat-value">18</span><span class="stat-label">进行中预约</span></div></div></el-card>
      <el-card class="stat-card"><div class="stat-content"><el-icon :size="40" color="#F56C6C"><Warning /></el-icon><div class="stat-info"><span class="stat-value">10</span><span class="stat-label">待审核预约</span></div></div></el-card>
    </div>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header><div class="card-header"><span>设备预约日历</span><el-radio-group v-model="viewMode" size="small"><el-radio-button value="week">周视图</el-radio-button><el-radio-button value="month">月视图</el-radio-button></el-radio-group></div></template>
          <div class="calendar-container">
            <el-calendar v-model="calendarDate"><template #date-cell="{ data }"><div class="calendar-cell" @click="handleDateClick(data)"><span class="date-num">{{ data.day.split('-')[2] }}</span><div v-if="getReservations(data.day).length > 0" class="reservation-dots"><el-badge v-for="r in getReservations(data.day).slice(0, 3)" :key="r.id" is-dot :type="r.status === 1 ? 'success' : 'warning'" /></div></div></template></el-calendar>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>今日预约</span></template>
          <el-timeline>
            <el-timeline-item v-for="item in todayReservations" :key="item.id" :type="item.status === 2 ? 'success' : item.status === 1 ? 'primary' : 'warning'" :timestamp="item.time" placement="top">
              <el-card shadow="hover" class="timeline-card">
                <p class="timeline-title">{{ item.equipment }}</p>
                <p class="timeline-info">预约人：{{ item.user }}</p>
                <p class="timeline-info">用途：{{ item.purpose }}</p>
                <el-tag :type="item.status === 2 ? 'success' : item.status === 1 ? 'primary' : 'warning'" size="small">{{ item.statusName }}</el-tag>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
        <el-card style="margin-top: 20px">
          <template #header><span>热门设备</span></template>
          <div class="hot-equipment">
            <div v-for="item in hotEquipments" :key="item.id" class="hot-item"><span class="hot-name">{{ item.name }}</span><el-progress :percentage="item.usage" :color="item.usage > 80 ? '#F56C6C' : '#409EFF'" /></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="detailVisible" :title="`${selectedDate} 预约详情`" width="600px">
      <el-table :data="dateReservations" stripe border max-height="400">
        <el-table-column prop="time" label="时间段" width="150" />
        <el-table-column prop="equipment" label="设备名称" />
        <el-table-column prop="user" label="预约人" width="100" />
        <el-table-column prop="statusName" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 2 ? 'success' : row.status === 1 ? 'primary' : 'warning'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="100"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const viewMode = ref('month'), calendarDate = ref(new Date()), detailVisible = ref(false), selectedDate = ref(''), dateReservations = ref<any[]>([])
const todayReservations = ref([
  { id: 1, time: '09:00-11:00', equipment: '高效液相色谱仪', user: '张三', purpose: '样品分析', status: 2, statusName: '已完成' },
  { id: 2, time: '11:00-12:00', equipment: '紫外分光光度计', user: '李四', purpose: '浓度测定', status: 1, statusName: '使用中' },
  { id: 3, time: '14:00-16:00', equipment: '气质联用仪', user: '王五', purpose: '农残检测', status: 0, statusName: '待开始' },
  { id: 4, time: '16:00-18:00', equipment: '原子吸收光谱仪', user: '赵六', purpose: '金属含量测定', status: 0, statusName: '待开始' }
])
const hotEquipments = ref([
  { id: 1, name: '高效液相色谱仪', usage: 92 },
  { id: 2, name: '气相色谱质谱联用仪', usage: 85 },
  { id: 3, name: '紫外可见分光光度计', usage: 78 },
  { id: 4, name: '原子吸收光谱仪', usage: 65 },
  { id: 5, name: '超速离心机', usage: 45 }
])
const allReservations = ref([
  { id: 1, date: '2024-12-22', time: '09:00-11:00', equipment: '高效液相色谱仪', user: '张三', status: 1 },
  { id: 2, date: '2024-12-22', time: '14:00-16:00', equipment: '气质联用仪', user: '王五', status: 0 },
  { id: 3, date: '2024-12-23', time: '10:00-12:00', equipment: '紫外分光光度计', user: '李四', status: 0 },
  { id: 4, date: '2024-12-24', time: '09:00-12:00', equipment: '原子吸收光谱仪', user: '赵六', status: 0 }
])
const getReservations = (day: string) => allReservations.value.filter(r => r.date === day)
const handleDateClick = (data: any) => { selectedDate.value = data.day; dateReservations.value = getReservations(data.day); if (dateReservations.value.length > 0) detailVisible.value = true; else ElMessage.info('该日期暂无预约') }
const handleViewDetail = (row: any) => ElMessage.success(`查看预约详情：${row.equipment}`)
</script>
<style scoped>.reservation-overview-page { height: 100%; }.stats-cards { display: flex; gap: 20px; margin-bottom: 20px; }.stat-card { flex: 1; }.stat-content { display: flex; align-items: center; gap: 15px; }.stat-info { display: flex; flex-direction: column; }.stat-value { font-size: 28px; font-weight: bold; }.stat-label { font-size: 14px; color: #909399; }.card-header { display: flex; justify-content: space-between; align-items: center; }.calendar-cell { height: 100%; cursor: pointer; }.date-num { font-size: 14px; }.reservation-dots { display: flex; gap: 3px; margin-top: 5px; }.timeline-card { padding: 0; }.timeline-title { font-weight: bold; margin: 0 0 5px 0; }.timeline-info { font-size: 12px; color: #909399; margin: 3px 0; }.hot-item { margin-bottom: 15px; }.hot-name { font-size: 13px; color: #606266; }</style>
