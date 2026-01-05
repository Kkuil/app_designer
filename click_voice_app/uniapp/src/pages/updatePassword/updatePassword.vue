<template>
    <view class="container">
        <!-- 主内容区域 -->
        <view class="main-content">
            <view class="content-card">
                <form @submit.prevent="handleSubmit">
                    <!-- 当前密码 -->
                    <view class="form-item">
                        <text class="form-label">当前密码</text>
                        <view class="input-wrapper">
                            <input
                                type="password"
                                v-model="currentPassword"
                                class="form-input"
                                placeholder="密码，至少8位"
                                placeholder-class="input-placeholder"
                                @input="clearError"
                            />
                            <text class="icon-lock">🔒</text>
                        </view>
                    </view>

                    <!-- 新密码 -->
                    <view class="form-item">
                        <text class="form-label">新密码</text>
                        <view class="input-wrapper">
                            <input
                                :type="isNewPasswordVisible ? 'text' : 'password'"
                                v-model="newPassword"
                                class="form-input"
                                placeholder="密码，至少8位"
                                placeholder-class="input-placeholder"
                                @input="clearError"
                            />
                            <view class="input-icons">
                                <text
                                    v-if="newPassword && validatePasswordStrength(newPassword)"
                                    class="icon-check"
                                >
                                    ✓
                                </text>
                                <text
                                    class="icon-eye"
                                    @click="toggleNewPasswordVisibility"
                                >
                                    {{ isNewPasswordVisible ? '👁' : '👁‍🗨' }}
                                </text>
                            </view>
                        </view>
                    </view>

                    <!-- 确认密码 -->
                    <view class="form-item">
                        <text class="form-label">确认密码</text>
                        <view class="input-wrapper">
                            <input
                                type="password"
                                v-model="confirmPassword"
                                class="form-input"
                                placeholder="再次输入密码"
                                placeholder-class="input-placeholder"
                                @input="clearError"
                            />
                            <text class="icon-lock">🔒</text>
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
                        :disabled="isSubmitting"
                        :class="{ 'submitting': isSubmitting }"
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
    name: 'ChangePasswordPage',
    data() {
        return {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            isNewPasswordVisible: false,
            isSubmitting: false,
            formError: ''
        }
    },
    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack({
                delta: 1
            });
        },

        // 处理密码可见性切换
        toggleNewPasswordVisibility() {
            this.isNewPasswordVisible = !this.isNewPasswordVisible;
        },

        // 验证密码强度
        validatePasswordStrength(password) {
            return password.length >= 8;
        },

        // 清除错误信息
        clearError() {
            this.formError = '';
        },

        // 处理表单提交
        handleSubmit() {
            // 表单验证
            if (!this.currentPassword.trim()) {
                this.formError = '请输入当前密码';
                return;
            }

            if (!this.newPassword.trim()) {
                this.formError = '请输入新密码';
                return;
            }

            if (!this.validatePasswordStrength(this.newPassword)) {
                this.formError = '新密码长度至少为8位';
                return;
            }

            if (!this.confirmPassword.trim()) {
                this.formError = '请再次输入新密码';
                return;
            }

            if (this.newPassword !== this.confirmPassword) {
                this.formError = '两次输入的新密码不一致';
                return;
            }

            // 模拟提交
            this.isSubmitting = true;

            // 模拟网络请求延迟
            setTimeout(() => {
                this.isSubmitting = false;
                this.formError = '';

                uni.showToast({
                    title: '密码修改成功',
                    icon: 'success',
                    duration: 2000
                });

                // 清空表单并返回上一页
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';

                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1
                    });
                }, 1500);
            }, 1000);
        }
    }
}
</script>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(to bottom, #FACC15, #FDE047);
    padding: 16rpx;
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
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10rpx);
}

.icon-back {
    font-size: 48rpx;
    color: #1F2937;
    font-weight: bold;
    line-height: 1;
}

.header-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #1F2937;
    margin-left: 32rpx;
}

/* 主内容区域 */
.main-content {
    flex: 1;
    margin-top: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content-card {
    background: #FFFFFF;
    border-radius: 32rpx;
    box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 928rpx;
    padding: 48rpx;
}

/* 表单项 */
.form-item {
    margin-bottom: 48rpx;
}

.form-label {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #374151;
    margin-bottom: 16rpx;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.form-input {
    width: 100%;
    height: 112rpx;
    padding: 0 100rpx 0 32rpx;
    border-radius: 16rpx;
    border: none;
    background: #F3F4F6;
    font-size: 36rpx;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    box-shadow: 0 0 0 4rpx rgba(250, 204, 21, 0.3);
}

.input-placeholder {
    color: #9CA3AF;
}

.icon-lock {
    position: absolute;
    right: 32rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32rpx;
    color: #9CA3AF;
}

.input-icons {
    position: absolute;
    right: 32rpx;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.icon-check {
    font-size: 32rpx;
    color: #10B981;
    font-weight: bold;
}

.icon-eye {
    font-size: 32rpx;
    color: #9CA3AF;
    cursor: pointer;
}

/* 错误提示 */
.error-message {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
    margin-bottom: 16rpx;
}

.error-icon {
    color: #EF4444;
    font-size: 28rpx;
    margin-right: 8rpx;
}

.error-text {
    color: #EF4444;
    font-size: 28rpx;
}

/* 提交按钮 */
.submit-btn {
    width: 100%;
    height: 128rpx;
    background: #FACC15;
    border-radius: 16rpx;
    font-size: 40rpx;
    font-weight: bold;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: background-color 0.3s;
    margin-top: 64rpx;
}

.submit-btn:active {
    background: #EAB308;
}

.submit-btn.submitting {
    opacity: 0.6;
}

/* 重置button默认样式 */
.submit-btn::after {
    border: none;
}
</style>
