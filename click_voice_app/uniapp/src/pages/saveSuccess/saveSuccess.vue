<template>
    <view class="container">
        <!-- 页面标题 -->
        <view class="header">
            <text class="title">作品首帧作为封面</text>
        </view>

        <!-- 主内容区域 -->
        <view class="main-content">
            <!-- 封面预览区域 -->
            <view class="cover-preview">
                <text class="plus-icon">+</text>
                <text class="success-text">保存成功</text>
            </view>

            <!-- 操作按钮区域 -->
            <view class="button-group">
                <!-- 提交按钮 -->
                <button class="submit-button" @click="handleSubmit">
                    提交
                </button>

                <!-- 分享好友设备按钮 (未连接) -->
                <button
                    class="share-button disabled"
                    :disabled="true"
                    @click="handleShare(false)"
                >
                    分享好友设备 (未连接)
                </button>

                <!-- 分享好友设备按钮 (已连接) -->
                <button
                    class="share-button"
                    @click="handleShare(true, '好友设备名称')"
                >
                    分享好友设备 (好友设备名称)
                </button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            // 可以在这里添加需要的数据
        };
    },

    methods: {
        // 处理提交按钮点击
        handleSubmit() {
            uni.showToast({
                title: '提交成功',
                icon: 'success',
                duration: 2000
            });

            // 可以根据需求添加提交后的逻辑，比如跳转页面
            // setTimeout(() => {
            //   uni.navigateTo({
            //     url: '/pages/some-page/some-page'
            //   });
            // }, 2000);
        },

        // 处理分享好友设备按钮点击
        handleShare(connected, deviceName) {
            if (!connected) {
                uni.showToast({
                    title: '请先连接好友设备',
                    icon: 'none',
                    duration: 2000
                });
            } else if (deviceName) {
                uni.showToast({
                    title: `正在分享到设备：${deviceName}`,
                    icon: 'none',
                    duration: 2000
                });
            }
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
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    padding: 64rpx;
    padding-top: 128rpx;
}

/* 页面标题 */
.header {
    width: 100%;
    text-align: center;
    margin-bottom: 80rpx;
}

.title {
    font-size: 42rpx;
    font-weight: bold;
    color: #1f2937;
}

/* 主内容区域 */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 640rpx;
}

/* 封面预览区域 */
.cover-preview {
    width: 100%;
    aspect-ratio: 4/3;
    background-color: #f9fafb;
    border-radius: 16rpx;
    border: 2rpx solid #e5e7eb;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 64rpx;
}

.plus-icon {
    font-size: 64rpx;
    color: #9ca3af;
    margin-bottom: 16rpx;
    font-weight: 300;
}

.success-text {
    font-size: 32rpx;
    color: #6b7280;
    font-weight: 500;
}

/* 操作按钮区域 */
.button-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 32rpx;
}

/* 提交按钮 */
.submit-button {
    width: 100%;
    height: 128rpx;
    background-color: #facc15;
    border-radius: 16rpx;
    font-size: 42rpx;
    font-weight: bold;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: background-color 0.3s;
}

.submit-button:active {
    background-color: #eab308;
}

.submit-button::after {
    border: none;
}

/* 分享好友设备按钮 */
.share-button {
    width: 100%;
    height: 112rpx;
    background-color: #e5e7eb;
    border-radius: 16rpx;
    font-size: 36rpx;
    font-weight: 500;
    color: #4b5563;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: background-color 0.3s;
}

.share-button:active:not(.disabled) {
    background-color: #d1d5db;
}

.share-button.disabled {
    color: #6b7280;
    opacity: 0.7;
}

.share-button::after {
    border: none;
}
</style>
