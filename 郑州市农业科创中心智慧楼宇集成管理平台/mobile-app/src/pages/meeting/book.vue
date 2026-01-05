<template>
  <view class="book-page">
    <view class="form-card">
      <view class="form-item">
        <text class="label">会议室</text>
        <picker mode="selector" :range="rooms" @change="onRoomChange">
          <view class="picker-value">{{ form.room || '请选择会议室' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">日期</text>
        <picker mode="date" @change="onDateChange">
          <view class="picker-value">{{ form.date }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">开始时间</text>
        <picker mode="time" @change="onStartChange">
          <view class="picker-value">{{ form.start }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">时长</text>
        <picker mode="selector" :range="durations" @change="onDurationChange">
          <view class="picker-value">{{ form.duration }} 小时</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">会议主题</text>
        <input v-model="form.topic" placeholder="请输入主题" />
      </view>

      <view class="form-item">
        <text class="label">参会人员</text>
        <textarea v-model="form.members" placeholder="填写参会人姓名或部门" />
      </view>

      <view class="form-item">
        <text class="label">备注</text>
        <textarea v-model="form.remark" placeholder="其他需求：投影/茶歇等" />
      </view>
    </view>

    <view class="submit-bar">
      <button class="btn" @click="submit">提交预约</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const rooms = ['A101 小型会议室', 'A201 大型会议室', 'B102 培训室']
const durations = ['0.5', '1', '1.5', '2', '3']

const form = reactive({
  room: '',
  date: new Date().toISOString().slice(0, 10),
  start: '09:00',
  duration: '1',
  topic: '',
  members: '',
  remark: ''
})

onLoad((query) => {
  if (query?.date) form.date = query.date as string
})

const onRoomChange = (e: any) => { form.room = rooms[e.detail.value] }
const onDateChange = (e: any) => { form.date = e.detail.value }
const onStartChange = (e: any) => { form.start = e.detail.value }
const onDurationChange = (e: any) => { form.duration = durations[e.detail.value] }

const submit = () => {
  if (!form.room || !form.topic) {
    uni.showToast({ title: '请完善会议室和主题', icon: 'none' })
    return
  }
  uni.showToast({ title: '预约成功', icon: 'none' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style lang="scss">
.book-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.form-card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.form-item { margin-bottom: 20rpx; }
.label { font-size: 26rpx; color: #333; display: block; margin-bottom: 10rpx; }
.picker-value, input, textarea { width: 100%; background: #f5f5f5; border-radius: 12rpx; padding: 16rpx; font-size: 26rpx; box-sizing: border-box; }
textarea { min-height: 140rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05); }
.btn { width: 100%; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; background: #1890ff; color: #fff; font-size: 28rpx; text-align: center; }
</style>
