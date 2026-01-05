<template>
  <view class="attendance-page">
    <!-- 个人信息与状态 -->
    <view class="header">
      <view class="info">
        <text class="name">{{ user.name }}</text>
        <text class="dept">{{ user.dept }}</text>
      </view>
      <view class="status" :class="today.status">{{ today.statusText }}</view>
    </view>

    <!-- 打卡卡片 -->
    <view class="clock-card">
      <view class="time-box">
        <text class="time">{{ currentTime }}</text>
        <text class="date">{{ today.date }}</text>
      </view>
      <view class="actions">
        <button class="btn" @click="clock('on')">上班打卡</button>
        <button class="btn ghost" @click="clock('off')">下班打卡</button>
      </view>
      <view class="location">
        <Location style="width:18px;height:18px;color:#1890ff" />
        <text>{{ today.location }}</text>
      </view>
    </view>

    <!-- 今日记录 -->
    <view class="section">
      <view class="section-title">今日记录</view>
      <view class="record">
        <view class="row">
          <text>上班</text>
          <text :class="{ warning: today.onStatus === 'late' }">{{ today.onTime || '--' }}</text>
        </view>
        <view class="row">
          <text>下班</text>
          <text :class="{ warning: today.offStatus === 'early' }">{{ today.offTime || '--' }}</text>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="section">
      <view class="section-title">考勤历史</view>
      <scroll-view class="history" scroll-y>
        <view class="history-item" v-for="item in history" :key="item.date">
          <view>
            <text class="date">{{ item.date }}</text>
            <text class="weekday">{{ item.weekday }}</text>
          </view>
          <view class="status" :class="item.status">{{ item.statusText }}</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

interface User { name: string; dept: string }
interface Today {
  date: string
  status: string
  statusText: string
  onTime: string
  offTime: string
  onStatus: string
  offStatus: string
  location: string
}
interface HistoryItem { date: string; weekday: string; status: string; statusText: string }

const user = reactive<User>({ name: '王小明', dept: '运维部' })
const today = reactive<Today>({
  date: '2025-01-15 周三',
  status: 'normal',
  statusText: '正常出勤',
  onTime: '',
  offTime: '',
  onStatus: '',
  offStatus: '',
  location: 'A栋大堂打卡点'
})

const history = ref<HistoryItem[]>([
  { date: '2025-01-14', weekday: '周二', status: 'normal', statusText: '正常' },
  { date: '2025-01-13', weekday: '周一', status: 'late', statusText: '迟到' },
  { date: '2025-01-12', weekday: '周日', status: 'leave', statusText: '请假' }
])

const currentTime = ref('08:15')

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toTimeString().slice(0, 5)
}

const clock = (type: 'on' | 'off') => {
  const now = new Date().toTimeString().slice(0, 5)
  if (type === 'on') {
    today.onTime = now
    today.onStatus = now > '09:00' ? 'late' : 'normal'
    today.status = today.onStatus === 'late' ? 'late' : 'normal'
    today.statusText = today.onStatus === 'late' ? '迟到' : '正常出勤'
  } else {
    today.offTime = now
    today.offStatus = now < '18:00' ? 'early' : 'normal'
  }
  uni.showToast({ title: '打卡成功', icon: 'none' })
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 30000)
})
</script>

<style lang="scss">
.attendance-page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.header { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.info .name { font-size: 32rpx; font-weight: 700; color: #333; display: block; }
.dept { font-size: 24rpx; color: #999; }
.status { padding: 6rpx 14rpx; border-radius: 14rpx; font-size: 24rpx; color: #fff; background: #52c41a; }
.status.late { background: #fa8c16; }

.clock-card { margin-top: 20rpx; background: linear-gradient(135deg, #1890ff, #40a9ff); border-radius: 16rpx; padding: 24rpx; color: #fff; box-shadow: 0 6rpx 16rpx rgba(24,144,255,0.25); }
.time-box { text-align: center; }
.time { font-size: 56rpx; font-weight: 700; }
.date { display: block; margin-top: 6rpx; font-size: 24rpx; opacity: 0.9; }
.actions { display: flex; gap: 12rpx; margin: 16rpx 0; }
.btn { flex: 1; height: 72rpx; line-height: 72rpx; text-align: center; border-radius: 12rpx; font-size: 28rpx; background: #fff; color: #1890ff; }
.btn.ghost { background: transparent; color: #fff; border: 1rpx solid rgba(255,255,255,0.6); }
.location { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; opacity: 0.9; }

.section { margin-top: 20rpx; background: #fff; border-radius: 16rpx; padding: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.section-title { font-size: 28rpx; color: #333; font-weight: 600; margin-bottom: 12rpx; }
.record .row { display: flex; justify-content: space-between; padding: 10rpx 0; font-size: 26rpx; color: #555; border-bottom: 1rpx solid #f0f0f0; }
.record .row:last-child { border-bottom: none; }
.warning { color: #fa8c16; }
.history { max-height: 320rpx; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 12rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.history-item:last-child { border-bottom: none; }
.history-item .date { font-size: 26rpx; color: #333; display: block; }
.history-item .weekday { font-size: 22rpx; color: #999; display: block; }
.history-item .status { padding: 6rpx 12rpx; border-radius: 12rpx; font-size: 22rpx; color: #fff; }
.history-item .status.normal { background: #52c41a; }
.history-item .status.late { background: #fa8c16; }
.history-item .status.leave { background: #999; }
</style>
