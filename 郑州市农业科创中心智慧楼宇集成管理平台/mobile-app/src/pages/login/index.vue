<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">郑州市农业科创中心智慧楼宇集成管理平台</text>
      <text class="subtitle">Smart Building Management</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <User style="width:20px;height:20px;color:#999" />
        <input
          v-model="loginForm.username"
          type="text"
          placeholder="请输入用户名"
          class="input"
        />
      </view>

      <view class="form-item">
        <Lock style="width:20px;height:20px;color:#999" />
        <input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          class="input"
          :password="!showPassword"
        />
        <component :is="showPassword ? 'View' : 'Hide'" style="width:20px;height:20px;color:#999" @click="showPassword = !showPassword" />
      </view>

      <view class="options">
        <view class="remember" @click="rememberMe = !rememberMe">
          <component :is="rememberMe ? 'CircleCheck' : 'CircleClose'" :style="{ width: '18px', height: '18px', color: rememberMe ? '#409eff' : '#999' }" />
          <text>记住密码</text>
        </view>
        <text class="forgot" @click="forgotPassword">忘记密码?</text>
      </view>

      <button class="login-btn" :loading="loading" @click="handleLogin">
        登 录
      </button>
    </view>

    <view class="other-login">
      <view class="divider">
        <view class="line"></view>
        <text>其他登录方式</text>
        <view class="line"></view>
      </view>

      <view class="login-methods">
        <view class="method-item" @click="wechatLogin">
          <text>微信</text>
        </view>
        <view class="method-item" @click="faceLogin">
          <text>人脸</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <text>© 2025 郑州市农业科创中心智慧楼宇集成管理平台</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { post } from '@/utils/request'

const userStore = useUserStore()

const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

// 登录
const handleLogin = async () => {
  if (!loginForm.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!loginForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true

  try {
    const res = await post('/auth/login', loginForm)
    userStore.setToken(res.data.token)

    // 保存密码
    if (rememberMe.value) {
      uni.setStorageSync('savedUsername', loginForm.username)
    }

    uni.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error: any) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 忘记密码
const forgotPassword = () => {
  uni.showToast({ title: '请联系管理员重置密码', icon: 'none' })
}

// 微信登录
const wechatLogin = () => {
  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      console.log('微信登录code:', loginRes.code)
      // 发送code到后端换取token
    }
  })
  // #endif

  // #ifdef APP-PLUS
  uni.showToast({ title: '请在微信小程序中使用', icon: 'none' })
  // #endif
}

// 人脸登录
const faceLogin = () => {
  uni.showToast({ title: '人脸登录功能开发中', icon: 'none' })
}
</script>

<style lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  padding: 80rpx 40rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;

  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
  }

  .title {
    font-size: 44rpx;
    font-weight: 600;
    color: #fff;
    display: block;
  }

  .subtitle {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 10rpx;
    display: block;
  }
}

.login-form {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);

  .form-item {
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #eee;
    padding: 24rpx 0;
    margin-bottom: 20rpx;

    .input {
      flex: 1;
      margin-left: 20rpx;
      font-size: 28rpx;
    }
  }

  .options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20rpx 0 40rpx;

    .remember {
      display: flex;
      align-items: center;

      text {
        font-size: 24rpx;
        color: #666;
        margin-left: 8rpx;
      }
    }

    .forgot {
      font-size: 24rpx;
      color: #409eff;
    }
  }

  .login-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;
    border: none;

    &::after {
      border: none;
    }
  }
}

.other-login {
  margin-top: 60rpx;

  .divider {
    display: flex;
    align-items: center;
    justify-content: center;

    .line {
      width: 80rpx;
      height: 1rpx;
      background-color: rgba(255, 255, 255, 0.5);
    }

    text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 20rpx;
    }
  }

  .login-methods {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;

    .method-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 40rpx;

      image {
        width: 80rpx;
        height: 80rpx;
        background-color: #fff;
        border-radius: 50%;
        padding: 15rpx;
      }

      text {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 12rpx;
      }
    }
  }
}

.footer {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 40rpx;

  text {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>
