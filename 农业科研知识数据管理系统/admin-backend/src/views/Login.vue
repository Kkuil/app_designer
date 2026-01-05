<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-box">
      <div class="login-header">
        <el-icon :size="40" color="#409eff"><Promotion /></el-icon>
        <h1>农业科研知识数据管理系统</h1>
        <p>后台管理平台</p>
      </div>
      <el-form ref="formRef" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="loginForm.code" placeholder="验证码" size="large" prefix-icon="Key" />
            <div class="code-img" @click="refreshCode">
              <span>{{ captcha }}</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="remember-row">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <el-button type="primary" link>忘记密码？</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <el-divider>其他登录方式</el-divider>
        <div class="other-login">
          <el-button circle @click="handleOtherLogin('wechat')"><el-icon><ChatDotRound /></el-icon></el-button>
          <el-button circle @click="handleOtherLogin('phone')"><el-icon><Iphone /></el-icon></el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const captcha = ref('X7K9')

const loginForm = reactive({
  username: 'admin',
  password: '123456',
  code: '',
  remember: true
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captcha.value = code
  ElMessage.info('验证码已刷新')
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (loginForm.code.toUpperCase() !== captcha.value) {
        ElMessage.error('验证码错误')
        refreshCode()
        return
      }
      loading.value = true
      setTimeout(() => {
        loading.value = false
        ElMessage.success('登录成功')
        router.push('/dashboard')
      }, 1500)
    }
  })
}

const handleOtherLogin = (type: string) => {
  const names: Record<string, string> = {
    wechat: '微信',
    phone: '手机号'
  }
  ElMessage.info(`${names[type]}登录功能开发中`)
}

onMounted(() => {
  refreshCode()
})
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a5f2a 0%, #2d8a3e 50%, #3d9a4f 100%);
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.login-box {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 22px;
  color: #303133;
  margin: 15px 0 8px;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.code-row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.code-row .el-input {
  flex: 1;
}

.code-img {
  width: 120px;
  height: 40px;
  background: linear-gradient(45deg, #f5f7fa, #e4e7ed);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 5px;
  user-select: none;
}

.code-img:hover {
  background: linear-gradient(45deg, #e4e7ed, #dcdfe6);
}

.remember-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.login-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
}

.other-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
