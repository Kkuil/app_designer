<template>
  <view class="meeting-page">
    <view class="header">
      <view class="title">会议室预定</view>
      <picker mode="date" @change="onDateChange">
        <view class="date">{{ date }}</view>
      </picker>
    </view>

    <view class="tabs">
      <view
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: current === t.value }"
        @click="current = t.value"
      >
        {{ t.label }}
      </view>
    </view>

    <scroll-view scroll-y class="list">
      <view class="card" v-for="room in filtered" :key="room.id">
        <view class="row">
          <view>
            <view class="name">{{ room.name }}</view>
            <view class="meta">容量：{{ room.capacity }}人 · 设备：{{ room.equip }}</view>
          </view>
          <view class="status" :class="room.status">{{ statusText(room.status) }}</view>
        </view>
        <view class="meta">下个会议：{{ room.next || '空闲中' }}</view>
        <view class="actions">
          <button size="mini" type="primary" @click="book(room)">预约</button>
          <button size="mini" v-if="room.status === 'using'">查看占用</button>
        </view>
      </view>
      <uni-load-more status="noMore" :contentText="{ contentdown: '下拉刷新', contentrefresh: '加载中', contentnomore: '没有更多了' }" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const tabs = [
  { label: '全部', value: '' },
  { label: '可预定', value: 'free' },
  { label: '使用中', value: 'using' }
]

const date = ref(new Date().toISOString().slice(0, 10))
const current = ref('')

const rooms = ref([
  { id: 1, name: 'A101 小型会议室', capacity: 8, equip: '投影/白板', status: 'free', next: '空闲' },
  { id: 2, name: 'A201 大型会议室', capacity: 20, equip: 'LED屏/视频会议', status: 'using', next: '10:00-11:00 团队例会' },
  { id: 3, name: 'B102 培训室', capacity: 30, equip: '音响/投影', status: 'free', next: '14:00-16:00 培训占用' }
])

const filtered = computed(() => rooms.value.filter((r) => !current.value || r.status === current.value))

const statusText = (s: string) => {
  const map: Record<string, string> = { free: '可预定', using: '使用中' }
  return map[s] || '未知'
}

const onDateChange = (e: any) => { date.value = e.detail.value }

const book = (room: any) => {
  uni.navigateTo({ url: `/pages/meeting/book?id=${room.id}&date=${date.value}` })
}
</script>

<style lang="scss">
.meeting-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; color: #333; }
.date { font-size: 26rpx; color: #1890ff; padding: 10rpx 16rpx; background: #e6f4ff; border-radius: 10rpx; }
.tabs { display: flex; gap: 12rpx; margin-bottom: 12rpx; }
.tab { padding: 10rpx 20rpx; border-radius: 24rpx; background: #f2f2f2; color: #666; font-size: 24rpx; }
.tab.active { background: #e6f4ff; color: #1890ff; border: 1rpx solid #1890ff; }
.list { height: calc(100vh - 220rpx); }
.card { background: #fff; border-radius: 14rpx; padding: 20rpx; margin-bottom: 14rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.name { font-size: 30rpx; font-weight: 600; color: #333; }
.meta { font-size: 24rpx; color: #666; margin: 4rpx 0; }
.status { font-size: 24rpx; padding: 6rpx 14rpx; border-radius: 20rpx; background: #f5f5f5; color: #666; }
.status.free { color: #52c41a; background: #f6ffed; }
.status.using { color: #fa8c16; background: #fff7e6; }
.actions { display: flex; gap: 12rpx; margin-top: 10rpx; }
button[size='mini'] { border-radius: 28rpx; padding: 0 18rpx; }
</style>
