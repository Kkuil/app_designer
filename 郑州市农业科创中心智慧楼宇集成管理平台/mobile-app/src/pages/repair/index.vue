<template>
  <view class="repair-page">
    <view class="header">
      <view class="title">报修管理</view>
      <button size="mini" class="btn" @click="goCreate">新建报修</button>
    </view>

    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <scroll-view scroll-y class="list">
      <view class="card" v-for="item in filtered" :key="item.id">
        <view class="row">
          <view class="name">{{ item.title }}</view>
          <view class="status" :class="item.status">{{ statusText(item.status) }}</view>
        </view>
        <view class="meta">设备：{{ item.device }}</view>
        <view class="meta">位置：{{ item.location }}</view>
        <view class="meta">上报时间：{{ item.time }}</view>
        <view class="actions">
          <button size="mini">详情</button>
          <button size="mini" type="primary" v-if="item.status === 'todo'">派单</button>
          <button size="mini" type="warn" v-if="item.status === 'todo'">取消</button>
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
  { label: '待处理', value: 'todo' },
  { label: '处理中', value: 'doing' },
  { label: '已完成', value: 'done' }
]

const list = ref([
  { id: 1, title: '温室喷淋故障', device: '喷淋阀A1', location: '1号温室', time: '2023-09-05 10:00', status: 'todo' },
  { id: 2, title: '照明不亮', device: 'LED灯组B3', location: '实验楼', time: '2023-09-05 11:00', status: 'doing' },
  { id: 3, title: '监控画面模糊', device: '摄像头C2', location: '2号棚', time: '2023-09-04 16:20', status: 'done' }
])

const currentTab = ref('')

const filtered = computed(() => list.value.filter((i) => !currentTab.value || i.status === currentTab.value))

const statusText = (s: string) => {
  const map: Record<string, string> = { todo: '待处理', doing: '处理中', done: '已完成' }
  return map[s] || '未知'
}

const goCreate = () => uni.navigateTo({ url: '/pages/repair/create' })
</script>

<style lang="scss">
.repair-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; color: #333; }
.btn { background: #1890ff; color: #fff; border: none; }
.tabs { display: flex; gap: 12rpx; margin-bottom: 12rpx; }
.tab { padding: 10rpx 20rpx; border-radius: 24rpx; background: #f2f2f2; color: #666; font-size: 24rpx; }
.tab.active { background: #e6f4ff; color: #1890ff; border: 1rpx solid #1890ff; }
.list { height: calc(100vh - 200rpx); }
.card { background: #fff; border-radius: 14rpx; padding: 20rpx; margin-bottom: 14rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6rpx; }
.name { font-size: 30rpx; font-weight: 600; color: #333; }
.status { font-size: 24rpx; padding: 6rpx 14rpx; border-radius: 20rpx; background: #f5f5f5; color: #666; }
.status.todo { color: #fa8c16; background: #fff7e6; }
.status.doing { color: #1890ff; background: #e6f4ff; }
.status.done { color: #52c41a; background: #f6ffed; }
.meta { font-size: 24rpx; color: #666; margin: 4rpx 0; }
.actions { display: flex; gap: 12rpx; margin-top: 10rpx; }
button[size='mini'] { border-radius: 28rpx; padding: 0 18rpx; }
</style>
