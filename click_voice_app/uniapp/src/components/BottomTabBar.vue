<template>
    <!-- 底部导航栏 -->
    <view class="fixed bottom-0 left-0 right-0 bg-white py-2 px-4 z-50 pb-safe shadow-lg border-t border-gray-100">
        <view class="flex justify-between items-center h-12">
            <view
                class="flex flex-col items-center justify-center flex-1"
                @click="handleNavigation('/pages/index/index')"
            >
                <view class="w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                         stroke-linejoin="round"
                         :class="currentPage === '/pages/index/index' ? 'text-[#FDD403]' : 'text-gray-400'">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </view>
                <text
                    :class="['text-xs font-bold mt-1', currentPage === '/pages/index/index' ? 'text-[#FDD403]' : 'text-gray-400']">
                    广场
                </text>
            </view>
            <view class="relative flex-1 flex justify-center pointer-events-none">
                <view
                    @click="handleNavigation('/pages/creation/main')"
                    class="pointer-events-auto absolute -top-8 w-12 h-12 rounded-full bg-[#FDD403] flex items-center justify-center shadow-md border-4 border-white">
                    <view class="w-7 h-7">
                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"
                             stroke-linejoin="round" class="text-black">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </view>
                </view>
                <text class="text-xs mt-5 font-bold text-gray-800">创作</text>
            </view>
            <view
                class="flex flex-col items-center justify-center flex-1"
                @click="handleNavigation('/pages/mine/mine')"
            >
                <view class="w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                         stroke-linejoin="round"
                         :class="currentPage === '/pages/mine/mine' ? 'text-[#FDD403]' : 'text-gray-400'">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </view>
                <text
                    :class="['text-xs mt-1 font-bold', currentPage === '/pages/mine/mine' ? 'text-[#FDD403]' : 'text-gray-400']">
                    我的
                </text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import {onMounted, onUpdated, ref} from 'vue'

const currentPage = ref('')

// 获取当前页面路径
const getCurrentPagePath = () => {
    const pages = getCurrentPages()
    if (pages.length > 0) {
        const current = pages[pages.length - 1]
        return '/' + current.route
    }
    return ''
}

// 更新当前页面
const updateCurrentPage = () => {
    currentPage.value = getCurrentPagePath()
}

const handleNavigation = (path: string) => {
    const currentPath = getCurrentPagePath()
    if (currentPath === path) {
        // 如果已经在目标页面，不进行跳转
        return
    }

    // 使用 redirectTo 进行页面跳转（替换当前页面）
    uni.redirectTo({
        url: path,
        fail: (err) => {
            console.log('导航失败，尝试 navigateTo', err)
            // 如果 redirectTo 失败，尝试 navigateTo
            uni.navigateTo({
                url: path,
                fail: (err2) => {
                    console.log('导航失败', err2)
                }
            })
        }
    })
}

// 组件挂载时获取当前页面
onMounted(() => {
    updateCurrentPage()
})

// 组件更新时也更新当前页面（确保页面切换时能正确显示）
onUpdated(() => {
    updateCurrentPage()
})
</script>

<style>
.pb-safe {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}
</style>

