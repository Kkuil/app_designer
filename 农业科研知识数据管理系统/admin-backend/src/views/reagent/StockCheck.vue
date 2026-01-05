<template>
  <div class="stock-check-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>盘库管理</span>
          <div>
            <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新建盘点任务</el-button>
            <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出报告</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="盘点单号"><el-input v-model="filters.code" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="盘点类型"><el-select v-model="filters.type" placeholder="全部" clearable><el-option label="全盘" value="full" /><el-option label="抽盘" value="sample" /><el-option label="定期盘点" value="regular" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="待盘点" value="pending" /><el-option label="盘点中" value="processing" /><el-option label="已完成" value="done" /></el-select></el-form-item>
        <el-form-item label="盘点日期"><el-date-picker v-model="filters.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>

      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="盘点单号" width="140" />
        <el-table-column prop="typeName" label="盘点类型" width="100">
          <template #default="{ row }"><el-tag size="small">{{ row.typeName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="warehouse" label="仓库" width="120" />
        <el-table-column prop="planDate" label="计划日期" width="100" />
        <el-table-column prop="actualDate" label="实际日期" width="100" />
        <el-table-column prop="totalItems" label="盘点品项" width="90" />
        <el-table-column prop="matchCount" label="相符" width="70" />
        <el-table-column prop="diffCount" label="差异" width="70">
          <template #default="{ row }"><span :class="row.diffCount > 0 ? 'diff-warning' : ''">{{ row.diffCount }}</span></template>
        </el-table-column>
        <el-table-column prop="operator" label="盘点人" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)" v-if="row.status !== 'done'">编辑</el-button>
            <el-button type="success" link size="small" @click="handleStart(row)" v-if="row.status === 'pending'">开始盘点</el-button>
            <el-button type="info" link size="small" @click="handleFinish(row)" v-if="row.status === 'processing'">完成</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" /></div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑盘点任务' : '新建盘点任务'" width="700px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="盘点类型"><el-select v-model="form.type" placeholder="请选择" style="width: 100%"><el-option label="全盘" value="full" /><el-option label="抽盘" value="sample" /><el-option label="定期盘点" value="regular" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="盘点仓库"><el-select v-model="form.warehouse" placeholder="请选择" style="width: 100%"><el-option label="主仓库" value="main" /><el-option label="危化品库" value="hazardous" /><el-option label="冷藏库" value="cold" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="计划日期"><el-date-picker v-model="form.planDate" type="date" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="盘点人员"><el-select v-model="form.operator" placeholder="请选择" style="width: 100%"><el-option label="张三" value="张三" /><el-option label="李四" value="李四" /><el-option label="王五" value="王五" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="盘点范围" v-if="form.type === 'sample'"><el-select v-model="form.sampleRange" placeholder="请选择盘点范围" style="width: 100%" multiple><el-option label="化学试剂" value="chemical" /><el-option label="有机溶剂" value="solvent" /><el-option label="生化试剂" value="bio" /><el-option label="危化品" value="hazardous" /></el-select></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="盘点详情" width="900px">
      <el-descriptions :column="3" border style="margin-bottom: 20px">
        <el-descriptions-item label="盘点单号">{{ currentCheck?.code }}</el-descriptions-item>
        <el-descriptions-item label="盘点类型">{{ currentCheck?.typeName }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ currentCheck?.warehouse }}</el-descriptions-item>
        <el-descriptions-item label="盘点人">{{ currentCheck?.operator }}</el-descriptions-item>
        <el-descriptions-item label="计划日期">{{ currentCheck?.planDate }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag :type="getStatusType(currentCheck?.status)" size="small">{{ currentCheck?.statusName }}</el-tag></el-descriptions-item>
      </el-descriptions>
      <el-table :data="detailData" stripe border size="small" max-height="400">
        <el-table-column prop="reagentName" label="试剂名称" min-width="150" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="batchNo" label="批号" width="120" />
        <el-table-column prop="systemStock" label="系统库存" width="90" />
        <el-table-column prop="actualStock" label="实际库存" width="90">
          <template #default="{ row }"><el-input-number v-model="row.actualStock" :min="0" size="small" style="width: 80px" /></template>
        </el-table-column>
        <el-table-column prop="diff" label="差异" width="70">
          <template #default="{ row }"><span :class="getDiffClass(row.actualStock - row.systemStock)">{{ row.actualStock - row.systemStock }}</span></template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150">
          <template #default="{ row }"><el-input v-model="row.remark" size="small" placeholder="请输入差异原因" /></template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(30), dialogVisible = ref(false), detailVisible = ref(false), isEdit = ref(false)
const currentCheck = ref<any>(null)
const filters = reactive({ code: '', type: '', status: '', dateRange: null })
const form = reactive({ type: '', warehouse: '', planDate: '', operator: '', sampleRange: [], remark: '' })
const tableData = ref([
  { code: 'PK202412001', type: 'full', typeName: '全盘', warehouse: '主仓库', planDate: '2024-12-20', actualDate: '2024-12-20', totalItems: 150, matchCount: 145, diffCount: 5, operator: '张三', status: 'done', statusName: '已完成' },
  { code: 'PK202412002', type: 'sample', typeName: '抽盘', warehouse: '危化品库', planDate: '2024-12-22', actualDate: '', totalItems: 30, matchCount: 0, diffCount: 0, operator: '李四', status: 'processing', statusName: '盘点中' },
  { code: 'PK202412003', type: 'regular', typeName: '定期盘点', warehouse: '冷藏库', planDate: '2024-12-25', actualDate: '', totalItems: 50, matchCount: 0, diffCount: 0, operator: '王五', status: 'pending', statusName: '待盘点' }
])
const detailData = ref([
  { reagentName: '无水乙醇', spec: '500mL', batchNo: 'BN2024120101', systemStock: 50, actualStock: 48, remark: '' },
  { reagentName: '甲醇(色谱纯)', spec: '4L', batchNo: 'BN2024120102', systemStock: 20, actualStock: 20, remark: '' },
  { reagentName: '盐酸', spec: '500mL', batchNo: 'BN2024120103', systemStock: 30, actualStock: 28, remark: '' },
  { reagentName: 'Tris缓冲液', spec: '500g', batchNo: 'BN2024120104', systemStock: 15, actualStock: 15, remark: '' }
])
const getStatusType = (status: string) => ({ pending: 'info', processing: 'warning', done: 'success' }[status] || 'info')
const getDiffClass = (diff: number) => diff < 0 ? 'diff-danger' : diff > 0 ? 'diff-warning' : ''
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { code: '', type: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleCreate = () => { isEdit.value = false; Object.assign(form, { type: '', warehouse: '', planDate: '', operator: '', sampleRange: [], remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
const handleView = (row: any) => { currentCheck.value = row; detailVisible.value = true }
const handleStart = (row: any) => { row.status = 'processing'; row.statusName = '盘点中'; ElMessage.success('盘点已开始') }
const handleFinish = (row: any) => { ElMessageBox.confirm('确定完成盘点并提交结果吗？', '提示').then(() => { row.status = 'done'; row.statusName = '已完成'; row.actualDate = new Date().toISOString().split('T')[0]; ElMessage.success('盘点已完成') }).catch(() => {}) }
const handleExport = () => ElMessage.success('导出成功')
</script>
<style scoped>
.stock-check-page { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
.pagination-container { margin-top: 15px; display: flex; justify-content: flex-end; }
.diff-warning { color: #E6A23C; font-weight: bold; }
.diff-danger { color: #F56C6C; font-weight: bold; }
</style>
