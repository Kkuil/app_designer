<template>
  <div class="billing-rules-page">
    <el-card>
      <template #header><div class="card-header"><span>计费规则管理</span><el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增计费规则</el-button></div></template>
      <el-table :data="ruleList" stripe border>
        <el-table-column prop="id" label="规则编号" width="100" />
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="equipmentType" label="适用设备类型" width="130" />
        <el-table-column prop="userType" label="适用用户" width="120" />
        <el-table-column prop="price" label="单价(元/小时)" width="120" />
        <el-table-column prop="minCharge" label="最低收费(元)" width="110" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" /></template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>设备收费标准</span></template>
      <el-table :data="priceList" stripe border>
        <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
        <el-table-column prop="category" label="设备类别" width="120" />
        <el-table-column prop="internalPrice" label="内部价格(元/h)" width="130" />
        <el-table-column prop="externalPrice" label="外部价格(元/h)" width="130" />
        <el-table-column prop="partnerPrice" label="合作单位(元/h)" width="130" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleEditPrice(row)">编辑</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>优惠设置</span></template>
      <el-form :model="discountSettings" label-width="150px" style="max-width: 700px">
        <el-form-item label="是否启用优惠"><el-switch v-model="discountSettings.enabled" /></el-form-item>
        <el-form-item label="内部用户折扣"><el-slider v-model="discountSettings.internalDiscount" :min="50" :max="100" :format-tooltip="(val: number) => `${val}%`" style="width: 300px" /><span style="margin-left: 20px">{{ discountSettings.internalDiscount }}%</span></el-form-item>
        <el-form-item label="学生优惠"><el-slider v-model="discountSettings.studentDiscount" :min="50" :max="100" :format-tooltip="(val: number) => `${val}%`" style="width: 300px" /><span style="margin-left: 20px">{{ discountSettings.studentDiscount }}%</span></el-form-item>
        <el-form-item label="合作单位优惠"><el-slider v-model="discountSettings.partnerDiscount" :min="50" :max="100" :format-tooltip="(val: number) => `${val}%`" style="width: 300px" /><span style="margin-left: 20px">{{ discountSettings.partnerDiscount }}%</span></el-form-item>
        <el-form-item label="批量使用优惠"><el-checkbox v-model="discountSettings.bulkEnabled">启用</el-checkbox><span style="margin-left: 20px">累计使用超过</span><el-input-number v-model="discountSettings.bulkHours" :min="10" :max="100" style="width: 100px; margin: 0 10px" />小时，享受<el-input-number v-model="discountSettings.bulkDiscount" :min="1" :max="50" style="width: 100px; margin: 0 10px" />%优惠</el-form-item>
        <el-form-item><el-button type="primary" @click="handleSaveDiscount">保存设置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑计费规则' : '新增计费规则'" width="600px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="规则名称"><el-input v-model="form.name" placeholder="请输入规则名称" /></el-form-item>
        <el-form-item label="适用设备类型"><el-select v-model="form.equipmentType" placeholder="请选择" style="width: 100%"><el-option label="全部设备" value="all" /><el-option label="大型精密仪器" value="large" /><el-option label="常规分析仪器" value="regular" /><el-option label="专用仪器" value="special" /></el-select></el-form-item>
        <el-form-item label="适用用户类型"><el-select v-model="form.userType" placeholder="请选择" style="width: 100%"><el-option label="全部用户" value="all" /><el-option label="内部用户" value="internal" /><el-option label="外部用户" value="external" /><el-option label="合作单位" value="partner" /></el-select></el-form-item>
        <el-form-item label="单价"><el-input-number v-model="form.price" :min="0" :precision="2" style="width: 200px" /><span style="margin-left: 10px">元/小时</span></el-form-item>
        <el-form-item label="最低收费"><el-input-number v-model="form.minCharge" :min="0" :precision="2" style="width: 200px" /><span style="margin-left: 10px">元</span></el-form-item>
        <el-form-item label="超时加收"><el-input-number v-model="form.overtimeRate" :min="0" :max="200" style="width: 200px" /><span style="margin-left: 10px">%（超时按此比例加收）</span></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const dialogVisible = ref(false), isEdit = ref(false)
const form = reactive({ name: '', equipmentType: '', userType: '', price: 0, minCharge: 0, overtimeRate: 150, status: 1, remark: '' })
const discountSettings = reactive({ enabled: true, internalDiscount: 80, studentDiscount: 70, partnerDiscount: 85, bulkEnabled: true, bulkHours: 50, bulkDiscount: 10 })
const ruleList = ref([
  { id: 'BR001', name: '大型仪器标准计费', equipmentType: '大型精密仪器', userType: '全部用户', price: 200, minCharge: 100, status: 1 },
  { id: 'BR002', name: '常规仪器标准计费', equipmentType: '常规分析仪器', userType: '全部用户', price: 50, minCharge: 25, status: 1 },
  { id: 'BR003', name: '内部用户优惠计费', equipmentType: '全部设备', userType: '内部用户', price: 0, minCharge: 0, status: 1 },
  { id: 'BR004', name: '外部用户标准计费', equipmentType: '全部设备', userType: '外部用户', price: 300, minCharge: 150, status: 1 }
])
const priceList = ref([
  { equipmentName: '高效液相色谱仪', category: '大型精密仪器', internalPrice: 0, externalPrice: 200, partnerPrice: 160 },
  { equipmentName: '气相色谱质谱联用仪', category: '大型精密仪器', internalPrice: 0, externalPrice: 300, partnerPrice: 240 },
  { equipmentName: '紫外可见分光光度计', category: '常规分析仪器', internalPrice: 0, externalPrice: 50, partnerPrice: 40 },
  { equipmentName: '原子吸收光谱仪', category: '大型精密仪器', internalPrice: 0, externalPrice: 250, partnerPrice: 200 },
  { equipmentName: '超速离心机', category: '大型精密仪器', internalPrice: 0, externalPrice: 150, partnerPrice: 120 }
])
const handleAdd = () => { isEdit.value = false; Object.assign(form, { name: '', equipmentType: '', userType: '', price: 0, minCharge: 0, overtimeRate: 150, status: 1, remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleStatusChange = (row: any) => ElMessage.success(`规则"${row.name}"已${row.status === 1 ? '启用' : '禁用'}`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除规则"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleEditPrice = (row: any) => ElMessage.success(`编辑${row.equipmentName}收费标准`)
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSaveDiscount = () => ElMessage.success('优惠设置已保存')
</script>
<style scoped>.billing-rules-page { height: 100%; overflow-y: auto; }.card-header { display: flex; justify-content: space-between; align-items: center; }</style>
