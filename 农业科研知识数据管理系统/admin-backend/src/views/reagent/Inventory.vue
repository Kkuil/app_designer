<template>
  <div class="inventory-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="试剂名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="试剂分类"><el-select v-model="searchForm.category" placeholder="全部" clearable><el-option label="有机溶剂" value="organic" /><el-option label="无机试剂" value="inorganic" /><el-option label="生化试剂" value="biochem" /><el-option label="标准品" value="standard" /><el-option label="危险化学品" value="hazardous" /></el-select></el-form-item>
        <el-form-item label="库存状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="正常" value="normal" /><el-option label="库存不足" value="low" /><el-option label="即将过期" value="expiring" /><el-option label="已过期" value="expired" /></el-select></el-form-item>
        <el-form-item label="存放位置"><el-select v-model="searchForm.location" placeholder="全部" clearable><el-option label="常温库房" value="room" /><el-option label="冷藏库" value="cold" /><el-option label="冷冻库" value="frozen" /><el-option label="危化品库" value="hazard" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="stats-cards">
      <el-card class="stat-card"><div class="stat-content"><span class="stat-value">{{ inventoryList.length }}</span><span class="stat-label">试剂种类</span></div></el-card>
      <el-card class="stat-card warning"><div class="stat-content"><span class="stat-value">{{ inventoryList.filter(r => r.status === 'low').length }}</span><span class="stat-label">库存不足</span></div></el-card>
      <el-card class="stat-card danger"><div class="stat-content"><span class="stat-value">{{ inventoryList.filter(r => r.status === 'expiring' || r.status === 'expired').length }}</span><span class="stat-label">临期/过期</span></div></el-card>
      <el-card class="stat-card info"><div class="stat-content"><span class="stat-value">¥{{ totalValue.toLocaleString() }}</span><span class="stat-label">库存总值</span></div></el-card>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增试剂</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button><el-button type="warning" @click="handleStocktaking"><el-icon><Document /></el-icon>库存盘点</el-button></div>
      <el-table :data="inventoryList" stripe border :row-class-name="getRowClass">
        <el-table-column prop="id" label="编号" width="70" />
        <el-table-column prop="code" label="试剂编码" width="110" />
        <el-table-column prop="name" label="品名" min-width="140" />
        <el-table-column prop="brand" label="品牌" width="80" />
        <el-table-column prop="productNo" label="货号" width="100" />
        <el-table-column prop="cas" label="CAS号" width="100" />
        <el-table-column prop="categoryName" label="分类" width="90" />
        <el-table-column prop="spec" label="规格" width="80" />
        <el-table-column prop="unit" label="单位" width="50" />
        <el-table-column prop="stock" label="数量" width="70"><template #default="{ row }"><span :class="row.stock <= row.safeStock ? 'text-danger' : ''">{{ row.stock }}</span></template></el-table-column>
        <el-table-column prop="batchNo" label="批次号" width="110" />
        <el-table-column prop="locationName" label="存储位置" width="90" />
        <el-table-column prop="safeStock" label="安全库存" width="80" />
        <el-table-column prop="expiryDate" label="有效期至" width="100" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button type="success" link size="small" @click="handleInbound(row)">入库</el-button><el-button type="warning" link size="small" @click="handleOutbound(row)">出库</el-button><el-button type="info" link size="small" @click="handleEdit(row)">编辑</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑试剂' : '新增试剂'" width="700px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="试剂编码"><el-input v-model="form.code" placeholder="请输入或自动生成" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="试剂名称"><el-input v-model="form.name" placeholder="请输入试剂名称" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="试剂分类"><el-select v-model="form.category" placeholder="请选择" style="width: 100%"><el-option label="有机溶剂" value="organic" /><el-option label="无机试剂" value="inorganic" /><el-option label="生化试剂" value="biochem" /><el-option label="标准品" value="standard" /><el-option label="危险化学品" value="hazardous" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="CAS号"><el-input v-model="form.cas" placeholder="请输入CAS号" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="规格"><el-input v-model="form.spec" placeholder="如：500mL、100g" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="单位"><el-select v-model="form.unit" placeholder="请选择" style="width: 100%"><el-option label="瓶" value="瓶" /><el-option label="支" value="支" /><el-option label="盒" value="盒" /><el-option label="克" value="g" /><el-option label="毫升" value="mL" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="品牌"><el-input v-model="form.brand" placeholder="请输入品牌" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="货号"><el-input v-model="form.productNo" placeholder="请输入货号" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="批次号"><el-input v-model="form.batchNo" placeholder="请输入批次号" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="生产厂家"><el-input v-model="form.manufacturer" placeholder="请输入生产厂家" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="安全库存"><el-input-number v-model="form.safeStock" :min="0" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="存放位置"><el-select v-model="form.location" placeholder="请选择" style="width: 100%"><el-option label="常温库房" value="room" /><el-option label="冷藏库" value="cold" /><el-option label="冷冻库" value="frozen" /><el-option label="危化品库" value="hazard" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(100), dialogVisible = ref(false), isEdit = ref(false)
const searchForm = reactive({ name: '', category: '', status: '', location: '' })
const form = reactive({ code: '', name: '', category: '', cas: '', spec: '', unit: '', brand: '', productNo: '', batchNo: '', manufacturer: '', safeStock: 10, location: '', remark: '' })
const inventoryList = ref([
  { id: 1, code: 'RG20240001', name: '无水乙醇', brand: '国药', productNo: '10009259', category: 'organic', categoryName: '有机溶剂', cas: '64-17-5', spec: '500mL', unit: '瓶', stock: 50, safeStock: 20, batchNo: 'B20240115001', location: 'room', locationName: '常温库房', expiryDate: '2025-12-31', price: 35, status: 'normal', statusName: '正常' },
  { id: 2, code: 'RG20240002', name: '甲醇(色谱纯)', brand: 'Fisher', productNo: 'A452-4', category: 'organic', categoryName: '有机溶剂', cas: '67-56-1', spec: '4L', unit: '瓶', stock: 8, safeStock: 10, batchNo: 'B20240108002', location: 'room', locationName: '常温库房', expiryDate: '2025-06-30', price: 280, status: 'low', statusName: '库存不足' },
  { id: 3, code: 'RG20240003', name: '浓硫酸', brand: '国药', productNo: '10021618', category: 'hazardous', categoryName: '危险化学品', cas: '7664-93-9', spec: '2.5L', unit: '瓶', stock: 12, safeStock: 5, batchNo: 'B20231220003', location: 'hazard', locationName: '危化品库', expiryDate: '2026-12-31', price: 85, status: 'normal', statusName: '正常' },
  { id: 4, code: 'RG20240004', name: 'Tris缓冲液', brand: 'Sigma', productNo: 'T1503', category: 'biochem', categoryName: '生化试剂', cas: '77-86-1', spec: '500g', unit: '瓶', stock: 3, safeStock: 5, batchNo: 'B20231201004', location: 'cold', locationName: '冷藏库', expiryDate: '2024-12-31', price: 520, status: 'expiring', statusName: '即将过期' },
  { id: 5, code: 'RG20240005', name: '农药残留标准品套装', brand: 'Supelco', productNo: '48599', category: 'standard', categoryName: '标准品', cas: '-', spec: '1套', unit: '套', stock: 2, safeStock: 2, batchNo: 'B20231115005', location: 'frozen', locationName: '冷冻库', expiryDate: '2025-03-15', price: 8500, status: 'normal', statusName: '正常' }
])
const totalValue = computed(() => inventoryList.value.reduce((sum, item) => sum + item.stock * item.price, 0))
const getStatusType = (status: string) => { const m: Record<string, string> = { normal: 'success', low: 'warning', expiring: 'danger', expired: 'danger' }; return m[status] || 'info' }
const getRowClass = ({ row }: any) => row.status === 'low' || row.status === 'expiring' ? 'warning-row' : row.status === 'expired' ? 'danger-row' : ''
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', category: '', status: '', location: '' }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { code: '', name: '', category: '', cas: '', spec: '', unit: '', brand: '', manufacturer: '', safeStock: 10, location: '', remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看试剂详情：${row.name}`)
const handleInbound = (row: any) => ElMessage.success(`进入${row.name}入库页面`)
const handleOutbound = (row: any) => ElMessage.success(`进入${row.name}出库页面`)
const handleExport = () => ElMessage.success('导出成功')
const handleStocktaking = () => ElMessage.success('进入库存盘点')
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.inventory-page { height: 100%; }.stats-cards { display: flex; gap: 20px; margin-bottom: 20px; }.stat-card { flex: 1; }.stat-card.warning { border-left: 4px solid #E6A23C; }.stat-card.danger { border-left: 4px solid #F56C6C; }.stat-card.info { border-left: 4px solid #409EFF; }.stat-content { display: flex; flex-direction: column; align-items: center; padding: 10px; }.stat-value { font-size: 28px; font-weight: bold; }.stat-label { font-size: 14px; color: #909399; }.text-danger { color: #F56C6C; font-weight: bold; }:deep(.warning-row) { background-color: #fdf6ec !important; }:deep(.danger-row) { background-color: #fef0f0 !important; }</style>
