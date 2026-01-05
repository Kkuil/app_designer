<template>
    <view class="min-h-screen flex flex-col items-center bg-white pt-12 pb-8 px-12 box-border">
        <view class="w-full max-w-md flex flex-col space-y-8">
            <!-- 重置密码表单 -->
            <view class="w-full space-y-5">

                <!-- 邮箱输入框 -->
                <view class="w-full space-y-2">
                    <text class="block text-base font-medium text-[15px] text-gray-700">邮箱</text>
                    <input
                        type="text"
                        placeholder="请输入正确邮箱"
                        v-model="email"
                        @input="handleEmailInput"
                        :class="[
              'w-full h-8 px-4 rounded-lg text-lg border-2 transition-colors box-border border-solid rounded-full',
              emailError ? 'border-red-500' : 'border-gray-300 focus:border-[#FDD403]'
            ]"
                        placeholder-class="text-gray-400 text-14px"
                    />
                </view>

                <!-- 验证码输入框 -->
                <view class="w-full space-y-2">
                    <text class="block text-base font-medium text-gray-700 text-[15px]">验证码</text>
                    <view :class="
[
    'flex space-x-3 border-2  border-solid rounded-full',
              emailError ? 'border-red-500' : 'border-gray-300 focus:border-[#FDD403]'
]">
                        <input
                            type="number"
                            placeholder="验证码"
                            v-model="verificationCode"
                            @input="clearFormError"
                            maxlength="6"
                            class="flex-1 h-8 px-4 rounded-lg border-2 border-gray-300 text-lg box-border focus:border-[#FDD403]"
                            placeholder-class="text-gray-400 text-14px"
                        />
                        <button
                            @click="handleGetVerificationCode"
                            :disabled="countdown > 0"
                            class="h-8 px-4 text-[14px] rounded-lg font-medium transition-colors whitespace-nowrap flex items-center justify-center border-0 text-base text-[#FDD403] bg-transparent"
                        >
                            {{ countdown > 0 ? `重新获取${countdown}s` : '获取验证码' }}
                        </button>
                    </view>
                </view>

                <!-- 新密码输入框 -->
                <view class="w-full space-y-2">
                    <text class="block text-base font-medium text-gray-700 text-[15px]">密码</text>
                    <view :class="
[
    'relative flex space-x-3 border-2  border-solid rounded-full',
              emailError ? 'border-red-500' : 'border-gray-300 focus:border-[#FDD403]'
]">
                        <input
                            :password="!isNewPasswordVisible"
                            type="text"
                            placeholder="请输入密码"
                            v-model="newPassword"
                            @input="clearFormError"
                            class="w-full h-8 px-4 pr-12 rounded-lg border-2 border-gray-300 text-lg box-border focus:border-yellow-400 text-[14px]"
                            placeholder-class="text-gray-400"
                        />
                        <view
                            @click="toggleNewPasswordVisibility"
                            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 flex items-center h-full z-10"
                        >
                            <uni-icons :type="isNewPasswordVisible ? 'eye' : 'eye-slash'" size="20"
                                       color="#6b7280"></uni-icons>
                        </view>
                    </view>
                </view>

                <!-- 确认密码输入框 -->
                <view class="w-full space-y-2">
                    <view :class="
[
    'relative flex space-x-3 border-2  border-solid rounded-full',
              emailError ? 'border-red-500' : 'border-gray-300 focus:border-[#FDD403]'
]">
                        <input
                            :password="!isConfirmPasswordVisible"
                            type="text"
                            placeholder="请输入密码"
                            v-model="confirmPassword"
                            @input="clearFormError"
                            class="w-full h-8 px-4 pr-12 rounded-lg border-2 border-gray-300 text-lg box-border focus:border-yellow-400 text-[14px]"
                            placeholder-class="text-gray-400"
                        />
                        <view
                            @click="toggleConfirmPasswordVisibility"
                            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 flex items-center h-full z-10"
                        >
                            <uni-icons :type="isConfirmPasswordVisible ? 'eye' : 'eye-slash'" size="20"
                                       color="#6b7280"></uni-icons>
                        </view>
                    </view>
                </view>

                <!-- 错误提示 -->
                <view v-if="formError" class="text-red-500 text-sm flex items-center mt-2">
                    <text class="mr-1">✕</text>
                    <text>{{ formError }}</text>
                </view>
            </view>
        </view>
        <button
            @click="handleSubmit"
            class="w-full h-10 mt-14 rounded-full text-sm bg-[#FDD403] font-bold hover:bg-yellow-500 flex items-center justify-center border-0 text-gray-900"
        >
            确定
        </button>
    </view>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            verificationCode: '',
            newPassword: '',
            confirmPassword: '',
            isNewPasswordVisible: false,
            isConfirmPasswordVisible: false,
            countdown: 0,
            emailError: false,
            formError: '',
            timer: null
        };
    },
    beforeDestroy() {
        // 组件销毁前清除定时器
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        // 处理返回
        handleBack() {
            uni.navigateBack({delta: 1});
        },

        // 监听邮箱输入
        handleEmailInput(e) {
            // e.detail.value 在 uni-app 中获取 input 值
            // v-model 会自动更新，这里主要用于清除错误状态
            if (this.emailError) this.emailError = false;
            if (this.formError) this.formError = '';
        },

        // 清除通用错误
        clearFormError() {
            if (this.formError) this.formError = '';
        },

        // 获取验证码
        handleGetVerificationCode() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                this.emailError = true;
                this.formError = '请输入正确的邮箱';
                return;
            }

            this.emailError = false;
            this.formError = '';

            // 模拟发送验证码
            this.countdown = 45;
            uni.showToast({
                title: '验证码已发送',
                icon: 'success'
            });

            // 倒计时逻辑
            this.timer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                } else {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            }, 1000);
        },

        // 切换密码显示状态
        toggleNewPasswordVisibility() {
            this.isNewPasswordVisible = !this.isNewPasswordVisible;
        },

        toggleConfirmPasswordVisibility() {
            this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
        },

        // 提交表单
        handleSubmit() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(this.email)) {
                this.emailError = true;
                this.formError = '请输入正确的邮箱';
                return;
            }

            if (!this.verificationCode || this.verificationCode.length !== 6) {
                this.formError = '请输入6位验证码';
                return;
            }

            if (!this.newPassword || this.newPassword.length < 6) {
                this.formError = '密码长度至少为6位';
                return;
            }

            if (this.newPassword !== this.confirmPassword) {
                this.formError = '两次输入的密码不一致';
                return;
            }

            // 成功逻辑
            this.formError = '';
            uni.showToast({
                title: '密码重置成功',
                icon: 'success'
            });

            // 延迟跳转
            setTimeout(() => {
                // 假设登录页路径为 /pages/login/login
                uni.navigateTo({
                    url: '/pages/login/login'
                });
            }, 1500);
        }
    }
};
</script>

<style>
/*
  如果你的项目正确配置了 WindiCSS/TailwindCSS，
  这里的样式通常不需要写，插件会自动生成。

  为了保证 button 默认样式不干扰 Tailwind 类，
  建议添加以下重置代码：
*/
button::after {
    border: none;
}
</style>
