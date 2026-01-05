<template>
    <view class="container">
        <!-- 主内容区域 -->
        <view class="main-content">
            <view class="form-container">
                <!-- 标题输入 -->
                <view class="input-section">
                    <input
                        class="title-input"
                        v-model="title"
                        placeholder="请输入标题"
                        placeholder-class="placeholder"
                    />
                </view>

                <!-- 封面图片上传和创意描述 -->
                <view class="content-section">
                    <!-- 封面上传 -->
                    <view class="cover-upload" @click="handleCoverImageUpload">
                        <view
                            class="cover-area"
                            :class="{ 'has-image': coverImagePreview }"
                        >
                            <image
                                v-if="coverImagePreview"
                                :src="coverImagePreview"
                                class="cover-preview"
                                mode="aspectFill"
                            />
                            <view v-else class="cover-placeholder">
                                <text class="cover-icon">🖼</text>
                                <text class="cover-text">封面</text>
                            </view>
                        </view>
                    </view>

                    <!-- 创意描述 -->
                    <view class="description-section">
            <textarea
                class="description-input"
                v-model="description"
                placeholder="描述你的创意"
                placeholder-class="placeholder"
                :maxlength="-1"
                :auto-height="false"
            />
                    </view>
                </view>

                <!-- 权限设置 -->
                <view class="permission-section">
                    <!-- 所有人可见开关 -->
                    <view class="permission-item">
                        <text class="permission-label">所有人可见</text>
                        <switch
                            :checked="isPublicVisible"
                            @change="handleVisibleChange"
                            color="#22c55e"
                            class="permission-switch"
                        />
                    </view>

                    <!-- 所有人可编辑开关 -->
                    <view class="permission-item">
                        <text class="permission-label">所有人可编辑，保持和分享</text>
                        <switch
                            :checked="isPublicEditable"
                            @change="handleEditableChange"
                            color="#22c55e"
                            class="permission-switch"
                        />
                    </view>
                </view>

                <!-- 发布按钮 -->
                <button
                    class="submit-button"
                    :class="{ submitting: isSubmitting }"
                    :disabled="isSubmitting"
                    @click="handleSubmit"
                >
                    {{ isSubmitting ? '发布中...' : '发布' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            title: '',
            description: '',
            isPublicVisible: true,
            isPublicEditable: true,
            coverImage: null,
            coverImagePreview: null,
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

        // 处理封面图片上传
        handleCoverImageUpload() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    const tempFilePath = res.tempFilePaths[0];

                    // 获取文件信息检查大小
                    uni.getFileInfo({
                        filePath: tempFilePath,
                        success: (fileInfo) => {
                            // 检查文件大小（5MB限制）
                            if (fileInfo.size > 5 * 1024 * 1024) {
                                uni.showToast({
                                    title: '图片大小不能超过5MB',
                                    icon: 'none',
                                    duration: 2000
                                });
                                return;
                            }

                            this.coverImage = tempFilePath;
                            this.coverImagePreview = tempFilePath;

                            uni.showToast({
                                title: '封面图片已选择',
                                icon: 'success',
                                duration: 2000
                            });
                        }
                    });
                }
            });
        },

        // 处理可见性开关变化
        handleVisibleChange(e) {
            this.isPublicVisible = e.detail.value;
        },

        // 处理可编辑开关变化
        handleEditableChange(e) {
            this.isPublicEditable = e.detail.value;
        },

        // 处理表单提交
        handleSubmit() {
            // 表单验证
            if (!this.title.trim()) {
                uni.showToast({
                    title: '请输入标题',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }

            if (!this.description.trim()) {
                uni.showToast({
                    title: '请描述您的创意',
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
                    title: '发布成功',
                    icon: 'success',
                    duration: 2000
                });

                // 清空表单并返回上一页
                this.title = '';
                this.description = '';
                this.coverImage = null;
                this.coverImagePreview = null;

                setTimeout(() => {
                    uni.navigateBack({
                        delta: 1
                    });
                }, 1500);
            }, 1500);
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
    background-color: #ffffff;
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
    background-color: #f3f4f6;
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
}

.form-container {
    display: flex;
    flex-direction: column;
}

/* 标题输入 */
.input-section {
    margin-bottom: 48rpx;
}

.title-input {
    width: 100%;
    height: 112rpx;
    padding: 0 32rpx;
    border-radius: 16rpx;
    border: 2rpx solid #e5e7eb;
    font-size: 36rpx;
    color: #1f2937;
    box-sizing: border-box;
}

.title-input:focus {
    border-color: #facc15;
}

/* 封面和描述区域 */
.content-section {
    display: flex;
    gap: 32rpx;
    margin-bottom: 48rpx;
}

/* 封面上传 */
.cover-upload {
    flex-shrink: 0;
}

.cover-area {
    width: 256rpx;
    height: 256rpx;
    border-radius: 16rpx;
    border: 4rpx dashed #d1d5db;
    background-color: #f9fafb;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.cover-area.has-image {
    border: 2rpx solid #d1d5db;
    background-color: #f3f4f6;
}

.cover-preview {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
}

.cover-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cover-icon {
    font-size: 48rpx;
    margin-bottom: 16rpx;
}

.cover-text {
    font-size: 24rpx;
    color: #6b7280;
}

/* 创意描述 */
.description-section {
    flex: 1;
}

.description-input {
    width: 100%;
    height: 256rpx;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    border: 2rpx solid #e5e7eb;
    font-size: 36rpx;
    color: #1f2937;
    box-sizing: border-box;
}

.description-input:focus {
    border-color: #facc15;
}

.placeholder {
    color: #9ca3af;
}

/* 权限设置 */
.permission-section {
    margin-top: 48rpx;
    display: flex;
    flex-direction: column;
    gap: 32rpx;
}

.permission-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.permission-label {
    font-size: 36rpx;
    color: #1f2937;
    flex: 1;
}

.permission-switch {
    transform: scale(0.9);
}

/* 发布按钮 */
.submit-button {
    width: 100%;
    height: 128rpx;
    background: linear-gradient(to right, #facc15, #fbbf24);
    border-radius: 16rpx;
    font-size: 42rpx;
    font-weight: bold;
    color: #ffffff;
    margin-top: 96rpx;
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
