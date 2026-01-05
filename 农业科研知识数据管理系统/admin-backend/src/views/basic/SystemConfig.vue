<template>
  <div class="system-config-page">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="基础配置" name="basic">
        <el-form :model="basicForm" label-width="150px" style="max-width: 600px">
          <el-form-item label="系统名称"><el-input v-model="basicForm.systemName" /></el-form-item>
          <el-form-item label="系统Logo"><el-upload action="#" :show-file-list="false" :before-upload="handleLogoUpload"><el-button type="primary">上传Logo</el-button></el-upload><span style="margin-left: 10px; color: #909399">{{ basicForm.logo || '未上传' }}</span></el-form-item>
          <el-form-item label="系统版本"><el-input v-model="basicForm.version" disabled /></el-form-item>
          <el-form-item label="版权信息"><el-input v-model="basicForm.copyright" /></el-form-item>
          <el-form-item label="备案号"><el-input v-model="basicForm.icp" /></el-form-item>
          <el-form-item label="技术支持"><el-input v-model="basicForm.techSupport" /></el-form-item>
          <el-form-item><el-button type="primary" @click="handleSaveBasic">保存配置</el-button><el-button @click="handleResetBasic">重置</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="安全配置" name="security">
        <el-form :model="securityForm" label-width="180px" style="max-width: 650px">
          <el-form-item label="密码最小长度"><el-input-number v-model="securityForm.pwdMinLength" :min="6" :max="20" /></el-form-item>
          <el-form-item label="密码复杂度要求"><el-checkbox-group v-model="securityForm.pwdComplexity"><el-checkbox value="upper">大写字母</el-checkbox><el-checkbox value="lower">小写字母</el-checkbox><el-checkbox value="number">数字</el-checkbox><el-checkbox value="special">特殊字符</el-checkbox></el-checkbox-group></el-form-item>
          <el-form-item label="登录失败次数限制"><el-input-number v-model="securityForm.loginFailLimit" :min="3" :max="10" /></el-form-item>
          <el-form-item label="账号锁定时长(分钟)"><el-input-number v-model="securityForm.lockDuration" :min="5" :max="60" /></el-form-item>
          <el-form-item label="会话超时时间(分钟)"><el-input-number v-model="securityForm.sessionTimeout" :min="15" :max="480" /></el-form-item>
          <el-form-item label="验证码开关"><el-switch v-model="securityForm.captchaEnabled" /></el-form-item>
          <el-form-item label="是否允许并发登录"><el-switch v-model="securityForm.allowConcurrent" /></el-form-item>
          <el-form-item><el-button type="primary" @click="handleSaveSecurity">保存配置</el-button><el-button @click="handleResetSecurity">重置</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="邮件配置" name="email">
        <el-form :model="emailForm" label-width="150px" style="max-width: 600px">
          <el-form-item label="SMTP服务器"><el-input v-model="emailForm.smtpHost" placeholder="如：smtp.163.com" /></el-form-item>
          <el-form-item label="SMTP端口"><el-input-number v-model="emailForm.smtpPort" :min="1" :max="65535" /></el-form-item>
          <el-form-item label="发送邮箱"><el-input v-model="emailForm.fromEmail" placeholder="请输入发送邮箱" /></el-form-item>
          <el-form-item label="邮箱密码/授权码"><el-input v-model="emailForm.password" type="password" show-password placeholder="请输入密码或授权码" /></el-form-item>
          <el-form-item label="发件人名称"><el-input v-model="emailForm.fromName" placeholder="请输入发件人名称" /></el-form-item>
          <el-form-item label="启用SSL"><el-switch v-model="emailForm.sslEnabled" /></el-form-item>
          <el-form-item><el-button type="primary" @click="handleSaveEmail">保存配置</el-button><el-button type="success" @click="handleTestEmail">发送测试邮件</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="短信配置" name="sms">
        <el-form :model="smsForm" label-width="150px" style="max-width: 600px">
          <el-form-item label="短信服务商"><el-select v-model="smsForm.provider" style="width: 100%"><el-option label="阿里云短信" value="aliyun" /><el-option label="腾讯云短信" value="tencent" /><el-option label="华为云短信" value="huawei" /></el-select></el-form-item>
          <el-form-item label="AccessKey ID"><el-input v-model="smsForm.accessKeyId" placeholder="请输入AccessKey ID" /></el-form-item>
          <el-form-item label="AccessKey Secret"><el-input v-model="smsForm.accessKeySecret" type="password" show-password placeholder="请输入AccessKey Secret" /></el-form-item>
          <el-form-item label="短信签名"><el-input v-model="smsForm.signName" placeholder="请输入短信签名" /></el-form-item>
          <el-form-item label="验证码模板ID"><el-input v-model="smsForm.templateId" placeholder="请输入模板ID" /></el-form-item>
          <el-form-item><el-button type="primary" @click="handleSaveSms">保存配置</el-button><el-button type="success" @click="handleTestSms">发送测试短信</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
const activeTab = ref('basic')
const basicForm = reactive({ systemName: '农业科研知识数据管理系统', logo: 'logo.png', version: 'v1.0.0', copyright: 'Copyright © 2024 农业科研院', icp: '京ICP备12345678号', techSupport: '技术支持：xxx科技有限公司' })
const securityForm = reactive({ pwdMinLength: 8, pwdComplexity: ['upper', 'lower', 'number'], loginFailLimit: 5, lockDuration: 30, sessionTimeout: 120, captchaEnabled: true, allowConcurrent: false })
const emailForm = reactive({ smtpHost: 'smtp.163.com', smtpPort: 465, fromEmail: 'test@163.com', password: '', fromName: '农业科研系统', sslEnabled: true })
const smsForm = reactive({ provider: 'aliyun', accessKeyId: '', accessKeySecret: '', signName: '农业科研', templateId: 'SMS_123456789' })
const handleTabClick = () => ElMessage.info(`切换到${activeTab.value}配置`)
const handleLogoUpload = () => { ElMessage.success('Logo上传成功'); return false }
const handleSaveBasic = () => ElMessage.success('基础配置保存成功')
const handleResetBasic = () => ElMessage.info('已重置基础配置')
const handleSaveSecurity = () => ElMessage.success('安全配置保存成功')
const handleResetSecurity = () => ElMessage.info('已重置安全配置')
const handleSaveEmail = () => ElMessage.success('邮件配置保存成功')
const handleTestEmail = () => ElMessage.success('测试邮件发送成功')
const handleSaveSms = () => ElMessage.success('短信配置保存成功')
const handleTestSms = () => ElMessage.success('测试短信发送成功')
</script>
<style scoped>.system-config-page { height: 100%; padding: 10px; }</style>
