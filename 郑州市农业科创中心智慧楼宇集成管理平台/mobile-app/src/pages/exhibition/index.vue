<template>
  <view class="exhibition-page">
    <view class="header">
      <view class="title">展厅活动</view>
      <picker mode="selector" :range="statusOptions" @change="onStatusChange">
        <view class="filter">{{ currentStatus || '全部状态' }}</view>
      </picker>
    </view>

    <scroll-view scroll-y class="list">
      <view class="card" v-for="item in filtered" :key="item.id">
        <view class="banner">
          <view class="tag">{{ item.status }}</view>
        </view>
        <view class="info">
          <view class="name">{{ item.title }}</view>
          <view class="meta">时间：{{ item.time }}</view>
          <view class="meta">地点：{{ item.place }}</view>
          <view class="meta">人数：{{ item.people }} / {{ item.limit }}</view>
          <view class="desc">{{ item.desc }}</view>
        </view>
        <view class="actions">
          <button size="mini" type="primary">预约参观</button>
          <button size="mini" v-if="item.status === '进行中'">签到</button>
        </view>
      </view>
      <uni-load-more status="noMore" :contentText="{ contentdown: '下拉刷新', contentrefresh: '加载中', contentnomore: '没有更多了' }" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const statusOptions = ['全部', '预告', '进行中', '已结束']
const currentStatus = ref('')

const list = ref([
  { id: 1, title: '智慧农业成果展', time: '2023-09-06 09:00-17:00', place: '综合展厅A', status: '进行中', people: 60, limit: 200, desc: '展示温室智能化、物联网监控等成果。' },
  { id: 2, title: '新品种发布会', time: '2023-09-08 14:00-16:00', place: '展厅路演区', status: '预告', people: 12, limit: 80, desc: '发布新品种育种成果，支持现场答疑。' },
  { id: 3, title: '农业科普开放日', time: '2023-09-03 09:00-12:00', place: '公众体验区', status: '已结束', people: 120, limit: 150, desc: '面向公众的农业知识科普与互动体验。' }
])

const filtered = computed(() => list.value.filter((i) => !currentStatus.value || currentStatus.value === '全部' || i.status === currentStatus.value))

const onStatusChange = (e: any) => { currentStatus.value = statusOptions[e.detail.value] }
</script>

<style lang="scss">
.exhibition-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14rpx; }
.title { font-size: 32rpx; font-weight: 600; color: #333; }
.filter { padding: 10rpx 16rpx; background: #e6f4ff; color: #1890ff; border-radius: 10rpx; font-size: 24rpx; }
.list { height: calc(100vh - 160rpx); }
.card { background: #fff; border-radius: 14rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); margin-bottom: 14rpx; }
.banner { height: 160rpx; background: linear-gradient(120deg, #4facfe, #00f2fe); position: relative; }
.tag { position: absolute; left: 16rpx; top: 16rpx; padding: 8rpx 14rpx; background: rgba(0,0,0,0.35); color: #fff; border-radius: 8rpx; font-size: 24rpx; }
.info { padding: 16rpx; }
.name { font-size: 30rpx; font-weight: 700; color: #333; margin-bottom: 6rpx; }
.meta { font-size: 24rpx; color: #666; margin: 4rpx 0; }
.desc { font-size: 24rpx; color: #555; margin-top: 6rpx; line-height: 1.5; }
.actions { display: flex; gap: 12rpx; padding: 0 16rpx 16rpx; }
button[size='mini'] { border-radius: 28rpx; padding: 0 18rpx; }
</style>
