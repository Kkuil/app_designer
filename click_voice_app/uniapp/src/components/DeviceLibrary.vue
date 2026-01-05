<template>
    <view class="grid grid-cols-2 gap-2">
        <view
            v-for="video in videos"
            :key="video.id"
            class="bg-gray-100 rounded-lg overflow-hidden relative"
            @tap="handlePlay(video.id)"
        >
            <!-- 视频缩略图 -->
            <view class="w-full aspect-square relative">
                <image
                    :src="video.thumbnailUrl"
                    mode="aspectFill"
                    class="w-full h-full"
                />

                <!-- 暂停按钮 - 右上角 -->
                <view
                    class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black-40 flex items-center justify-center"
                    @tap.stop="handlePause(video.id)"
                >
                    <view class="pause-icon"></view>
                </view>

                <!-- 删除按钮 - 左下角 -->
                <view
                    class="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black-40 flex items-center justify-center"
                    @tap.stop="handleDelete(video.id)"
                >
                    <view class="trash-icon-small"></view>
                </view>
            </view>

            <!-- 统计信息 -->
            <view class="p-2 flex items-center justify-between">
                <view class="flex items-center">
                    <view class="heart-icon"></view>
                    <text class="text-xs text-gray-500 ml-1">{{ formatNumber(video.likes) }}</text>
                </view>
                <view class="flex items-center">
                    <view class="comment-icon"></view>
                    <text class="text-xs text-gray-500 ml-1">{{ video.comments }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            videos: Array(8).fill(0).map((_, index) => ({
                id: index + 1,
                // 使用不同的随机图片
                thumbnailUrl: `https://picsum.photos/400/400?random=${index + 20}`,
                likes: 3400,
                comments: 5,
            }))
        };
    },
    methods: {
        handlePlay(id) {
            uni.showToast({
                title: `正在播放设备视频 ${id}`,
                icon: 'none'
            });
        },

        handlePause(id) {
            uni.showToast({
                title: `暂停视频 ${id}`,
                icon: 'none'
            });
        },

        handleDelete(id) {
            uni.showToast({
                title: `删除视频 ${id}`,
                icon: 'none'
            });
        },

        formatNumber(num) {
            return num.toLocaleString();
        }
    }
};
</script>

<style scoped>
/* 复用样式 */
.aspect-square {
    aspect-ratio: 1 / 1;
}

.pause-icon {
    width: 12px;
    height: 12px;
    position: relative;
}

.pause-icon::before,
.pause-icon::after {
    content: '';
    position: absolute;
    width: 3px;
    height: 12px;
    background: #fff;
    border-radius: 1px;
}

.pause-icon::before {
    left: 0;
}

.pause-icon::after {
    right: 0;
}

.trash-icon-small {
    width: 9px;
    height: 11px;
    border: 1px solid #fff;
    border-top: none;
    border-radius: 0 0 2px 2px;
    position: relative;
}

.trash-icon-small::before {
    content: '';
    position: absolute;
    width: 13px;
    height: 1.5px;
    background: #fff;
    top: -2.5px;
    left: -2px;
}

.trash-icon-small::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 1.5px;
    background: #fff;
    top: -5px;
    left: 0.5px;
    border-radius: 2px 2px 0 0;
}

.heart-icon {
    width: 14px;
    height: 14px;
    position: relative;
}

.heart-icon::before {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    background: #6b7280;
    transform: rotate(45deg);
    border-radius: 0 14px 0 0;
}

.heart-icon::after {
    content: '';
    position: absolute;
    width: 7px;
    height: 12px;
    background: #6b7280;
    border-radius: 7px 7px 0 0;
    left: -3px;
    top: 1px;
}

.comment-icon {
    width: 14px;
    height: 14px;
    border: 2px solid #6b7280;
    border-radius: 50%;
    position: relative;
}

.comment-icon::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #6b7280;
    bottom: -5px;
    left: 3px;
}

.bg-black-40 {
    background-color: rgba(0, 0, 0, 0.4);
}

.grid {
    display: flex;
    flex-wrap: wrap;
}

.grid-cols-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.gap-2 {
    gap: 8px;
}

text {
    word-break: break-all;
}
</style>
