<template>
  <div class="project-team-page">
    <el-card>
      <template #header><span>团队协作</span></template>
      <el-table :data="teamList" stripe border size="small">
        <el-table-column prop="project" label="项目" min-width="200" />
        <el-table-column prop="member" label="成员" width="120" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="duty" label="职责" min-width="200" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleAssign(row)">分配任务</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const teamList = ref([
  { project: '智慧农机监测', member: '张三', role: '项目经理', duty: '统筹进度与质量', status: 'active', statusName: '在岗' },
  { project: '智慧农机监测', member: '李四', role: '硬件工程师', duty: '设备方案与集成', status: 'active', statusName: '在岗' },
  { project: '玉米耐旱品种选育', member: '王五', role: '科研助理', duty: '田间试验记录', status: 'inactive', statusName: '待安排' }
])

const handleAssign = (row: any) => ElMessage.success(`为 ${row.member} 分配任务`)
const handleView = (row: any) => ElMessage.info(`查看 ${row.member}`)
</script>

<style scoped>
.project-team-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
