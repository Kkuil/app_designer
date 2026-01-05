<template>
    <div class="billing-calculator-page">
        <el-card class="calculator-card">
            <template #header>
                <span>计费计算器 - 预计费用测算工具</span>
            </template>

            <el-row :gutter="20">
                <!-- 左侧：计费配置选择 -->
                <el-col :span="12">
                    <el-card shadow="hover">
                        <template #header>
                            <span>1. 选择计费规则</span>
                        </template>

                        <el-form :model="calculator" label-width="100px">
                            <el-form-item label="设备">
                                <el-select v-model="calculator.equipmentId" placeholder="请选择设备"
                                    @change="handleEquipmentChange">
                                    <el-option v-for="eq in equipmentOptions" :key="eq.id" :label="eq.name"
                                        :value="eq.id" />
                                </el-select>
                            </el-form-item>

                            <el-form-item label="计费规则" v-if="availableRules.length > 0">
                                <el-select v-model="calculator.ruleId" placeholder="请选择计费规则" @change="handleRuleChange">
                                    <el-option v-for="rule in availableRules" :key="rule.id" :label="rule.name"
                                        :value="rule.id" />
                                </el-select>
                            </el-form-item>

                            <el-form-item label="用户类型">
                                <el-select v-model="calculator.userType" placeholder="请选择用户类型">
                                    <el-option label="内部用户" value="internal" />
                                    <el-option label="外部用户" value="external" />
                                    <el-option label="合作单位" value="partner" />
                                    <el-option label="学生用户" value="student" />
                                </el-select>
                            </el-form-item>

                            <div v-if="currentRule" class="rule-info">
                                <el-alert :title="`当前规则：${currentRule.name}`"
                                    :description="getRuleDescription(currentRule)" type="info" :closable="false" />
                            </div>
                        </el-form>
                    </el-card>

                    <!-- 计费方式说明 -->
                    <el-card shadow="hover" style="margin-top: 20px">
                        <template #header>
                            <span>2. 计费方式说明</span>
                        </template>

                        <div v-if="currentRule" class="billing-guide">
                            <div v-if="currentRule.billingType === 'smart'" class="guide-item">
                                <h4>智能计费</h4>
                                <p>
                                    综合考虑使用时长、使用次数、送样数量等多个因素进行费用计算。
                                </p>
                                <code>费用 = 开机费 + (时长×时长费率) + (次数×次数费率) + (样品×样品费率)</code>
                            </div>

                            <div v-if="currentRule.billingType === 'duration'" class="guide-item">
                                <h4>时长计费</h4>
                                <p>按仪器使用的时长进行计费，最小按最低收费计算。</p>
                                <code>费用 = 开机费 + (时长×单价/小时)，不低于最低收费</code>
                            </div>

                            <div v-if="currentRule.billingType === 'usage_count'" class="guide-item">
                                <h4>使用次数计费</h4>
                                <p>按仪器使用的次数进行计费，每次使用收取固定费用。</p>
                                <code>费用 = 开机费 + (使用次数×每次费用)</code>
                            </div>

                            <div v-if="currentRule.billingType === 'sample_qty'" class="guide-item">
                                <h4>送样数量计费</h4>
                                <p>按提交样品的数量进行计费，支持批量优惠。</p>
                                <code>费用 = 开机费 + (样品数×单位费用)</code>
                            </div>

                            <div v-if="currentRule.billingType === 'tiered'" class="guide-item">
                                <h4>阶梯式计费</h4>
                                <p>根据使用量分为多个阶梯，不同阶梯有不同价格。</p>
                                <code>费用 = 开机费 + 各阶梯分段费用之和</code>
                            </div>

                            <div v-if="currentRule.hasStartupFee" class="startup-fee-notice">
                                <el-alert title="该仪器收取开机费" :description="`每次使用需支付开机费 ¥${currentRule.startupFee}元`"
                                    type="warning" :closable="false" />
                            </div>
                        </div>
                    </el-card>
                </el-col>

                <!-- 右侧：费用计算 -->
                <el-col :span="12">
                    <el-card shadow="hover">
                        <template #header>
                            <span>3. 输入使用情况</span>
                        </template>

                        <el-form :model="calculator" label-width="120px">
                            <!-- 时长输入 -->
                            <template v-if="['duration', 'smart', 'tiered'].includes(calculator.billingType)">
                                <el-form-item label="使用时长(小时)">
                                    <el-input-number v-model="calculator.duration" :min="0" :precision="2" :step="0.5"
                                        placeholder="请输入使用时长" controls-position="right" />
                                </el-form-item>
                                <el-form-item label="预约时长(小时)" v-if="calculator.billingType === 'duration'">
                                    <el-input-number v-model="calculator.reservedDuration" :min="0" :precision="2"
                                        :step="0.5" placeholder="用于计算超时费用" controls-position="right" />
                                </el-form-item>
                            </template>

                            <!-- 次数输入 -->
                            <template v-if="['usage_count', 'smart'].includes(calculator.billingType)">
                                <el-form-item label="使用次数">
                                    <el-input-number v-model="calculator.usageCount" :min="0" :step="1"
                                        placeholder="请输入使用次数" controls-position="right" />
                                </el-form-item>
                            </template>

                            <!-- 样品数量输入 -->
                            <template v-if="['sample_qty', 'smart'].includes(calculator.billingType)">
                                <el-form-item label="送样数量(份)">
                                    <el-input-number v-model="calculator.sampleQuantity" :min="0" :step="1"
                                        placeholder="请输入样品数量" controls-position="right" />
                                </el-form-item>
                            </template>

                            <el-button type="primary" size="large" @click="calculateFee" block>
                                <el-icon>
                                    <Calendar />
                                </el-icon>计算费用
                            </el-button>
                        </el-form>
                    </el-card>

                    <!-- 费用明细 -->
                    <el-card shadow="hover" style="margin-top: 20px">
                        <template #header>
                            <span>4. 费用明细</span>
                        </template>

                        <div v-if="result" class="fee-detail">
                            <el-descriptions :column="1" border>
                                <el-descriptions-item label="开机费" class-name="fee-item">
                                    <span class="fee-amount">¥{{ result.startupFee.toFixed(2) }}</span>
                                </el-descriptions-item>

                                <el-descriptions-item label="使用费" class-name="fee-item">
                                    <span class="fee-amount">¥{{ result.usageCharge.toFixed(2) }}</span>
                                </el-descriptions-item>

                                <el-descriptions-item v-if="result.userTypeDiscount > 0" label="用户类型折扣"
                                    class-name="discount-item">
                                    <span class="discount-amount">-¥{{ result.userTypeDiscount.toFixed(2) }}</span>
                                </el-descriptions-item>

                                <el-descriptions-item v-if="result.otherDiscount > 0" label="其他优惠"
                                    class-name="discount-item">
                                    <span class="discount-amount">-¥{{ result.otherDiscount.toFixed(2) }}</span>
                                </el-descriptions-item>

                                <el-descriptions-item label="合计优惠" class-name="discount-item">
                                    <span class="discount-amount">-¥{{ result.totalDiscount.toFixed(2) }}</span>
                                </el-descriptions-item>

                                <el-descriptions-item label="应付金额" class-name="total-item">
                                    <span class="total-amount">¥{{ result.totalCharge.toFixed(2) }}</span>
                                </el-descriptions-item>
                            </el-descriptions>

                            <!-- 费用说明 -->
                            <el-divider />

                            <div class="fee-description">
                                <h4>计费说明</h4>
                                <pre>{{ result.details?.description }}</pre>
                            </div>

                            <!-- 不同用户类型的对比 -->
                            <el-divider />

                            <div class="user-type-comparison">
                                <h4>不同用户类型价格对比</h4>
                                <el-table :data="userTypeComparison" stripe border size="small">
                                    <el-table-column prop="userType" label="用户类型" width="100" />
                                    <el-table-column prop="discount" label="折扣" width="100" />
                                    <el-table-column prop="amount" label="应付金额" width="100">
                                        <template #default="{ row }">
                                            ¥{{ row.amount.toFixed(2) }}
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>

                        <el-empty v-else description="请点击计算费用按钮查看明细" />
                    </el-card>
                </el-col>
            </el-row>

            <!-- 常见问题 -->
            <el-card shadow="hover" style="margin-top: 20px">
                <template #header>
                    <span>常见问题</span>
                </template>

                <el-collapse>
                    <el-collapse-item title="什么是开机费？" name="1">
                        <p>开机费是使用大型精密仪器时需要支付的一次性费用，不受使用时长影响。开机费主要用于覆盖仪器的启动成本和基础维护费用。</p>
                    </el-collapse-item>
                    <el-collapse-item title="最低收费是什么意思？" name="2">
                        <p>最低收费是指无论实际使用时长或使用次数多少，都需要支付的最低费用。例如最低收费为50元，实际使用费用只有30元，仍需按50元计费。</p>
                    </el-collapse-item>
                    <el-collapse-item title="如何理解阶梯式计费？" name="3">
                        <p>阶梯式计费是指在不同的使用量区间内应用不同的价格。例如：0-10小时每小时200元，10-50小时每小时180元，超过50小时每小时150元。费用按各阶梯分段累加计算。</p>
                    </el-collapse-item>
                    <el-collapse-item title="优惠如何申请？" name="4">
                        <p>系统会根据您的用户类型和累计使用情况自动计算优惠。内部用户、合作单位可享受折扣，大量使用可获得批量优惠。</p>
                    </el-collapse-item>
                    <el-collapse-item title="超时使用如何计费？" name="5">
                        <p>如果实际使用时长超过预约时长，超出部分可能按照更高的倍率收费（如按原价的1.5倍收费）。</p>
                    </el-collapse-item>
                </el-collapse>
            </el-card>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'

// 模拟数据
const equipmentOptions = [
    { id: 'eq001', name: '高效液相色谱仪' },
    { id: 'eq002', name: '紫外可见分光光度计' },
    { id: 'eq003', name: '气相色谱质谱联用仪' },
    { id: 'eq004', name: '质谱仪' }
]

const rulesData = [
    {
        id: 'rule001',
        equipmentId: 'eq001',
        name: '高效液相色谱仪智能计费',
        billingType: 'smart',
        hasStartupFee: true,
        startupFee: 100,
        minCharge: 50,
        pricingConfig: {
            hourlyRate: 200,
            countRate: 50,
            sampleRate: 20
        }
    },
    {
        id: 'rule002',
        equipmentId: 'eq002',
        name: '紫外分光光度计次数计费',
        billingType: 'usage_count',
        hasStartupFee: false,
        startupFee: 0,
        minCharge: 30,
        pricingConfig: {
            perUseRate: 50
        }
    },
    {
        id: 'rule003',
        equipmentId: 'eq003',
        name: '气质联用仪时长计费',
        billingType: 'duration',
        hasStartupFee: true,
        startupFee: 200,
        minCharge: 100,
        pricingConfig: {
            hourlyRate: 300,
            minDuration: 0.5
        }
    },
    {
        id: 'rule004',
        equipmentId: 'eq004',
        name: '质谱仪阶梯计费',
        billingType: 'tiered',
        hasStartupFee: true,
        startupFee: 150,
        minCharge: 100,
        pricingConfig: {
            tiers: [
                { minValue: 0, maxValue: 10, price: 300 },
                { minValue: 10, maxValue: 50, price: 250 },
                { minValue: 50, maxValue: -1, price: 200 }
            ]
        }
    }
]

const calculator = reactive({
    equipmentId: '',
    ruleId: '',
    userType: 'external',
    billingType: '',
    duration: 0,
    reservedDuration: 0,
    usageCount: 0,
    sampleQuantity: 0
})

const result = ref(null)
const currentRule = ref(null)
const userTypeComparison = ref([])

// 计算属性
const availableRules = computed(() => {
    if (!calculator.equipmentId) return []
    return rulesData.filter(r => r.equipmentId === calculator.equipmentId)
})

// 方法
const handleEquipmentChange = () => {
    calculator.ruleId = ''
    currentRule.value = null
}

const handleRuleChange = () => {
    const rule = rulesData.find(r => r.id === calculator.ruleId)
    if (rule) {
        currentRule.value = rule
        calculator.billingType = rule.billingType
        // 重置输入
        calculator.duration = 0
        calculator.usageCount = 0
        calculator.sampleQuantity = 0
    }
}

const getRuleDescription = (rule) => {
    const lines = []
    lines.push(`计费方式：${getBillingTypeLabel(rule.billingType)}`)
    if (rule.hasStartupFee) {
        lines.push(`开机费：¥${rule.startupFee}元`)
    }
    lines.push(`最低收费：¥${rule.minCharge}元`)
    return lines.join('，')
}

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

const calculateFee = () => {
    if (!currentRule.value) {
        ElMessage.warning('请先选择计费规则')
        return
    }

    const rule = currentRule.value

    // 计算开机费
    let startupFee = rule.hasStartupFee ? rule.startupFee : 0

    // 计算使用费
    let usageCharge = 0
    switch (rule.billingType) {
        case 'smart':
            usageCharge =
                (calculator.duration || 0) * rule.pricingConfig.hourlyRate +
                (calculator.usageCount || 0) * rule.pricingConfig.countRate +
                (calculator.sampleQuantity || 0) * rule.pricingConfig.sampleRate
            break

        case 'duration':
            const chargeableDuration = Math.max(
                calculator.duration || 0,
                rule.pricingConfig.minDuration
            )
            usageCharge = chargeableDuration * rule.pricingConfig.hourlyRate
            break

        case 'usage_count':
            usageCharge = (calculator.usageCount || 0) * rule.pricingConfig.perUseRate
            break

        case 'sample_qty':
            usageCharge = (calculator.sampleQuantity || 0) * rule.pricingConfig.perSampleRate
            break

        case 'tiered':
            const quantity = calculator.duration || 0
            let tieredCharge = 0
            for (const tier of rule.pricingConfig.tiers) {
                if (quantity <= tier.minValue) break
                const tierSize = tier.maxValue === -1 ? quantity : tier.maxValue - tier.minValue
                const chargeableInTier = Math.min(quantity - tier.minValue, tierSize)
                tieredCharge += chargeableInTier * tier.price
            }
            usageCharge = tieredCharge
            break
    }

    // 计算用户类型折扣（简化示例）
    const userTypeDiscount =
        calculator.userType === 'external' ? 0 : (startupFee + usageCharge) * 0.1

    let totalCharge = startupFee + usageCharge - userTypeDiscount

    // 应用最低收费
    if (totalCharge < rule.minCharge) {
        totalCharge = rule.minCharge
    }

    result.value = {
        startupFee,
        usageCharge,
        userTypeDiscount,
        otherDiscount: 0,
        totalDiscount: userTypeDiscount,
        totalCharge,
        details: {
            description: generateDescription(rule)
        }
    }

    // 生成用户类型对比
    generateUserTypeComparison(rule)

    ElMessage.success('计算完成')
}

const generateDescription = (rule) => {
    const lines = []
    lines.push(`设备: 高效液相色谱仪`)
    lines.push(`计费方式: ${getBillingTypeLabel(rule.billingType)}`)

    if (result.value.startupFee > 0) {
        lines.push(`开机费: ¥${result.value.startupFee.toFixed(2)}`)
    }

    if (result.value.usageCharge > 0) {
        lines.push(`使用费: ¥${result.value.usageCharge.toFixed(2)}`)
        if (rule.billingType === 'duration') {
            lines.push(`  (${calculator.duration}小时 × ${rule.pricingConfig.hourlyRate}元/小时)`)
        }
    }

    if (result.value.totalDiscount > 0) {
        lines.push(`优惠: -¥${result.value.totalDiscount.toFixed(2)}`)
    }

    lines.push(`---`)
    lines.push(`应付金额: ¥${result.value.totalCharge.toFixed(2)}`)

    return lines.join('\n')
}

const generateUserTypeComparison = (rule) => {
    const userTypes = [
        { type: 'internal', label: '内部用户' },
        { type: 'external', label: '外部用户' },
        { type: 'partner', label: '合作单位' }
    ]

    userTypeComparison.value = userTypes.map(ut => {
        let amount = result.value.startupFee + result.value.usageCharge
        if (ut.type !== 'external') {
            amount *= 0.9 // 内部用户和合作单位享受10%折扣
        }
        if (amount < rule.minCharge) {
            amount = rule.minCharge
        }

        return {
            userType: ut.label,
            discount: ut.type !== 'external' ? '9折' : '无',
            amount
        }
    })
}
</script>

<style scoped>
.billing-calculator-page {
    padding: 20px;
}

.calculator-card {
    width: 100%;
}

.rule-info {
    margin-top: 15px;
}

.billing-guide {
    line-height: 1.8;
}

.guide-item {
    margin-bottom: 15px;
    padding: 10px;
    background: #f5f7fa;
    border-left: 4px solid #409eff;
    border-radius: 4px;
}

.guide-item h4 {
    margin: 0 0 8px 0;
    color: #409eff;
}

.guide-item p {
    margin: 8px 0;
    font-size: 14px;
}

.guide-item code {
    display: block;
    margin-top: 8px;
    padding: 8px;
    background: #fff;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    color: #e6a23c;
    border: 1px solid #f0f0f0;
    overflow-x: auto;
}

.startup-fee-notice {
    margin-top: 10px;
}

.fee-detail {
    width: 100%;
}

.fee-item {
    background: #f0f9ff;
}

.fee-amount {
    font-size: 18px;
    font-weight: bold;
    color: #409eff;
}

.discount-item {
    background: #fef0f0;
}

.discount-amount {
    font-size: 16px;
    color: #f56c6c;
}

.total-item {
    background: #f56c6c;
}

.total-amount {
    font-size: 24px;
    font-weight: bold;
    color: white;
}

.fee-description {
    margin-top: 15px;
}

.fee-description h4 {
    margin: 0 0 10px 0;
}

.fee-description pre {
    background: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
}

.user-type-comparison {
    margin-top: 15px;
}

.user-type-comparison h4 {
    margin: 0 0 10px 0;
}
</style>
