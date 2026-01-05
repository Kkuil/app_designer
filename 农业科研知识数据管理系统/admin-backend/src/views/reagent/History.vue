<template>
  <div class="reagent-history-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>历史记录</span>
          <div class="actions">
            <el-button type="primary" @click="handleRefresh" :loading="loading"><el-icon><Refresh /></el-icon>刷新</el-button>
            <el-button type="success" @click="handleExportExcel"><el-icon><Download /></el-icon>导出Excel</el-button>
          </div>
        </div>
      </template>

      <!-- 历史类型切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="领用历史" name="outbound" />
        <el-tab-pane label="入库历史" name="inbound" />
        <el-tab-pane label="报损历史" name="damage" />
        <el-tab-pane label="申购历史" name="purchase" />
      </el-tabs>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="试剂名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item label="操作人"><el-input v-model="filters.operator" placeholder="请输入" clearable /></el-form-item>
        <el-form-item v-if="activeTab === 'purchase'" label="申购状态">
          <el-select v-model="filters.purchaseStatus" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>

      <!-- 领用历史表格 -->
      <el-table v-if="activeTab === 'outbound'" :data="outboundList" stripe border size="small" v-loading="loading">
        <el-table-column prop="code" label="试剂编码" width="120" />
        <el-table-column prop="name" label="试剂名称" min-width="140" />
        <el-table-column prop="quantity" label="领用数量" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="purpose" label="用途" min-width="120" show-overflow-tooltip />
        <el-table-column prop="project" label="所属项目" min-width="120" show-overflow-tooltip />
        <el-table-column prop="applicant" label="领用人" width="80" />
        <el-table-column prop="approver" label="审批人" width="80" />
        <el-table-column prop="time" label="领用时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      </el-table>

      <!-- 入库历史表格 -->
      <el-table v-if="activeTab === 'inbound'" :data="inboundList" stripe border size="small" v-loading="loading">
        <el-table-column prop="code" label="试剂编码" width="120" />
        <el-table-column prop="name" label="试剂名称" min-width="140" />
        <el-table-column prop="quantity" label="入库数量" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="purchaseNo" label="采购单号" width="120" />
        <el-table-column prop="operator" label="入库人" width="80" />
        <el-table-column prop="time" label="入库时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="100" show-overflow-tooltip />
      </el-table>

      <!-- 报损历史表格 -->
      <el-table v-if="activeTab === 'damage'" :data="damageList" stripe border size="small" v-loading="loading">
        <el-table-column prop="code" label="试剂编码" width="120" />
        <el-table-column prop="name" label="试剂名称" min-width="140" />
        <el-table-column prop="quantity" label="报损数量" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="reason" label="报损原因" min-width="150">
          <template #default="{ row }">
            <el-tag :type="getDamageReasonType(row.reasonType)" size="small">{{ row.reason }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="报损人" width="80" />
        <el-table-column prop="approver" label="审批人" width="80" />
        <el-table-column prop="time" label="报损时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="100" show-overflow-tooltip />
      </el-table>

      <!-- 申购历史表格 -->
      <el-table v-if="activeTab === 'purchase'" :data="purchaseList" stripe border size="small" v-loading="loading">
        <el-table-column prop="purchaseNo" label="申购单号" width="130" />
        <el-table-column prop="name" label="试剂名称" min-width="140" />
        <el-table-column prop="spec" label="规格" width="80" />
        <el-table-column prop="quantity" label="申购数量" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="estimatePrice" label="预估金额" width="100" />
        <el-table-column prop="purpose" label="用途" min-width="120" show-overflow-tooltip />
        <el-table-column prop="applicant" label="申购人" width="80" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getPurchaseStatusType(row.status)" size="small">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="申购时间" width="160" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10,20,50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)
const activeTab = ref('outbound')
const filters = reactive({ name: '', dateRange: null, operator: '', purchaseStatus: '' })

// 领用历史数据
const outboundList = ref([
  { code: 'RG20240001', name: '无水乙醇', quantity: 5, unit: '瓶', purpose: '样品前处理', project: '智慧农机监测项目', applicant: '王五', approver: '李四', time: '2024-12-21 15:10', remark: '' },
  { code: 'RG20240002', name: '甲醇(色谱纯)', quantity: 2, unit: '瓶', purpose: '色谱分析', project: '农药残留检测', applicant: '赵六', approver: '李四', time: '2024-12-20 10:30', remark: '紧急使用' },
  { code: 'RG20240004', name: 'Tris缓冲液', quantity: 1, unit: '瓶', purpose: '蛋白提取', project: '玉米耐旱研究', applicant: '张三', approver: '王五', time: '2024-12-19 14:20', remark: '' }
])

// 入库历史数据
const inboundList = ref([
  { code: 'RG20240001', name: '无水乙醇', quantity: 20, unit: '瓶', batchNo: 'B20241220001', supplier: '国药集团', purchaseNo: 'PO20241218001', operator: '李四', time: '2024-12-21 10:23', remark: '采购入库' },
  { code: 'RG20240005', name: '农药残留标准品', quantity: 2, unit: '套', batchNo: 'B20241215002', supplier: 'Sigma-Aldrich', purchaseNo: 'PO20241210002', operator: '李四', time: '2024-12-15 09:00', remark: '进口试剂' },
  { code: 'RG20240003', name: '浓硫酸', quantity: 10, unit: '瓶', batchNo: 'B20241210003', supplier: '国药集团', purchaseNo: 'PO20241205003', operator: '王五', time: '2024-12-10 14:30', remark: '' }
])

// 报损历史数据
const damageList = ref([
  { code: 'RG20240003', name: '浓硫酸', quantity: 1, unit: '瓶', reasonType: 'broken', reason: '瓶盖破损', operator: '赵六', approver: '李四', time: '2024-12-20 09:15', remark: '运输过程中损坏' },
  { code: 'RG20240004', name: 'Tris缓冲液', quantity: 2, unit: '瓶', reasonType: 'expired', reason: '过期报废', operator: '李四', approver: '张三', time: '2024-12-18 16:00', remark: '有效期2024-12-15' },
  { code: 'RG20240002', name: '甲醇(色谱纯)', quantity: 1, unit: '瓶', reasonType: 'contaminated', reason: '污染变质', operator: '王五', approver: '李四', time: '2024-12-15 11:30', remark: '发现杂质沉淀' }
])

// 申购历史数据
const purchaseList = ref([
  { purchaseNo: 'PR20241220001', name: '无水乙醇', spec: '500mL', quantity: 50, unit: '瓶', estimatePrice: '¥1750', purpose: '日常实验', applicant: '李四', status: 'completed', statusName: '已完成', time: '2024-12-20 09:00' },
  { purchaseNo: 'PR20241218002', name: '色谱纯乙腈', spec: '4L', quantity: 10, unit: '瓶', estimatePrice: '¥3500', purpose: '色谱分析', applicant: '王五', status: 'approved', statusName: '已批准', time: '2024-12-18 14:30' },
  { purchaseNo: 'PR20241215003', name: 'PCR试剂盒', spec: '100次', quantity: 5, unit: '盒', estimatePrice: '¥4000', purpose: '分子检测', applicant: '赵六', status: 'pending', statusName: '待审核', time: '2024-12-15 10:00' },
  { purchaseNo: 'PR20241210004', name: '蛋白酶K', spec: '100mg', quantity: 3, unit: '支', estimatePrice: '¥1200', purpose: 'DNA提取', applicant: '张三', status: 'rejected', statusName: '已驳回', time: '2024-12-10 11:20' }
])

const getDamageReasonType = (type: string) => {
  const types: Record<string, string> = { broken: 'warning', expired: 'info', contaminated: 'danger', other: '' }
  return types[type] || 'info'
}

const getPurchaseStatusType = (status: string) => {
  const types: Record<string, string> = { pending: 'warning', approved: 'primary', rejected: 'danger', completed: 'success' }
  return types[status] || 'info'
}

const handleTabChange = (tab: string) => { console.log('切换到:', tab); currentPage.value = 1 }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { name: '', dateRange: null, operator: '', purchaseStatus: '' }); ElMessage.info('已重置') }
const handleRefresh = () => { loading.value = true; setTimeout(() => { loading.value = false; ElMessage.success('刷新成功') }, 500) }
const handleExportExcel = () => {
  ElMessage.success(`正在导出${activeTab.value === 'outbound' ? '领用' : activeTab.value === 'inbound' ? '入库' : activeTab.value === 'damage' ? '报损' : '申购'}历史Excel...`)
}
const handleSizeChange = (val: number) => ElMessage.info(`每页${val}条`)
const handleCurrentChange = (val: number) => ElMessage.info(`第${val}页`)
</script>

<style scoped>
.reagent-history-page { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 10px; }
.filter-bar { margin-bottom: 10px; }
.pagination-container { margin-top: 15px; display: flex; justify-content: flex-end; }
</style>
