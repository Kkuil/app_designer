<template>
  <div class="project-progress-page">
    <el-card>
      <template #header><span>进度管理</span></template>
      <el-table :data="progressList" stripe border size="small">
        <el-table-column prop="code" label="项目编号" width="140" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="milestone" label="当前里程碑" min-width="180" />
        <el-table-column prop="progress" label="进度" width="160"><template #default="{ row }"><el-progress :percentage="row.progress" :color="row.progress >= 80 ? '#67C23A' : '#409EFF'" /></template></el-table-column>
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="update" label="更新时间" width="140" />
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleUpdate(row)">更新</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const progressList = ref([
  { code: 'XM202412001', name: '智慧农机监测', milestone: '硬件样机完成', progress: 65, owner: '张三', update: '2024-12-21' },
  { code: 'XM202412002', name: '玉米耐旱品种选育', milestone: '田间试验入冬监测', progress: 82, owner: '李四', update: '2024-12-19' }
])

const handleUpdate = (row: any) => ElMessage.success(`更新进度 ${row.code}`)
const handleView = (row: any) => ElMessage.info(`查看 ${row.code}`)
</script>

<style scoped>
.project-progress-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
