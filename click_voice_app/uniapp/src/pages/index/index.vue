<template>
    <view class="min-h-screen bg-yellow-50 flex flex-col box-border">
        <!-- 顶部导航栏 -->
        <view class="px-4 py-3 flex justify-between items-center sticky top-0 z-50 bg-[#FDD403]">
            <!-- 左侧 Tabs -->
            <view class="flex space-x-12 items-end h-8">
                <view
                    v-for="(tab, index) in tabs"
                    :key="index"
                    class="relative flex flex-col items-center justify-end h-full"
                    @click="currentTab = index"
                >
                    <!-- 文字：选中时大字体黑色，未选中时小字体灰色 -->
                    <!-- transition-all 用于平滑过渡字体大小 -->
                    <text
                        class="transition-all duration-200 leading-none"
                        :class="[
                            currentTab === index
                                ? 'text-[22px] font-bold text-black mb-1.5'
                                : 'text-[18px] font-medium text-gray-700 mb-1.5'
                        ]"
                    >
                        {{ tab }}
                    </text>

                    <!-- 下划线指示器 -->
                    <!-- 绝对定位到底部，只有选中时显示 -->
                    <view
                        v-if="currentTab === index"
                        class="absolute bottom-0 w-10 h-1 bg-black rounded-full"
                    ></view>
                </view>
            </view>

            <!-- 右侧图标 -->
            <view class="flex items-center space-x-4">
                <view class="w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         class="text-black">
                        <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </view>
            </view>
        </view>

        <!-- 主内容区域：瀑布流 -->
        <scroll-view scroll-y class="flex-1" :style="{ height: 'calc(100vh - 160rpx)' }">
            <view class="p-2 pb-20">
                <!-- 瀑布流双列容器 -->
                <view class="flex flex-row justify-between items-start">

                    <!-- 左列 -->
                    <view class="flex flex-col w-[48.5%] gap-2">
                        <view
                            v-for="post in leftPosts"
                            :key="post.id"
                            class="bg-white rounded-lg overflow-hidden shadow-sm"
                        >
                            <image
                                :src="post.imageUrl"
                                mode="widthFix"
                                class="w-full block bg-gray-200"
                                style="min-height: 100px;"
                            />
                            <view class="p-3">
                                <view class="text-sm font-bold mb-2 line-clamp-2 leading-5">
                                    {{ post.title }}
                                </view>
                                <view class="flex justify-between items-center">
                                    <view class="flex items-center">
                                        <view
                                            class="w-5 h-5 rounded-full bg-gray-200 mr-1 flex-shrink-0 overflow-hidden">
                                            <image
                                                :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`"
                                                class="w-full h-full"/>
                                        </view>
                                        <text class="text-xs text-gray-600 truncate max-w-[120rpx]">{{
                                                post.author
                                            }}
                                        </text>
                                    </view>
                                    <view class="flex items-center">
                                        <view class="w-3.5 h-3.5 mr-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
                                                 viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"
                                                 stroke-linecap="round" stroke-linejoin="round">
                                                <path
                                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                        </view>
                                        <text class="text-xs text-gray-400">{{ post.likes }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>

                    <!-- 右列 -->
                    <view class="flex flex-col w-[48.5%] gap-2">
                        <view
                            v-for="post in rightPosts"
                            :key="post.id"
                            class="bg-white rounded-lg overflow-hidden shadow-sm"
                        >
                            <image
                                :src="post.imageUrl"
                                mode="widthFix"
                                class="w-full block bg-gray-200"
                                style="min-height: 100px;"
                            />
                            <view class="p-3">
                                <view class="text-sm font-bold mb-2 line-clamp-2 leading-5">
                                    {{ post.title }}
                                </view>
                                <view class="flex justify-between items-center">
                                    <view class="flex items-center">
                                        <view
                                            class="w-5 h-5 rounded-full bg-gray-200 mr-1 flex-shrink-0 overflow-hidden">
                                            <image
                                                :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`"
                                                class="w-full h-full"/>
                                        </view>
                                        <text class="text-xs text-gray-600 truncate max-w-[120rpx]">{{
                                                post.author
                                            }}
                                        </text>
                                    </view>
                                    <view class="flex items-center">
                                        <view class="w-3.5 h-3.5 mr-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
                                                 viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"
                                                 stroke-linecap="round" stroke-linejoin="round">
                                                <path
                                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                        </view>
                                        <text class="text-xs text-gray-400">{{ post.likes }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>

                </view>
            </view>
        </scroll-view>

        <!-- 底部导航栏 -->
        <BottomTabBar />
    </view>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import BottomTabBar from '@/components/BottomTabBar.vue';

// 顶部 Tab 配置
const tabs = ['广场', '新品', '推荐'];
const currentTab = ref(0); // 默认选中第一个

interface PostData {
    id: number;
    imageUrl: string;
    title: string;
    author: string;
    likes: number;
}

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 生成随机数据 (保持不变)
const generateRandomPosts = (count: number): PostData[] => {
    return Array.from({length: count}).map((_, index) => {
        const height = getRandomInt(300, 600);
        const id = index + 1;
        return {
            id: id,
            imageUrl: `https://picsum.photos/400/${height}?random=${id}`,
            title: [
                "生活中的小确幸，今天也是元气满满的一天！",
                "探索未知的角落，发现城市之美",
                "周末探店，这家咖啡馆氛围绝了",
                "超可爱的像素画，爱了爱了",
                "今日份穿搭分享，黄色系超显白",
                "自制美味早餐，健康又好吃",
                "旅行日记 | 遇见不一样的风景",
                "好物推荐，提升生活幸福感"
            ][getRandomInt(0, 7)],
            author: `User_${getRandomInt(100, 999)}`,
            likes: getRandomInt(10, 999)
        };
    });
};

const posts = ref<PostData[]>(generateRandomPosts(20));

// 实际开发中，这里应该根据 currentTab 的值去请求不同接口或者过滤数据
// 这里为了演示，仅仅是展示相同的数据
const leftPosts = computed(() => posts.value.filter((_, index) => index % 2 === 0));
const rightPosts = computed(() => posts.value.filter((_, index) => index % 2 !== 0));
</script>

<style>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.pb-safe {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
