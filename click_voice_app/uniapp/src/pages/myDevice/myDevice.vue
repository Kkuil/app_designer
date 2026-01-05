<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <view class="header">
            <view class="back-btn" @click="handleBack">
                <text class="icon-back">‹</text>
            </view>
            <view class="title">我的设备</view>
            <view class="placeholder"></view>
        </view>

        <!-- 连接类型选项卡 -->
        <view class="tab-container">
            <view class="tab-wrapper">
                <view
                    class="tab-btn"
                    :class="{ 'tab-active': connectionType === 'bluetooth' }"
                    @click="handleConnectionTypeChange('bluetooth')"
                >
                    <text :class="{ 'tab-text-active': connectionType === 'bluetooth' }">蓝牙</text>
                </view>
                <view
                    class="tab-btn"
                    :class="{ 'tab-active': connectionType === 'wifi' }"
                    @click="handleConnectionTypeChange('wifi')"
                >
                    <text :class="{ 'tab-text-active': connectionType === 'wifi' }">Wi-Fi</text>
                </view>
            </view>
        </view>

        <!-- 主内容区域 -->
        <view class="main-content">
            <!-- 设备连接状态卡片 -->
            <view class="status-card">
                <!-- 连接状态图标 -->
                <view class="status-icon-wrapper">
                    <view class="status-icon">
                        <text class="checkmark">✓</text>
                    </view>
                </view>

                <!-- 连接状态文本 -->
                <text class="status-text">已连接</text>

                <!-- 设备列表 -->
                <view class="device-list">
                    <view
                        v-for="device in devices"
                        :key="device.id"
                        class="device-item"
                    >
                        <text class="device-name">{{ device.name }}</text>
                        <view class="device-actions">
                            <text
                                class="device-status"
                                :class="{ 'status-connected': device.isConnected }"
                            >
                                {{ device.isConnected ? '已链接' : '未链接' }}
                            </text>
                            <view
                                class="link-icon"
                                :class="{ 'link-active': device.isConnected }"
                                @click="handleDeviceConnection(device.id)"
                            >
                                <text class="icon-link">🔗</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 搜索设备按钮 -->
        <view class="search-btn-container">
            <view
                class="search-btn"
                :class="{ 'btn-disabled': isSearching }"
                @click="handleSearchDevices"
            >
                <text class="search-icon">🔍</text>
                <text class="search-text">{{ isSearching ? '搜索中...' : '搜索设备' }}</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            connectionType: 'bluetooth',
            devices: [
                {id: '1', name: '设备名称', isConnected: true},
                {id: '2', name: '设备名称', isConnected: false}
            ],
            isSearching: false
        };
    },
    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack();
        },

        // 处理连接类型切换
        handleConnectionTypeChange(type) {
            this.connectionType = type;
            uni.showToast({
                title: `切换到${type === 'bluetooth' ? '蓝牙' : 'Wi-Fi'}连接`,
                icon: 'none',
                duration: 2000
            });
        },

        // 处理设备连接/断开
        handleDeviceConnection(deviceId) {
            const device = this.devices.find(d => d.id === deviceId);
            if (!device || !device.isConnected) {
                return;
            }

            this.devices = this.devices.map(d =>
                d.id === deviceId
                    ? {...d, isConnected: !d.isConnected}
                    : d
            );

            uni.showToast({
                title: device.isConnected ? '设备已断开连接' : '设备已成功连接',
                icon: 'none',
                duration: 2000
            });
        },

        // 处理搜索设备
        handleSearchDevices() {
            if (this.isSearching) {
                return;
            }

            this.isSearching = true;

            // 模拟搜索设备的延迟
            setTimeout(() => {
                this.isSearching = false;
                uni.showToast({
                    title: '搜索完成，已找到所有可用设备',
                    icon: 'success',
                    duration: 2000
                });
            }, 1500);
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb;
}

/* 顶部导航栏 */
.header {
    background-color: #ffffff;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.icon-back {
    font-size: 48rpx;
    color: #374151;
    font-weight: bold;
}

.title {
    flex: 1;
    text-align: center;
    font-size: 40rpx;
    font-weight: bold;
    color: #1f2937;
}

.placeholder {
    width: 80rpx;
}

/* 连接类型选项卡 */
.tab-container {
    padding: 30rpx;
    padding-top: 20rpx;
}

.tab-wrapper {
    background-color: #ffffff;
    padding: 8rpx;
    display: flex;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-btn {
    flex: 1;
    padding: 20rpx 0;
    border-radius: 12rpx;
    text-align: center;
    transition: all 0.3s;
}

.tab-active {
    background-color: #3b82f6;
}

.tab-btn text {
    color: #4b5563;
    font-size: 32rpx;
}

.tab-text-active {
    color: #ffffff !important;
}

/* 主内容区域 */
.main-content {
    flex: 1;
    padding: 0 30rpx 30rpx;
}

/* 设备连接状态卡片 */
.status-card {
    background-color: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    padding: 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50rpx;
}

/* 连接状态图标 */
.status-icon-wrapper {
    margin-bottom: 30rpx;
}

.status-icon {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background-color: #eff6ff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.checkmark {
    font-size: 100rpx;
    color: #3b82f6;
    font-weight: bold;
}

/* 连接状态文本 */
.status-text {
    font-size: 40rpx;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 50rpx;
}

/* 设备列表 */
.device-list {
    width: 100%;
}

.device-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f3f4f6;
}

.device-name {
    font-size: 32rpx;
    color: #374151;
}

.device-actions {
    display: flex;
    align-items: center;
}

.device-status {
    font-size: 28rpx;
    color: #9ca3af;
    margin-right: 15rpx;
}

.status-connected {
    color: #3b82f6;
}

.link-icon {
    font-size: 32rpx;
    color: #9ca3af;
}

.link-active {
    color: #3b82f6;
}

.icon-link {
    font-size: 32rpx;
}

/* 搜索设备按钮 */
.search-btn-container {
    position: fixed;
    bottom: 60rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 600rpx;
    padding: 0 30rpx;
    box-sizing: border-box;
}

.search-btn {
    width: 100%;
    height: 120rpx;
    background-color: #3b82f6;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 16rpx rgba(59, 130, 246, 0.3);
}

.btn-disabled {
    opacity: 0.6;
}

.search-icon {
    font-size: 40rpx;
    margin-right: 15rpx;
}

.search-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
}
</style>
