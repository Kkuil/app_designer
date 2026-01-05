<template>
  <div class="normal-reagent-page">
    <el-row :gutter="15" style="margin-bottom: 15px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card primary"><div class="stat-value">{{ stats.total }}</div><div class="stat-label">试剂总数</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card success"><div class="stat-value">{{ stats.inStock }}</div><div class="stat-label">库存充足</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card warning"><div class="stat-value">{{ stats.lowStock }}</div><div class="stat-label">库存不足</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card info"><div class="stat-value">{{ stats.expiringSoon }}</div><div class="stat-label">即将过期</div></el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>普通试剂清单</span>
          <div>
            <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增试剂</el-button>
            <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="编码"><el-input v-model="filters.code" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="分类"><el-select v-model="filters.category" placeholder="全部" clearable><el-option label="有机试剂" value="organic" /><el-option label="无机试剂" value="inorganic" /><el-option label="生化试剂" value="bio" /><el-option label="色谱试剂" value="chromatography" /><el-option label="指示剂" value="indicator" /></el-select></el-form-item>
        <el-form-item label="存储位置"><el-select v-model="filters.location" placeholder="全部" clearable><el-option label="常温库" value="normal" /><el-option label="冷藏库" value="cold" /><el-option label="阴凉库" value="cool" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>

      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="试剂编码" width="120" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }"><el-tag :type="getCategoryType(row.categoryCode)" size="small">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="purity" label="纯度" width="80" />
        <el-table-column prop="stock" label="当前库存" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="location" label="存储位置" width="100" />
        <el-table-column prop="expireDate" label="有效期至" width="100">
          <template #default="{ row }"><span :class="isExpiringSoon(row.expireDate) ? 'expire-warning' : ''">{{ row.expireDate }}</span></template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="success" link size="small" @click="handleApply(row)">领用</el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" /></div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑试剂' : '新增试剂'" width="700px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="试剂编码"><el-input v-model="form.code" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="名称"><el-input v-model="form.name" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="分类"><el-select v-model="form.category" style="width: 100%"><el-option label="有机试剂" value="organic" /><el-option label="无机试剂" value="inorganic" /><el-option label="生化试剂" value="bio" /><el-option label="色谱试剂" value="chromatography" /><el-option label="指示剂" value="indicator" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="纯度"><el-input v-model="form.purity" placeholder="如: AR, GR, 99.9%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="规格"><el-input v-model="form.spec" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="安全库存"><el-input-number v-model="form.safetyStock" :min="0" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="存储位置"><el-select v-model="form.location" style="width: 100%"><el-option label="常温库" value="normal" /><el-option label="冷藏库" value="cold" /><el-option label="阴凉库" value="cool" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="供应商"><el-input v-model="form.supplier" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="存储条件"><el-input v-model="form.storageCondition" placeholder="如: 密封保存、避光、干燥处保存等" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="applyVisible" title="试剂领用" width="500px">
      <el-form :model="applyForm" label-width="100px">
        <el-form-item label="试剂名称"><el-input v-model="applyForm.name" disabled /></el-form-item>
        <el-form-item label="当前库存"><el-input v-model="applyForm.stock" disabled /></el-form-item>
        <el-form-item label="领用数量"><el-input-number v-model="applyForm.quantity" :min="1" :max="applyForm.stock" /></el-form-item>
        <el-form-item label="用途说明"><el-input v-model="applyForm.purpose" type="textarea" rows="2" placeholder="请说明使用用途" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="applyVisible = false">取消</el-button><el-button type="primary" @click="handleApplySubmit">确认领用</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(100), dialogVisible = ref(false), applyVisible = ref(false), isEdit = ref(false)
const stats = reactive({ total: 528, inStock: 485, lowStock: 28, expiringSoon: 15 })
const filters = reactive({ code: '', name: '', category: '', location: '' })
const form = reactive({ code: '', name: '', category: '', purity: '', spec: '', unit: '', safetyStock: 10, location: '', supplier: '', storageCondition: '', remark: '' })
const applyForm = reactive({ name: '', stock: 0, quantity: 1, purpose: '' })
const tableData = ref([
  { code: 'SJ001', name: '无水乙醇', categoryCode: 'organic', category: '有机试剂', spec: '500mL', purity: 'AR', stock: 120, unit: '瓶', location: '常温库', expireDate: '2025-08-30', supplier: '国药集团' },
  { code: 'SJ002', name: '氯化钠', categoryCode: 'inorganic', category: '无机试剂', spec: '500g', purity: 'AR', stock: 85, unit: '瓶', location: '常温库', expireDate: '2026-03-15', supplier: '西陇科学' },
  { code: 'SJ003', name: 'Tris缓冲液', categoryCode: 'bio', category: '生化试剂', spec: '500g', purity: '99%', stock: 25, unit: '瓶', location: '冷藏库', expireDate: '2025-04-20', supplier: 'Sigma' },
  { code: 'SJ004', name: '乙腈(色谱纯)', categoryCode: 'chromatography', category: '色谱试剂', spec: '4L', purity: 'HPLC', stock: 18, unit: '瓶', location: '阴凉库', expireDate: '2025-12-31', supplier: 'Merck' },
  { code: 'SJ005', name: '酚酞指示剂', categoryCode: 'indicator', category: '指示剂', spec: '100mL', purity: 'AR', stock: 40, unit: '瓶', location: '常温库', expireDate: '2025-09-10', supplier: '国药集团' }
])
const getCategoryType = (c: string) => ({ organic: 'success', inorganic: '', bio: 'warning', chromatography: 'info', indicator: 'danger' }[c] || '')
const isExpiringSoon = (date: string) => { const d = new Date(date), now = new Date(); return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 90 }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { code: '', name: '', category: '', location: '' }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { code: '', name: '', category: '', purity: '', spec: '', unit: '', safetyStock: 10, location: '', supplier: '', storageCondition: '', remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
const handleDetail = (row: any) => ElMessage.info(`查看详情: ${row.name}`)
const handleApply = (row: any) => { Object.assign(applyForm, { name: row.name, stock: row.stock, quantity: 1, purpose: '' }); applyVisible.value = true }
const handleApplySubmit = () => { applyVisible.value = false; ElMessage.success('领用成功') }
const handleExport = () => ElMessage.success('导出成功')
</script>
<style scoped>
.normal-reagent-page { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
.pagination-container { margin-top: 15px; display: flex; justify-content: flex-end; }
.stat-card { text-align: center; }
.stat-card.primary { border-left: 4px solid #409EFF; }
.stat-card.success { border-left: 4px solid #67C23A; }
.stat-card.warning { border-left: 4px solid #E6A23C; }
.stat-card.info { border-left: 4px solid #909399; }
.stat-value { font-size: 28px; font-weight: bold; color: #303133; }
.stat-label { color: #909399; font-size: 14px; margin-top: 5px; }
.expire-warning { color: #E6A23C; font-weight: bold; }
</style>
