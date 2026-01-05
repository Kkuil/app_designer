<template>
  <div class="project-ledger-page">
    <el-card>
      <template #header><span>成果台账</span></template>
      <el-table :data="ledgerList" stripe border size="small">
        <el-table-column prop="code" label="成果编号" width="140" />
        <el-table-column prop="title" label="成果名称" min-width="220" />
        <el-table-column prop="project" label="所属项目" min-width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="level" label="级别" width="120" />
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 'archived' ? 'info' : 'success'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="date" label="归档日期" width="140" />
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button type="info" link size="small" @click="handleDownload(row)">下载</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const ledgerList = ref([
  { code: 'CG202412001', title: '农机远程监控算法', project: '智慧农机监测', type: '软件著作权', level: '国家级', owner: '张三', status: 'archived', statusName: '已归档', date: '2024-12-10' },
  { code: 'CG202412002', title: '耐旱品系阶段成果', project: '玉米耐旱品种选育', type: '技术报告', level: '省部级', owner: '李四', status: 'active', statusName: '在研', date: '2024-12-18' }
])

const handleView = (row: any) => ElMessage.info(`查看台账：${row.code}`)
const handleDownload = (row: any) => ElMessage.success(`下载附件：${row.code}`)
</script>

<style scoped>
.project-ledger-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
</style>
