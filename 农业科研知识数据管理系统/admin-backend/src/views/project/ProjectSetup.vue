<template>
  <div class="project-setup-page">
    <el-card>
      <template #header><span>项目立项</span></template>
      <el-table :data="projectList" stripe border size="small">
        <el-table-column prop="code" label="项目编号" width="140" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="leader" label="负责人" width="100" />
        <el-table-column prop="budget" label="预算(¥)" width="120" />
        <el-table-column prop="duration" label="周期(月)" width="100" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'pending' ? 'warning' : 'success'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleApprove(row)">立项</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const projectList = ref([
  { code: 'XM202412001', name: '智慧农机监测', leader: '张三', budget: 1200000, duration: 18, status: 'pending', statusName: '待立项' },
  { code: 'XM202412002', name: '玉米耐旱品种选育', leader: '李四', budget: 2000000, duration: 24, status: 'approved', statusName: '已立项' }
])

const handleApprove = (row: any) => ElMessage.success(`项目 ${row.code} 已立项`)
const handleView = (row: any) => ElMessage.info(`查看 ${row.code}`)
</script>

<style scoped>
.project-setup-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
