<template>
    <view class="container">
        <!-- 主内容区域 -->
        <view class="main-content">
            <view class="content-card">
                <form @submit.prevent="handleSubmit">
                    <!-- 发件邮箱 -->
                    <view class="form-item">
                        <text class="form-label">发件邮箱</text>
                        <input
                            type="text"
                            v-model="email"
                            class="form-input"
                            placeholder="请输入邮箱地址"
                            placeholder-class="input-placeholder"
                        />
                    </view>

                    <!-- 发件内容 -->
                    <view class="form-item">
                        <text class="form-label">发件内容</text>
                        <textarea
                            v-model="message"
                            class="form-textarea"
                            placeholder="请输入"
                            placeholder-class="input-placeholder"
                            maxlength="-1"
                            auto-height
                        />
                        <text class="form-tip">请客观描述反馈内容</text>
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
    name: 'SupportPage',
    data() {
        return {
            email: '132465263@qq.com', // 默认邮箱
            message: '',
            isSubmitting: false
        }
    },
    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack({
                delta: 1
            });
        },

        // 处理表单提交
        handleSubmit() {
            // 表单验证
            if (!this.email.trim()) {
                uni.showToast({
                    title: '请输入发件邮箱',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }

            if (!this.message.trim()) {
                uni.showToast({
                    title: '请输入发件内容',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }

            // 模拟提交
            this.isSubmitting = true;

            // 模拟网络请求延迟
            setTimeout(() => {
                this.isSubmitting = false;
                uni.showToast({
                    title: '您的反馈已提交，我们会尽快处理',
                    icon: 'success',
                    duration: 2000
                });

                // 清空表单
                this.message = '';
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

.form-input {
    width: 100%;
    height: 112rpx;
    padding: 0 32rpx;
    border-radius: 16rpx;
    border: 4rpx solid #E5E7EB;
    font-size: 36rpx;
    box-sizing: border-box;
}

.form-input:focus {
    border-color: #FACC15;
}

.form-textarea {
    width: 100%;
    min-height: 320rpx;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    border: 4rpx solid #E5E7EB;
    font-size: 36rpx;
    box-sizing: border-box;
}

.form-textarea:focus {
    border-color: #FACC15;
}

.input-placeholder {
    color: #9CA3AF;
}

.form-tip {
    display: block;
    margin-top: 16rpx;
    font-size: 28rpx;
    color: #6B7280;
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
    margin-top: 16rpx;
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
