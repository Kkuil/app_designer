<template>
  <view class="activity-detail-page">
    <image class="banner" :src="detail.cover" mode="aspectFill" />

    <view class="content">
      <view class="title-row">
        <text class="title">{{ detail.title }}</text>
        <view class="tag" :class="detail.type">{{ detail.typeText }}</view>
      </view>
      <view class="meta-row">
        <Calendar style="width:16px;height:16px;color:#999" />
        <text>{{ detail.time }}</text>
      </view>
      <view class="meta-row">
        <Location style="width:16px;height:16px;color:#999" />
        <text>{{ detail.location }}</text>
      </view>
      <view class="meta-row">
        <User style="width:16px;height:16px;color:#999" />
        <text>主办方：{{ detail.organizer }}</text>
      </view>

      <view class="desc">{{ detail.desc }}</view>

      <view class="section">
        <view class="section-title">报名信息</view>
        <view class="info-line"><text>名额</text><text>{{ detail.joined }}/{{ detail.quota }}</text></view>
        <view class="info-line"><text>费用</text><text>{{ detail.fee }}</text></view>
        <view class="info-line"><text>联系电话</text><text>{{ detail.phone }}</text></view>
      </view>

      <view class="section">
        <view class="section-title">活动安排</view>
        <view class="timeline">
          <view class="timeline-item" v-for="(item, idx) in detail.schedule" :key="idx">
            <view class="dot"></view>
            <view class="info">
              <text class="time">{{ item.time }}</text>
              <text class="text">{{ item.text }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <text class="status" :class="detail.status">{{ getStatusText(detail.status) }}</text>
      <button class="btn" :disabled="detail.status !== 'signup'" @click="join">立即报名</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface ScheduleItem { time: string; text: string }
interface Detail {
  id: number
  title: string
  type: string
  typeText: string
  time: string
  location: string
  organizer: string
  desc: string
  quota: number
  joined: number
  fee: string
  phone: string
  status: string
  cover: string
  schedule: ScheduleItem[]
}

const detail = reactive<Detail>({
  id: 1,
  title: 'AI 创新沙龙',
  type: 'tech',
  typeText: '科技',
  time: '1月22日 19:00',
  location: 'B栋路演厅',
  organizer: '园区创新中心',
  desc: '聚焦AI在园区管理、设备运维中的应用案例分享与交流。',
  quota: 60,
  joined: 45,
  fee: '免费',
  phone: '010-888888',
  status: 'signup',
  cover: '/static/logo.png',
  schedule: [
    { time: '19:00', text: '嘉宾签到与交流' },
    { time: '19:30', text: '主题分享：AI与智慧园区' },
    { time: '20:30', text: '圆桌讨论与问答' }
  ]
})

const getStatusText = (status: string): string => {
  const map: Record<string, string> = { signup: '报名中', ongoing: '进行中', finished: '已结束' }
  return map[status] || '未知'
}

const join = () => {
  uni.showToast({ title: '报名成功，已发送通知', icon: 'none' })
  detail.joined += 1
}
</script>

<style lang="scss">
.activity-detail-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 140rpx; }
.banner { width: 100%; height: 320rpx; }
.content { background: #fff; margin: -40rpx 20rpx 20rpx; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06); }
.title-row { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 32rpx; color: #333; font-weight: 700; }
.tag { padding: 6rpx 14rpx; border-radius: 14rpx; color: #fff; font-size: 22rpx; }
.tag.tech { background: #722ed1; }
.tag.sport { background: #1890ff; }
.tag.security { background: #f5222d; }
.meta-row { display: flex; align-items: center; gap: 10rpx; color: #888; font-size: 24rpx; margin-top: 8rpx; }
.desc { margin-top: 16rpx; font-size: 26rpx; color: #555; line-height: 1.7; }
.section { margin-top: 24rpx; }
.section-title { font-size: 28rpx; color: #333; font-weight: 600; margin-bottom: 12rpx; }
.info-line { display: flex; justify-content: space-between; padding: 10rpx 0; font-size: 26rpx; color: #555; border-bottom: 1rpx solid #f0f0f0; }
.info-line:last-child { border-bottom: none; }
.timeline { position: relative; padding-left: 20rpx; }
.timeline::before { content: ''; position: absolute; left: 8rpx; top: 0; bottom: 0; width: 2rpx; background: #e8e8e8; }
.timeline-item { display: flex; margin-bottom: 16rpx; position: relative; }
.timeline-item:last-child { margin-bottom: 0; }
.dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #1890ff; position: absolute; left: -1rpx; top: 4rpx; }
.info { margin-left: 24rpx; }
.time { font-size: 24rpx; color: #1890ff; display: block; }
.text { font-size: 26rpx; color: #555; display: block; margin-top: 6rpx; }

.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; background: #fff; padding: 16rpx 24rpx; display: flex; align-items: center; gap: 16rpx; box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05); }
.status { font-size: 24rpx; padding: 6rpx 14rpx; border-radius: 14rpx; background: #f5f5f5; color: #666; }
.status.signup { background: #e6f7ff; color: #1890ff; }
.status.ongoing { background: #fff7e6; color: #fa8c16; }
.status.finished { background: #f5f5f5; color: #999; }
.btn { flex: 1; height: 80rpx; line-height: 80rpx; text-align: center; background: #1890ff; color: #fff; border-radius: 40rpx; font-size: 28rpx; }
.btn:disabled { opacity: 0.5; }
</style>
