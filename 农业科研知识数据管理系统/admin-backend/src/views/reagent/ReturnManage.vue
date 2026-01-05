<template>
  <div class="return-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>归还管理</span>
          <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新增归还</el-button>
        </div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="归还单号"><el-input v-model="filters.code" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="试剂名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="归还人"><el-input v-model="filters.returner" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="待确认" value="pending" /><el-option label="已确认" value="confirmed" /><el-option label="已拒绝" value="rejected" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="归还单号" width="140" />
        <el-table-column prop="reagentName" label="试剂名称" min-width="150" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="returnQuantity" label="归还数量" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="returner" label="归还人" width="100" />
        <el-table-column prop="borrowCode" label="领用单号" width="140" />
        <el-table-column prop="returnDate" label="归还日期" width="100" />
        <el-table-column prop="condition" label="归还情况" width="100">
          <template #default="{ row }"><el-tag :type="getConditionType(row.condition)" size="small">{{ row.conditionName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button type="success" link size="small" @click="handleConfirm(row)" v-if="row.status === 'pending'">确认</el-button>
            <el-button type="danger" link size="small" @click="handleReject(row)" v-if="row.status === 'pending'">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" /></div>
    </el-card>
    <el-dialog v-model="dialogVisible" title="新增归还" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="领用单号"><el-select v-model="form.borrowCode" placeholder="选择领用单号" style="width: 100%" filterable><el-option label="LY202412001 - 无水乙醇" value="LY202412001" /><el-option label="LY202412002 - 甲醇" value="LY202412002" /><el-option label="LY202412003 - 盐酸" value="LY202412003" /></el-select></el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="归还数量"><el-input-number v-model="form.returnQuantity" :min="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="归还日期"><el-date-picker v-model="form.returnDate" type="date" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="归还情况"><el-select v-model="form.condition" placeholder="请选择" style="width: 100%"><el-option label="完好" value="good" /><el-option label="部分损耗" value="partial" /><el-option label="已用完" value="empty" /></el-select></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(50), dialogVisible = ref(false)
const filters = reactive({ code: '', name: '', returner: '', status: '' })
const form = reactive({ borrowCode: '', returnQuantity: 1, returnDate: '', condition: '', remark: '' })
const tableData = ref([
  { code: 'GH202412001', reagentName: '无水乙醇', spec: '500mL', returnQuantity: 3, unit: '瓶', returner: '张三', borrowCode: 'LY202412001', returnDate: '2024-12-22', condition: 'good', conditionName: '完好', status: 'confirmed', statusName: '已确认' },
  { code: 'GH202412002', reagentName: '甲醇(色谱纯)', spec: '4L', returnQuantity: 1, unit: '桶', returner: '李四', borrowCode: 'LY202412002', returnDate: '2024-12-21', condition: 'partial', conditionName: '部分损耗', status: 'pending', statusName: '待确认' },
  { code: 'GH202412003', reagentName: '盐酸', spec: '500mL', returnQuantity: 2, unit: '瓶', returner: '王五', borrowCode: 'LY202412003', returnDate: '2024-12-20', condition: 'empty', conditionName: '已用完', status: 'rejected', statusName: '已拒绝' }
])
const getStatusType = (status: string) => ({ pending: 'warning', confirmed: 'success', rejected: 'danger' }[status] || 'info')
const getConditionType = (condition: string) => ({ good: 'success', partial: 'warning', empty: 'info' }[condition] || 'info')
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { code: '', name: '', returner: '', status: '' }); ElMessage.info('已重置') }
const handleCreate = () => { Object.assign(form, { borrowCode: '', returnQuantity: 1, returnDate: '', condition: '', remark: '' }); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
const handleView = (row: any) => ElMessage.success(`查看归还单 ${row.code}`)
const handleConfirm = (row: any) => { row.status = 'confirmed'; row.statusName = '已确认'; ElMessage.success('归还确认成功') }
const handleReject = (row: any) => { ElMessageBox.prompt('请输入拒绝原因', '提示').then(() => { row.status = 'rejected'; row.statusName = '已拒绝'; ElMessage.success('已拒绝') }).catch(() => {}) }
</script>
<style scoped>
.return-manage-page { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
.pagination-container { margin-top: 15px; display: flex; justify-content: flex-end; }
</style>
