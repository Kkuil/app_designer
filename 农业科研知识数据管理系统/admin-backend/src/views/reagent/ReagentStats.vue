<template>
  <div class="reagent-stats-page">
    <div class="stat-grid">
      <el-card v-for="item in statCards" :key="item.title" class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-info">
            <span class="stat-value">{{ item.value }}</span>
            <span class="stat-title">{{ item.title }}</span>
          </div>
          <el-tag :type="item.type" size="small">{{ item.trend }}</el-tag>
        </div>
      </el-card>
    </div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header><span>库存分布</span></template>
          <div class="chart-placeholder">
            <el-icon :size="60" color="#dcdfe6"><DataAnalysis /></el-icon>
            <p>库存分布图表占位</p>
            <el-button type="primary" @click="handleLoad('库存分布')">加载数据</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>消耗趋势</span></template>
          <div class="chart-placeholder">
            <el-icon :size="60" color="#dcdfe6"><TrendCharts /></el-icon>
            <p>消耗趋势图表占位</p>
            <el-button type="primary" @click="handleLoad('消耗趋势')">加载数据</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top: 20px">
      <template #header><span>预警列表</span></template>
      <el-table :data="warningList" stripe border size="small">
        <el-table-column prop="name" label="试剂名称" min-width="160" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="safeStock" label="安全库存" width="100" />
        <el-table-column prop="statusName" label="状态" width="100"><template #default="{ row }"><el-tag :type="row.type" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const statCards = ref([
  { title: '库存总值(¥)', value: '1,265,800', trend: '+8.3%', type: 'success' },
  { title: '低库存品种', value: 12, trend: '+2', type: 'warning' },
  { title: '临期/过期', value: 6, trend: '-1', type: 'danger' },
  { title: '本月出库', value: '428 瓶/支', trend: '+5.2%', type: 'info' }
])

const warningList = ref([
  { name: '甲醇(色谱纯)', category: '有机溶剂', stock: 8, safeStock: 10, statusName: '库存不足', type: 'warning' },
  { name: 'Tris缓冲液', category: '生化试剂', stock: 3, safeStock: 5, statusName: '即将过期', type: 'danger' }
])

const handleLoad = (name: string) => ElMessage.success(`${name}数据已加载`)
</script>

<style scoped>
.reagent-stats-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.stat-card { min-height: 90px; }
.stat-content { display: flex; justify-content: space-between; align-items: center; }
.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 26px; font-weight: bold; }
.stat-title { color: #909399; font-size: 13px; }
.chart-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px 0; color: #909399; gap: 10px; }
</style>
