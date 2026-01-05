<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-left">
        <div class="register-banner">
          <h1>加入我们</h1>
          <p>Join Agricultural Research Knowledge Data Management System</p>
          <div class="banner-benefits">
            <div class="benefit-item">
              <el-icon :size="30"><Checked /></el-icon>
              <span>便捷的设备预约</span>
            </div>
            <div class="benefit-item">
              <el-icon :size="30"><Checked /></el-icon>
              <span>高效的数据管理</span>
            </div>
            <div class="benefit-item">
              <el-icon :size="30"><Checked /></el-icon>
              <span>完善的项目跟踪</span>
            </div>
            <div class="benefit-item">
              <el-icon :size="30"><Checked /></el-icon>
              <span>专业的技术支持</span>
            </div>
          </div>
        </div>
      </div>

      <div class="register-right">
        <div class="register-form-wrapper">
          <h2>用户注册</h2>
          <p class="register-subtitle">创建您的账号，开启科研之旅</p>

          <el-steps :active="currentStep" align-center style="margin-bottom: 30px">
            <el-step title="基本信息" />
            <el-step title="账号设置" />
            <el-step title="完成" />
          </el-steps>

          <!-- 步骤1：基本信息 -->
          <el-form
            v-show="currentStep === 0"
            :model="registerForm"
            :rules="step1Rules"
            ref="step1FormRef"
            label-width="100px"
          >
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="registerForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号">
                <template #append>
                  <el-button @click="sendSmsCode" :disabled="smsCountdown > 0">
                    {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="短信验证码" prop="smsCode">
              <el-input v-model="registerForm.smsCode" placeholder="请输入短信验证码" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱地址" />
            </el-form-item>

            <el-form-item label="部门" prop="deptId">
              <el-select v-model="registerForm.deptId" placeholder="请选择所属部门" style="width: 100%">
                <el-option label="生物工程系" value="1" />
                <el-option label="化学系" value="2" />
                <el-option label="物理系" value="3" />
                <el-option label="材料系" value="4" />
                <el-option label="环境科学系" value="5" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="nextStep" style="width: 100%">
                下一步
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 步骤2：账号设置 -->
          <el-form
            v-show="currentStep === 1"
            :model="registerForm"
            :rules="step2Rules"
            ref="step2FormRef"
            label-width="100px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入用户名（3-20位）">
                <template #suffix>
                  <el-icon v-if="usernameChecking"><Loading /></el-icon>
                  <el-icon v-else-if="usernameAvailable" color="#67c23a"><CircleCheck /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码（至少6位）"
                show-password
              />
              <div class="password-strength">
                <span>密码强度：</span>
                <div class="strength-bar">
                  <div :class="['strength-level', `level-${passwordStrength}`]"></div>
                </div>
                <span :class="['strength-text', `level-${passwordStrength}`]">
                  {{ ['弱', '中', '强'][passwordStrength - 1] || '无' }}
                </span>
              </div>
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="图形验证码" prop="captcha">
              <div style="display: flex; gap: 10px; width: 100%">
                <el-input
                  v-model="registerForm.captcha"
                  placeholder="请输入验证码"
                  style="flex: 1"
                />
                <div class="captcha-img" @click="refreshCaptcha">
                  <img :src="captchaImage" alt="验证码" />
                </div>
              </div>
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="registerForm.agreeTerms">
                我已阅读并同意
                <el-link type="primary" :underline="false" @click="showTerms">
                  《用户协议》
                </el-link>
                和
                <el-link type="primary" :underline="false" @click="showPrivacy">
                  《隐私政策》
                </el-link>
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button @click="prevStep" style="width: 48%">上一步</el-button>
              <el-button
                type="primary"
                @click="handleRegister"
                :loading="loading"
                style="width: 48%; margin-left: 4%"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 步骤3：完成 -->
          <div v-show="currentStep === 2" class="register-success">
            <el-result icon="success" title="注册成功！" sub-title="您的账号已创建成功">
              <template #extra>
                <p style="margin-bottom: 20px; color: #666">
                  {{ needApproval ? '您的账号正在审核中，审核通过后即可登录' : '现在您可以登录系统了' }}
                </p>
                <el-button type="primary" @click="goToLogin">立即登录</el-button>
              </template>
            </el-result>
          </div>

          <div class="login-link" v-if="currentStep < 2">
            已有账号？
            <router-link to="/login">立即登录</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户协议对话框 -->
    <el-dialog v-model="termsDialog" title="用户协议" width="700px">
      <div class="terms-content">
        <h3>一、服务条款的接受</h3>
        <p>欢迎使用农业科研知识数据管理系统。在使用本系统之前，请您仔细阅读本协议的所有内容...</p>
        
        <h3>二、账号注册与使用</h3>
        <p>1. 用户注册时应提供真实、准确、完整的个人信息...</p>
        <p>2. 用户应妥善保管账号和密码，不得转让或借用给他人使用...</p>
        
        <h3>三、用户行为规范</h3>
        <p>1. 用户应遵守国家法律法规和实验室管理规定...</p>
        <p>2. 不得利用系统从事违法违规活动...</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="termsDialog = false">我已了解</el-button>
      </template>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog v-model="privacyDialog" title="隐私政策" width="700px">
      <div class="terms-content">
        <h3>一、信息收集</h3>
        <p>我们会收集您在注册和使用服务时提供的信息，包括但不限于姓名、手机号、邮箱等...</p>
        
        <h3>二、信息使用</h3>
        <p>我们会将收集的信息用于提供服务、改进服务质量、保障系统安全等目的...</p>
        
        <h3>三、信息保护</h3>
        <p>我们采用行业标准的安全措施保护您的个人信息...</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="privacyDialog = false">我已了解</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { Checked, Loading, CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()

const currentStep = ref(0)
const loading = ref(false)
const needApproval = ref(true)

const step1FormRef = ref<FormInstance>()
const step2FormRef = ref<FormInstance>()

const registerForm = reactive({
  // 步骤1：基本信息
  realName: '',
  phone: '',
  smsCode: '',
  email: '',
  deptId: '',
  // 步骤2：账号设置
  username: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  agreeTerms: false
})

const smsCountdown = ref(0)
const usernameChecking = ref(false)
const usernameAvailable = ref(false)
const captchaImage = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzQwOWVmZiI+MTJBQTM8L3RleHQ+PC9zdmc+')

const termsDialog = ref(false)
const privacyDialog = ref(false)

const step1Rules: FormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  deptId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ]
}

const validatePassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6个字符'))
  } else {
    if (registerForm.confirmPassword !== '') {
      step2FormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreeTerms = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

const step2Rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  agreeTerms: [
    { validator: validateAgreeTerms, trigger: 'change' }
  ]
}

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = registerForm.password
  if (!pwd) return 0
  
  let strength = 0
  if (pwd.length >= 6) strength++
  if (pwd.length >= 10) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/\d/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++
  
  return Math.min(Math.floor(strength / 2), 3)
})

// 监听用户名输入，检查可用性
watch(() => registerForm.username, (newVal) => {
  if (newVal && newVal.length >= 3) {
    usernameChecking.value = true
    
    // 模拟检查用户名
    setTimeout(() => {
      usernameChecking.value = false
      usernameAvailable.value = true
    }, 500)
  } else {
    usernameAvailable.value = false
  }
})

const sendSmsCode = () => {
  if (!registerForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  smsCountdown.value = 60
  const timer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  ElMessage.success('验证码已发送到手机')
}

const refreshCaptcha = () => {
  const random = Math.random().toString(36).substr(2, 5).toUpperCase()
  captchaImage.value = `data:image/svg+xml;base64,${btoa(`<svg width="120" height="40" xmlns="http://www.w3.org/2000/svg"><text x="10" y="30" font-size="24" fill="#409eff">${random}</text></svg>`)}`
}

const nextStep = async () => {
  if (!step1FormRef.value) return
  
  await step1FormRef.value.validate((valid) => {
    if (valid) {
      currentStep.value = 1
    }
  })
}

const prevStep = () => {
  currentStep.value = 0
}

const handleRegister = async () => {
  if (!step2FormRef.value) return
  
  await step2FormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟注册请求
      setTimeout(() => {
        loading.value = false
        currentStep.value = 2
        
        // 保存用户信息（实际开发中应该从后端返回）
        localStorage.setItem('pendingUsername', registerForm.username)
      }, 1500)
    }
  })
}

const goToLogin = () => {
  router.push('/login')
}

const showTerms = () => {
  termsDialog.value = true
}

const showPrivacy = () => {
  privacyDialog.value = true
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  display: flex;
  width: 100%;
  max-width: 1100px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-left {
  flex: 0.9;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-banner h1 {
  font-size: 36px;
  margin-bottom: 10px;
  font-weight: bold;
}

.register-banner p {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 50px;
}

.banner-benefits {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
}

.register-right {
  flex: 1.1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  max-height: 90vh;
}

.register-form-wrapper {
  width: 100%;
  max-width: 450px;
}

.register-form-wrapper h2 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
}

.register-subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
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

.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
  overflow: hidden;
}

.strength-level {
  height: 100%;
  transition: all 0.3s;
}

.strength-level.level-1 {
  width: 33%;
  background: #f56c6c;
}

.strength-level.level-2 {
  width: 66%;
  background: #e6a23c;
}

.strength-level.level-3 {
  width: 100%;
  background: #67c23a;
}

.strength-text.level-1 {
  color: #f56c6c;
}

.strength-text.level-2 {
  color: #e6a23c;
}

.strength-text.level-3 {
  color: #67c23a;
}

.register-success {
  padding: 40px 0;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

.terms-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.terms-content h3 {
  margin: 20px 0 10px;
  font-size: 16px;
  color: #333;
}

.terms-content h3:first-child {
  margin-top: 0;
}

.terms-content p {
  margin: 10px 0;
  line-height: 1.6;
  color: #666;
}

@media (max-width: 768px) {
  .register-box {
    flex-direction: column;
  }

  .register-left {
    padding: 40px 20px;
  }

  .register-right {
    padding: 40px 20px;
  }
}
</style>
