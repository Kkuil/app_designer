<template>
    <view class="container">
        <!-- 主内容区域 -->
        <view class="main-content">
            <view class="content-card">
                <!-- 头像设置项 -->
                <view class="setting-item border-bottom" @click="handleAvatarClick">
                    <view class="item-left">
                        <text class="item-label">头像</text>
                    </view>
                    <view class="item-right">
                        <image
                            class="avatar-img"
                            src="https://lf-code-agent.coze.cn/obj/x-ai-cn/341176381698/attachment/image_20251217224627.png"
                            mode="aspectFill"
                        />
                        <text class="icon-arrow">›</text>
                    </view>
                </view>

                <!-- 昵称设置项 -->
                <view class="setting-item" @click="handleNicknameClick">
                    <view class="item-left">
                        <text class="item-label">昵称</text>
                    </view>
                    <view class="item-right">
                        <text class="nickname-text">张三丰</text>
                        <text class="icon-arrow">›</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'ProfilePage',
    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack({
                delta: 1
            });
        },

        // 处理头像点击事件
        handleAvatarClick() {
            uni.showToast({
                title: '修改头像功能即将上线',
                icon: 'none',
                duration: 2000
            });
        },

        // 处理昵称点击事件
        handleNicknameClick() {
            uni.showToast({
                title: '修改昵称功能即将上线',
                icon: 'none',
                duration: 2000
            });
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

/* 主内容区域 */
.main-content {
    flex: 1;
}

.content-card {
    background: #FFFFFF;
    border-radius: 32rpx;
    box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* 设置项 */
.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40rpx;
    transition: background-color 0.3s;
}

.setting-item:active {
    background-color: #F9FAFB;
}

.border-bottom {
    border-bottom: 1rpx solid #F3F4F6;
}

.item-left {
    display: flex;
    align-items: center;
}

.item-label {
    font-size: 36rpx;
    color: #1F2937;
    margin-right: 16rpx;
}

.item-right {
    display: flex;
    align-items: center;
}

.avatar-img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 24rpx;
}

.nickname-text {
    font-size: 36rpx;
    color: #4B5563;
    margin-right: 24rpx;
}

.icon-arrow {
    font-size: 40rpx;
    color: #9CA3AF;
    font-weight: bold;
    line-height: 1;
}
</style>
