<template>
  <div class="project-achievement-page">
    <el-card>
      <template #header><span>成果管理</span></template>
      <el-table :data="achievementList" stripe border size="small">
        <el-table-column prop="project" label="所属项目" min-width="200" />
        <el-table-column prop="title" label="成果名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'published' ? 'success' : 'warning'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="date" label="完成日期" width="140" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handlePublish(row)">发布</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const achievementList = ref([
  { project: '智慧农机监测', title: '农机远程监控算法', type: '论文', owner: '张三', status: 'published', statusName: '已发布', date: '2024-11-30' },
  { project: '玉米耐旱品种选育', title: '耐旱品系阶段成果', type: '技术报告', owner: '李四', status: 'draft', statusName: '草稿', date: '2024-12-10' }
])

const handlePublish = (row: any) => ElMessage.success(`发布成果：${row.title}`)
const handleView = (row: any) => ElMessage.info(`查看成果：${row.title}`)
</script>

<style scoped>
.project-achievement-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
