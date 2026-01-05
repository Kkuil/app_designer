<template>
  <view class="inspection-page">
    <!-- 统计卡片 -->
    <view class="stat-cards">
      <view class="stat-card">
        <text class="stat-value">{{ stats.today }}</text>
        <text class="stat-label">今日任务</text>
      </view>
      <view class="stat-card">
        <text class="stat-value completed">{{ stats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-card">
        <text class="stat-value pending">{{ stats.pending }}</text>
        <text class="stat-label">待巡检</text>
      </view>
      <view class="stat-card">
        <text class="stat-value warning">{{ stats.abnormal }}</text>
        <text class="stat-label">异常项</text>
      </view>
    </view>

    <!-- 标签切换 -->
    <view class="tabs">
      <view class="tab-item" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">待巡检</view>
      <view class="tab-item" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">已完成</view>
      <view class="tab-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">全部</view>
    </view>

    <!-- 任务列表 -->
    <scroll-view class="task-list" scroll-y @scrolltolower="loadMore" refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view class="task-item" v-for="task in taskList" :key="task.id" @click="goToDetail(task)">
        <view class="task-header">
          <view class="task-type" :class="'type-' + task.type">{{ task.typeName }}</view>
          <view class="task-status" :class="task.status">{{ getStatusText(task.status) }}</view>
        </view>
        <view class="task-content">
          <text class="task-name">{{ task.name }}</text>
          <view class="task-info">
            <view class="info-item">
              <Location style="width:14px;height:14px;color:#999" />
              <text>{{ task.routeName }}</text>
            </view>
            <view class="info-item">
              <Calendar style="width:14px;height:14px;color:#999" />
              <text>{{ task.planTime }}</text>
            </view>
          </view>
          <view class="task-progress" v-if="task.status === 'processing'">
            <view class="progress-bar">
              <view class="progress-inner" :style="{ width: task.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ task.progress }}%</text>
          </view>
        </view>
        <view class="task-footer">
          <view class="point-info">
            <text>巡检点：{{ task.completedPoints }}/{{ task.totalPoints }}</text>
          </view>
          <button class="btn-start" size="mini" v-if="task.status === 'pending'" @click.stop="startInspection(task)">开始巡检</button>
          <button class="btn-continue" size="mini" v-else-if="task.status === 'processing'" @click.stop="continueInspection(task)">继续巡检</button>
        </view>
      </view>
      
      <view class="loading-more" v-if="loading"><uni-load-more status="loading" /></view>
      <view class="no-more" v-if="!hasMore && taskList.length > 0"><text>没有更多数据了</text></view>
      <view class="empty" v-if="!loading && taskList.length === 0">
        <image src="/static/logo.png" mode="aspectFit" />
        <text>暂无巡检任务</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Task {
  id: number
  name: string
  type: number
  typeName: string
  status: string
  routeName: string
  planTime: string
  progress: number
  totalPoints: number
  completedPoints: number
}

const activeTab = ref('pending')
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)

const stats = reactive({ today: 8, completed: 5, pending: 3, abnormal: 2 })

const taskList = ref<Task[]>([
  { id: 1, name: '设备间日常巡检', type: 1, typeName: '设备巡检', status: 'pending', routeName: 'A栋设备路线', planTime: '09:00-12:00', progress: 0, totalPoints: 12, completedPoints: 0 },
  { id: 2, name: '消防设施巡检', type: 2, typeName: '消防巡检', status: 'processing', routeName: 'B栋消防路线', planTime: '14:00-17:00', progress: 60, totalPoints: 10, completedPoints: 6 },
  { id: 3, name: '环境监测巡检', type: 3, typeName: '环境巡检', status: 'completed', routeName: 'C栋环境路线', planTime: '08:00-10:00', progress: 100, totalPoints: 8, completedPoints: 8 },
  { id: 4, name: '安防设备巡检', type: 4, typeName: '安防巡检', status: 'pending', routeName: '园区安防路线', planTime: '15:00-18:00', progress: 0, totalPoints: 15, completedPoints: 0 }
])

const getStatusText = (status: string): string => {
  const statuses: Record<string, string> = { pending: '待巡检', processing: '巡检中', completed: '已完成', abnormal: '有异常' }
  return statuses[status] || '未知'
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => { loading.value = false; hasMore.value = false }, 500)
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => { refreshing.value = false; hasMore.value = true }, 1000)
}

const goToDetail = (task: Task) => {
  uni.navigateTo({ url: '/pages/inspection/detail?id=' + task.id })
}

const startInspection = (task: Task) => {
  uni.navigateTo({ url: '/pages/inspection/execute?id=' + task.id })
}

const continueInspection = (task: Task) => {
  uni.navigateTo({ url: '/pages/inspection/execute?id=' + task.id })
}

onMounted(() => { })
</script>

<style lang="scss">
.inspection-page { min-height: 100vh; background-color: #f5f5f5; display: flex; flex-direction: column; }

.stat-cards {
  display: flex; padding: 20rpx; gap: 16rpx;
  .stat-card { flex: 1; background-color: #fff; border-radius: 12rpx; padding: 24rpx 16rpx; text-align: center;
    .stat-value { display: block; font-size: 40rpx; font-weight: 600; color: #333; &.completed { color: #52c41a; } &.pending { color: #1890ff; } &.warning { color: #f5222d; } }
    .stat-label { font-size: 22rpx; color: #999; margin-top: 8rpx; }
  }
}

.tabs { display: flex; background-color: #fff; padding: 0 20rpx;
  .tab-item { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; position: relative;
    &.active { color: #1890ff; font-weight: 600; &::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 48rpx; height: 4rpx; background-color: #1890ff; border-radius: 2rpx; } }
  }
}

.task-list { flex: 1; padding: 20rpx; }

.task-item {
  background-color: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx;
  .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx;
    .task-type { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 4rpx; &.type-1 { background-color: #e6f7ff; color: #1890ff; } &.type-2 { background-color: #fff2e8; color: #fa541c; } &.type-3 { background-color: #f6ffed; color: #52c41a; } &.type-4 { background-color: #f9f0ff; color: #722ed1; } }
    .task-status { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 4rpx; &.pending { background-color: #fff7e6; color: #fa8c16; } &.processing { background-color: #e6f7ff; color: #1890ff; } &.completed { background-color: #f6ffed; color: #52c41a; } &.abnormal { background-color: #fff1f0; color: #f5222d; } }
  }
  .task-content { .task-name { font-size: 30rpx; color: #333; font-weight: 500; display: block; margin-bottom: 12rpx; }
    .task-info { display: flex; gap: 24rpx; margin-bottom: 12rpx; .info-item { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #999; } }
    .task-progress { display: flex; align-items: center; gap: 16rpx; .progress-bar { flex: 1; height: 12rpx; background-color: #f0f0f0; border-radius: 6rpx; overflow: hidden; .progress-inner { height: 100%; background: linear-gradient(90deg, #1890ff, #40a9ff); border-radius: 6rpx; } } .progress-text { font-size: 24rpx; color: #1890ff; } }
  }
  .task-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid #f0f0f0;
    .point-info { font-size: 24rpx; color: #999; }
    button { font-size: 24rpx; padding: 0 24rpx; height: 56rpx; line-height: 56rpx; border-radius: 28rpx; &.btn-start { background-color: #1890ff; color: #fff; } &.btn-continue { background-color: #52c41a; color: #fff; } }
  }
}

.loading-more, .no-more { text-align: center; padding: 30rpx 0; color: #999; font-size: 24rpx; }
.empty { text-align: center; padding: 100rpx 0; image { width: 200rpx; height: 200rpx; } text { display: block; margin-top: 20rpx; color: #999; font-size: 26rpx; } }
</style>
