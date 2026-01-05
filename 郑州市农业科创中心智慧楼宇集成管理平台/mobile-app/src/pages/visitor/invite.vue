<template>
  <view class="invite-page">
    <view class="form-card">
      <view class="form-item">
        <text class="label">访客姓名</text>
        <input v-model="form.name" placeholder="请输入访客姓名" />
      </view>

      <view class="form-item">
        <text class="label">联系方式</text>
        <input v-model="form.phone" placeholder="请输入手机号" />
      </view>

      <view class="form-item">
        <text class="label">来访时间</text>
        <picker mode="datetime" @change="onDateChange">
          <view class="picker-value">{{ form.time || '请选择日期时间' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">来访事由</text>
        <textarea v-model="form.reason" placeholder="简要描述来访事由" />
      </view>

      <view class="form-item">
        <text class="label">携带物品</text>
        <input v-model="form.items" placeholder="如有请填写" />
      </view>
    </view>

    <view class="submit-bar">
      <button class="btn" @click="submit">发送邀请</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({ name: '', phone: '', time: '', reason: '', items: '' })

const onDateChange = (e: any) => {
  form.time = e.detail.value
}

const submit = () => {
  if (!form.name || !form.phone || !form.time) {
    uni.showToast({ title: '请完善必填项', icon: 'none' })
    return
  }
  uni.showToast({ title: '邀请已发送', icon: 'none' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style lang="scss">
.invite-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.form-card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.form-item { margin-bottom: 20rpx; }
.label { font-size: 26rpx; color: #333; display: block; margin-bottom: 10rpx; }
.picker-value, input, textarea { width: 100%; background: #f5f5f5; border-radius: 12rpx; padding: 16rpx; font-size: 26rpx; box-sizing: border-box; }
textarea { min-height: 140rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05); }
.btn { width: 100%; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; background: #52c41a; color: #fff; font-size: 28rpx; text-align: center; }
</style>
