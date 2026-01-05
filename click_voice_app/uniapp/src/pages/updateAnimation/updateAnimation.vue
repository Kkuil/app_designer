<template>
    <view class="container">
        <!-- 主编辑区域 -->
        <view class="main">
            <!-- 预览区域 -->
            <view class="preview-container">
                <!-- 主要预览框 -->
                <view class="preview-box">
                    <!-- 这里可以放置实际的动画帧内容 -->
                </view>

                <!-- 播放按钮 -->
                <view class="play-btn" @tap="handlePlayPause">
                    <text class="icon-play">▶</text>
                </view>

                <!-- 左下角的方块图标 -->
                <view class="corner-icon">
                    <view class="corner-black-1"></view>
                    <view class="corner-black-2"></view>
                    <view class="corner-yellow-1"></view>
                    <view class="corner-yellow-2"></view>
                </view>

                <!-- 底部信息栏 -->
                <view class="info-bar">
                    <text class="info-text">动画帧：{{ currentFrame }}/{{ totalFrames }}</text>
                    <text class="info-text">动画时长：{{ animationDuration }}s</text>
                </view>
            </view>

            <!-- 帧控制区域 -->
            <view class="control-container">
                <!-- 帧延迟显示 -->
                <view class="delay-display">
                    <text class="delay-text">帧延迟：{{ frameDelay.toFixed(3) }}s</text>
                </view>

                <!-- 帧控制滑块 -->
                <view class="control-slider">
                    <!-- 上一帧按钮 -->
                    <view
                        :class="['nav-btn', currentFrame <= 1 ? 'nav-btn-disabled' : '']"
                        @tap="handlePrevFrame"
                    >
                        <text class="icon-arrow">‹</text>
                    </view>

                    <!-- 滑块控制区域 -->
                    <view class="slider-wrapper">
                        <!-- 滑块轨道 -->
                        <view class="slider-track"></view>

                        <!-- 滑块控制杆 -->
                        <view class="slider-thumb-container" :style="{ left: '25%' }">
                            <view class="slider-thumb">
                                <view class="slider-thumb-ring"></view>
                            </view>
                        </view>
                    </view>

                    <!-- 下一帧按钮 -->
                    <view
                        :class="['nav-btn', currentFrame >= totalFrames ? 'nav-btn-disabled' : '']"
                        @tap="handleNextFrame"
                    >
                        <text class="icon-arrow">›</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            frameDelay: 0.1, // 默认帧延迟为0.1秒
            isPlaying: false,
            totalFrames: 1,
            currentFrame: 1
        };
    },

    computed: {
        // 计算动画时长
        animationDuration() {
            return (this.totalFrames * this.frameDelay).toFixed(3);
        }
    },

    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack({
                delta: 1
            });
        },

        // 处理编辑按钮点击
        handleEdit() {
            uni.showToast({
                title: '编辑功能即将上线',
                icon: 'none',
                duration: 2000
            });
        },

        // 处理播放/暂停按钮点击
        handlePlayPause() {
            this.isPlaying = !this.isPlaying;
            uni.showToast({
                title: this.isPlaying ? '开始播放动画' : '已暂停播放',
                icon: 'none',
                duration: 2000
            });
        },

        // 处理帧延迟调整
        handleDelayChange(value) {
            // 限制延迟范围在0.01到1秒之间，保留3位小数
            const clampedValue = Math.max(0.01, Math.min(1, value));
            this.frameDelay = parseFloat(clampedValue.toFixed(3));
        },

        // 处理上一帧
        handlePrevFrame() {
            if (this.currentFrame > 1) {
                this.currentFrame--;
            }
        },

        // 处理下一帧
        handleNextFrame() {
            if (this.currentFrame < this.totalFrames) {
                this.currentFrame++;
            }
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
}

/* 顶部导航栏 */
.header {
    background-color: #facc15;
    padding: 32rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
}

.header-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-chevron-left {
    font-size: 48rpx;
    color: #000000;
    font-weight: bold;
}

.icon-edit {
    font-size: 48rpx;
    color: #000000;
}

.header-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #000000;
}

/* 主编辑区域 */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 32rpx;
}

/* 预览区域 */
.preview-container {
    background-color: #1f2937;
    border-radius: 24rpx;
    padding: 48rpx;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
}

.preview-box {
    width: 560rpx;
    height: 560rpx;
    background-color: #000000;
    margin-bottom: 64rpx;
}

/* 播放按钮 */
.play-btn {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(8rpx);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 64rpx;
}

.icon-play {
    font-size: 48rpx;
    color: #ffffff;
    margin-left: 8rpx;
}

/* 左下角的方块图标 */
.corner-icon {
    position: absolute;
    bottom: 48rpx;
    left: 48rpx;
    width: 52rpx;
    height: 52rpx;
}

.corner-black-1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 32rpx;
    height: 32rpx;
    background-color: #000000;
}

.corner-black-2 {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 32rpx;
    height: 32rpx;
    background-color: #000000;
}

.corner-yellow-1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 16rpx;
    height: 16rpx;
    background-color: #facc15;
}

.corner-yellow-2 {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16rpx;
    height: 16rpx;
    background-color: #facc15;
}

/* 底部信息栏 */
.info-bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: auto;
}

.info-text {
    font-size: 28rpx;
    color: #ffffff;
}

/* 帧控制区域 */
.control-container {
    background-color: #1f2937;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-top: 32rpx;
}

/* 帧延迟显示 */
.delay-display {
    text-align: center;
    margin-bottom: 32rpx;
}

.delay-text {
    color: #ffffff;
    font-size: 28rpx;
}

/* 帧控制滑块 */
.control-slider {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16rpx;
}

/* 导航按钮 */
.nav-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #374151;
    transition: background-color 0.3s;
}

.nav-btn-disabled {
    background-color: #4b5563;
    opacity: 0.5;
}

.icon-arrow {
    font-size: 32rpx;
    color: #ffffff;
    font-weight: bold;
}

/* 滑块包装器 */
.slider-wrapper {
    flex: 1;
    margin: 0 32rpx;
    position: relative;
    height: 64rpx;
    display: flex;
    align-items: center;
}

/* 滑块轨道 */
.slider-track {
    height: 8rpx;
    background-color: #4b5563;
    border-radius: 8rpx;
    width: 100%;
}

/* 滑块控制杆容器 */
.slider-thumb-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 滑块控制杆 */
.slider-thumb {
    width: 24rpx;
    height: 24rpx;
    background-color: #ffffff;
    border-radius: 50%;
    position: relative;
}

/* 滑块外圈 */
.slider-thumb-ring {
    position: absolute;
    top: -8rpx;
    left: -8rpx;
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ffffff;
    border-radius: 50%;
}
</style>
