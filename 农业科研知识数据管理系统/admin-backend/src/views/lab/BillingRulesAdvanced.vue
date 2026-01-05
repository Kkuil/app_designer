<template>
    <div class="billing-rules-advanced-page">
        <!-- 规则列表 -->
        <el-card class="list-card">
            <template #header>
                <div class="card-header">
                    <span>计费规则管理</span>
                    <el-button type="primary" @click="handleAddRule">
                        <el-icon>
                            <Plus />
                        </el-icon>新增计费规则
                    </el-button>
                </div>
            </template>

            <el-table :data="ruleList" stripe border class="rules-table">
                <el-table-column prop="id" label="规则ID" width="100" />
                <el-table-column prop="name" label="规则名称" min-width="150" />
                <el-table-column prop="equipmentName" label="设备" min-width="150" />
                <el-table-column prop="billingType" label="计费方式" width="120">
                    <template #default="{ row }">
                        <el-tag>{{ getBillingTypeLabel(row.billingType) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="startupFee" label="开机费" width="100">
                    <template #default="{ row }">
                        {{ row.hasStartupFee ? `¥${row.startupFee}` : '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="minCharge" label="最低收费" width="100">
                    <template #default="{ row }">
                        ¥{{ row.minCharge }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                    <template #default="{ row }">
                        <el-switch v-model="row.status" :active-value="1" :inactive-value="0"
                            @change="handleStatusChange(row)" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link size="small" @click="handleEditRule(row)">
                            编辑
                        </el-button>
                        <el-button type="info" link size="small" @click="handleViewRule(row)">
                            详情
                        </el-button>
                        <el-button type="danger" link size="small" @click="handleDeleteRule(row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 规则编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑计费规则' : '新增计费规则'" width="800px"
            @close="handleDialogClose">
            <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="140px" scroll-to-error>
                <!-- 基础信息 -->
                <el-form-item label="规则名称" prop="name">
                    <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
                </el-form-item>

                <el-form-item label="关联设备" prop="equipmentId">
                    <el-select v-model="ruleForm.equipmentId" placeholder="请选择设备">
                        <el-option v-for="eq in equipmentList" :key="eq.id" :label="eq.name" :value="eq.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="计费方式" prop="billingType">
                    <el-select v-model="ruleForm.billingType" placeholder="请选择计费方式" @change="handleBillingTypeChange">
                        <el-option label="智能计费" value="smart" />
                        <el-option label="时长计费" value="duration" />
                        <el-option label="使用次数计费" value="usage_count" />
                        <el-option label="送样数量计费" value="sample_qty" />
                        <el-option label="阶梯式计费" value="tiered" />
                    </el-select>
                </el-form-item>

                <!-- 开机费配置 -->
                <el-form-item label="是否收取开机费">
                    <el-switch v-model="ruleForm.hasStartupFee" />
                </el-form-item>

                <el-form-item v-if="ruleForm.hasStartupFee" label="开机费(元)" prop="startupFee">
                    <el-input-number v-model="ruleForm.startupFee" :min="0" :precision="2" placeholder="请输入开机费" />
                </el-form-item>

                <el-form-item label="最低收费(元)" prop="minCharge">
                    <el-input-number v-model="ruleForm.minCharge" :min="0" :precision="2" placeholder="请输入最低收费" />
                </el-form-item>

                <!-- 根据计费方式显示不同的配置 -->
                <el-divider>计费方式配置</el-divider>

                <!-- 智能计费配置 -->
                <template v-if="ruleForm.billingType === 'smart'">
                    <el-form-item label="小时费率(元/h)" prop="pricingConfig.hourlyRate">
                        <el-input-number v-model="ruleForm.pricingConfig.hourlyRate" :min="0" :precision="2"
                            placeholder="请输入小时费率" />
                    </el-form-item>
                    <el-form-item label="次数费率(元/次)" prop="pricingConfig.countRate">
                        <el-input-number v-model="ruleForm.pricingConfig.countRate" :min="0" :precision="2"
                            placeholder="请输入次数费率" />
                    </el-form-item>
                    <el-form-item label="样品费率(元/份)" prop="pricingConfig.sampleRate">
                        <el-input-number v-model="ruleForm.pricingConfig.sampleRate" :min="0" :precision="2"
                            placeholder="请输入样品费率" />
                    </el-form-item>
                </template>

                <!-- 时长计费配置 -->
                <template v-else-if="ruleForm.billingType === 'duration'">
                    <el-form-item label="小时费率(元/h)" prop="pricingConfig.hourlyRate">
                        <el-input-number v-model="ruleForm.pricingConfig.hourlyRate" :min="0" :precision="2"
                            placeholder="请输入小时费率" />
                    </el-form-item>
                    <el-form-item label="最小计费时长(小时)" prop="pricingConfig.minDuration">
                        <el-input-number v-model="ruleForm.pricingConfig.minDuration" :min="0" :precision="2"
                            placeholder="如：0.5表示最少按半小时计费" />
                    </el-form-item>
                    <el-form-item label="超时加收比例(%)" prop="pricingConfig.overstayRate">
                        <el-input-number v-model="ruleForm.pricingConfig.overstayRate" :min="0" :precision="0"
                            placeholder="请输入超时加收比例" />
                    </el-form-item>
                </template>

                <!-- 使用次数计费配置 -->
                <template v-else-if="ruleForm.billingType === 'usage_count'">
                    <el-form-item label="每次费用(元)" prop="pricingConfig.perUseRate">
                        <el-input-number v-model="ruleForm.pricingConfig.perUseRate" :min="0" :precision="2"
                            placeholder="请输入每次费用" />
                    </el-form-item>
                    <el-form-item label="批量计费阈值(次)">
                        <el-input-number v-model="ruleForm.pricingConfig.bulkThreshold" :min="0"
                            placeholder="超过此次数后使用批量费率" />
                    </el-form-item>
                    <el-form-item label="批量费率(元/次)">
                        <el-input-number v-model="ruleForm.pricingConfig.bulkRate" :min="0" :precision="2"
                            placeholder="批量使用时的费率" />
                    </el-form-item>
                </template>

                <!-- 送样数量计费配置 -->
                <template v-else-if="ruleForm.billingType === 'sample_qty'">
                    <el-form-item label="每份样品费用(元)" prop="pricingConfig.perSampleRate">
                        <el-input-number v-model="ruleForm.pricingConfig.perSampleRate" :min="0" :precision="2"
                            placeholder="请输入每份样品费用" />
                    </el-form-item>
                    <el-form-item label="批量计费阈值(份)">
                        <el-input-number v-model="ruleForm.pricingConfig.bulkThreshold" :min="0"
                            placeholder="超过此数量后使用批量费率" />
                    </el-form-item>
                    <el-form-item label="批量费率(元/份)">
                        <el-input-number v-model="ruleForm.pricingConfig.bulkRate" :min="0" :precision="2"
                            placeholder="批量样品时的费率" />
                    </el-form-item>
                </template>

                <!-- 阶梯式计费配置 -->
                <template v-else-if="ruleForm.billingType === 'tiered'">
                    <el-form-item label="阶梯单位">
                        <el-select v-model="ruleForm.pricingConfig.unit">
                            <el-option label="小时(h)" value="h" />
                            <el-option label="次数(count)" value="count" />
                            <el-option label="样品数(qty)" value="qty" />
                        </el-select>
                    </el-form-item>

                    <div class="tiered-section">
                        <div class="tiered-header">
                            <span>价格阶梯配置</span>
                            <el-button type="primary" size="small" @click="addTier">
                                <el-icon>
                                    <Plus />
                                </el-icon>添加阶梯
                            </el-button>
                        </div>

                        <el-table :data="ruleForm.pricingConfig.tiers" stripe border class="tiered-table">
                            <el-table-column label="下限" width="100">
                                <template #default="{ row, $index }">
                                    <el-input-number v-model="row.minValue" :min="0" :precision="2"
                                        class="tier-input" />
                                </template>
                            </el-table-column>
                            <el-table-column label="上限" width="100">
                                <template #default="{ row, $index }">
                                    <el-input-number v-model="row.maxValue" :min="-1" :precision="2"
                                        placeholder="-1表示无上限" class="tier-input" />
                                </template>
                            </el-table-column>
                            <el-table-column label="价格" width="100">
                                <template #default="{ row, $index }">
                                    <el-input-number v-model="row.price" :min="0" :precision="2" class="tier-input" />
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="80">
                                <template #default="{ row, $index }">
                                    <el-button type="danger" link size="small" @click="removeTier($index)">
                                        删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </template>

                <!-- 用户类型差异化定价 -->
                <el-divider>用户类型差异化定价</el-divider>

                <div class="user-type-section">
                    <div class="user-type-header">
                        <span>按用户类型设置不同价格</span>
                        <el-button type="primary" size="small" @click="addUserTypeRule">
                            <el-icon>
                                <Plus />
                            </el-icon>添加用户类型
                        </el-button>
                    </div>

                    <el-table :data="ruleForm.userTypeRules" stripe border class="user-type-table">
                        <el-table-column label="用户类型" width="120">
                            <template #default="{ row, $index }">
                                <el-select v-model="row.userType" placeholder="请选择">
                                    <el-option label="内部用户" value="internal" />
                                    <el-option label="外部用户" value="external" />
                                    <el-option label="合作单位" value="partner" />
                                    <el-option label="学生" value="student" />
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="价格系数(折扣)" width="150">
                            <template #default="{ row, $index }">
                                <el-input-number v-model="row.coefficient" :min="0" :max="1" :step="0.05" :precision="2"
                                    placeholder="0.8表示8折" />
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                            <template #default="{ row, $index }">
                                <el-button type="danger" link size="small" @click="removeUserTypeRule($index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 优惠规则 -->
                <el-divider>优惠规则</el-divider>

                <div class="discount-section">
                    <div class="discount-header">
                        <span>配置优惠策略</span>
                        <el-button type="primary" size="small" @click="addDiscount">
                            <el-icon>
                                <Plus />
                            </el-icon>添加优惠
                        </el-button>
                    </div>

                    <el-table :data="ruleForm.discounts" stripe border class="discount-table">
                        <el-table-column label="优惠类型" width="100">
                            <template #default="{ row, $index }">
                                <el-select v-model="row.type" placeholder="请选择">
                                    <el-option label="批量优惠" value="bulk" />
                                    <el-option label="忠诚度优惠" value="loyalty" />
                                    <el-option label="季节性优惠" value="seasonal" />
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="优惠名称" width="120">
                            <template #default="{ row, $index }">
                                <el-input v-model="row.name" placeholder="如：50小时优惠" size="small" />
                            </template>
                        </el-table-column>
                        <el-table-column label="触发条件" width="120">
                            <template #default="{ row, $index }">
                                <el-input-number v-model="row.condition" :min="0" placeholder="50" size="small" />
                            </template>
                        </el-table-column>
                        <el-table-column label="条件单位" width="100">
                            <template #default="{ row, $index }">
                                <el-select v-model="row.conditionUnit" placeholder="h">
                                    <el-option label="小时(h)" value="h" />
                                    <el-option label="次数" value="count" />
                                    <el-option label="样品(份)" value="qty" />
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="优惠比例(%)" width="120">
                            <template #default="{ row, $index }">
                                <el-input-number v-model="row.discountPercent" :min="0" :max="100" placeholder="10"
                                    size="small" />
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                            <template #default="{ row, $index }">
                                <el-button type="danger" link size="small" @click="removeDiscount($index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <el-form-item label="备注" prop="remark">
                    <el-input v-model="ruleForm.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
                <el-button type="info" @click="handlePreview">预览计费</el-button>
            </template>
        </el-dialog>

        <!-- 规则详情对话框 -->
        <el-dialog v-model="detailDialogVisible" title="规则详情" width="700px">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="规则名称">
                    {{ currentRule?.name }}
                </el-descriptions-item>
                <el-descriptions-item label="设备">
                    {{ currentRule?.equipmentName }}
                </el-descriptions-item>
                <el-descriptions-item label="计费方式" :span="2">
                    {{ getBillingTypeLabel(currentRule?.billingType) }}
                </el-descriptions-item>
                <el-descriptions-item label="开机费" :span="2">
                    {{ currentRule?.hasStartupFee ? `¥${currentRule.startupFee}` : '无' }}
                </el-descriptions-item>
                <el-descriptions-item label="最低收费" :span="2">
                    ¥{{ currentRule?.minCharge }}
                </el-descriptions-item>
                <el-descriptions-item label="状态" :span="2">
                    <el-tag :type="currentRule?.status === 1 ? 'success' : 'danger'">
                        {{ currentRule?.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                </el-descriptions-item>
            </el-descriptions>
        </el-dialog>

        <!-- 计费预览对话框 -->
        <el-dialog v-model="previewDialogVisible" title="计费预览" width="600px">
            <el-form :model="previewForm" label-width="120px">
                <el-form-item label="用户类型">
                    <el-select v-model="previewForm.userType">
                        <el-option label="内部用户" value="internal" />
                        <el-option label="外部用户" value="external" />
                        <el-option label="合作单位" value="partner" />
                    </el-select>
                </el-form-item>

                <template v-if="['duration', 'smart', 'tiered'].includes(ruleForm.billingType)">
                    <el-form-item label="使用时长(小时)">
                        <el-input-number v-model="previewForm.duration" :min="0" :precision="2" placeholder="请输入时长" />
                    </el-form-item>
                </template>

                <template v-if="['usage_count', 'smart'].includes(ruleForm.billingType)">
                    <el-form-item label="使用次数">
                        <el-input-number v-model="previewForm.usageCount" :min="0" placeholder="请输入次数" />
                    </el-form-item>
                </template>

                <template v-if="['sample_qty', 'smart'].includes(ruleForm.billingType)">
                    <el-form-item label="样品数量(份)">
                        <el-input-number v-model="previewForm.sampleQuantity" :min="0" placeholder="请输入数量" />
                    </el-form-item>
                </template>

                <el-button type="primary" @click="calculatePreview">计算费用</el-button>
            </el-form>

            <div v-if="previewResult" class="preview-result">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="开机费">
                        ¥{{ previewResult.startupFee.toFixed(2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="使用费">
                        ¥{{ previewResult.usageCharge.toFixed(2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="优惠">
                        -¥{{ previewResult.totalDiscount.toFixed(2) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="应付金额" class="amount-item">
                        <span class="amount">¥{{ previewResult.totalCharge.toFixed(2) }}</span>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 数据
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const isEdit = ref(false)
const ruleFormRef = ref()

const equipmentList = ref([
    { id: 'eq001', name: '高效液相色谱仪' },
    { id: 'eq002', name: '紫外可见分光光度计' },
    { id: 'eq003', name: '气相色谱质谱联用仪' },
    { id: 'eq004', name: '质谱仪' }
])

const ruleList = ref([
    {
        id: 'rule001',
        name: '高效液相色谱仪智能计费',
        equipmentName: '高效液相色谱仪',
        equipmentId: 'eq001',
        billingType: 'smart',
        hasStartupFee: true,
        startupFee: 100,
        minCharge: 50,
        status: 1
    },
    {
        id: 'rule002',
        name: '紫外分光光度计次数计费',
        equipmentName: '紫外可见分光光度计',
        equipmentId: 'eq002',
        billingType: 'usage_count',
        hasStartupFee: false,
        startupFee: 0,
        minCharge: 30,
        status: 1
    }
])

const currentRule = ref(null)
const previewResult = ref(null)

const ruleForm = reactive({
    name: '',
    equipmentId: '',
    billingType: 'duration',
    hasStartupFee: false,
    startupFee: 0,
    minCharge: 50,
    pricingConfig: {
        type: 'duration',
        hourlyRate: 100,
        minDuration: 0.5,
        overstayRate: 50,
        countRate: 50,
        sampleRate: 20,
        perUseRate: 50,
        perSampleRate: 20,
        tiers: [],
        unit: 'h'
    },
    userTypeRules: [],
    discounts: [],
    remark: ''
})

const previewForm = reactive({
    userType: 'external',
    duration: 5,
    usageCount: 0,
    sampleQuantity: 0
})

const rules = {
    name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
    equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }],
    billingType: [{ required: true, message: '请选择计费方式', trigger: 'change' }],
    startupFee: [{ required: true, message: '请输入开机费', trigger: 'blur' }],
    minCharge: [{ required: true, message: '请输入最低收费', trigger: 'blur' }]
}

// 方法
const getBillingTypeLabel = (type) => {
    const labels = {
        smart: '智能计费',
        duration: '时长计费',
        usage_count: '使用次数计费',
        sample_qty: '送样数量计费',
        tiered: '阶梯式计费'
    }
    return labels[type] || type
}

const handleAddRule = () => {
    isEdit.value = false
    resetForm()
    dialogVisible.value = true
}

const handleEditRule = (row) => {
    isEdit.value = true
    Object.assign(ruleForm, row)
    dialogVisible.value = true
}

const handleViewRule = (row) => {
    currentRule.value = row
    detailDialogVisible.value = true
}

const handleDeleteRule = (row) => {
    ElMessageBox.confirm(`确定删除规则"${row.name}"吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const index = ruleList.value.findIndex(r => r.id === row.id)
        if (index > -1) {
            ruleList.value.splice(index, 1)
            ElMessage.success('删除成功')
        }
    }).catch(() => { })
}

const handleStatusChange = (row) => {
    ElMessage.success(`规则"${row.name}"已${row.status === 1 ? '启用' : '禁用'}`)
}

const handleBillingTypeChange = () => {
    // 重置特定的计费配置
    ruleForm.pricingConfig.tiers = []
}

const handleDialogClose = () => {
    resetForm()
}

const resetForm = () => {
    ruleForm.name = ''
    ruleForm.equipmentId = ''
    ruleForm.billingType = 'duration'
    ruleForm.hasStartupFee = false
    ruleForm.startupFee = 0
    ruleForm.minCharge = 50
    ruleForm.pricingConfig = {
        type: 'duration',
        hourlyRate: 100,
        minDuration: 0.5,
        overstayRate: 50,
        countRate: 50,
        sampleRate: 20,
        perUseRate: 50,
        perSampleRate: 20,
        tiers: [],
        unit: 'h'
    }
    ruleForm.userTypeRules = []
    ruleForm.discounts = []
    ruleForm.remark = ''
}

const addTier = () => {
    ruleForm.pricingConfig.tiers.push({
        minValue: 0,
        maxValue: 10,
        price: 100,
        unit: ruleForm.pricingConfig.unit
    })
}

const removeTier = (index) => {
    ruleForm.pricingConfig.tiers.splice(index, 1)
}

const addUserTypeRule = () => {
    ruleForm.userTypeRules.push({
        userType: 'external',
        coefficient: 1,
        discountPercent: 0
    })
}

const removeUserTypeRule = (index) => {
    ruleForm.userTypeRules.splice(index, 1)
}

const addDiscount = () => {
    ruleForm.discounts.push({
        type: 'bulk',
        name: '',
        condition: 50,
        conditionUnit: 'h',
        discountPercent: 10,
        active: true
    })
}

const removeDiscount = (index) => {
    ruleForm.discounts.splice(index, 1)
}

const handleSubmit = () => {
    ruleFormRef.value?.validate((valid) => {
        if (valid) {
            ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
            dialogVisible.value = false
        }
    })
}

const handlePreview = () => {
    previewResult.value = null
    previewDialogVisible.value = true
}

const calculatePreview = () => {
    // 这里应该调用后端API计算费用
    previewResult.value = {
        startupFee: ruleForm.hasStartupFee ? ruleForm.startupFee : 0,
        usageCharge: 500,
        userTypeDiscount: 50,
        otherDiscount: 0,
        totalDiscount: 50,
        totalCharge: 450
    }
    ElMessage.success('计算完成')
}
</script>

<style scoped>
.billing-rules-advanced-page {
    padding: 20px;
}

.list-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.rules-table {
    width: 100%;
}

.tiered-section,
.user-type-section,
.discount-section {
    margin: 20px 0;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
}

.tiered-header,
.user-type-header,
.discount-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-weight: bold;
}

.tiered-table,
.user-type-table,
.discount-table {
    width: 100%;
}

.tier-input {
    width: 100%;
}

.preview-result {
    margin-top: 20px;
    padding: 15px;
    background: #f0f9ff;
    border-radius: 4px;
}

.amount-item {
    background: #f56c6c;
}

.amount {
    color: white;
    font-size: 18px;
    font-weight: bold;
}
</style>
