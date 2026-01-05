<template>
    <view class="settings-page">
        <!-- 主内容区域 -->
        <view class="main-content">
            <view class="settings-container">
                <!-- 设置项列表 -->
                <view
                    v-for="(item, index) in settingItems"
                    :key="item.id"
                    @click="handleItemClick(item)"
                    class="setting-item"
                    :class="{ 'no-border': index === settingItems.length - 1 }"
                >
                    <view class="item-left">
                        <view class="icon-wrapper">
                            <uni-icons
                                :type="item.iconType"
                                :size="20"
                                color="#666666"
                            ></uni-icons>
                        </view>
                        <text class="item-title">{{ item.title }}</text>
                    </view>
                    <uni-icons type="right" size="16" color="#cccccc"></uni-icons>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            settingItems: [
                {
                    id: 'personalInfo',
                    iconType: 'contact',
                    title: '个人信息',
                    action: 'personalInfo'
                },
                {
                    id: 'contactSupport',
                    iconType: 'headphones',
                    title: '联系客服',
                    action: 'contactSupport'
                },
                {
                    id: 'changePassword',
                    iconType: 'locked',
                    title: '修改密码',
                    action: 'changePassword'
                },
                {
                    id: 'changeEmail',
                    iconType: 'email',
                    title: '修改邮箱',
                    action: 'changeEmail'
                },
                {
                    id: 'aboutUs',
                    iconType: 'info',
                    title: '关于我们',
                    action: 'aboutUs'
                },
                {
                    id: 'privacyPolicy',
                    iconType: 'safe',
                    title: '隐私政策',
                    action: 'privacyPolicy'
                },
                {
                    id: 'userAgreement',
                    iconType: 'paperplane',
                    title: '用户协议',
                    action: 'userAgreement'
                }
            ]
        }
    },
    methods: {
        // 处理返回按钮点击
        handleBack() {
            uni.navigateBack({
                delta: 1
            });
        },

        // 处理设置项点击
        handleItemClick(item) {
            switch (item.action) {
                case 'personalInfo':
                    this.handlePersonalInfo();
                    break;
                case 'contactSupport':
                    this.handleContactSupport();
                    break;
                case 'changePassword':
                    this.handleChangePassword();
                    break;
                case 'changeEmail':
                    this.handleChangeEmail();
                    break;
                case 'aboutUs':
                    this.handleAboutUs();
                    break;
                case 'privacyPolicy':
                    this.handlePrivacyPolicy();
                    break;
                case 'userAgreement':
                    this.handleUserAgreement();
                    break;
                default:
                    break;
            }
        },

        // 处理各个设置项的点击事件
        handlePersonalInfo() {
            uni.navigateTo({
                url: '/pages/profile/profile'
            });
        },

        handleContactSupport() {
            this.showToast('联系客服功能即将上线');
        },

        handleChangePassword() {
            uni.navigateTo({
                url: '/pages/updatePassword/updatePassword'
            });
        },

        handleChangeEmail() {
            uni.navigateTo({
                url: '/pages/updateEmail/updateEmail'
            });
        },

        handleAboutUs() {
            this.showToast('关于我们页面即将上线');
        },

        handlePrivacyPolicy() {
            this.showToast('隐私政策页面即将上线');
        },

        handleUserAgreement() {
            this.showToast('用户协议页面即将上线');
        },

        // 显示提示信息
        showToast(message) {
            uni.showToast({
                title: message,
                icon: 'none',
                duration: 2000
            });
        }
    }
}
</script>

<style scoped>
.settings-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(to bottom, #FDD403, #fcd34d);
    padding: 32rpx;
    padding-top: 200rpx;
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
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10rpx);
}

.header-title {
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

.settings-container {
    background-color: #ffffff;
    border-radius: 32rpx;
    box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* 设置项样式 */
.setting-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40rpx;
    border-bottom: 1rpx solid #f3f4f6;
    transition: background-color 0.3s ease;
}

.setting-item:hover {
    background-color: #f9fafb;
}

.setting-item.no-border {
    border-bottom: none;
}

.item-left {
    display: flex;
    align-items: center;
}

.icon-wrapper {
    margin-right: 32rpx;
}

.item-title {
    font-size: 36rpx;
    color: #1f2937;
}

/* 适配不同平台 */
/* #ifdef APP-PLUS */
.settings-page {
    padding-top: var(--status-bar-height);
}

.back-button {
    background: rgba(255, 255, 255, 0.4);
}

/* #endif */

/* #ifdef H5 */
.setting-item:active {
    background-color: #f3f4f6;
}

/* #endif */

/* #ifdef MP-WEIXIN */
.setting-item {
    position: relative;
}

.setting-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 40rpx;
    right: 0;
    height: 1rpx;
    background-color: #f3f4f6;
}

.setting-item.no-border::after {
    display: none;
}

/* #endif */
</style>
