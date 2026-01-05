<template>
  <view class="notice-detail-page">
    <view class="header">
      <view class="badge" :class="notice.type">{{ notice.typeText }}</view>
      <text class="title">{{ notice.title }}</text>
      <view class="meta">
        <text class="time">{{ notice.time }}</text>
        <text class="from">发布人：{{ notice.author }}</text>
      </view>
    </view>

    <view class="content-card">
      <text class="content" selectable>{{ notice.content }}</text>
      <view class="attachments" v-if="notice.attachments.length">
        <text class="attach-title">附件</text>
        <view class="attach-item" v-for="(file, idx) in notice.attachments" :key="idx" @click="download(file)">
          <Link style="width:18px;height:18px;color:#1890ff" />
          <text class="name">{{ file.name }}</text>
          <text class="size">{{ file.size }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="btn" @click="markRead" :disabled="notice.read">{{ notice.read ? '已读' : '标记为已读' }}</button>
      <button class="btn secondary" @click="back">返回</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Attachment { name: string; url: string; size: string }
interface NoticeDetail {
  id: number
  title: string
  content: string
  type: string
  typeText: string
  time: string
  author: string
  read: boolean
  attachments: Attachment[]
}

const notice = reactive<NoticeDetail>({
  id: 1,
  title: '园区消防演练通知',
  content: '本周五15:00在B栋进行消防演练，请各单位提前做好准备。演练期间请听从指挥，保持疏散通道畅通。',
  type: 'security',
  typeText: '安全',
  time: '2025-01-15 10:00',
  author: '园区综合办',
  read: false,
  attachments: [
    { name: '演练路线图.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '1.2MB' }
  ]
})

const markRead = () => {
  notice.read = true
  uni.showToast({ title: '已标记为已读' })
}

const download = (file: Attachment) => {
  uni.showToast({ title: '下载 ' + file.name, icon: 'none' })
}

const back = () => {
  uni.navigateBack()
}
</script>

<style lang="scss">
.notice-detail-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 140rpx; }
.header { background: #fff; padding: 24rpx; margin: 20rpx; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.badge { display: inline-block; padding: 4rpx 12rpx; border-radius: 12rpx; color: #fff; font-size: 22rpx; }
.badge.security { background: #f5222d; }
.badge.event { background: #722ed1; }
.badge.notice { background: #1890ff; }
.badge.utility { background: #fa8c16; }
.title { display: block; font-size: 32rpx; font-weight: 700; color: #333; margin: 12rpx 0; }
.meta { font-size: 22rpx; color: #999; display: flex; gap: 12rpx; }

.content-card { background: #fff; margin: 0 20rpx 20rpx; padding: 24rpx; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.content { font-size: 26rpx; color: #444; line-height: 1.8; display: block; }
.attachments { margin-top: 20rpx; }
.attach-title { font-size: 24rpx; color: #666; margin-bottom: 12rpx; display: block; }
.attach-item { display: flex; align-items: center; gap: 10rpx; padding: 12rpx 0; border-bottom: 1rpx solid #f0f0f0; font-size: 24rpx; color: #1890ff; }
.attach-item:last-child { border-bottom: none; }
.attach-item .name { flex: 1; }
.attach-item .size { color: #999; font-size: 22rpx; }

.bottom-actions { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: #fff; display: flex; gap: 16rpx; box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05); }
.btn { flex: 1; height: 80rpx; line-height: 80rpx; text-align: center; border-radius: 40rpx; background: #1890ff; color: #fff; font-size: 28rpx; }
.btn.secondary { background: #fff; color: #1890ff; border: 1rpx solid #1890ff; }
.btn:disabled { opacity: 0.6; }
</style>
