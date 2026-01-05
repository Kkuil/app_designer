<template>
  <div class="auto-confirm-page">
    <el-card>
      <template #header><div class="card-header"><span>上机自动确认设置</span></div></template>
      <el-form :model="form" label-width="180px" style="max-width: 700px">
        <el-form-item label="启用自动确认"><el-switch v-model="form.enabled" /></el-form-item>
        <el-form-item label="确认延迟时间"><el-input-number v-model="form.delayMinutes" :min="0" :max="120" style="width: 200px" /><span style="margin-left: 10px">分钟（上机后多久自动确认）</span></el-form-item>
        <el-form-item label="超时未上机处理"><el-radio-group v-model="form.noShowAction"><el-radio value="cancel">自动取消预约</el-radio><el-radio value="notify">发送提醒通知</el-radio><el-radio value="penalty">按违约处理</el-radio></el-radio-group></el-form-item>
        <el-form-item label="超时等待时间"><el-input-number v-model="form.noShowTimeout" :min="5" :max="60" style="width: 200px" /><span style="margin-left: 10px">分钟</span></el-form-item>
        <el-form-item label="自动下机确认"><el-switch v-model="form.autoEndEnabled" /><span style="margin-left: 10px; color: #909399">预约结束后自动确认下机</span></el-form-item>
        <el-form-item label="下机延迟时间"><el-input-number v-model="form.autoEndDelay" :min="0" :max="30" style="width: 200px" /><span style="margin-left: 10px">分钟</span></el-form-item>
        <el-form-item label="适用设备类型">
          <el-checkbox-group v-model="form.applyTypes">
            <el-checkbox value="large">大型精密仪器</el-checkbox>
            <el-checkbox value="regular">常规分析仪器</el-checkbox>
            <el-checkbox value="special">专用仪器</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="例外设备"><el-select v-model="form.exceptEquipments" multiple filterable placeholder="选择不参与自动确认的设备" style="width: 100%"><el-option v-for="item in equipmentList" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSave">保存设置</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 20px">
      <template #header><span>自动确认日志</span></template>
      <el-table :data="logList" stripe border>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="equipmentName" label="设备名称" width="200" />
        <el-table-column prop="userName" label="预约用户" width="120" />
        <el-table-column prop="action" label="操作类型" width="120"><template #default="{ row }"><el-tag :type="getActionType(row.action)" size="small">{{ row.action }}</el-tag></template></el-table-column>
        <el-table-column prop="result" label="执行结果" width="100"><template #default="{ row }"><el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag></template></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
const form = reactive({
  enabled: true, delayMinutes: 15, noShowAction: 'notify', noShowTimeout: 15, autoEndEnabled: true, autoEndDelay: 5,
  applyTypes: ['large', 'regular', 'special'], exceptEquipments: [] as string[]
})
const equipmentList = ref([
  { id: 'E001', name: '高效液相色谱仪' },
  { id: 'E002', name: '气相色谱质谱联用仪' },
  { id: 'E003', name: '紫外可见分光光度计' },
  { id: 'E004', name: '原子吸收光谱仪' }
])
const logList = ref([
  { time: '2024-12-25 09:15:00', equipmentName: '高效液相色谱仪', userName: '张研究员', action: '自动上机确认', result: '成功', remark: '预约时间09:00，实际上机09:05' },
  { time: '2024-12-25 10:05:00', equipmentName: '紫外可见分光光度计', userName: '李博士', action: '超时取消', result: '成功', remark: '超时15分钟未上机，自动取消' },
  { time: '2024-12-25 11:30:00', equipmentName: '气相色谱质谱联用仪', userName: '王助理', action: '自动下机确认', result: '成功', remark: '预约时间11:00-11:30，按时结束' },
  { time: '2024-12-25 14:20:00', equipmentName: '原子吸收光谱仪', userName: '陈教授', action: '超时提醒', result: '成功', remark: '已发送短信和系统通知' }
])
const getActionType = (action: string) => {
  const map: Record<string, string> = { '自动上机确认': 'success', '自动下机确认': 'success', '超时取消': 'danger', '超时提醒': 'warning' }
  return map[action] || 'info'
}
const handleSave = () => ElMessage.success('自动确认设置保存成功')
const handleReset = () => ElMessage.info('已重置设置')
</script>
<style scoped>.auto-confirm-page { height: 100%; overflow-y: auto; }.card-header { display: flex; justify-content: space-between; align-items: center; }</style>
