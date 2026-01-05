<template>
  <div class="reservation-rules-page">
    <el-card>
      <template #header><div class="card-header"><span>预约规则管理</span><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增规则</el-button></div></template>
      <el-table :data="ruleList" stripe border>
        <el-table-column prop="id" label="规则编号" width="100" />
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="scope" label="适用范围" width="150" />
        <el-table-column prop="description" label="规则说明" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" /></template></el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>预约时间设置</span></template>
      <el-form :model="timeSettings" label-width="150px" style="max-width: 600px">
        <el-form-item label="开放预约时间"><el-time-picker v-model="timeSettings.openTime" is-range range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item label="提前预约天数"><el-input-number v-model="timeSettings.advanceDays" :min="1" :max="30" /><span style="margin-left: 10px">天（用户最多可提前多少天预约）</span></el-form-item>
        <el-form-item label="最短预约时长"><el-input-number v-model="timeSettings.minDuration" :min="0.5" :step="0.5" /><span style="margin-left: 10px">小时</span></el-form-item>
        <el-form-item label="最长预约时长"><el-input-number v-model="timeSettings.maxDuration" :min="1" :max="24" /><span style="margin-left: 10px">小时</span></el-form-item>
        <el-form-item label="每日预约上限"><el-input-number v-model="timeSettings.dailyLimit" :min="1" :max="10" /><span style="margin-left: 10px">次/人</span></el-form-item>
        <el-form-item label="工作日预约"><el-checkbox-group v-model="timeSettings.workdays"><el-checkbox :value="1">周一</el-checkbox><el-checkbox :value="2">周二</el-checkbox><el-checkbox :value="3">周三</el-checkbox><el-checkbox :value="4">周四</el-checkbox><el-checkbox :value="5">周五</el-checkbox><el-checkbox :value="6">周六</el-checkbox><el-checkbox :value="0">周日</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSaveTime">保存设置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>取消规则设置</span></template>
      <el-form :model="cancelSettings" label-width="180px" style="max-width: 650px">
        <el-form-item label="允许取消预约"><el-switch v-model="cancelSettings.allowCancel" /></el-form-item>
        <el-form-item label="取消时间限制"><span>预约开始前 </span><el-input-number v-model="cancelSettings.cancelHours" :min="0" :max="48" /><span> 小时可取消</span></el-form-item>
        <el-form-item label="爽约惩罚"><el-switch v-model="cancelSettings.penaltyEnabled" /></el-form-item>
        <el-form-item label="爽约次数限制" v-if="cancelSettings.penaltyEnabled"><span>累计爽约 </span><el-input-number v-model="cancelSettings.maxNoShow" :min="1" :max="10" /><span> 次后禁止预约 </span><el-input-number v-model="cancelSettings.banDays" :min="1" :max="30" /><span> 天</span></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSaveCancel">保存设置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="规则名称"><el-input v-model="form.name" placeholder="请输入规则名称" /></el-form-item>
        <el-form-item label="适用范围"><el-select v-model="form.scope" placeholder="请选择" style="width: 100%"><el-option label="全部设备" value="all" /><el-option label="大型仪器" value="large" /><el-option label="常规仪器" value="regular" /><el-option label="指定设备" value="specific" /></el-select></el-form-item>
        <el-form-item label="规则类型"><el-select v-model="form.type" placeholder="请选择" style="width: 100%"><el-option label="时间限制" value="time" /><el-option label="权限限制" value="permission" /><el-option label="数量限制" value="quantity" /><el-option label="审批规则" value="approval" /></el-select></el-form-item>
        <el-form-item label="规则说明"><el-input v-model="form.description" type="textarea" rows="4" placeholder="请详细描述规则内容" /></el-form-item>
        <el-form-item label="优先级"><el-input-number v-model="form.priority" :min="1" :max="100" /></el-form-item>
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
const form = reactive({ name: '', scope: '', type: '', description: '', priority: 1, status: 1 })
const timeSettings = reactive({ openTime: null, advanceDays: 7, minDuration: 1, maxDuration: 8, dailyLimit: 3, workdays: [1, 2, 3, 4, 5] })
const cancelSettings = reactive({ allowCancel: true, cancelHours: 2, penaltyEnabled: true, maxNoShow: 3, banDays: 7 })
const ruleList = ref([
  { id: 'R001', name: '大型仪器需审批', scope: '大型仪器', description: '大型精密仪器预约需经设备负责人审批后方可使用', status: 1, priority: 1 },
  { id: 'R002', name: '新用户培训要求', scope: '全部设备', description: '首次使用某设备的用户需先完成该设备的操作培训', status: 1, priority: 2 },
  { id: 'R003', name: '跨部门使用审批', scope: '全部设备', description: '跨部门使用设备需额外经本部门负责人审批', status: 1, priority: 3 },
  { id: 'R004', name: '周末使用限制', scope: '全部设备', description: '周末使用设备需提前3天申请并经管理员批准', status: 0, priority: 4 },
  { id: 'R005', name: '实习生限制', scope: '大型仪器', description: '实习生不可单独预约大型仪器，需导师陪同', status: 1, priority: 5 }
])
const handleAdd = () => { isEdit.value = false; Object.assign(form, { name: '', scope: '', type: '', description: '', priority: 1, status: 1 }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleStatusChange = (row: any) => ElMessage.success(`规则"${row.name}"已${row.status === 1 ? '启用' : '禁用'}`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除规则"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSaveTime = () => ElMessage.success('预约时间设置已保存')
const handleSaveCancel = () => ElMessage.success('取消规则设置已保存')
</script>
<style scoped>.reservation-rules-page { height: 100%; overflow-y: auto; }.card-header { display: flex; justify-content: space-between; align-items: center; }</style>
