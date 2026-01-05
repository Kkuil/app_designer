<template>
  <view class="access-page">
    <!-- 通行码 -->
    <view class="pass-card">
      <view class="header">
        <text class="title">通行码</text>
        <text class="subtitle">刷码通行 · 当日有效</text>
      </view>
      <view class="code-box">
        <view class="qr"></view>
        <text class="code">{{ passCode }}</text>
      </view>
      <view class="info">
        <text>姓名：{{ user.name }}</text>
        <text>公司：{{ user.company }}</text>
        <text>有效期：今日 23:59</text>
      </view>
      <view class="actions">
        <button class="btn" @click="refreshCode">刷新</button>
        <button class="btn ghost" @click="createVisitor">访客邀请</button>
      </view>
    </view>

    <!-- 通行记录 -->
    <view class="section">
      <view class="section-title">通行记录</view>
      <scroll-view class="record-list" scroll-y>
        <view class="record-item" v-for="item in records" :key="item.id">
          <view>
            <text class="location">{{ item.gate }}</text>
            <text class="time">{{ item.time }}</text>
          </view>
          <view class="status" :class="item.status">{{ item.statusText }}</view>
        </view>
        <view class="empty" v-if="records.length === 0">暂无通行记录</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface UserInfo { name: string; company: string }
interface RecordItem { id: number; gate: string; time: string; status: string; statusText: string }

const user = reactive<UserInfo>({ name: '王小明', company: '智慧园区科技有限公司' })
const passCode = ref('8F6A-23B9')

const records = ref<RecordItem[]>([
  { id: 1, gate: 'A栋北门', time: '08:32 已进', status: 'in', statusText: '进' },
  { id: 2, gate: 'A栋北门', time: '12:05 已出', status: 'out', statusText: '出' },
  { id: 3, gate: 'B3停车场', time: '08:20 已进', status: 'in', statusText: '进' }
])

const refreshCode = () => {
  passCode.value = Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
  uni.showToast({ title: '已刷新通行码', icon: 'none' })
}

const createVisitor = () => {
  uni.navigateTo({ url: '/pages/visitor/invite' })
}
</script>

<style lang="scss">
.access-page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.pass-card { background: linear-gradient(135deg, #1890ff, #40a9ff); color: #fff; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 6rpx 16rpx rgba(24,144,255,0.25); }
.header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 32rpx; font-weight: 700; }
.subtitle { font-size: 22rpx; opacity: 0.85; }
.code-box { margin: 20rpx 0; background: rgba(255,255,255,0.12); border-radius: 12rpx; padding: 20rpx; text-align: center; }
.qr { width: 200rpx; height: 200rpx; background: #fff; border-radius: 12rpx; margin: 0 auto 12rpx; }
.code { font-size: 32rpx; letter-spacing: 2rpx; font-weight: 700; }
.info { display: flex; flex-direction: column; gap: 6rpx; font-size: 24rpx; opacity: 0.9; }
.actions { display: flex; gap: 12rpx; margin-top: 16rpx; }
.btn { flex: 1; height: 72rpx; line-height: 72rpx; text-align: center; border-radius: 12rpx; background: #fff; color: #1890ff; font-size: 28rpx; }
.btn.ghost { background: transparent; color: #fff; border: 1rpx solid rgba(255,255,255,0.6); }

.section { margin-top: 20rpx; background: #fff; border-radius: 16rpx; padding: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.section-title { font-size: 28rpx; color: #333; font-weight: 600; margin-bottom: 12rpx; }
.record-list { max-height: 600rpx; }
.record-item { display: flex; justify-content: space-between; align-items: center; padding: 14rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.record-item:last-child { border-bottom: none; }
.location { display: block; font-size: 26rpx; color: #333; }
.time { display: block; font-size: 22rpx; color: #999; margin-top: 4rpx; }
.status { padding: 6rpx 12rpx; border-radius: 12rpx; font-size: 22rpx; color: #fff; }
.status.in { background: #52c41a; }
.status.out { background: #1890ff; }
.empty { text-align: center; color: #999; font-size: 24rpx; padding: 40rpx 0; }
</style>
