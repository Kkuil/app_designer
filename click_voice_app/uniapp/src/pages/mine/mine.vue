<template>
    <view class="min-h-screen flex flex-col bg-white pb-17">
        <view class="sticky z-10">
            <!-- 顶部导航栏 -->
            <view class="bg-[#FDD403] px-4 py-6 flex items-center justify-between ">
                <view class="flex items-center flex-1" @click="toLogin">
                    <view class="w-10 h-10 rounded-full bg-black flex items-center justify-center mr-3">
                        <text class="text-white text-sm font-bold">像素</text>
                    </view>
                    <view>
                        <text class="text-lg font-bold text-black block">灯光大师</text>
                        <text class="text-xs text-gray-700 block">账户ID: 234234</text>
                    </view>
                </view>

                <view
                    @tap="handleSettings"
                    class="w-10 h-10 flex items-center justify-center"
                >
                    <view class="settings-icon"></view>
                </view>
            </view>

            <!-- 标签页导航 -->
            <view class="border-b border-gray-200 bg-white">
                <view class="flex">
                    <view
                        @tap="setActiveTab('local')"
                        :class="['flex-1 py-3 font-medium text-base relative text-center', activeTab === 'local' ? 'text-orange-500' : 'text-gray-600']"
                    >
                        <text>本地图库</text>
                        <view v-if="activeTab === 'local'"
                              class="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></view>
                    </view>
                    <view
                        @tap="setActiveTab('uploaded')"
                        :class="['flex-1 py-3 font-medium text-base relative text-center', activeTab === 'uploaded' ? 'text-orange-500' : 'text-gray-600']"
                    >
                        <text>已上传</text>
                        <view v-if="activeTab === 'uploaded'"
                              class="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></view>
                    </view>
                    <view
                        @tap="setActiveTab('device')"
                        :class="['flex-1 py-3 font-medium text-base relative text-center', activeTab === 'device' ? 'text-orange-500' : 'text-gray-600']"
                    >
                        <text>设备</text>
                        <view v-if="activeTab === 'device'"
                              class="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 主内容区域 - 根据activeTab显示不同组件 -->
        <view class="flex-1 p-2">
            <LocalLibrary v-if="activeTab === 'local'"/>
            <UploadedLibrary v-else-if="activeTab === 'uploaded'"/>
            <DeviceLibrary v-else-if="activeTab === 'device'"/>
        </view>
    </view>
    <BottomTabBar/>
</template>

<script>
import BottomTabBar from '@/components/BottomTabBar.vue';
import LocalLibrary from '@/components/LocalLibrary.vue';
import UploadedLibrary from '@/components/UploadedLibrary.vue';
import DeviceLibrary from '@/components/DeviceLibrary.vue';

export default {
    components: {
        BottomTabBar,
        LocalLibrary,
        UploadedLibrary,
        DeviceLibrary
    },
    data() {
        return {
            activeTab: 'local'
        };
    },
    methods: {
        handleSettings() {
            uni.navigateTo({
                url: '/pages/settings/settings'
            });
        },

        setActiveTab(tab) {
            this.activeTab = tab;
        },
        toLogin() {
            uni.navigateTo({
                url: '/pages/login/login'
            });
        }
    }
};
</script>

<style scoped>
.min-h-screen {
    min-height: 100vh;
}

.settings-icon {
    width: 24px;
    height: 24px;
    border: 2px solid #000;
    border-radius: 50%;
    position: relative;
}

.settings-icon::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #000;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.sticky {
    position: sticky;
}

text {
    word-break: break-all;
}
</style>
