<template>
  <div class="reagent-inbound-page">
    <el-card>
      <template #header>
        <div class="card-header"><span>入库管理</span><el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon>新增入库</el-button></div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="入库单号"><el-input v-model="filters.code" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="供应商"><el-input v-model="filters.supplier" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="待入库" value="pending" /><el-option label="已完成" value="done" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="code" label="入库单号" width="140" />
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="reagentName" label="试剂名称" min-width="150" />
        <el-table-column prop="category" label="物料种类" width="100">
          <template #default="{ row }"><el-tag size="small" :type="getCategoryType(row.category)">{{ row.categoryName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="quantity" label="入库数量" width="90" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="batchNo" label="批号" width="120" />
        <el-table-column prop="expireDate" label="有效期至" width="100" />
        <el-table-column prop="unitPrice" label="单价(¥)" width="90" />
        <el-table-column prop="total" label="总金额(¥)" width="100" />
        <el-table-column prop="statusName" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 'done' ? 'success' : 'warning'" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="date" label="入库日期" width="100" />
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button type="success" link size="small" @click="handleFinish(row)" :disabled="row.status === 'done'">完成</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="新增入库" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="供应商"><el-input v-model="form.supplier" placeholder="请输入" /></el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="试剂名称"><el-input v-model="form.reagentName" placeholder="请输入试剂名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="物料种类"><el-select v-model="form.category" placeholder="请选择" style="width: 100%"><el-option label="化学试剂" value="chemical" /><el-option label="有机溶剂" value="solvent" /><el-option label="生化试剂" value="bio" /><el-option label="危化品" value="hazardous" /><el-option label="实验耗材" value="consumable" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="规格"><el-input v-model="form.spec" placeholder="如 500mL" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="批号"><el-input v-model="form.batchNo" placeholder="请输入批号" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="入库数量"><el-input-number v-model="form.quantity" :min="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="单位"><el-select v-model="form.unit" placeholder="选择" style="width: 100%"><el-option label="瓶" value="瓶" /><el-option label="桶" value="桶" /><el-option label="盒" value="盒" /><el-option label="支" value="支" /><el-option label="包" value="包" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="单价(¥)"><el-input-number v-model="form.unitPrice" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="有效期至"><el-date-picker v-model="form.expireDate" type="date" placeholder="请选择" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="入库日期"><el-date-picker v-model="form.date" type="date" placeholder="请选择" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const filters = reactive({ code: '', supplier: '', status: '' })
const tableData = ref([
  { code: 'RK202412001', supplier: '国药集团', reagentName: '无水乙醇', category: 'chemical', categoryName: '化学试剂', spec: '500mL', quantity: 10, unit: '瓶', batchNo: 'BN2024120101', expireDate: '2026-12-01', unitPrice: 35, total: 350, status: 'pending', statusName: '待入库', date: '2024-12-22' },
  { code: 'RK202412002', supplier: 'Fisher', reagentName: '甲醇(色谱纯)', category: 'solvent', categoryName: '有机溶剂', spec: '4L', quantity: 2, unit: '桶', batchNo: 'BN2024120102', expireDate: '2025-06-15', unitPrice: 280, total: 560, status: 'done', statusName: '已完成', date: '2024-12-20' },
  { code: 'RK202412003', supplier: '西格玛', reagentName: 'Tris缓冲液', category: 'bio', categoryName: '生化试剂', spec: '500g', quantity: 3, unit: '瓶', batchNo: 'BN2024120103', expireDate: '2027-03-20', unitPrice: 520, total: 1560, status: 'done', statusName: '已完成', date: '2024-12-18' },
  { code: 'RK202412004', supplier: '国药集团', reagentName: '硫酸(分析纯)', category: 'hazardous', categoryName: '危化品', spec: '500mL', quantity: 5, unit: '瓶', batchNo: 'BN2024120104', expireDate: '2028-01-01', unitPrice: 45, total: 225, status: 'pending', statusName: '待入库', date: '2024-12-22' }
])
const getCategoryType = (category: string) => {
  const map: Record<string, string> = { chemical: 'primary', solvent: 'info', bio: 'success', hazardous: 'danger', consumable: 'warning' }
  return map[category] || 'info'
}
const dialogVisible = ref(false)
const form = reactive({ supplier: '', reagentName: '', category: '', spec: '', batchNo: '', quantity: 1, unit: '瓶', unitPrice: 0, expireDate: '', date: '', remark: '' })

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { code: '', supplier: '', status: '' }); ElMessage.info('已重置') }
const handleCreate = () => { Object.assign(form, { supplier: '', reagentName: '', category: '', spec: '', batchNo: '', quantity: 1, unit: '瓶', unitPrice: 0, expireDate: '', date: '', remark: '' }); dialogVisible.value = true }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
const handleView = (row: any) => ElMessage.success(`查看入库单 ${row.code}`)
const handleFinish = (row: any) => ElMessage.success(`入库单 ${row.code} 已完成`)
</script>

<style scoped>
.reagent-inbound-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
</style>
