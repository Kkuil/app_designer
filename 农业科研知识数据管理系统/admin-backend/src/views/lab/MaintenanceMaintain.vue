<template>
  <div class="maintenance-maintain-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="设备名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="保养状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="待保养" value="0" /><el-option label="保养中" value="1" /><el-option label="已完成" value="2" /></el-select></el-form-item>
        <el-form-item label="保养时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar">
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增保养记录</el-button>
        <el-button type="warning" @click="handleSchedule"><el-icon><Calendar /></el-icon>保养计划</el-button>
        <el-button type="info" @click="handleCycleSettings"><el-icon><Setting /></el-icon>保养周期设置</el-button>
        <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
      </div>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="记录编号" width="100" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="equipmentCode" label="设备编号" width="120" />
        <el-table-column prop="cycleType" label="保养周期" width="100">
          <template #default="{ row }"><el-tag size="small">{{ row.cycleType }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="content" label="保养内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="maintainer" label="保养人员" width="100" />
        <el-table-column prop="planDate" label="计划时间" width="100" />
        <el-table-column prop="actualDate" label="实际时间" width="100" />
        <el-table-column prop="cost" label="费用(元)" width="90" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button type="warning" link size="small" @click="handleEdit(row)" v-if="row.status !== 2">编辑</el-button><el-button type="success" link size="small" @click="handleComplete(row)" v-if="row.status === 1">完成</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <!-- 保养周期设置对话框 -->
    <el-dialog v-model="cycleDialogVisible" title="保养周期设置" width="800px">
      <el-alert title="设定仪器的保养周期以及初次启用时间，系统会根据时间进行提醒。支持自定义设置提醒规则。" type="info" style="margin-bottom: 20px" :closable="false" />
      <el-table :data="cycleSettings" stripe border>
        <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
        <el-table-column prop="equipmentCode" label="设备编号" width="120" />
        <el-table-column prop="firstUseDate" label="初次启用日期" width="120" />
        <el-table-column prop="cycleValue" label="保养周期(天)" width="120">
          <template #default="{ row }"><el-input-number v-model="row.cycleValue" :min="1" size="small" style="width: 100px" /></template>
        </el-table-column>
        <el-table-column prop="remindDays" label="提前提醒(天)" width="120">
          <template #default="{ row }"><el-input-number v-model="row.remindDays" :min="1" size="small" style="width: 100px" /></template>
        </el-table-column>
        <el-table-column prop="remindMethod" label="提醒方式" width="150">
          <template #default="{ row }">
            <el-select v-model="row.remindMethod" placeholder="选择" size="small" style="width: 130px">
              <el-option label="站内消息" value="message" />
              <el-option label="邮件通知" value="email" />
              <el-option label="短信提醒" value="sms" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="nextMaintenance" label="下次保养时间" width="120" />
      </el-table>
      <template #footer><el-button @click="cycleDialogVisible = false">取消</el-button><el-button type="primary" @click="handleSaveCycle">保存</el-button></template>
    </el-dialog>
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑保养记录' : '新增保养记录'" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择设备"><el-select v-model="form.equipmentId" placeholder="请选择设备" style="width: 100%" filterable><el-option label="高效液相色谱仪 (EQ20240001)" value="1" /><el-option label="气相色谱质谱联用仪 (EQ20240002)" value="2" /><el-option label="紫外可见分光光度计 (EQ20240003)" value="3" /><el-option label="原子吸收光谱仪 (EQ20240004)" value="4" /></el-select></el-form-item>
        <el-form-item label="保养类型"><el-select v-model="form.cycleType" placeholder="请选择" style="width: 100%"><el-option label="日常保养" value="daily" /><el-option label="周保养" value="weekly" /><el-option label="月度保养" value="monthly" /><el-option label="季度保养" value="quarterly" /><el-option label="年度保养" value="yearly" /></el-select></el-form-item>
        <el-form-item label="保养内容"><el-input v-model="form.content" type="textarea" rows="3" placeholder="请描述保养内容" /></el-form-item>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="保养人员"><el-input v-model="form.maintainer" placeholder="请输入" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="请输入" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="计划时间"><el-date-picker v-model="form.planDate" type="date" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="保养费用"><el-input-number v-model="form.cost" :min="0" :precision="2" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(30), dialogVisible = ref(false), cycleDialogVisible = ref(false), isEdit = ref(false)
const searchForm = reactive({ name: '', status: '', dateRange: null })
const form = reactive({ equipmentId: '', cycleType: '', content: '', maintainer: '', phone: '', planDate: '', cost: 0, remark: '' })
const tableData = ref([
  { id: 'BY20241201', equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', cycleType: '月度保养', content: '清洁色谱柱、更换密封件、检查泵头', maintainer: '张工', planDate: '2024-12-20', actualDate: '2024-12-20', cost: 2000, status: 2, statusName: '已完成' },
  { id: 'BY20241202', equipmentName: '气相色谱质谱联用仪', equipmentCode: 'EQ20240002', cycleType: '季度保养', content: '真空系统检测、离子源清洗', maintainer: '李工', planDate: '2024-12-25', actualDate: '', cost: 3000, status: 0, statusName: '待保养' },
  { id: 'BY20241203', equipmentName: '紫外可见分光光度计', equipmentCode: 'EQ20240003', cycleType: '日常保养', content: '清洁光路、检查灯泡寿命', maintainer: '王工', planDate: '2024-12-22', actualDate: '2024-12-22', cost: 500, status: 1, statusName: '保养中' }
])
const cycleSettings = ref([
  { equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', firstUseDate: '2024-01-15', cycleValue: 30, remindDays: 7, remindMethod: 'message', nextMaintenance: '2025-01-15' },
  { equipmentName: '气相色谱质谱联用仪', equipmentCode: 'EQ20240002', firstUseDate: '2024-03-01', cycleValue: 90, remindDays: 14, remindMethod: 'email', nextMaintenance: '2025-02-01' },
  { equipmentName: '紫外可见分光光度计', equipmentCode: 'EQ20240003', firstUseDate: '2024-02-20', cycleValue: 7, remindDays: 3, remindMethod: 'message', nextMaintenance: '2024-12-26' },
  { equipmentName: '原子吸收光谱仪', equipmentCode: 'EQ20240004', firstUseDate: '2024-05-10', cycleValue: 60, remindDays: 10, remindMethod: 'sms', nextMaintenance: '2025-01-10' }
])
const getStatusType = (status: number) => { const m: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success' }; return m[status] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { equipmentId: '', cycleType: '', content: '', maintainer: '', phone: '', planDate: '', cost: 0, remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看保养记录：${row.id}`)
const handleComplete = (row: any) => { ElMessageBox.confirm(`确定将保养记录"${row.id}"标记为已完成吗？`, '提示', { type: 'info' }).then(() => { row.status = 2; row.statusName = '已完成'; ElMessage.success('操作成功') }).catch(() => {}) }
const handleSchedule = () => ElMessage.success('打开保养计划')
const handleCycleSettings = () => { cycleDialogVisible.value = true }
const handleSaveCycle = () => { ElMessage.success('保养周期设置已保存'); cycleDialogVisible.value = false }
const handleExport = () => ElMessage.success('导出成功')
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.maintenance-maintain-page { height: 100%; }</style>
