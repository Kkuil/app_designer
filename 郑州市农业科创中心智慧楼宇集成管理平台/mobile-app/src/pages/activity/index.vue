<template>
  <view class="activity-page">
    <!-- 筛选与搜索 -->
    <view class="filter-bar">
      <scroll-view class="tabs" scroll-x>
        <view
          class="tab-item"
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ active: activeTab === tab.value }"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </view>
      </scroll-view>
      <view class="search-input">
        <Search style="width:18px;height:18px;color:#999" />
        <input v-model="keyword" placeholder="搜索活动/主办方" @confirm="loadData" />
      </view>
    </view>

    <!-- 活动列表 -->
    <scroll-view class="activity-list" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="loadMore">
      <view class="activity-card" v-for="item in activityList" :key="item.id" @click="goDetail(item)">
        <image class="cover" :src="item.cover" mode="aspectFill" />
        <view class="card-body">
          <view class="title-row">
            <text class="title">{{ item.title }}</text>
            <view class="tag" :class="item.type">{{ item.typeText }}</view>
          </view>
          <view class="info-row">
            <Calendar style="width:14px;height:14px;color:#999" />
            <text>{{ item.time }}</text>
          </view>
          <view class="info-row">
            <Location style="width:14px;height:14px;color:#999" />
            <text>{{ item.location }}</text>
          </view>
          <view class="footer">
            <view class="status" :class="item.status">{{ getStatusText(item.status) }}</view>
            <view class="count">{{ item.joined }}/{{ item.quota }} 人</view>
          </view>
        </view>
      </view>

      <view class="loading-more" v-if="loading"><uni-load-more status="loading" /></view>
      <view class="no-more" v-if="!hasMore && activityList.length > 0"><text>没有更多数据了</text></view>
      <view class="empty" v-if="!loading && activityList.length === 0">
        <text>暂无活动</text>
      </view>
    </scroll-view>

    <!-- 新建报名 -->
    <view class="fab" @click="createActivity">
      <Plus style="width:26px;height:26px;color:#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ActivityItem {
  id: number
  title: string
  type: string
  typeText: string
  time: string
  location: string
  status: string
  joined: number
  quota: number
  cover: string
}

const tabs = [
  { label: '全部', value: 'all' },
  { label: '报名中', value: 'signup' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'finished' }
]

const activityList = ref<ActivityItem[]>([
  { id: 1, title: '园区羽毛球友谊赛', type: 'sport', typeText: '运动', time: '1月20日 14:00', location: '园区体育馆', status: 'signup', joined: 18, quota: 32, cover: '/static/logo.png' },
  { id: 2, title: 'AI 创新沙龙', type: 'tech', typeText: '科技', time: '1月22日 19:00', location: 'B栋路演厅', status: 'ongoing', joined: 45, quota: 60, cover: '/static/logo.png' },
  { id: 3, title: '消防安全培训', type: 'security', typeText: '安全', time: '1月18日 10:00', location: 'A栋多功能厅', status: 'finished', joined: 80, quota: 80, cover: '/static/logo.png' }
])

const activeTab = ref('all')
const keyword = ref('')
const loading = ref(false)
const hasMore = ref(true)
const refreshing = ref(false)

const getStatusText = (status: string): string => {
  const map: Record<string, string> = { signup: '报名中', ongoing: '进行中', finished: '已结束' }
  return map[status] || '未知'
}

const switchTab = (val: string) => {
  activeTab.value = val
  loadData()
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasMore.value = false
  }, 400)
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => { loading.value = false; hasMore.value = false }, 400)
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => { refreshing.value = false; hasMore.value = true }, 600)
}

const goDetail = (item: ActivityItem) => {
  uni.navigateTo({ url: '/pages/activity/detail?id=' + item.id })
}

const createActivity = () => {
  uni.showToast({ title: '请联系管理员发布活动', icon: 'none' })
}
</script>

<style lang="scss">
.activity-page { min-height: 100vh; background: #f5f5f5; }
.filter-bar { background: #fff; padding: 16rpx 20rpx 10rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.tabs { display: flex; gap: 12rpx; }
.tab-item { padding: 12rpx 20rpx; border-radius: 20rpx; background: #f5f5f5; color: #666; font-size: 26rpx; }
.tab-item.active { background: #e6f7ff; color: #1890ff; font-weight: 600; }
.search-input { margin-top: 12rpx; display: flex; align-items: center; gap: 8rpx; background: #f5f5f5; border-radius: 30rpx; padding: 12rpx 16rpx; }
.search-input input { flex: 1; font-size: 26rpx; }

.activity-list { padding: 20rpx; height: calc(100vh - 200rpx); }
.activity-card { background: #fff; border-radius: 16rpx; overflow: hidden; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.cover { width: 100%; height: 200rpx; }
.card-body { padding: 16rpx; }
.title-row { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 30rpx; color: #333; font-weight: 600; }
.tag { padding: 4rpx 12rpx; border-radius: 12rpx; font-size: 22rpx; color: #fff; }
.tag.sport { background: #1890ff; }
.tag.tech { background: #722ed1; }
.tag.security { background: #f5222d; }
.info-row { display: flex; align-items: center; gap: 8rpx; color: #888; font-size: 24rpx; margin-top: 8rpx; }
.footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12rpx; }
.status { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 12rpx; }
.status.signup { background: #e6f7ff; color: #1890ff; }
.status.ongoing { background: #fff7e6; color: #fa8c16; }
.status.finished { background: #f5f5f5; color: #999; }
.count { font-size: 24rpx; color: #666; }

.loading-more, .no-more { text-align: center; padding: 30rpx 0; color: #999; font-size: 24rpx; }
.empty { text-align: center; padding: 120rpx 0; color: #999; font-size: 26rpx; }

.fab { position: fixed; right: 40rpx; bottom: 140rpx; width: 96rpx; height: 96rpx; border-radius: 50%; background: linear-gradient(135deg, #1890ff, #40a9ff); display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 20rpx rgba(24,144,255,0.35); }
</style>
