<template>
  <div class="project-quality-page">
    <el-card>
      <template #header><span>质量管理</span></template>
      <el-table :data="qualityList" stripe border size="small">
        <el-table-column prop="code" label="项目编号" width="140" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="checkpoint" label="质控节点" min-width="180" />
        <el-table-column prop="owner" label="责任人" width="100" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'pass' ? 'success' : row.status === 'risk' ? 'warning' : 'danger'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="update" label="更新时间" width="140" />
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleRecord(row)">记录</el-button><el-button type="info" link size="small" @click="handleView(row)">详情</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const qualityList = ref([
  { code: 'XM202412001', name: '智慧农机监测', checkpoint: '数据准确性验证', owner: '张三', status: 'pass', statusName: '通过', update: '2024-12-20' },
  { code: 'XM202412002', name: '玉米耐旱品种选育', checkpoint: '样品留存追踪', owner: '李四', status: 'risk', statusName: '存在风险', update: '2024-12-18' }
])

const handleRecord = (row: any) => ElMessage.success(`记录质控 ${row.code}`)
const handleView = (row: any) => ElMessage.info(`查看 ${row.code}`)
</script>

<style scoped>
.project-quality-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
