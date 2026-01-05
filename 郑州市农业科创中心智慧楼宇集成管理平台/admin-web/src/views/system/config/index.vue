<template>
  <div class="system-config-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="基础配置" name="basic">
        <div class="config-section">
          <div class="section-title">系统信息</div>
          <el-form :model="basicForm" label-width="140px">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="系统名称"><el-input v-model="basicForm.systemName" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统Logo"><el-upload class="logo-uploader" action="#" :show-file-list="false"><el-button type="primary">上传Logo</el-button></el-upload></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="版权信息"><el-input v-model="basicForm.copyright" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统版本"><el-input v-model="basicForm.version" disabled /></el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div class="config-section">
          <div class="section-title">登录配置</div>
          <el-form :model="basicForm" label-width="140px">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="登录验证码"><el-switch v-model="basicForm.captchaEnabled" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="记住密码"><el-switch v-model="basicForm.rememberPassword" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="登录失败锁定"><el-input-number v-model="basicForm.loginFailLock" :min="3" :max="10" /> 次</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="会话超时(分钟)"><el-input-number v-model="basicForm.sessionTimeout" :min="5" :max="480" /></el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="告警配置" name="alarm">
        <div class="config-section">
          <div class="section-title">告警通知</div>
          <el-form :model="alarmForm" label-width="140px">
            <el-form-item label="邮件通知"><el-switch v-model="alarmForm.emailEnabled" /></el-form-item>
            <el-form-item label="邮件服务器" v-if="alarmForm.emailEnabled"><el-input v-model="alarmForm.smtpServer" placeholder="smtp.example.com" /></el-form-item>
            <el-form-item label="短信通知"><el-switch v-model="alarmForm.smsEnabled" /></el-form-item>
            <el-form-item label="微信通知"><el-switch v-model="alarmForm.wechatEnabled" /></el-form-item>
            <el-form-item label="告警推送间隔(秒)"><el-input-number v-model="alarmForm.pushInterval" :min="30" :max="3600" /></el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="数据配置" name="data">
        <div class="config-section">
          <div class="section-title">数据存储</div>
          <el-form :model="dataForm" label-width="140px">
            <el-form-item label="数据保留天数"><el-input-number v-model="dataForm.retentionDays" :min="30" :max="365" /></el-form-item>
            <el-form-item label="自动归档"><el-switch v-model="dataForm.autoArchive" /></el-form-item>
            <el-form-item label="归档周期(天)" v-if="dataForm.autoArchive"><el-input-number v-model="dataForm.archiveCycle" :min="7" :max="90" /></el-form-item>
            <el-form-item label="备份策略">
              <el-select v-model="dataForm.backupStrategy" style="width:200px">
                <el-option label="每日备份" value="daily" />
                <el-option label="每周备份" value="weekly" />
                <el-option label="手动备份" value="manual" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="接口配置" name="api">
        <div class="config-section">
          <div class="section-title">API设置</div>
          <el-form :model="apiForm" label-width="140px">
            <el-form-item label="API请求超时(秒)"><el-input-number v-model="apiForm.timeout" :min="5" :max="120" /></el-form-item>
            <el-form-item label="接口限流"><el-switch v-model="apiForm.rateLimitEnabled" /></el-form-item>
            <el-form-item label="每分钟最大请求" v-if="apiForm.rateLimitEnabled"><el-input-number v-model="apiForm.rateLimit" :min="100" :max="10000" /></el-form-item>
            <el-form-item label="调试模式"><el-switch v-model="apiForm.debugMode" /></el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="action-bar">
      <el-button type="primary" @click="handleSave"><el-icon><Check /></el-icon>保存配置</el-button>
      <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Refresh } from '@element-plus/icons-vue'

const activeTab = ref('basic')

const basicForm = reactive({
  systemName: '智慧楼宇管理平台',
  copyright: '© 2025 智慧楼宇',
  version: 'v1.0.0',
  captchaEnabled: true,
  rememberPassword: true,
  loginFailLock: 5,
  sessionTimeout: 30
})

const alarmForm = reactive({
  emailEnabled: true,
  smtpServer: 'smtp.company.com',
  smsEnabled: false,
  wechatEnabled: true,
  pushInterval: 60
})

const dataForm = reactive({
  retentionDays: 90,
  autoArchive: true,
  archiveCycle: 30,
  backupStrategy: 'daily'
})

const apiForm = reactive({
  timeout: 30,
  rateLimitEnabled: true,
  rateLimit: 1000,
  debugMode: false
})

const handleSave = () => { ElMessage.success('配置保存成功') }
const handleReset = () => { ElMessage.info('配置已重置') }
</script>

<style lang="scss" scoped>
.system-config-container { background: #fff; border-radius: 8px; padding: 20px; }

.config-section { margin-bottom: 24px; .section-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; padding-left: 10px; border-left: 3px solid #409EFF; } }

.action-bar { margin-top: 24px; padding-top: 20px; border-top: 1px solid #ebeef5; display: flex; gap: 12px; justify-content: center; }
</style>
