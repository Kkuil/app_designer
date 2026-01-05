<template>
  <div class="hazardous-page">
    <el-alert type="warning" :closable="false" style="margin-bottom: 15px">
      <template #title>
        <el-icon><Warning /></el-icon> 危险化学品管理专区 - 请严格遵守危化品安全管理规定
      </template>
    </el-alert>
    
    <el-row :gutter="15" style="margin-bottom: 15px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card danger"><div class="stat-value">{{ stats.total }}</div><div class="stat-label">危化品总数</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card warning"><div class="stat-value">{{ stats.lowStock }}</div><div class="stat-label">库存不足</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card info"><div class="stat-value">{{ stats.expiringSoon }}</div><div class="stat-label">即将过期</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card success"><div class="stat-value">{{ stats.todayUsage }}</div><div class="stat-label">今日领用</div></el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>危化品清单</span>
          <div>
            <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增危化品</el-button>
            <el-button type="warning" @click="handleMSDS"><el-icon><Document /></el-icon>MSDS查询</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="编码"><el-input v-model="filters.code" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="危险类别"><el-select v-model="filters.hazardClass" placeholder="全部" clearable><el-option label="易燃液体" value="3" /><el-option label="氧化性物质" value="5" /><el-option label="毒害品" value="6" /><el-option label="腐蚀品" value="8" /></el-select></el-form-item>
        <el-form-item label="存储位置"><el-select v-model="filters.location" placeholder="全部" clearable><el-option label="危化品库A区" value="A" /><el-option label="危化品库B区" value="B" /><el-option label="冷藏危化库" value="C" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>

      <el-table :data="tableData" stripe border size="small" row-class-name="hazardous-row">
        <el-table-column prop="code" label="危化品编码" width="120" />
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <el-tag type="danger" size="small" style="margin-left: 5px" v-if="row.isKeyControl">重点管控</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="casNo" label="CAS号" width="120" />
        <el-table-column prop="hazardClass" label="危险类别" width="100">
          <template #default="{ row }"><el-tag :type="getHazardType(row.hazardClass)" size="small">{{ row.hazardClassName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="stock" label="当前库存" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="location" label="存储位置" width="110" />
        <el-table-column prop="expireDate" label="有效期至" width="100">
          <template #default="{ row }"><span :class="isExpiringSoon(row.expireDate) ? 'expire-warning' : ''">{{ row.expireDate }}</span></template>
        </el-table-column>
        <el-table-column prop="safetyStock" label="安全库存" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="success" link size="small" @click="handleApply(row)">申领</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" link size="small" @click="handleMSDSView(row)">MSDS</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" /></div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑危化品' : '新增危化品'" width="800px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="危化品编码"><el-input v-model="form.code" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="名称"><el-input v-model="form.name" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="CAS号"><el-input v-model="form.casNo" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="危险类别"><el-select v-model="form.hazardClass" style="width: 100%"><el-option label="易燃液体" value="3" /><el-option label="氧化性物质" value="5" /><el-option label="毒害品" value="6" /><el-option label="腐蚀品" value="8" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="规格"><el-input v-model="form.spec" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="安全库存"><el-input-number v-model="form.safetyStock" :min="0" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="存储位置"><el-select v-model="form.location" style="width: 100%"><el-option label="危化品库A区" value="A" /><el-option label="危化品库B区" value="B" /><el-option label="冷藏危化库" value="C" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="重点管控"><el-switch v-model="form.isKeyControl" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="安全提示"><el-input v-model="form.safetyTips" type="textarea" rows="2" placeholder="请输入存储和使用安全提示" /></el-form-item>
        <el-form-item label="应急处理"><el-input v-model="form.emergencyInfo" type="textarea" rows="2" placeholder="请输入泄漏/中毒等应急处理措施" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="applyVisible" title="危化品申领" width="500px">
      <el-form :model="applyForm" label-width="100px">
        <el-form-item label="危化品名称"><el-input v-model="applyForm.name" disabled /></el-form-item>
        <el-form-item label="当前库存"><el-input v-model="applyForm.stock" disabled /></el-form-item>
        <el-form-item label="申领数量"><el-input-number v-model="applyForm.quantity" :min="1" :max="applyForm.stock" /></el-form-item>
        <el-form-item label="用途说明"><el-input v-model="applyForm.purpose" type="textarea" rows="2" placeholder="请详细说明使用用途" /></el-form-item>
        <el-form-item label="项目关联"><el-select v-model="applyForm.project" style="width: 100%"><el-option label="农药残留检测项目" value="1" /><el-option label="土壤重金属分析项目" value="2" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="applyVisible = false">取消</el-button><el-button type="primary" @click="handleApplySubmit">提交申请</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(20), dialogVisible = ref(false), applyVisible = ref(false), isEdit = ref(false)
const stats = reactive({ total: 156, lowStock: 8, expiringSoon: 12, todayUsage: 5 })
const filters = reactive({ code: '', name: '', hazardClass: '', location: '' })
const form = reactive({ code: '', name: '', casNo: '', hazardClass: '', spec: '', unit: '', safetyStock: 10, location: '', isKeyControl: false, safetyTips: '', emergencyInfo: '' })
const applyForm = reactive({ name: '', stock: 0, quantity: 1, purpose: '', project: '' })
const tableData = ref([
  { code: 'WHX001', name: '浓硫酸', casNo: '7664-93-9', hazardClass: '8', hazardClassName: '腐蚀品', spec: '500mL', stock: 25, unit: '瓶', location: '危化品库A区', expireDate: '2025-06-30', safetyStock: 10, isKeyControl: true },
  { code: 'WHX002', name: '甲苯', casNo: '108-88-3', hazardClass: '3', hazardClassName: '易燃液体', spec: '2.5L', stock: 15, unit: '瓶', location: '危化品库B区', expireDate: '2025-03-15', safetyStock: 5, isKeyControl: false },
  { code: 'WHX003', name: '高锰酸钾', casNo: '7722-64-7', hazardClass: '5', hazardClassName: '氧化性物质', spec: '500g', stock: 8, unit: '瓶', location: '危化品库A区', expireDate: '2025-12-31', safetyStock: 5, isKeyControl: true },
  { code: 'WHX004', name: '氰化钾', casNo: '151-50-8', hazardClass: '6', hazardClassName: '毒害品', spec: '100g', stock: 3, unit: '瓶', location: '危化品库A区', expireDate: '2025-08-20', safetyStock: 2, isKeyControl: true }
])
const getHazardType = (c: string) => ({ '3': 'warning', '5': '', '6': 'danger', '8': 'info' }[c] || '')
const isExpiringSoon = (date: string) => { const d = new Date(date), now = new Date(); return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 90 }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { code: '', name: '', hazardClass: '', location: '' }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { code: '', name: '', casNo: '', hazardClass: '', spec: '', unit: '', safetyStock: 10, location: '', isKeyControl: false, safetyTips: '', emergencyInfo: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
const handleDetail = (row: any) => ElMessage.info(`查看详情: ${row.name}`)
const handleApply = (row: any) => { Object.assign(applyForm, { name: row.name, stock: row.stock, quantity: 1, purpose: '', project: '' }); applyVisible.value = true }
const handleApplySubmit = () => { applyVisible.value = false; ElMessage.success('申领申请已提交，等待审批') }
const handleMSDS = () => ElMessage.info('打开MSDS查询系统')
const handleMSDSView = (row: any) => ElMessage.info(`查看 ${row.name} 的MSDS信息`)
</script>
<style scoped>
.hazardous-page { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
.pagination-container { margin-top: 15px; display: flex; justify-content: flex-end; }
.stat-card { text-align: center; }
.stat-card.danger { border-left: 4px solid #F56C6C; }
.stat-card.warning { border-left: 4px solid #E6A23C; }
.stat-card.info { border-left: 4px solid #909399; }
.stat-card.success { border-left: 4px solid #67C23A; }
.stat-value { font-size: 28px; font-weight: bold; color: #303133; }
.stat-label { color: #909399; font-size: 14px; margin-top: 5px; }
.expire-warning { color: #E6A23C; font-weight: bold; }
:deep(.hazardous-row) { background-color: #FEF0F0 !important; }
</style>
