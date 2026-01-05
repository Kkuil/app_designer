<template>
    <view class="min-h-screen flex flex-col items-center bg-[#FFD128] p-12 box-border">
        <view class="w-full max-w-md flex flex-col space-y-6 mt-8">
            <!-- 页面标题 -->
            <view class="text-center">
                <text class="text-[23px] font-bold text-gray-800">创建属于你的账号</text>
            </view>

            <!-- 注册表单 -->
            <view class="w-full space-y-4">
                <!-- 昵称输入框 -->
                <view class="w-full">
                    <text class="block text-sm font-medium text-gray-700 mb-1">昵称</text>
                    <input
                        type="text"
                        placeholder="请输入昵称"
                        v-model="nickname"
                        @input="clearError('nickname')"
                        class="w-full h-11 px-4 rounded-full bg-white/30 backdrop-blur-md border border-yellow-300 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border"
                        placeholder-class="text-[#3D3D3D]"
                    />
                    <view v-if="errors.nickname" class="text-red-500 text-xs mt-1 flex items-center">
                        <view class="mr-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </view>
                        <text>{{ errors.nickname }}</text>
                    </view>
                </view>

                <!-- 邮箱输入框 -->
                <view class="w-full">
                    <text class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</text>
                    <input
                        type="text"
                        placeholder="请输入邮箱地址"
                        v-model="email"
                        @input="clearError('email')"
                        class="w-full h-11 px-4 rounded-full bg-white/30 backdrop-blur-md border border-yellow-300 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border"
                    />
                    <view v-if="errors.email" class="text-red-500 text-xs mt-1 flex items-center">
                        <view class="mr-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </view>
                        <text>{{ errors.email }}</text>
                    </view>
                </view>

                <!-- 验证码输入框 -->
                <view class="w-full">
                    <text class="block text-sm font-medium text-gray-700 mb-1">验证码</text>
                    <view class="flex space-x-3 bg-white/30 backdrop-blur-md rounded-full ">
                        <input
                            type="number"
                            placeholder="请输入验证码"
                            v-model="verificationCode"
                            @input="clearError('verificationCode')"
                            maxlength="6"
                            class="flex-1 h-11 px-4 border border-yellow-300 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border"
                        />
                        <button
                            @click="handleGetVerificationCode"
                            :disabled="countdown > 0"
                            class="h-11 px-4 bg-transparent text-[#3D3D3D] rounded-full font-medium text-sm transition-colors whitespace-nowrap flex items-center justify-center border-none"
                        >
                            <text>{{ countdown > 0 ? `重新获取${countdown}s` : '获取验证码' }}</text>
                        </button>
                    </view>
                    <view v-if="errors.verificationCode" class="text-red-500 text-xs mt-1 flex items-center">
                        <view class="mr-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </view>
                        <text>{{ errors.verificationCode }}</text>
                    </view>
                </view>

                <!-- 密码输入框 -->
                <view class="w-full">
                    <text class="block text-sm font-medium text-gray-700 mb-1">密码</text>
                    <view class="relative">
                        <input
                            :type="isPasswordVisible ? 'text' : 'password'"
                            placeholder="请输入密码"
                            v-model="password"
                            @input="clearError('password')"
                            class="w-full h-11 px-4 pr-12 rounded-full bg-white/30 backdrop-blur-md border border-yellow-300 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border"
                        />
                        <view
                            @click="togglePasswordVisibility"
                            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 flex items-center z-10"
                            style="height: 100%;"
                        >
                            <svg v-if="!isPasswordVisible" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                                <line x1="2" x2="22" y1="2" y2="22"/>
                            </svg>
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </view>
                    </view>
                    <view v-if="errors.password" class="text-red-500 text-xs mt-1 flex items-center">
                        <view class="mr-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </view>
                        <text>{{ errors.password }}</text>
                    </view>
                </view>

                <!-- 确认密码输入框 -->
                <view class="w-full">
                    <text class="block text-sm font-medium text-gray-700 mb-1">再次输入密码</text>
                    <view class="relative">
                        <input
                            :type="isConfirmPasswordVisible ? 'text' : 'password'"
                            placeholder="请再次输入密码"
                            v-model="confirmPassword"
                            @input="clearError('confirmPassword')"
                            class="w-full h-11 px-4 pr-12 rounded-full bg-white/30 backdrop-blur-md border border-yellow-300 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 box-border"
                        />
                        <view
                            @click="toggleConfirmPasswordVisibility"
                            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 flex items-center z-10"
                            style="height: 100%;"
                        >
                            <svg v-if="!isConfirmPasswordVisible" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                                <line x1="2" x2="22" y1="2" y2="22"/>
                            </svg>
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </view>
                    </view>
                    <view v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1 flex items-center">
                        <view class="mr-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </view>
                        <text>{{ errors.confirmPassword }}</text>
                    </view>
                </view>

            </view>
        </view>

        <!-- 注册并登录按钮 -->
        <button
            @click="handleSubmit"
            class="w-full h-12 mt-16 bg-black text-white text-lg font-bold rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center border-none"
        >
            注册并登录
        </button>

        <!-- 协议勾选 -->
        <view class="flex items-center space-x-2 text-xs text-gray-700 mt-4">
            <checkbox-group @change="handleAgreementChange">
                <label class="flex items-center">
                    <checkbox
                        value="agreed"
                        :checked="isAgreementChecked"
                        color="#000000"
                        class="round-checkbox"
                        style="transform:scale(0.7)"
                    />
                    <view class="ml-1 flex flex-wrap">
                        <text>我已阅读并同意</text>
                        <text class="text-blue-700 underline" @click.stop="openPrivacy">《隐私协议》</text>
                        <text>和</text>
                        <text class="text-blue-700 underline" @click.stop="openUserAgreement">《用户协议》</text>
                    </view>
                </label>
            </checkbox-group>
        </view>
    </view>
</template>

<script setup lang="ts">
import {onUnmounted, ref, watch} from 'vue';

// 状态定义
const nickname = ref('');
const email = ref('');
const verificationCode = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const countdown = ref(0);
const isAgreementChecked = ref(true);
const errors = ref<Record<string, string>>({});

// 倒计时逻辑
let timer: ReturnType<typeof setInterval>;

watch(countdown, (newVal) => {
    if (newVal > 0 && !timer) {
        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer);
                timer = undefined as any;
            }
        }, 1000);
    }
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});

// 处理密码可见性
const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

const toggleConfirmPasswordVisibility = () => {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
};

// 验证邮箱格式
const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
};

// 获取验证码
const handleGetVerificationCode = () => {
    const newErrors = {...errors.value};
    delete newErrors.email;

    if (!email.value) {
        newErrors.email = '请输入邮箱地址';
    } else if (!validateEmail(email.value)) {
        newErrors.email = '请输入正确的邮箱地址';
    }

    if (newErrors.email) {
        errors.value = newErrors;
        return;
    }

    // 模拟发送验证码
    countdown.value = 45;
    uni.showToast({
        title: '验证码已发送',
        icon: 'success'
    });
};

// 表单验证
const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nickname.value.trim()) {
        newErrors.nickname = '请输入昵称';
    }

    if (!email.value) {
        newErrors.email = '请输入邮箱地址';
    } else if (!validateEmail(email.value)) {
        newErrors.email = '请输入正确的邮箱地址';
    }

    if (!verificationCode.value) {
        newErrors.verificationCode = '请输入验证码';
    } else if (verificationCode.value.length !== 6) {
        newErrors.verificationCode = '验证码长度应为6位';
    }

    if (!password.value) {
        newErrors.password = '请输入密码';
    } else if (password.value.length < 6) {
        newErrors.password = '密码长度至少为6位';
    }

    if (!confirmPassword.value) {
        newErrors.confirmPassword = '请再次输入密码';
    } else if (password.value !== confirmPassword.value) {
        newErrors.confirmPassword = '两次输入的密码不一致';
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

// 清除错误
const clearError = (field: string) => {
    if (errors.value[field]) {
        const newErrors = {...errors.value};
        delete newErrors[field];
        errors.value = newErrors;
    }
};

// 处理协议勾选
const handleAgreementChange = (e: any) => {
    isAgreementChecked.value = e.detail.value.length > 0;
};

// 处理提交
const handleSubmit = () => {
    if (!validateForm()) {
        return;
    }

    if (!isAgreementChecked.value) {
        uni.showToast({
            title: '请阅读并同意协议',
            icon: 'none'
        });
        return;
    }

    // 模拟注册成功逻辑
    // 实际项目中这里应该调用 API 并保存 token
    uni.setStorageSync('isAuthenticated', true);

    uni.showToast({
        title: '注册成功，已自动登录',
        icon: 'success'
    });

    // 延迟跳转
    setTimeout(() => {
        // 假设首页路径为 /pages/index/index
        uni.reLaunch({
            url: '/pages/index/index'
        });
    }, 1500);
};

// 协议点击占位函数
const openPrivacy = () => {
    uni.showToast({title: '点击了隐私协议', icon: 'none'});
};

const openUserAgreement = () => {
    uni.showToast({title: '点击了用户协议', icon: 'none'});
};
</script>

<style scoped>
svg {
    display: block;
}

/* 强制修改 checkbox 为圆形 */
:deep(.uni-checkbox-input),
:deep(.wx-checkbox-input) {
    border-radius: 50% !important;
}
</style>
