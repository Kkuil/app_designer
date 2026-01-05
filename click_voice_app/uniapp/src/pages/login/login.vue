<template>
    <view class="container">
        <!-- 返回按钮 -->
        <view class="back-btn" @click="handleBack">
            <!-- 这里使用了 uni-icons，如果没有引入可以换成 <text><</text> 或图片 -->
            <uni-icons type="left" size="24" color="#000"></uni-icons>
        </view>

        <view class="content-wrapper">
            <!-- Logo -->
            <view class="logo-box">
                LOGO
            </view>

            <!-- 登录表单 -->
            <view class="form-area">
                <!-- 邮箱输入框 -->
                <view class="input-group">
                    <input
                        type="text"
                        placeholder="请输入邮箱地址"
                        v-model="email"
                        class="custom-input"
                        placeholder-class="input-placeholder"
                    />
                </view>

                <!-- 密码输入框 -->
                <view class="input-group relative">
                    <input
                        :password="!isPasswordVisible"
                        type="text"
                        placeholder="请输入密码"
                        v-model="password"
                        class="custom-input"
                        placeholder-class="input-placeholder"
                    />
                    <view class="eye-icon" @click="togglePasswordVisibility">
                        <uni-icons :type="isPasswordVisible ? 'eye-filled' : 'eye-slash-filled'" size="24"
                                   color="#9ca3af"></uni-icons>
                    </view>
                </view>

                <!-- 链接 -->
                <view class="flex justify-end space-x-2 text-[15px] text-[#9CA3B1]">
                    <text @click="handleRegister">注册账号</text>
                    <text @click="handleForgotPassword">忘记密码</text>
                </view>

                <!-- 登录按钮 -->
                <button class="btn-primary" @click="handleLogin">登录</button>

                <!-- Apple ID登录按钮 -->
                <button class="btn-outline" @click="handleAppleLogin">Apple ID登录</button>

                <!-- 协议勾选 -->
                <view class="agreement-box">
                    <checkbox-group @change="handleCheckboxChange">
                        <label class="agreement-label">
                            <checkbox value="agreed" :checked="isAgreementChecked" color="#facc15"
                                      style="transform:scale(0.7)"/>
                            <text class="text-gray">我已阅读并同意</text>
                        </label>
                    </checkbox-group>
                    <text class="link-blue">《隐私协议》</text>
                    <text class="text-gray">和</text>
                    <text class="link-blue">《用户协议》</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            password: '',
            isPasswordVisible: false,
            isAgreementChecked: false
        };
    },
    methods: {
        handleBack() {
            // UniApp 返回上一页
            uni.navigateTo({
                url: '/pages/index/index', // 示例路径
            });
        },
        togglePasswordVisibility() {
            this.isPasswordVisible = !this.isPasswordVisible;
        },
        handleRegister() {
            uni.navigateTo({url: '/pages/createAccount/createAccount'}); // 示例路径
        },
        handleForgotPassword() {
            uni.navigateTo({url: '/pages/resetPassword/resetPassword'}); // 示例路径
        },
        handleLogin() {
            if (!this.isAgreementChecked) {
                uni.showToast({title: '请先同意协议', icon: 'none'});
                return;
            }
            console.log('登录:', this.email, this.password);
            uni.showLoading({title: '登录中...'});
            // 模拟登录请求
            setTimeout(() => uni.hideLoading(), 1000);
        },
        handleAppleLogin() {
            uni.showToast({title: 'Apple ID 登录', icon: 'none'});
        },
        handleCheckboxChange(e) {
            this.isAgreementChecked = e.detail.value.includes('agreed');
        }
    }
};
</script>

<style lang="scss" scoped>
/*
   将 Tailwind 类转换为 CSS
   转换逻辑：1rem ≈ 32rpx (基于750rpx设计稿)
*/

.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffff;
    padding: 100rpx 48rpx 64rpx 48rpx; /* pt-12 (approx 96rpx) pb-8 px-6 */
    box-sizing: border-box;
    position: relative;
}

/* 返回按钮 absolute top-4 left-4 */
.back-btn {
    position: absolute;
    top: 30rpx;
    left: 32rpx;
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.content-wrapper {
    width: 100%;
    max-width: 600rpx; /* max-w-md */
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 80rpx;
}

/* Logo */
.logo-box {
    width: 150rpx; /* 159px * 2 */
    height: 150rpx; /* 158px * 2 */
    background-color: #facc15; /* yellow-400 */
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx; /* 3xl */
    font-weight: bold;
    margin-bottom: 180rpx; /* space-y-12 */
}

.form-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40rpx; /* space-y-5 */
}

.input-group {
    width: 100%;
    position: relative;
}

.custom-input {
    width: 100%;
    height: 90rpx; /* h-14 */
    padding: 0 32rpx;
    border-radius: 999999rpx;
    border: 4rpx solid #facc15; /* border-2 border-yellow-400 */
    font-size: 36rpx; /* text-lg */
    box-sizing: border-box;
}

.input-placeholder {
    color: #9ca3af; /* gray-400 */
}

/* 密码输入框的眼睛图标 */
.eye-icon {
    position: absolute;
    right: 32rpx;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    z-index: 5;
}

/* 链接区域 */
.links-row {
    display: flex;
    justify-content: flex-end;
    font-size: 32rpx;
    color: #4b5563;
    gap: 10rpx;
}

/* 登录按钮 */
.btn-primary {
    width: 100%;
    height: 90rpx; /* h-16 */
    background-color: #facc15; /* yellow-400 */
    border-radius: 999999rpx;
    font-size: 40rpx; /* text-xl */
    font-weight: bold;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.btn-primary:active {
    background-color: #eab308; /* yellow-500 hover state simulation */
}

/* Apple ID 按钮 */
.btn-outline {
    width: 100%;
    height: 90rpx;
    background-color: #ffffff;
    border: 4rpx solid #facc15;
    border-radius: 999999rpx;
    font-size: 40rpx;
    font-weight: bold;
    color: #374151; /* gray-700 */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
}

.btn-outline:active {
    background-color: #f9fafb; /* gray-50 */
}

/* 协议区域 */
.agreement-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-size: 20rpx; /* text-sm */
    margin-top: 32rpx;
    justify-content: center;
}

.agreement-label {
    display: flex;
    align-items: center;
}

.text-gray {
    color: #4b5563; /* gray-600 */
}

.link-blue {
    color: #facc15; /* blue-600 */
}

/* 重置button默认样式 */
button::after {
    border: none;
}
</style>
