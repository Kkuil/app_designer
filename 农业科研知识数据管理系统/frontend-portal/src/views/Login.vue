<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="login-banner">
          <h1>农业科研知识数据管理系统</h1>
          <p>Agricultural Research Knowledge Data Management System</p>
          <div class="banner-features">
            <div class="feature-item">
              <el-icon :size="40"><DataAnalysis /></el-icon>
              <span>数据管理</span>
            </div>
            <div class="feature-item">
              <el-icon :size="40"><SetUp /></el-icon>
              <span>设备预约</span>
            </div>
            <div class="feature-item">
              <el-icon :size="40"><Folder /></el-icon>
              <span>项目管理</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form-wrapper">
          <h2>用户登录</h2>
          <p class="login-subtitle">欢迎回来，请登录您的账号</p>

          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" size="large">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item prop="captcha" v-if="showCaptcha">
              <div style="display: flex; gap: 10px; width: 100%">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="Key"
                  clearable
                  style="flex: 1"
                  @keyup.enter="handleLogin"
                />
                <div class="captcha-img" @click="refreshCaptcha">
                  <img :src="captchaImage" alt="验证码" />
                </div>
              </div>
            </el-form-item>

            <el-form-item>
              <div class="login-options">
                <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
                <el-link type="primary" :underline="false" @click="handleForgotPassword">
                  忘记密码？
                </el-link>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                style="width: 100%"
              >
                登录
              </el-button>
            </el-form-item>

            <el-divider>其他登录方式</el-divider>

            <div class="social-login">
              <el-button circle @click="handleSocialLogin('wechat')">
                <el-icon :size="20"><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle @click="handleSocialLogin('qq')">
                <el-icon :size="20"><MessageBox /></el-icon>
              </el-button>
              <el-button circle @click="handleSocialLogin('dingtalk')">
                <el-icon :size="20"><Promotion /></el-icon>
              </el-button>
            </div>

            <div class="register-link">
              还没有账号？
              <router-link to="/register">立即注册</router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog v-model="forgotPasswordDialog" title="找回密码" width="450px">
      <el-form :model="forgotForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="forgotForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="forgotForm.email" placeholder="请输入注册邮箱" />
        </el-form-item>
        <el-form-item label="验证码">
          <div style="display: flex; gap: 10px">
            <el-input v-model="forgotForm.code" placeholder="请输入验证码" style="flex: 1" />
            <el-button @click="sendEmailCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forgotPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { User, Lock, Key, ChatDotRound, MessageBox, Promotion, DataAnalysis, SetUp, Folder } from '@element-plus/icons-vue'

const router = useRouter()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const showCaptcha = ref(true)
const captchaImage = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzQwOWVmZiI+MTJBQTM8L3RleHQ+PC9zdmc+')

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  rememberMe: false
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const forgotPasswordDialog = ref(false)
const forgotForm = reactive({
  username: '',
  email: '',
  code: ''
})

const countdown = ref(0)

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        ElMessage.success('登录成功')
        
        // 保存登录状态
        localStorage.setItem('token', 'mock-token-' + Date.now())
        localStorage.setItem('username', loginForm.username)
        
        // 跳转到首页
        router.push('/')
      }, 1000)
    }
  })
}

const refreshCaptcha = () => {
  // 刷新验证码
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  captchaImage.value = `data:image/svg+xml;base64,${btoa(`<svg width="120" height="40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="30" font-size="24" fill="#409eff">${random}</text></svg>`)}`
}

const handleForgotPassword = () => {
  forgotPasswordDialog.value = true
}

const sendEmailCode = () => {
  if (!forgotForm.email) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  ElMessage.success('验证码已发送到邮箱')
}

const handleResetPassword = () => {
  if (!forgotForm.username || !forgotForm.email || !forgotForm.code) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  ElMessage.success('密码重置链接已发送到邮箱')
  forgotPasswordDialog.value = false
}

const handleSocialLogin = (type: string) => {
  ElMessage.info(`${type} 登录功能开发中`)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-banner h1 {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: bold;
}

.login-banner p {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 60px;
}

.banner-features {
  display: flex;
  gap: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.feature-item span {
  font-size: 14px;
}

.login-right {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.login-form-wrapper h2 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
}

.login-subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.captcha-img {
  width: 120px;
  height: 40px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.social-login {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-box {
    flex-direction: column;
  }

  .login-left {
    padding: 40px 20px;
  }

  .login-right {
    padding: 40px 20px;
  }

  .banner-features {
    gap: 20px;
  }
}
</style>
