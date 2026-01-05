<template>
    <view class="container">
        <!-- 主内容区域 -->
        <view class="main">
            <view class="form-card">
                <form @submit.prevent="handleSubmit">
                    <!-- 当前密码 -->
                    <view class="form-item">
                        <text class="label">当前密码</text>
                        <view class="input-wrapper">
                            <input
                                type="password"
                                v-model="currentPassword"
                                @input="handlePasswordInput"
                                class="input"
                                placeholder="密码，至少8位"
                                placeholder-class="placeholder"
                            />
                            <text class="icon-lock">🔒</text>
                        </view>
                    </view>

                    <!-- 新邮箱地址 -->
                    <view class="form-item">
                        <text class="label">新邮箱地址</text>
                        <view class="input-wrapper">
                            <input
                                :type="isEmailVisible ? 'text' : 'text'"
                                v-model="newEmail"
                                @input="handleEmailInput"
                                class="input"
                                placeholder="请输入新邮箱地址"
                                placeholder-class="placeholder"
                            />
                            <view class="icon-group">
                                <text v-if="newEmail && isEmailValid" class="icon-check">✓</text>
                                <text class="icon-eye" @click="toggleEmailVisibility">
                                    {{ isEmailVisible ? '👁' : '👁‍🗨' }}
                                </text>
                            </view>
                        </view>
                    </view>

                    <!-- 邮箱验证 -->
                    <view class="form-item">
                        <text class="label">邮箱验证（请在新邮件中查收！）</text>
                        <view class="verification-wrapper">
                            <view class="verification-row">
                                <input
                                    type="text"
                                    v-model="verificationCode"
                                    @input="handleCodeInput"
                                    maxlength="6"
                                    class="input flex-1"
                                    placeholder="请输入验证码"
                                    placeholder-class="placeholder"
                                />
                                <view
                                    class="code-btn"
                                    :class="{ disabled: countdown > 0 }"
                                    @click="handleGetVerificationCode"
                                >
                                    <text class="code-btn-text">获取验证码</text>
                                </view>
                            </view>
                            <text v-if="countdown > 0" class="countdown-text">
                                重新获取{{ countdown }}s
                            </text>
                        </view>
                    </view>

                    <!-- 错误提示 -->
                    <view v-if="formError" class="error-message">
                        <text class="error-icon">✕</text>
                        <text class="error-text">{{ formError }}</text>
                    </view>

                    <!-- 确定按钮 -->
                    <button
                        class="submit-btn"
                        :class="{ submitting: isSubmitting }"
                        :disabled="isSubmitting"
                        @click="handleSubmit"
                    >
                        {{ isSubmitting ? '提交中...' : '确定' }}
                    </button>
                </form>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            currentPassword: '',
            newEmail: '',
            verificationCode: '',
            isEmailVisible: false,
            isSubmitting: false,
            countdown: 0,
            formError: '',
            isEmailValid: false,
            timer: null
        };
    },

    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack({
                delta: 1
            });
        },

        // 处理邮箱可见性切换
        toggleEmailVisibility() {
            this.isEmailVisible = !this.isEmailVisible;
        },

        // 验证邮箱格式
        validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // 处理密码输入
        handlePasswordInput(e) {
            this.currentPassword = e.detail.value;
            this.formError = '';
        },

        // 处理邮箱输入
        handleEmailInput(e) {
            this.newEmail = e.detail.value;
            this.isEmailValid = this.validateEmail(this.newEmail);
            this.formError = '';
        },

        // 处理验证码输入
        handleCodeInput(e) {
            this.verificationCode = e.detail.value;
            this.formError = '';
        },

        // 开始倒计时
        startCountdown() {
            this.countdown = 45;
            this.timer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                } else {
                    clearInterval(this.timer);
                }
            }, 1000);
        },

        // 处理获取验证码
        handleGetVerificationCode() {
            // 表单验证
            if (!this.newEmail.trim()) {
                this.formError = '请输入新邮箱地址';
                return;
            }

            if (!this.validateEmail(this.newEmail)) {
                this.formError = '请输入正确的邮箱地址';
                return;
            }

            if (this.countdown > 0) {
                return;
            }

            // 模拟发送验证码，开始倒计时
            this.startCountdown();
            this.formError = '';

            uni.showToast({
                title: '验证码已发送，请查收',
                icon: 'success',
                duration: 2000
            });
        },

        // 处理表单提交
        handleSubmit() {
            // 表单验证
            if (!this.currentPassword.trim()) {
                this.formError = '请输入当前密码';
                return;
            }

            if (!this.newEmail.trim()) {
                this.formError = '请输入新邮箱地址';
                return;
            }

            if (!this.validateEmail(this.newEmail)) {
                this.formError = '请输入正确的邮箱地址';
                return;
            }

            if (!this.verificationCode.trim()) {
                this.formError = '请输入验证码';
                return;
            }

            if (this.verificationCode.length !== 6) {
                this.formError = '验证码长度应为6位';
                return;
            }

            // 模拟提交
            this.isSubmitting = true;

            // 模拟网络请求延迟
            setTimeout(() => {
                this.isSubmitting = false;
                this.formError = '';

                uni.showToast({
                    title: '邮箱修改成功',
                    icon: 'success',
                    duration: 2000
                });

                // 清空表单并返回上一页
                this.currentPassword = '';
                this.newEmail = '';
                this.verificationCode = '';

                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1
                    });
                }, 1500);
            }, 1000);
        }
    },

    beforeDestroy() {
        // 清除定时器
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(to bottom, #facc15, #fde047);
    padding: 32rpx;
}

/* 顶部导航栏 */
.header {
    display: flex;
    align-items: center;
    padding: 32rpx 16rpx;
}

.back-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    backdrop-filter: blur(8rpx);
}

.icon-chevron-left {
    font-size: 48rpx;
    color: #1f2937;
    font-weight: bold;
}

.title {
    font-size: 40rpx;
    font-weight: bold;
    color: #1f2937;
    margin-left: 32rpx;
}

/* 主内容区域 */
.main {
    flex: 1;
    margin-top: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-card {
    background-color: #ffffff;
    border-radius: 32rpx;
    box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600rpx;
    padding: 48rpx;
}

/* 表单项 */
.form-item {
    margin-bottom: 48rpx;
}

.label {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #374151;
    margin-bottom: 16rpx;
}

.input-wrapper {
    position: relative;
}

.input {
    width: 100%;
    height: 112rpx;
    padding: 0 96rpx 0 32rpx;
    border-radius: 16rpx;
    border: none;
    font-size: 36rpx;
}

.placeholder {
    color: #9ca3af;
}

.icon-lock {
    position: absolute;
    right: 32rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 36rpx;
    color: #9ca3af;
}

.icon-group {
    position: absolute;
    right: 32rpx;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
}

.icon-check {
    font-size: 36rpx;
    color: #10b981;
    margin-right: 16rpx;
}

.icon-eye {
    font-size: 36rpx;
    color: #9ca3af;
}

/* 验证码部分 */
.verification-wrapper {
    display: flex;
    flex-direction: column;
}

.verification-row {
    display: flex;
    align-items: center;
}

.flex-1 {
    flex: 1;
    margin-right: 24rpx;
}

.code-btn {
    height: 112rpx;
    padding: 0 32rpx;
    border-radius: 16rpx;
    background-color: #fef3c7;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

.code-btn.disabled {
    background-color: #d1d5db;
}

.code-btn-text {
    font-size: 28rpx;
    font-weight: 500;
    color: #d97706;
    white-space: nowrap;
}

.code-btn.disabled .code-btn-text {
    color: #6b7280;
}

.countdown-text {
    font-size: 24rpx;
    color: #6b7280;
    text-align: right;
    margin-top: 8rpx;
}

/* 错误提示 */
.error-message {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
}

.error-icon {
    font-size: 28rpx;
    color: #ef4444;
    margin-right: 8rpx;
}

.error-text {
    font-size: 28rpx;
    color: #ef4444;
}

/* 确定按钮 */
.submit-btn {
    width: 100%;
    height: 128rpx;
    border-radius: 16rpx;
    background-color: #facc15;
    color: #1f2937;
    font-size: 40rpx;
    font-weight: bold;
    margin-top: 64rpx;
    border: none;
    transition: opacity 0.3s;
}

.submit-btn.submitting {
    opacity: 0.6;
}

.submit-btn::after {
    border: none;
}
</style>
