<template>
  <view class="complaint-page">
    <view class="header">
      <text class="title">投诉与建议</text>
      <button class="btn" @click="create">我要提交</button>
    </view>

    <scroll-view class="list" scroll-y>
      <view class="item" v-for="item in list" :key="item.id">
        <view class="item-header">
          <view class="type" :class="item.type">{{ item.typeText }}</view>
          <view class="status" :class="item.status">{{ item.statusText }}</view>
        </view>
        <view class="content">{{ item.content }}</view>
        <view class="meta">
          <text>{{ item.time }}</text>
          <text>回复：{{ item.reply || '待处理' }}</text>
        </view>
      </view>
      <view class="empty" v-if="list.length === 0">暂无记录</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  type: string
  typeText: string
  content: string
  status: string
  statusText: string
  time: string
  reply: string
}

const list = ref<Item[]>([
  { id: 1, type: 'service', typeText: '服务', content: '物业维修响应太慢，希望优化流程。', status: 'pending', statusText: '待处理', time: '2025-01-15 09:30', reply: '' },
  { id: 2, type: 'environment', typeText: '环境', content: 'B栋电梯厅有异味，请及时清洁。', status: 'replied', statusText: '已回复', time: '2025-01-14 16:20', reply: '已安排保洁处理' }
])

const create = () => {
  uni.navigateTo({ url: '/pages/complaint/create' })
}
</script>

<style lang="scss">
.complaint-page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.title { font-size: 32rpx; font-weight: 700; color: #333; }
.btn { height: 64rpx; line-height: 64rpx; padding: 0 20rpx; background: #1890ff; color: #fff; border-radius: 12rpx; font-size: 26rpx; }
.list { max-height: calc(100vh - 160rpx); }
.item { background: #fff; border-radius: 16rpx; padding: 16rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.type { padding: 4rpx 12rpx; border-radius: 12rpx; font-size: 22rpx; color: #fff; }
.type.service { background: #1890ff; }
.type.environment { background: #52c41a; }
.status { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 12rpx; }
.status.pending { background: #fff7e6; color: #fa8c16; }
.status.replied { background: #f6ffed; color: #52c41a; }
.content { font-size: 26rpx; color: #333; line-height: 1.6; margin: 8rpx 0; }
.meta { display: flex; justify-content: space-between; font-size: 22rpx; color: #999; }
.empty { text-align: center; padding: 80rpx 0; color: #999; }
</style>
