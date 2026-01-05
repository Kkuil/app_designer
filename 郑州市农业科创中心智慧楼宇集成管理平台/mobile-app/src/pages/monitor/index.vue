<template>
  <view class="monitor-page">
    <view class="header">
      <view class="title">视频监控</view>
      <view class="filter">
        <view
          v-for="f in filters"
          :key="f.value"
          class="tag"
          :class="{ active: current === f.value }"
          @click="current = f.value"
        >
          {{ f.label }}
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="grid">
      <view class="card" v-for="cam in filtered" :key="cam.id" @click="open(cam)">
        <view class="thumb">
          <view class="overlay">实时预览</view>
          <view class="dot" :class="cam.status"></view>
        </view>
        <view class="name">{{ cam.name }}</view>
        <view class="meta">位置：{{ cam.location }}</view>
        <view class="meta">最后检查：{{ cam.lastCheck }}</view>
      </view>
      <uni-load-more status="noMore" :contentText="{ contentdown: '下拉刷新', contentrefresh: '加载中', contentnomore: '没有更多了' }" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const filters = [
  { label: '全部', value: '' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' }
]

const cams = ref([
  { id: 1, name: '温室1-入口', location: '1号温室', status: 'online', lastCheck: '09:20' },
  { id: 2, name: '温室1-走廊', location: '1号温室', status: 'online', lastCheck: '09:18' },
  { id: 3, name: '实验楼-前台', location: '实验楼', status: 'offline', lastCheck: '08:05' },
  { id: 4, name: '仓库-北门', location: '仓库', status: 'online', lastCheck: '09:05' }
])

const current = ref('')

const filtered = computed(() => cams.value.filter((c) => !current.value || c.status === current.value))

const open = (cam: any) => uni.showToast({ title: `${cam.name} 打开中`, icon: 'none' })
</script>

<style lang="scss">
.monitor-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.header { margin-bottom: 12rpx; }
.title { font-size: 32rpx; font-weight: 600; color: #333; margin-bottom: 10rpx; }
.filter { display: flex; gap: 12rpx; }
.tag { padding: 10rpx 20rpx; border-radius: 24rpx; background: #f2f2f2; color: #666; font-size: 24rpx; }
.tag.active { background: #e6f4ff; color: #1890ff; border: 1rpx solid #1890ff; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12rpx; height: calc(100vh - 140rpx); }
.card { background: #fff; border-radius: 12rpx; padding: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.thumb { height: 200rpx; border-radius: 10rpx; background: linear-gradient(135deg, #1f7ae0, #4facfe); position: relative; overflow: hidden; }
.overlay { position: absolute; left: 12rpx; bottom: 12rpx; color: #fff; font-size: 24rpx; background: rgba(0,0,0,0.25); padding: 6rpx 12rpx; border-radius: 8rpx; }
.dot { position: absolute; right: 12rpx; top: 12rpx; width: 16rpx; height: 16rpx; border-radius: 50%; background: #52c41a; }
.dot.offline { background: #ff4d4f; }
.name { font-size: 28rpx; font-weight: 600; color: #333; margin: 10rpx 0 4rpx; }
.meta { font-size: 24rpx; color: #666; margin: 2rpx 0; }
</style>
