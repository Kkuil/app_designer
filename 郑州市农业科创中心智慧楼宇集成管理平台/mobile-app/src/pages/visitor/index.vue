<template>
  <view class="visitor-page">
    <view class="header">
      <view class="title">访客管理</view>
      <button class="btn" size="mini" @click="goInvite">邀请访客</button>
    </view>

    <view class="filter">
      <picker mode="date" @change="onDateChange">
        <view class="date">{{ query.date || '选择日期' }}</view>
      </picker>
      <view class="tags">
        <view
          v-for="t in statusOptions"
          :key="t.value"
          class="tag"
          :class="{ active: query.status === t.value }"
          @click="query.status = t.value"
        >
          {{ t.label }}
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="list">
      <view class="card" v-for="item in filtered" :key="item.id">
        <view class="row">
          <view class="name">{{ item.name }}</view>
          <view class="status" :class="item.status">{{ statusText(item.status) }}</view>
        </view>
        <view class="meta">来访时间：{{ item.time }}</view>
        <view class="meta">来访事由：{{ item.reason }}</view>
        <view class="meta">携带物品：{{ item.items || '无' }}</view>
        <view class="actions">
          <button size="mini" @click="showCode(item)">出入码</button>
          <button size="mini" type="warn" v-if="item.status === 'pending'">撤回</button>
        </view>
      </view>
      <uni-load-more status="noMore" :contentText="{ contentdown: '下拉刷新', contentrefresh: '加载中', contentnomore: '没有更多了' }" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待到访', value: 'pending' },
  { label: '已到访', value: 'arrived' },
  { label: '已结束', value: 'finished' }
]

const query = reactive({ date: '', status: '' })

const list = reactive([
  { id: 1, name: '张三', time: '2023-09-05 10:00', reason: '会议洽谈', status: 'pending', items: '资料袋' },
  { id: 2, name: '李四', time: '2023-09-05 14:00', reason: '设备维修', status: 'arrived', items: '工具箱' },
  { id: 3, name: '王五', time: '2023-09-04 09:30', reason: '参观交流', status: 'finished', items: '' }
])

const filtered = computed(() => list.filter((i) => (!query.status || i.status === query.status) && (!query.date || i.time.startsWith(query.date))) )

const onDateChange = (e: any) => {
  query.date = e.detail.value
}

const statusText = (s: string) => {
  const map: Record<string, string> = { pending: '待到访', arrived: '已到访', finished: '已结束' }
  return map[s] || '未知'
}

const showCode = (item: any) => {
  uni.showToast({ title: `${item.name}的通行码`, icon: 'none' })
}

const goInvite = () => {
  uni.navigateTo({ url: '/pages/visitor/invite' })
}
</script>

<style lang="scss">
.visitor-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; color: #333; }
.btn { background: #1890ff; color: #fff; border: none; }
.filter { background: #fff; border-radius: 12rpx; padding: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); margin-bottom: 16rpx; }
.date { font-size: 26rpx; color: #333; padding: 12rpx 0; }
.tags { display: flex; gap: 12rpx; margin-top: 8rpx; flex-wrap: wrap; }
.tag { padding: 10rpx 20rpx; border-radius: 24rpx; background: #f2f2f2; color: #666; font-size: 24rpx; }
.tag.active { background: #e6f4ff; color: #1890ff; border: 1rpx solid #1890ff; }
.list { height: calc(100vh - 220rpx); }
.card { background: #fff; border-radius: 14rpx; padding: 20rpx; margin-bottom: 14rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6rpx; }
.name { font-size: 30rpx; font-weight: 600; color: #333; }
.status { font-size: 24rpx; padding: 6rpx 14rpx; border-radius: 20rpx; background: #f5f5f5; color: #666; }
.status.pending { color: #fa8c16; background: #fff7e6; }
.status.arrived { color: #52c41a; background: #f6ffed; }
.status.finished { color: #999; background: #f5f5f5; }
.meta { font-size: 24rpx; color: #666; margin: 4rpx 0; }
.actions { display: flex; gap: 12rpx; margin-top: 10rpx; }
button[size='mini'] { border-radius: 28rpx; padding: 0 18rpx; }
</style>
