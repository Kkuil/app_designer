<template>
  <div class="reagent-approval-page">
    <el-card>
      <template #header>
        <div class="card-header"><span>审批设置</span><el-button type="primary" @click="handleAddStep"><el-icon><Plus /></el-icon>新增节点</el-button></div>
      </template>
      <el-table :data="steps" stripe border size="small">
        <el-table-column prop="order" label="序号" width="80" />
        <el-table-column prop="name" label="节点名称" width="140" />
        <el-table-column prop="role" label="审批角色" width="160" />
        <el-table-column prop="method" label="审批方式" width="140" />
        <el-table-column prop="sla" label="时效(h)" width="100" />
        <el-table-column label="操作" width="140" fixed="right"><template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 16px">
      <template #header><span>全局设置</span></template>
      <el-form label-width="140px" :model="globalSetting">
        <el-form-item label="启用多级审批"><el-switch v-model="globalSetting.enable" /></el-form-item>
        <el-form-item label="超时自动提醒"><el-switch v-model="globalSetting.remind" /></el-form-item>
        <el-form-item label="超时提醒周期(小时)"><el-input-number v-model="globalSetting.remindHours" :min="1" /></el-form-item>
      </el-form>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="节点名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="审批角色"><el-select v-model="form.role" placeholder="请选择" style="width: 100%"><el-option label="实验室管理员" value="lab_admin" /><el-option label="采购管理员" value="purchase_admin" /><el-option label="分管领导" value="leader" /></el-select></el-form-item>
        <el-form-item label="审批方式"><el-select v-model="form.method" placeholder="请选择" style="width: 100%"><el-option label="会签" value="countersign" /><el-option label="或签" value="orsign" /></el-select></el-form-item>
        <el-form-item label="时效(小时)"><el-input-number v-model="form.sla" :min="1" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const steps = ref([
  { order: 1, name: '实验室确认', role: '实验室管理员', method: '或签', sla: 8 },
  { order: 2, name: '采购审核', role: '采购管理员', method: '会签', sla: 12 },
  { order: 3, name: '领导审批', role: '分管领导', method: '或签', sla: 24 }
])
const globalSetting = reactive({ enable: true, remind: true, remindHours: 4 })
const dialogVisible = ref(false)
const dialogTitle = ref('新增节点')
const form = reactive({ order: 0, name: '', role: '', method: '', sla: 8 })

const handleAddStep = () => { dialogTitle.value = '新增节点'; Object.assign(form, { order: steps.value.length + 1, name: '', role: '', method: '', sla: 8 }); dialogVisible.value = true }
const handleEdit = (row: any) => { dialogTitle.value = '编辑节点'; Object.assign(form, row); dialogVisible.value = true }
const handleDelete = (row: any) => { steps.value = steps.value.filter(s => s.order !== row.order); ElMessage.success('已删除') }
const handleSubmit = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
</script>

<style scoped>
.reagent-approval-page { height: 100%; display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
