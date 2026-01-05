<template>
  <div class="project-resource-page">
    <el-card>
      <template #header><span>资源管理</span></template>
      <el-table :data="resourceList" stripe border size="small">
        <el-table-column prop="project" label="项目" min-width="200" />
        <el-table-column prop="resource" label="资源类型" width="140" />
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="usage" label="使用情况" min-width="200" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'ok' ? 'success' : 'warning'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleAdjust(row)">调整</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const resourceList = ref([
  { project: '智慧农机监测', resource: 'GPU 服务器', owner: '王五', usage: '本月已预约 120 小时 / 配额 200 小时', status: 'warning', statusName: '紧张' },
  { project: '玉米耐旱品种选育', resource: '田间试验地块', owner: '赵六', usage: '3 号地块使用率 60%', status: 'ok', statusName: '正常' }
])

const handleAdjust = (row: any) => ElMessage.success(`调整资源：${row.resource}`)
const handleView = (row: any) => ElMessage.info(`查看资源：${row.resource}`)
</script>

<style scoped>
.project-resource-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
