<template>
  <div class="dict-manage-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header><div class="card-header"><span>字典类型</span><el-button type="primary" @click="handleAddType"><el-icon><Plus /></el-icon></el-button></div></template>
          <div class="search-input"><el-input v-model="typeFilter" placeholder="搜索字典类型" prefix-icon="Search" /></div>
          <el-table :data="filteredTypes" stripe border size="small" highlight-current-row @current-change="handleTypeChange">
            <el-table-column prop="name" label="字典名称" min-width="100" />
            <el-table-column prop="type" label="字典类型" min-width="120" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click.stop="handleEditType(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header><div class="card-header"><span>字典数据 - {{ currentType?.name || '请选择' }}</span><el-button type="primary" @click="handleAddData" :disabled="!currentType"><el-icon><Plus /></el-icon>新增</el-button></div></template>
          <el-table :data="dictData" stripe border v-if="currentType">
            <el-table-column prop="sort" label="排序" width="60" />
            <el-table-column prop="label" label="字典标签" min-width="100" />
            <el-table-column prop="value" label="字典值" width="100" />
            <el-table-column prop="cssClass" label="样式" width="80">
              <template #default="{ row }"><el-tag :type="row.cssClass">{{ row.label }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '停用' }}</el-tag></template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditData(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteData(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="请先选择左侧字典类型" />
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="typeDialogVisible" :title="typeDialogTitle" width="500px">
      <el-form :model="typeForm" label-width="100px">
        <el-form-item label="字典名称"><el-input v-model="typeForm.name" placeholder="请输入" /></el-form-item>
        <el-form-item label="字典类型"><el-input v-model="typeForm.type" placeholder="请输入" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="typeForm.status"><el-radio :label="1">正常</el-radio><el-radio :label="0">停用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="typeForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="typeDialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmitType">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="dataDialogVisible" :title="dataDialogTitle" width="500px">
      <el-form :model="dataForm" label-width="100px">
        <el-form-item label="字典标签"><el-input v-model="dataForm.label" placeholder="请输入" /></el-form-item>
        <el-form-item label="字典值"><el-input v-model="dataForm.value" placeholder="请输入" /></el-form-item>
        <el-form-item label="标签样式"><el-select v-model="dataForm.cssClass" style="width: 100%"><el-option label="默认" value="" /><el-option label="主要" value="primary" /><el-option label="成功" value="success" /><el-option label="警告" value="warning" /><el-option label="危险" value="danger" /></el-select></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="dataForm.sort" :min="0" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="dataForm.status"><el-radio :label="1">正常</el-radio><el-radio :label="0">停用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dataDialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmitData">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const typeFilter = ref(''), currentType = ref<any>(null)
const typeDialogVisible = ref(false), dataDialogVisible = ref(false)
const typeDialogTitle = ref('新增字典类型'), dataDialogTitle = ref('新增字典数据')
const typeForm = reactive({ id: 0, name: '', type: '', status: 1, remark: '' })
const dataForm = reactive({ id: 0, label: '', value: '', cssClass: '', sort: 0, status: 1 })
const dictTypes = ref([
  { id: 1, name: '用户性别', type: 'sys_user_sex', status: 1 },
  { id: 2, name: '系统状态', type: 'sys_status', status: 1 },
  { id: 3, name: '设备状态', type: 'equipment_status', status: 1 },
  { id: 4, name: '项目类型', type: 'project_type', status: 1 },
  { id: 5, name: '试剂类型', type: 'reagent_type', status: 1 }
])
const dictDataMap: Record<string, any[]> = {
  'sys_user_sex': [{ id: 1, label: '男', value: '0', cssClass: 'primary', sort: 1, status: 1 }, { id: 2, label: '女', value: '1', cssClass: 'danger', sort: 2, status: 1 }],
  'sys_status': [{ id: 1, label: '正常', value: '1', cssClass: 'success', sort: 1, status: 1 }, { id: 2, label: '停用', value: '0', cssClass: 'danger', sort: 2, status: 1 }],
  'equipment_status': [{ id: 1, label: '正常', value: '1', cssClass: 'success', sort: 1, status: 1 }, { id: 2, label: '维修中', value: '2', cssClass: 'warning', sort: 2, status: 1 }, { id: 3, label: '已报废', value: '3', cssClass: 'danger', sort: 3, status: 1 }]
}
const filteredTypes = computed(() => dictTypes.value.filter(t => t.name.includes(typeFilter.value) || t.type.includes(typeFilter.value)))
const dictData = computed(() => currentType.value ? (dictDataMap[currentType.value.type] || []) : [])
const handleTypeChange = (row: any) => { currentType.value = row }
const handleAddType = () => { typeDialogTitle.value = '新增字典类型'; Object.assign(typeForm, { id: 0, name: '', type: '', status: 1, remark: '' }); typeDialogVisible.value = true }
const handleEditType = (row: any) => { typeDialogTitle.value = '编辑字典类型'; Object.assign(typeForm, row); typeDialogVisible.value = true }
const handleAddData = () => { dataDialogTitle.value = '新增字典数据'; Object.assign(dataForm, { id: 0, label: '', value: '', cssClass: '', sort: 0, status: 1 }); dataDialogVisible.value = true }
const handleEditData = (row: any) => { dataDialogTitle.value = '编辑字典数据'; Object.assign(dataForm, row); dataDialogVisible.value = true }
const handleDeleteData = (row: any) => { ElMessageBox.confirm(`确定删除"${row.label}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleSubmitType = () => { ElMessage.success('保存成功'); typeDialogVisible.value = false }
const handleSubmitData = () => { ElMessage.success('保存成功'); dataDialogVisible.value = false }
</script>
<style scoped>.dict-manage-page { height: 100%; } .card-header { display: flex; justify-content: space-between; align-items: center; } .search-input { margin-bottom: 15px; }</style>
