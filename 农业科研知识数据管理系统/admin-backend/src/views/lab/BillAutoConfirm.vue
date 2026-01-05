<template>
  <div class="bill-auto-confirm-page">
    <el-card>
      <template #header><div class="card-header"><span>账单自动确认设置</span></div></template>
      <el-form :model="form" label-width="180px" style="max-width: 750px">
        <el-form-item label="启用自动确认"><el-switch v-model="form.enabled" /><span style="margin-left: 10px; color: #909399">开启后系统将自动确认符合条件的账单</span></el-form-item>
        <el-form-item label="自动确认时间"><el-input-number v-model="form.confirmDays" :min="1" :max="30" style="width: 200px" /><span style="margin-left: 10px">天（账单生成后多少天自动确认）</span></el-form-item>
        <el-form-item label="确认提醒"><el-switch v-model="form.remindEnabled" /><span style="margin-left: 10px; color: #909399">自动确认前发送提醒</span></el-form-item>
        <el-form-item v-if="form.remindEnabled" label="提醒提前天数"><el-input-number v-model="form.remindDays" :min="1" :max="7" style="width: 200px" /><span style="margin-left: 10px">天</span></el-form-item>
        <el-form-item label="金额限制"><el-switch v-model="form.amountLimitEnabled" /><span style="margin-left: 10px; color: #909399">超过限额的账单需人工确认</span></el-form-item>
        <el-form-item v-if="form.amountLimitEnabled" label="金额上限"><el-input-number v-model="form.amountLimit" :min="100" :max="100000" :step="100" style="width: 200px" /><span style="margin-left: 10px">元</span></el-form-item>
        <el-form-item label="适用用户类型">
          <el-checkbox-group v-model="form.userTypes">
            <el-checkbox value="internal">内部用户</el-checkbox>
            <el-checkbox value="external">外部用户</el-checkbox>
            <el-checkbox value="partner">合作单位</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="异常账单处理"><el-radio-group v-model="form.exceptionAction"><el-radio value="manual">转人工处理</el-radio><el-radio value="hold">暂时挂起</el-radio><el-radio value="notify">通知管理员</el-radio></el-radio-group></el-form-item>
        <el-form-item label="确认后自动发送"><el-switch v-model="form.autoSend" /><span style="margin-left: 10px; color: #909399">账单确认后自动发送给用户</span></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSave">保存设置</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><div class="card-header"><span>自动确认统计</span><el-select v-model="statsMonth" placeholder="选择月份" style="width: 150px"><el-option label="2024年12月" value="2024-12" /><el-option label="2024年11月" value="2024-11" /><el-option label="2024年10月" value="2024-10" /></el-select></div></template>
      <div class="stats-cards">
        <div class="stat-card"><div class="stat-value">{{ stats.totalBills }}</div><div class="stat-label">账单总数</div></div>
        <div class="stat-card success"><div class="stat-value">{{ stats.autoConfirmed }}</div><div class="stat-label">自动确认</div></div>
        <div class="stat-card warning"><div class="stat-value">{{ stats.manualConfirmed }}</div><div class="stat-label">人工确认</div></div>
        <div class="stat-card info"><div class="stat-value">{{ stats.pending }}</div><div class="stat-label">待确认</div></div>
      </div>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>自动确认日志</span></template>
      <el-table :data="logList" stripe border>
        <el-table-column prop="time" label="执行时间" width="180" />
        <el-table-column prop="billNo" label="账单编号" width="150" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="amount" label="金额(元)" width="100"><template #default="{ row }">{{ row.amount.toFixed(2) }}</template></el-table-column>
        <el-table-column prop="result" label="执行结果" width="100"><template #default="{ row }"><el-tag :type="row.result === '成功' ? 'success' : row.result === '跳过' ? 'warning' : 'danger'" size="small">{{ row.result }}</el-tag></template></el-table-column>
        <el-table-column prop="reason" label="说明" min-width="200" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
const form = reactive({
  enabled: true, confirmDays: 7, remindEnabled: true, remindDays: 2,
  amountLimitEnabled: true, amountLimit: 10000, userTypes: ['internal', 'partner'],
  exceptionAction: 'notify', autoSend: true
})
const statsMonth = ref('2024-12')
const stats = reactive({ totalBills: 156, autoConfirmed: 128, manualConfirmed: 18, pending: 10 })
const logList = ref([
  { time: '2024-12-25 00:05:00', billNo: 'BILL202412001', userName: '内部用户A', amount: 0, result: '成功', reason: '内部用户免费，金额为0，自动确认' },
  { time: '2024-12-25 00:05:01', billNo: 'BILL202412002', userName: '合作单位B', amount: 8500, result: '成功', reason: '金额在限额内，自动确认' },
  { time: '2024-12-25 00:05:02', billNo: 'BILL202412003', userName: '外部单位C', amount: 15000, result: '跳过', reason: '金额超过限额，转人工处理' },
  { time: '2024-12-25 00:05:03', billNo: 'BILL202412004', userName: '外部用户D', amount: 3200, result: '成功', reason: '符合自动确认条件' },
  { time: '2024-12-24 00:05:00', billNo: 'BILL202412005', userName: '合作单位E', amount: 6800, result: '成功', reason: '符合自动确认条件' }
])
const handleSave = () => ElMessage.success('自动确认设置保存成功')
const handleReset = () => ElMessage.info('已重置设置')
</script>
<style scoped>.bill-auto-confirm-page { height: 100%; overflow-y: auto; }.card-header { display: flex; justify-content: space-between; align-items: center; }.stats-cards { display: flex; gap: 20px; }.stat-card { flex: 1; background: #f5f7fa; border-radius: 8px; padding: 20px; text-align: center; }.stat-card.success { background: #f0f9eb; }.stat-card.warning { background: #fdf6ec; }.stat-card.info { background: #ecf5ff; }.stat-value { font-size: 32px; font-weight: bold; color: #303133; }.stat-label { font-size: 14px; color: #909399; margin-top: 8px; }</style>
