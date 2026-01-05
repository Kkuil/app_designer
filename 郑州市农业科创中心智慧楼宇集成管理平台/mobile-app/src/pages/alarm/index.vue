<template>
  <view class="alarm-page">
    <!-- 顶部标签切换 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'realtime' }"
        @click="activeTab = 'realtime'"
      >
        实时报警
        <view class="badge" v-if="realtimeCount > 0">{{ realtimeCount }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        历史报警
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-bar">
      <picker mode="selector" :range="levelOptions" range-key="label" @change="onLevelChange">
        <view class="filter-item">
          <text>{{ selectedLevel?.label || '报警等级' }}</text>
          <ArrowDown style="width:14px;height:14px;color:#666" />
        </view>
      </picker>
      <picker mode="selector" :range="typeOptions" range-key="label" @change="onTypeChange">
        <view class="filter-item">
          <text>{{ selectedType?.label || '报警类型' }}</text>
          <ArrowDown style="width:14px;height:14px;color:#666" />
        </view>
      </picker>
      <picker mode="selector" :range="statusOptions" range-key="label" @change="onStatusChange">
        <view class="filter-item">
          <text>{{ selectedStatus?.label || '处理状态' }}</text>
          <ArrowDown style="width:14px;height:14px;color:#666" />
        </view>
      </picker>
    </view>

    <!-- 报警列表 -->
    <scroll-view 
      class="alarm-list" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="alarm-item" v-for="alarm in alarmList" :key="alarm.id" @click="goToDetail(alarm)">
        <view class="alarm-header">
          <view class="alarm-level" :class="'level-' + alarm.level">
            {{ getLevelText(alarm.level) }}
          </view>
          <text class="alarm-time">{{ alarm.time }}</text>
        </view>
        <view class="alarm-content">
          <text class="alarm-title">{{ alarm.title }}</text>
          <text class="alarm-device">设备：{{ alarm.deviceName }}</text>
          <text class="alarm-location">位置：{{ alarm.location }}</text>
        </view>
        <view class="alarm-footer">
          <view class="alarm-status" :class="alarm.status">
            {{ getStatusText(alarm.status) }}
          </view>
          <view class="alarm-actions" v-if="alarm.status === 'pending'">
            <button class="action-btn confirm" size="mini" @click.stop="confirmAlarm(alarm)">确认</button>
            <button class="action-btn handle" size="mini" @click.stop="handleAlarm(alarm)">处理</button>
          </view>
        </view>
      </view>
      
      <view class="loading-more" v-if="loading">
        <uni-load-more status="loading" />
      </view>
      <view class="no-more" v-if="!hasMore && alarmList.length > 0">
        <text>没有更多数据了</text>
      </view>
      <view class="empty" v-if="!loading && alarmList.length === 0">
        <image src="/static/logo.png" mode="aspectFit" />
        <text>暂无报警信息</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Alarm {
  id: number
  level: number
  title: string
  deviceName: string
  location: string
  time: string
  status: string
  type: string
}

const activeTab = ref('realtime')
const realtimeCount = ref(5)
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 筛选选项
const levelOptions = [
  { label: '全部等级', value: '' },
  { label: '一般', value: 1 },
  { label: '重要', value: 2 },
  { label: '紧急', value: 3 }
]

const typeOptions = [
  { label: '全部类型', value: '' },
  { label: '设备报警', value: 'device' },
  { label: '环境报警', value: 'environment' },
  { label: '安防报警', value: 'security' },
  { label: '消防报警', value: 'fire' }
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待处理', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已处理', value: 'handled' }
]

const selectedLevel = ref<any>(null)
const selectedType = ref<any>(null)
const selectedStatus = ref<any>(null)

// 报警列表
const alarmList = ref<Alarm[]>([
  { id: 1, level: 3, title: '烟感探测器报警', deviceName: '烟感-5F-001', location: '5楼东区走廊', time: '2025-01-15 14:30:22', status: 'pending', type: 'fire' },
  { id: 2, level: 2, title: '空调运行温度过高', deviceName: '空调主机-01', location: '3楼机房', time: '2025-01-15 14:25:18', status: 'confirmed', type: 'device' },
  { id: 3, level: 2, title: '门禁非法入侵', deviceName: '门禁-1F-Main', location: '1楼大厅', time: '2025-01-15 14:20:05', status: 'pending', type: 'security' },
  { id: 4, level: 1, title: '环境温度超限', deviceName: '温度传感器-2F', location: '2楼办公区', time: '2025-01-15 14:15:33', status: 'handled', type: 'environment' },
  { id: 5, level: 1, title: '设备通讯异常', deviceName: '电表-3F-001', location: '3楼配电间', time: '2025-01-15 14:10:12', status: 'pending', type: 'device' }
])

// 获取等级文本
const getLevelText = (level: number) => {
  const texts: Record<number, string> = { 1: '一般', 2: '重要', 3: '紧急' }
  return texts[level] || '未知'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = { pending: '待处理', confirmed: '已确认', handled: '已处理' }
  return texts[status] || '未知'
}

// 筛选变更
const onLevelChange = (e: any) => {
  selectedLevel.value = levelOptions[e.detail.value]
  loadData()
}

const onTypeChange = (e: any) => {
  selectedType.value = typeOptions[e.detail.value]
  loadData()
}

const onStatusChange = (e: any) => {
  selectedStatus.value = statusOptions[e.detail.value]
  loadData()
}

// 加载数据
const loadData = () => {
  page.value = 1
  hasMore.value = true
  // 调用API加载数据
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  // 模拟刷新
  setTimeout(() => {
    refreshing.value = false
  }, 1500)
}

// 加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  // 调用API加载更多
}

// 跳转详情
const goToDetail = (alarm: Alarm) => {
  uni.navigateTo({ url: `/pages/alarm/detail?id=${alarm.id}` })
}

// 确认报警
const confirmAlarm = (alarm: Alarm) => {
  uni.showModal({
    title: '确认报警',
    content: '确认该报警信息？',
    success: (res) => {
      if (res.confirm) {
        // 调用API确认报警
        alarm.status = 'confirmed'
        uni.showToast({ title: '已确认', icon: 'success' })
      }
    }
  })
}

// 处理报警
const handleAlarm = (alarm: Alarm) => {
  uni.navigateTo({ url: `/pages/alarm/handle?id=${alarm.id}` })
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss">
.alarm-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background-color: #fff;
  padding: 20rpx 0;
  
  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 16rpx 0;
    position: relative;
    
    &.active {
      color: #409eff;
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #409eff;
        border-radius: 2rpx;
      }
    }
    
    .badge {
      position: absolute;
      top: 8rpx;
      right: 30%;
      background-color: #f56c6c;
      color: #fff;
      font-size: 20rpx;
      padding: 2rpx 10rpx;
      border-radius: 16rpx;
      min-width: 32rpx;
      text-align: center;
    }
  }
}

.filter-bar {
  display: flex;
  background-color: #fff;
  padding: 16rpx 20rpx;
  border-top: 1rpx solid #eee;
  
  .filter-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #666;
    
    text {
      margin-right: 8rpx;
    }
  }
}

.alarm-list {
  flex: 1;
  padding: 20rpx;
}

.alarm-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .alarm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .alarm-level {
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      
      &.level-1 {
        background-color: #fdf6ec;
        color: #e6a23c;
      }
      &.level-2 {
        background-color: #fef0f0;
        color: #f56c6c;
      }
      &.level-3 {
        background-color: #ffeded;
        color: #ff0000;
      }
    }
    
    .alarm-time {
      font-size: 22rpx;
      color: #999;
    }
  }
  
  .alarm-content {
    .alarm-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .alarm-device,
    .alarm-location {
      font-size: 24rpx;
      color: #666;
      display: block;
      margin-bottom: 8rpx;
    }
  }
  
  .alarm-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .alarm-status {
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      
      &.pending {
        background-color: #fef0f0;
        color: #f56c6c;
      }
      &.confirmed {
        background-color: #fdf6ec;
        color: #e6a23c;
      }
      &.handled {
        background-color: #f0f9eb;
        color: #67c23a;
      }
    }
    
    .alarm-actions {
      display: flex;
      gap: 16rpx;
      
      .action-btn {
        font-size: 22rpx;
        padding: 0 24rpx;
        
        &.confirm {
          background-color: #e6a23c;
          color: #fff;
        }
        
        &.handle {
          background-color: #409eff;
          color: #fff;
        }
      }
    }
  }
}

.loading-more,
.no-more {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 24rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
