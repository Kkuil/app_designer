<template>
  <view class="device-page">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <scroll-view class="category-scroll" scroll-x>
        <view
          class="category-item"
          :class="{ active: activeCategory === cat.value }"
          v-for="cat in categoryOptions"
          :key="cat.value"
          @click="activeCategory = cat.value; loadData()"
        >
          <text>{{ cat.label }}</text>
        </view>
      </scroll-view>

      <view class="search-row">
        <view class="search-input">
          <Search style="width:18px;height:18px;color:#999" />
          <input v-model="keyword" type="text" placeholder="搜索设备名称/编号" @confirm="loadData" />
        </view>
        <picker mode="selector" :range="statusOptions" range-key="label" @change="onStatusChange">
          <view class="status-filter">
            <text>{{ currentStatusLabel }}</text>
            <ArrowDown style="width:14px;height:14px;color:#666" />
          </view>
        </picker>
      </view>
    </view>

    <!-- 设备列表 -->
    <scroll-view class="device-list" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="loadMore">
      <view class="device-card" v-for="item in deviceList" :key="item.id" @click="goDetail(item)">
        <view class="card-header">
          <view class="device-name">{{ item.name }}</view>
          <view class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</view>
        </view>
        <view class="device-meta">
          <text class="meta-text">编号：{{ item.code }}</text>
          <text class="meta-text">类型：{{ item.type }}</text>
        </view>
        <view class="device-meta">
          <text class="meta-text">位置：{{ item.location }}</text>
          <text class="meta-text">负责人：{{ item.manager }}</text>
        </view>
        <view class="device-stats">
          <view class="stat">
            <text class="stat-label">在线时长</text>
            <text class="stat-value">{{ item.onlineHours }}h</text>
          </view>
          <view class="stat">
            <text class="stat-label">今日告警</text>
            <text class="stat-value warning">{{ item.alarmCount }}</text>
          </view>
          <view class="stat">
            <text class="stat-label">健康度</text>
            <text class="stat-value">{{ item.health }}%</text>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading"><uni-load-more status="loading" /></view>
      <view class="no-more" v-if="!hasMore && deviceList.length > 0"><text>没有更多数据了</text></view>
      <view class="empty" v-if="!loading && deviceList.length === 0">
        <image src="/static/logo.png" mode="aspectFit" />
        <text>暂无设备数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface DeviceItem {
  id: number
  name: string
  code: string
  type: string
  status: string
  location: string
  manager: string
  onlineHours: number
  alarmCount: number
  health: number
}

const categoryOptions = [
  { label: '全部', value: 'all' },
  { label: '空调', value: 'ac' },
  { label: '电梯', value: 'elevator' },
  { label: '照明', value: 'light' },
  { label: '安防', value: 'security' },
  { label: '消防', value: 'fire' }
]

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
  { label: '告警', value: 'alarm' },
  { label: '检修', value: 'maintenance' }
]

const activeCategory = ref('all')
const keyword = ref('')
const statusFilter = ref('all')
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)

const deviceList = ref<DeviceItem[]>([
  { id: 1, name: 'A栋主机空调', code: 'AC-001', type: '空调', status: 'online', location: 'A栋3F机房', manager: '张三', onlineHours: 18, alarmCount: 0, health: 96 },
  { id: 2, name: 'B栋电梯#1', code: 'EL-102', type: '电梯', status: 'maintenance', location: 'B栋', manager: '李四', onlineHours: 6, alarmCount: 1, health: 80 },
  { id: 3, name: '停车场摄像头', code: 'CAM-233', type: '安防', status: 'alarm', location: '地下B2', manager: '王五', onlineHours: 22, alarmCount: 2, health: 72 }
])

const currentStatusLabel = computed(() => statusOptions.find((s) => s.value === statusFilter.value)?.label || '状态')

const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    online: '在线',
    offline: '离线',
    alarm: '告警',
    maintenance: '检修'
  }
  return map[status] || '未知'
}

const onStatusChange = (e: any) => {
  statusFilter.value = statusOptions[e.detail.value].value
  loadData()
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasMore.value = false
  }, 400)
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
    hasMore.value = true
  }, 600)
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasMore.value = false
  }, 500)
}

const goDetail = (item: DeviceItem) => {
  uni.navigateTo({ url: '/pages/device/detail?id=' + item.id })
}
</script>

<style lang="scss">
.device-page { min-height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }

.filter-bar { background-color: #fff; padding: 16rpx 20rpx; }
.category-scroll { white-space: nowrap; display: flex; gap: 12rpx; }
.category-item { padding: 12rpx 20rpx; border-radius: 24rpx; background: #f5f5f5; color: #666; font-size: 26rpx; display: inline-flex; }
.category-item.active { background: #e6f7ff; color: #1890ff; }

.search-row { display: flex; gap: 16rpx; margin-top: 16rpx; }
.search-input { flex: 1; display: flex; align-items: center; gap: 10rpx; background: #f5f5f5; border-radius: 30rpx; padding: 14rpx 20rpx; }
.search-input input { flex: 1; font-size: 26rpx; }
.status-filter { display: flex; align-items: center; gap: 8rpx; background: #f5f5f5; border-radius: 30rpx; padding: 14rpx 20rpx; font-size: 26rpx; color: #666; }

.device-list { flex: 1; padding: 20rpx; }
.device-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.device-name { font-size: 30rpx; color: #333; font-weight: 600; }
.status-tag { font-size: 22rpx; padding: 6rpx 14rpx; border-radius: 14rpx; }
.status-tag.online { background: #f6ffed; color: #52c41a; }
.status-tag.offline { background: #f5f5f5; color: #999; }
.status-tag.alarm { background: #fff1f0; color: #f5222d; }
.status-tag.maintenance { background: #fff7e6; color: #fa8c16; }

.device-meta { display: flex; justify-content: space-between; color: #888; font-size: 24rpx; margin: 4rpx 0; }
.device-stats { display: flex; justify-content: space-between; margin-top: 12rpx; }
.stat { text-align: left; }
.stat-label { display: block; font-size: 22rpx; color: #999; }
.stat-value { display: block; font-size: 28rpx; color: #333; font-weight: 600; }
.stat-value.warning { color: #f5222d; }

.loading-more, .no-more { text-align: center; padding: 30rpx 0; color: #999; font-size: 24rpx; }
.empty { text-align: center; padding: 120rpx 0; }
.empty image { width: 200rpx; height: 200rpx; }
.empty text { display: block; margin-top: 16rpx; color: #999; font-size: 26rpx; }
</style>
