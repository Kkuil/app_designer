<template>
  <div class="mode-control-page">
    <div class="header-section">
      <el-alert title="系统运行模式控制中心" description="可以在此切换系统运行模式，不同模式下系统功能和权限会有所不同。请谨慎操作！" type="info" show-icon :closable="false" />
    </div>
    <div class="mode-cards">
      <el-card :class="['mode-card', currentMode === 'normal' ? 'active' : '']" @click="handleSelectMode('normal')">
        <div class="mode-icon"><el-icon :size="48" color="#67C23A"><CircleCheck /></el-icon></div>
        <h3>正常模式</h3>
        <p class="mode-desc">系统正常运行，所有功能模块均可使用</p>
        <ul class="mode-features"><li>✓ 全部功能开放</li><li>✓ 正常权限控制</li><li>✓ 数据实时同步</li><li>✓ 定时任务运行</li></ul>
        <el-tag v-if="currentMode === 'normal'" type="success">当前模式</el-tag>
      </el-card>
      <el-card :class="['mode-card', currentMode === 'maintenance' ? 'active' : '']" @click="handleSelectMode('maintenance')">
        <div class="mode-icon"><el-icon :size="48" color="#E6A23C"><Warning /></el-icon></div>
        <h3>维护模式</h3>
        <p class="mode-desc">系统维护状态，仅管理员可访问</p>
        <ul class="mode-features"><li>✓ 仅管理员登录</li><li>✓ 普通用户提示维护</li><li>✓ 可进行数据维护</li><li>✗ 定时任务暂停</li></ul>
        <el-tag v-if="currentMode === 'maintenance'" type="warning">当前模式</el-tag>
      </el-card>
      <el-card :class="['mode-card', currentMode === 'readonly' ? 'active' : '']" @click="handleSelectMode('readonly')">
        <div class="mode-icon"><el-icon :size="48" color="#909399"><View /></el-icon></div>
        <h3>只读模式</h3>
        <p class="mode-desc">系统只读状态，仅支持查看操作</p>
        <ul class="mode-features"><li>✓ 所有用户可登录</li><li>✓ 仅支持查询操作</li><li>✗ 禁止新增/修改/删除</li><li>✗ 定时任务暂停</li></ul>
        <el-tag v-if="currentMode === 'readonly'" type="info">当前模式</el-tag>
      </el-card>
      <el-card :class="['mode-card', currentMode === 'emergency' ? 'active' : '']" @click="handleSelectMode('emergency')">
        <div class="mode-icon"><el-icon :size="48" color="#F56C6C"><Bell /></el-icon></div>
        <h3>紧急模式</h3>
        <p class="mode-desc">紧急情况下的最小化运行模式</p>
        <ul class="mode-features"><li>✓ 核心功能优先</li><li>✗ 非核心功能关闭</li><li>✗ 外部接口关闭</li><li>✓ 紧急通知开启</li></ul>
        <el-tag v-if="currentMode === 'emergency'" type="danger">当前模式</el-tag>
      </el-card>
    </div>
    <el-card class="settings-card">
      <template #header><span>模式切换设置</span></template>
      <el-form :model="settingsForm" label-width="180px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维护模式提示信息"><el-input v-model="settingsForm.maintenanceMsg" type="textarea" rows="2" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="只读模式提示信息"><el-input v-model="settingsForm.readonlyMsg" type="textarea" rows="2" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="模式切换需要二次确认"><el-switch v-model="settingsForm.confirmRequired" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="自动发送通知"><el-switch v-model="settingsForm.autoNotify" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="通知方式"><el-checkbox-group v-model="settingsForm.notifyMethods"><el-checkbox value="system">系统通知</el-checkbox><el-checkbox value="email">邮件</el-checkbox><el-checkbox value="sms">短信</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSaveSettings">保存设置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="log-card">
      <template #header><span>模式切换记录</span></template>
      <el-table :data="modeLogList" stripe border max-height="300">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="fromMode" label="原模式" width="100" />
        <el-table-column prop="toMode" label="目标模式" width="100" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operTime" label="操作时间" width="180" />
        <el-table-column prop="reason" label="切换原因" min-width="200" />
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentMode = ref('normal')
const settingsForm = reactive({ maintenanceMsg: '系统正在维护中，请稍后再试...', readonlyMsg: '系统当前为只读模式，暂不支持修改操作', confirmRequired: true, autoNotify: true, notifyMethods: ['system', 'email'] })
const modeLogList = ref([
  { id: 1, fromMode: '维护模式', toMode: '正常模式', operator: '管理员', operTime: '2024-12-22 08:00:00', reason: '系统升级完成，恢复正常运行' },
  { id: 2, fromMode: '正常模式', toMode: '维护模式', operator: '管理员', operTime: '2024-12-21 22:00:00', reason: '系统版本升级维护' },
  { id: 3, fromMode: '只读模式', toMode: '正常模式', operator: '管理员', operTime: '2024-12-15 10:00:00', reason: '数据备份完成，恢复正常' },
  { id: 4, fromMode: '正常模式', toMode: '只读模式', operator: '管理员', operTime: '2024-12-15 06:00:00', reason: '执行年度数据备份' }
])
const getModeLabel = (mode: string) => { const m: Record<string, string> = { normal: '正常模式', maintenance: '维护模式', readonly: '只读模式', emergency: '紧急模式' }; return m[mode] || mode }
const handleSelectMode = (mode: string) => { 
  if (mode === currentMode.value) return
  if (settingsForm.confirmRequired) {
    ElMessageBox.confirm(`确定将系统切换到【${getModeLabel(mode)}】吗？`, '模式切换确认', { type: 'warning', confirmButtonText: '确定切换', cancelButtonText: '取消' })
      .then(() => { currentMode.value = mode; ElMessage.success(`已切换到${getModeLabel(mode)}`) })
      .catch(() => {})
  } else {
    currentMode.value = mode
    ElMessage.success(`已切换到${getModeLabel(mode)}`)
  }
}
const handleSaveSettings = () => ElMessage.success('设置保存成功')
</script>
<style scoped>.mode-control-page { height: 100%; }.header-section { margin-bottom: 20px; }.mode-cards { display: flex; gap: 20px; margin-bottom: 20px; }.mode-card { flex: 1; cursor: pointer; transition: all 0.3s; text-align: center; }.mode-card:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }.mode-card.active { border: 2px solid #409EFF; }.mode-icon { margin-bottom: 10px; }.mode-desc { color: #909399; font-size: 13px; margin: 10px 0; }.mode-features { text-align: left; padding-left: 20px; font-size: 13px; color: #606266; list-style: none; }.mode-features li { margin: 5px 0; }.settings-card { margin-bottom: 20px; }.log-card { margin-bottom: 20px; }</style>
