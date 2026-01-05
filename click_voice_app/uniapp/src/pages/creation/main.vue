<script setup>
const navigateTo = (page) => {
    uni.navigateTo({
        url: `/pages/creation/${page}`
    });
};
</script>

<template>
    <view class="creation-main">
        <!-- 背景图片 -->
        <image src="/static/images/pages/creation/main.png" class="w-full h-[100vh]" mode="aspectFill"/>
        
        <!-- 可点击的透明覆盖层区域 -->
        <!-- 根据设计图调整这些区域的位置和大小 -->
        <view class="clickable-areas">
            <!-- 动画帧编辑 (clip) 按钮区域 - 假设在顶部 -->
            <view 
                class="click-area clip-area" 
                @click="navigateTo('clip')"
            ></view>
            
            <!-- 颜色填充 (fill) 按钮区域 - 假设在中间 -->
            <view 
                class="click-area fill-area" 
                @click="navigateTo('fill')"
            ></view>
            
            <!-- 调色板 (color-board) 按钮区域 - 假设在底部 -->
            <view 
                class="click-area color-board-area" 
                @click="navigateTo('color-board')"
            ></view>
        </view>
    </view>
</template>

<style scoped lang="scss">
.creation-main {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.clickable-areas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.click-area {
    position: absolute;
    pointer-events: auto;
    // 调试时可以添加背景色查看区域
    // background-color: rgba(255, 0, 0, 0.2);
}

/* 根据实际设计图调整这些位置 */
/* 这里提供一个示例布局，你需要根据实际图片调整 */

/* 动画帧编辑区域 - 假设在屏幕上方1/3处 */
.clip-area {
    top: 20%;
    left: 10%;
    width: 80%;
    height: 15%;
}

/* 颜色填充区域 - 假设在屏幕中间 */
.fill-area {
    top: 45%;
    left: 10%;
    width: 80%;
    height: 15%;
}

/* 调色板区域 - 假设在屏幕下方 */
.color-board-area {
    top: 70%;
    left: 10%;
    width: 80%;
    height: 15%;
}
</style>
