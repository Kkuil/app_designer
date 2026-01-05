<template>
  <div class="penalty-rules-page">
    <el-card>
      <template #header><div class="card-header"><span>违规惩罚规则</span><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增惩罚规则</el-button></div></template>
      <el-table :data="ruleList" stripe border>
        <el-table-column prop="id" label="规则编号" width="100" />
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="violationType" label="违规类型" width="120"><template #default="{ row }"><el-tag :type="getTypeColor(row.violationType)" size="small">{{ row.violationName }}</el-tag></template></el-table-column>
        <el-table-column prop="penaltyType" label="惩罚方式" width="120" />
        <el-table-column prop="penaltyValue" label="惩罚力度" width="150" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" /></template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>违规记录</span></template>
      <div class="search-bar" style="margin-bottom: 15px">
        <el-form :inline="true">
          <el-form-item label="用户"><el-input v-model="searchForm.user" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="违规类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="爽约" value="noshow" /><el-option label="超时" value="overtime" /><el-option label="损坏设备" value="damage" /><el-option label="违规操作" value="violation" /></el-select></el-form-item>
          <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button></el-form-item>
        </el-form>
      </div>
      <el-table :data="recordList" stripe border>
        <el-table-column prop="id" label="记录编号" width="120" />
        <el-table-column prop="user" label="用户" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="violationType" label="违规类型" width="100"><template #default="{ row }"><el-tag :type="getTypeColor(row.violationType)" size="small">{{ row.violationName }}</el-tag></template></el-table-column>
        <el-table-column prop="equipment" label="相关设备" min-width="150" />
        <el-table-column prop="description" label="违规描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="penalty" label="处罚措施" width="150" />
        <el-table-column prop="recordTime" label="记录时间" width="160" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">{{ row.status === 1 ? '已处理' : '待处理' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleViewRecord(row)">详情</el-button><el-button v-if="row.status === 0" type="success" link size="small" @click="handleProcess(row)">处理</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>违规统计</span></template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-item"><span class="stat-label">本月违规次数</span><span class="stat-value">12</span></div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item"><span class="stat-label">累计违规用户</span><span class="stat-value">8</span></div>
        </el-col>
        <el-col :span="8">
          <div class="stat-item"><span class="stat-label">当前禁止预约用户</span><span class="stat-value">2</span></div>
        </el-col>
      </el-row>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑惩罚规则' : '新增惩罚规则'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="规则名称"><el-input v-model="form.name" placeholder="请输入规则名称" /></el-form-item>
        <el-form-item label="违规类型"><el-select v-model="form.violationType" placeholder="请选择" style="width: 100%"><el-option label="爽约（未按时使用）" value="noshow" /><el-option label="超时使用" value="overtime" /><el-option label="损坏设备" value="damage" /><el-option label="违规操作" value="violation" /><el-option label="未经培训擅自使用" value="unauthorized" /></el-select></el-form-item>
        <el-form-item label="惩罚方式"><el-select v-model="form.penaltyType" placeholder="请选择" style="width: 100%"><el-option label="禁止预约" value="ban" /><el-option label="扣除信用分" value="credit" /><el-option label="经济处罚" value="fine" /><el-option label="通报批评" value="notice" /></el-select></el-form-item>
        <el-form-item label="惩罚力度" v-if="form.penaltyType === 'ban'"><el-input-number v-model="form.banDays" :min="1" :max="365" style="width: 200px" /><span style="margin-left: 10px">天</span></el-form-item>
        <el-form-item label="扣除信用分" v-if="form.penaltyType === 'credit'"><el-input-number v-model="form.creditDeduct" :min="1" :max="100" style="width: 200px" /><span style="margin-left: 10px">分</span></el-form-item>
        <el-form-item label="罚款金额" v-if="form.penaltyType === 'fine'"><el-input-number v-model="form.fineAmount" :min="0" :precision="2" style="width: 200px" /><span style="margin-left: 10px">元</span></el-form-item>
        <el-form-item label="累计触发"><el-checkbox v-model="form.cumulative">同类违规累计达到</el-checkbox><el-input-number v-model="form.cumulativeCount" :min="1" :max="10" style="width: 80px; margin: 0 10px" />次后生效</el-form-item>
        <el-form-item label="规则说明"><el-input v-model="form.description" type="textarea" rows="3" placeholder="请详细描述规则内容" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const dialogVisible = ref(false), isEdit = ref(false)
const searchForm = reactive({ user: '', type: '' })
const form = reactive({ name: '', violationType: '', penaltyType: '', banDays: 7, creditDeduct: 10, fineAmount: 0, cumulative: false, cumulativeCount: 3, description: '', status: 1 })
const ruleList = ref([
  { id: 'PR001', name: '爽约处罚', violationType: 'noshow', violationName: '爽约', penaltyType: '禁止预约', penaltyValue: '7天', status: 1 },
  { id: 'PR002', name: '累计爽约处罚', violationType: 'noshow', violationName: '爽约', penaltyType: '禁止预约', penaltyValue: '累计3次禁止30天', status: 1 },
  { id: 'PR003', name: '超时使用处罚', violationType: 'overtime', violationName: '超时', penaltyType: '扣除信用分', penaltyValue: '每超时1小时扣5分', status: 1 },
  { id: 'PR004', name: '设备损坏赔偿', violationType: 'damage', violationName: '损坏设备', penaltyType: '经济处罚', penaltyValue: '按实际损失赔偿', status: 1 },
  { id: 'PR005', name: '违规操作处罚', violationType: 'violation', violationName: '违规操作', penaltyType: '通报批评', penaltyValue: '全院通报', status: 1 }
])
const recordList = ref([
  { id: 'VR20241222001', user: '张三', department: '研发一部', violationType: 'noshow', violationName: '爽约', equipment: '高效液相色谱仪', description: '预约时间09:00-12:00未到场使用', penalty: '禁止预约7天', recordTime: '2024-12-22 12:30:00', status: 1 },
  { id: 'VR20241221001', user: '李四', department: '研发二部', violationType: 'overtime', violationName: '超时', equipment: '气相色谱质谱联用仪', description: '预约时间14:00-17:00，实际使用至18:30', penalty: '扣除信用分8分', recordTime: '2024-12-21 18:30:00', status: 1 },
  { id: 'VR20241220001', user: '王五', department: '实验中心', violationType: 'violation', violationName: '违规操作', equipment: '紫外可见分光光度计', description: '未按操作规程使用仪器', penalty: '待处理', recordTime: '2024-12-20 15:00:00', status: 0 }
])
const getTypeColor = (type: string) => { const m: Record<string, string> = { noshow: 'warning', overtime: 'primary', damage: 'danger', violation: 'danger', unauthorized: 'danger' }; return m[type] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleAdd = () => { isEdit.value = false; Object.assign(form, { name: '', violationType: '', penaltyType: '', banDays: 7, creditDeduct: 10, fineAmount: 0, cumulative: false, cumulativeCount: 3, description: '', status: 1 }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleStatusChange = (row: any) => ElMessage.success(`规则"${row.name}"已${row.status === 1 ? '启用' : '禁用'}`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除规则"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleViewRecord = (row: any) => ElMessage.success(`查看违规记录：${row.id}`)
const handleProcess = (row: any) => { ElMessageBox.confirm(`确定处理违规记录"${row.id}"吗？`, '确认', { type: 'info' }).then(() => { row.status = 1; ElMessage.success('处理成功') }).catch(() => {}) }
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
</script>
<style scoped>.penalty-rules-page { height: 100%; overflow-y: auto; }.card-header { display: flex; justify-content: space-between; align-items: center; }.stat-item { text-align: center; padding: 20px; }.stat-label { display: block; font-size: 14px; color: #909399; margin-bottom: 10px; }.stat-value { font-size: 32px; font-weight: bold; color: #303133; }</style>
