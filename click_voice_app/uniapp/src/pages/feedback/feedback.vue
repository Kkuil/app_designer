<template>
    <view class="container">
        <!-- 主内容区域 -->
        <view class="main-content">
            <view class="form-container">
                <!-- 反馈类型选择 -->
                <view class="type-grid">
                    <view
                        class="type-item"
                        :class="{ active: selectedType === 'garbage' }"
                        @click="handleTypeSelect('garbage')"
                    >
                        <view class="icon-circle" :class="{ active: selectedType === 'garbage' }">
                            <text class="icon">⚠</text>
                        </view>
                        <text class="type-label" :class="{ active: selectedType === 'garbage' }">
                            垃圾内容
                        </text>
                    </view>

                    <view
                        class="type-item"
                        :class="{ active: selectedType === 'inappropriate' }"
                        @click="handleTypeSelect('inappropriate')"
                    >
                        <view class="icon-circle" :class="{ active: selectedType === 'inappropriate' }">
                            <text class="icon">🛡</text>
                        </view>
                        <text class="type-label" :class="{ active: selectedType === 'inappropriate' }">
                            内容不当
                        </text>
                    </view>

                    <view
                        class="type-item"
                        :class="{ active: selectedType === 'infringement' }"
                        @click="handleTypeSelect('infringement')"
                    >
                        <view class="icon-circle" :class="{ active: selectedType === 'infringement' }">
                            <text class="icon">📄</text>
                        </view>
                        <text class="type-label" :class="{ active: selectedType === 'infringement' }">
                            内容侵权
                        </text>
                    </view>
                </view>

                <!-- 反馈内容 -->
                <view class="feedback-section">
                    <text class="section-title">我要反馈</text>

                    <textarea
                        class="feedback-input"
                        v-model="feedbackText"
                        placeholder="你想说点什么？"
                        :maxlength="-1"
                        :auto-height="false"
                    />

                    <!-- 图片上传区域 -->
                    <view class="upload-section">
                        <text class="upload-label">添加图片（可选）</text>
                        <view class="upload-area" @click="handleImageUpload">
                            <view v-if="!imageFile" class="upload-placeholder">
                                <text class="upload-icon">🖼</text>
                                <text class="upload-text">点击上传图片</text>
                            </view>
                            <image
                                v-else
                                :src="imageFile"
                                class="uploaded-image"
                                mode="aspectFit"
                            />
                        </view>
                    </view>

                    <text class="hint-text">请客观描述反馈内容</text>
                </view>

                <!-- 提交按钮 -->
                <button
                    class="submit-button"
                    :class="{ submitting: isSubmitting }"
                    :disabled="isSubmitting"
                    @click="handleSubmit"
                >
                    {{ isSubmitting ? '提交中...' : '提交' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            selectedType: 'inappropriate',
            feedbackText: '',
            imageFile: null,
            isSubmitting: false
        };
    },

    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack({
                delta: 1
            });
        },

        // 处理反馈类型选择
        handleTypeSelect(type) {
            this.selectedType = type;
        },

        // 处理图片上传
        handleImageUpload() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    this.imageFile = res.tempFilePaths[0];
                    uni.showToast({
                        title: '图片已选择',
                        icon: 'success',
                        duration: 2000
                    });
                }
            });
        },

        // 处理表单提交
        handleSubmit() {
            // 表单验证
            if (!this.feedbackText.trim()) {
                uni.showToast({
                    title: '请输入反馈内容',
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
                    title: '反馈已提交，感谢您的宝贵意见',
                    icon: 'success',
                    duration: 2000
                });

                // 清空表单
                this.feedbackText = '';
                this.imageFile = null;

                // 返回上一页
                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1
                    });
                }, 1500);
            }, 1000);
        }
    }
};
</script>

<style scoped>
/* 容器 */
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

.back-button {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10rpx);
}

.back-icon {
    font-size: 48rpx;
    color: #1f2937;
    font-weight: bold;
}

.title {
    font-size: 42rpx;
    font-weight: bold;
    color: #1f2937;
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

.form-container {
    background-color: #ffffff;
    border-radius: 32rpx;
    box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 640rpx;
    padding: 48rpx;
}

/* 反馈类型选择 */
.type-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
}

.type-item {
    padding: 32rpx;
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f9fafb;
    border: 2rpx solid #e5e7eb;
    transition: all 0.3s;
}

.type-item.active {
    background-color: #fef3c7;
    border: 4rpx solid #facc15;
    box-shadow: 0 2rpx 8rpx rgba(250, 204, 21, 0.2);
}

.icon-circle {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
    background-color: #e5e7eb;
    transition: all 0.3s;
}

.icon-circle.active {
    background-color: #facc15;
}

.icon {
    font-size: 40rpx;
}

.type-label {
    font-size: 28rpx;
    font-weight: 500;
    color: #4b5563;
}

.type-label.active {
    color: #d97706;
}

/* 反馈内容 */
.feedback-section {
    margin-top: 48rpx;
}

.section-title {
    font-size: 42rpx;
    font-weight: bold;
    color: #1f2937;
    display: block;
    margin-bottom: 32rpx;
}

.feedback-input {
    width: 100%;
    height: 288rpx;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    border: 4rpx solid #e5e7eb;
    font-size: 32rpx;
    color: #1f2937;
    box-sizing: border-box;
}

.feedback-input:focus {
    border-color: #facc15;
}

/* 图片上传区域 */
.upload-section {
    margin-top: 32rpx;
}

.upload-label {
    display: block;
    font-size: 28rpx;
    color: #6b7280;
    margin-bottom: 16rpx;
}

.upload-area {
    width: 100%;
    height: 192rpx;
    border: 4rpx dashed #d1d5db;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9fafb;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.upload-icon {
    font-size: 48rpx;
    margin-bottom: 16rpx;
}

.upload-text {
    font-size: 28rpx;
    color: #6b7280;
}

.uploaded-image {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
}

.hint-text {
    display: block;
    font-size: 28rpx;
    color: #6b7280;
    margin-top: 32rpx;
}

/* 提交按钮 */
.submit-button {
    width: 100%;
    height: 128rpx;
    background: linear-gradient(to right, #facc15, #fbbf24);
    border-radius: 16rpx;
    font-size: 42rpx;
    font-weight: bold;
    color: #ffffff;
    margin-top: 64rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(250, 204, 21, 0.3);
}

.submit-button.submitting {
    opacity: 0.6;
}

.submit-button::after {
    border: none;
}
</style>
