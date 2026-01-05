<template>
  <div class="project-review-page">
    <el-card>
      <template #header><span>项目评审</span></template>
      <el-table :data="reviewList" stripe border size="small">
        <el-table-column prop="code" label="项目编号" width="140" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="leader" label="负责人" width="100" />
        <el-table-column prop="stage" label="评审阶段" width="120" />
        <el-table-column prop="score" label="平均评分" width="100" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'pending' ? 'warning' : 'success'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleReview(row)">进入评审</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const reviewList = ref([
  { code: 'XM202412001', name: '智慧农机监测', leader: '张三', stage: '专家初审', score: 86.5, status: 'pending', statusName: '待评审' },
  { code: 'XM202412002', name: '玉米耐旱品种选育', leader: '李四', stage: '复审', score: 91.2, status: 'finished', statusName: '已完成' }
])

const handleReview = (row: any) => ElMessage.success(`进入 ${row.code} 评审流程`)
const handleView = (row: any) => ElMessage.info(`查看 ${row.code}`)
</script>

<style scoped>
.project-review-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
