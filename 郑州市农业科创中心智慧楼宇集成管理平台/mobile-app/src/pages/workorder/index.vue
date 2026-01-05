<template>
  <view class="workorder-page">
    <!-- 顶部标签 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }"
        @click="switchTab('all')"
      >全部</view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }"
        @click="switchTab('pending')"
      >
        待处理
        <view class="badge" v-if="pendingCount > 0">{{ pendingCount }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'processing' }"
        @click="switchTab('processing')"
      >处理中</view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'completed' }"
        @click="switchTab('completed')"
      >已完成</view>
    </view>

    <!-- 搜索筛选 -->
    <view class="search-bar">
      <view class="search-input">
        <Search style="width:18px;height:18px;color:#999" />
        <input type="text" v-model="searchKeyword" placeholder="搜索工单编号/标题" @confirm="onSearch" />
      </view>
      <view class="filter-btn" @click="showFilter = true">
        <Setting style="width:20px;height:20px;color:#666" />
      </view>
    </view>

    <!-- 工单列表 -->
    <scroll-view 
      class="workorder-list" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="workorder-item" v-for="item in workorderList" :key="item.id" @click="goToDetail(item)">
        <view class="item-header">
          <text class="order-code">{{ item.code }}</text>
          <view class="order-status" :class="item.status">{{ getStatusText(item.status) }}</view>
        </view>
        <view class="item-content">
          <text class="order-title">{{ item.title }}</text>
          <view class="order-info">
            <view class="info-item">
              <Location style="width:14px;height:14px;color:#999" />
              <text>{{ item.location }}</text>
            </view>
            <view class="info-item">
              <Calendar style="width:14px;height:14px;color:#999" />
              <text>{{ item.createTime }}</text>
            </view>
          </view>
          <view class="order-tags">
            <view class="tag" :class="'type-' + item.type">{{ item.typeName }}</view>
            <view class="tag" :class="'priority-' + item.priority">{{ getPriorityText(item.priority) }}</view>
          </view>
        </view>
        <view class="item-footer">
          <view class="handler-info">
            <image class="avatar" :src="item.handlerAvatar" mode="aspectFill" />
            <text class="handler-name">{{ item.handlerName || '待指派' }}</text>
          </view>
          <view class="action-btns" v-if="item.status === 'pending'">
            <button class="btn-accept" size="mini" @click.stop="acceptOrder(item)">接单</button>
          </view>
          <view class="action-btns" v-else-if="item.status === 'processing'">
            <button class="btn-complete" size="mini" @click.stop="completeOrder(item)">完成</button>
          </view>
        </view>
      </view>
      
      <view class="loading-more" v-if="loading">
        <uni-load-more status="loading" />
      </view>
      <view class="no-more" v-if="!hasMore && workorderList.length > 0">
        <text>没有更多数据了</text>
      </view>
      <view class="empty" v-if="!loading && workorderList.length === 0">
        <image src="/static/logo.png" mode="aspectFit" />
        <text>暂无工单数据</text>
      </view>
    </scroll-view>

    <!-- 新建工单按钮 -->
    <view class="fab-button" @click="createOrder">
      <Plus style="width:28px;height:28px;color:#fff" />
    </view>

    <!-- 筛选弹窗 -->
    <uni-popup ref="filterPopup" type="right">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">筛选条件</text>
          <text class="reset-btn" @click="resetFilter">重置</text>
        </view>
        <view class="filter-content">
          <view class="filter-group">
            <text class="group-title">工单类型</text>
            <view class="option-list">
              <view 
                class="option-item" 
                :class="{ active: filterForm.type === item.value }"
                v-for="item in typeOptions" 
                :key="item.value"
                @click="filterForm.type = item.value"
              >{{ item.label }}</view>
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">优先级</text>
            <view class="option-list">
              <view 
                class="option-item" 
                :class="{ active: filterForm.priority === item.value }"
                v-for="item in priorityOptions" 
                :key="item.value"
                @click="filterForm.priority = item.value"
              >{{ item.label }}</view>
            </view>
          </view>
          <view class="filter-group">
            <text class="group-title">时间范围</text>
            <view class="date-range">
              <picker mode="date" @change="onStartDateChange">
                <view class="date-input">{{ filterForm.startDate || '开始日期' }}</view>
              </picker>
              <text class="date-separator">至</text>
              <picker mode="date" @change="onEndDateChange">
                <view class="date-input">{{ filterForm.endDate || '结束日期' }}</view>
              </picker>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="btn-cancel" @click="closeFilter">取消</button>
          <button class="btn-confirm" @click="applyFilter">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

interface Workorder {
  id: number
  code: string
  title: string
  status: string
  type: number
  typeName: string
  priority: number
  location: string
  createTime: string
  handlerName: string
  handlerAvatar: string
}

const activeTab = ref('all')
const searchKeyword = ref('')
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const showFilter = ref(false)
const filterPopup = ref()

const pendingCount = ref(5)

const typeOptions = [
  { label: '全部', value: 0 },
  { label: '设备维修', value: 1 },
  { label: '报警处理', value: 2 },
  { label: '巡检任务', value: 3 },
  { label: '保养维护', value: 4 }
]

const priorityOptions = [
  { label: '全部', value: 0 },
  { label: '紧急', value: 1 },
  { label: '高', value: 2 },
  { label: '中', value: 3 },
  { label: '低', value: 4 }
]

const filterForm = reactive({
  type: 0,
  priority: 0,
  startDate: '',
  endDate: ''
})

const workorderList = ref<Workorder[]>([
  { id: 1, code: 'WO202501150001', title: '空调系统故障维修', status: 'pending', type: 1, typeName: '设备维修', priority: 1, location: 'A栋3楼会议室', createTime: '2025-01-15 10:30', handlerName: '', handlerAvatar: '/static/avatar-default.png' },
  { id: 2, code: 'WO202501150002', title: '消防报警处理', status: 'processing', type: 2, typeName: '报警处理', priority: 1, location: 'B栋1楼大厅', createTime: '2025-01-15 09:20', handlerName: '张三', handlerAvatar: '/static/avatar-default.png' },
  { id: 3, code: 'WO202501140003', title: '电梯日常巡检', status: 'completed', type: 3, typeName: '巡检任务', priority: 3, location: 'C栋', createTime: '2025-01-14 14:00', handlerName: '李四', handlerAvatar: '/static/avatar-default.png' },
  { id: 4, code: 'WO202501140004', title: '照明设备更换', status: 'pending', type: 1, typeName: '设备维修', priority: 2, location: 'A栋地下停车场', createTime: '2025-01-14 11:30', handlerName: '', handlerAvatar: '/static/avatar-default.png' },
  { id: 5, code: 'WO202501130005', title: '空调机组保养', status: 'completed', type: 4, typeName: '保养维护', priority: 3, location: '设备机房', createTime: '2025-01-13 08:00', handlerName: '王五', handlerAvatar: '/static/avatar-default.png' }
])

const getStatusText = (status: string): string => {
  const statuses: Record<string, string> = { pending: '待处理', processing: '处理中', completed: '已完成', cancelled: '已取消' }
  return statuses[status] || '未知'
}

const getPriorityText = (priority: number): string => {
  const priorities: Record<number, string> = { 1: '紧急', 2: '高', 3: '中', 4: '低' }
  return priorities[priority] || '未知'
}

const switchTab = (tab: string) => {
  activeTab.value = tab
  loadData()
}

const onSearch = () => {
  loadData()
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => {
    loading.value = false
    hasMore.value = false
  }, 500)
}

const onRefresh = () => {
  refreshing.value = true
  hasMore.value = true
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const goToDetail = (item: Workorder) => {
  uni.navigateTo({ url: '/pages/workorder/detail?id=' + item.id })
}

const acceptOrder = (item: Workorder) => {
  uni.showModal({
    title: '接单确认',
    content: '确认接受此工单？',
    success: (res) => {
      if (res.confirm) {
        item.status = 'processing'
        item.handlerName = '当前用户'
        pendingCount.value--
        uni.showToast({ title: '接单成功' })
      }
    }
  })
}

const completeOrder = (item: Workorder) => {
  uni.navigateTo({ url: '/pages/workorder/complete?id=' + item.id })
}

const createOrder = () => {
  uni.navigateTo({ url: '/pages/workorder/create' })
}

const resetFilter = () => {
  filterForm.type = 0
  filterForm.priority = 0
  filterForm.startDate = ''
  filterForm.endDate = ''
}

const closeFilter = () => {
  filterPopup.value?.close()
}

const applyFilter = () => {
  loadData()
  closeFilter()
}

const onStartDateChange = (e: any) => {
  filterForm.startDate = e.detail.value
}

const onEndDateChange = (e: any) => {
  filterForm.endDate = e.detail.value
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss">
.workorder-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background-color: #fff;
  padding: 0 20rpx;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #1890ff;
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48rpx;
        height: 4rpx;
        background-color: #1890ff;
        border-radius: 2rpx;
      }
    }
    
    .badge {
      position: absolute;
      top: 12rpx;
      right: 20rpx;
      min-width: 32rpx;
      height: 32rpx;
      padding: 0 8rpx;
      background-color: #f5222d;
      color: #fff;
      font-size: 20rpx;
      border-radius: 16rpx;
      text-align: center;
      line-height: 32rpx;
    }
  }
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  gap: 20rpx;
  
  .search-input {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 32rpx;
    padding: 16rpx 24rpx;
    gap: 12rpx;
    
    input {
      flex: 1;
      font-size: 26rpx;
    }
  }
  
  .filter-btn {
    width: 64rpx;
    height: 64rpx;
    background-color: #f5f5f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.workorder-list {
  flex: 1;
  padding: 20rpx;
}

.workorder-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .order-code { font-size: 24rpx; color: #999; }
    
    .order-status {
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      
      &.pending { background-color: #fff7e6; color: #fa8c16; }
      &.processing { background-color: #e6f7ff; color: #1890ff; }
      &.completed { background-color: #f6ffed; color: #52c41a; }
      &.cancelled { background-color: #f5f5f5; color: #999; }
    }
  }
  
  .item-content {
    .order-title { font-size: 30rpx; color: #333; font-weight: 500; display: block; margin-bottom: 16rpx; }
    
    .order-info {
      display: flex;
      flex-wrap: wrap;
      gap: 24rpx;
      margin-bottom: 16rpx;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .order-tags {
      display: flex;
      gap: 12rpx;
      
      .tag {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        
        &.type-1 { background-color: #e6f7ff; color: #1890ff; }
        &.type-2 { background-color: #fff2e8; color: #fa541c; }
        &.type-3 { background-color: #f6ffed; color: #52c41a; }
        &.type-4 { background-color: #f9f0ff; color: #722ed1; }
        
        &.priority-1 { background-color: #fff1f0; color: #f5222d; }
        &.priority-2 { background-color: #fff7e6; color: #fa8c16; }
        &.priority-3 { background-color: #e6f7ff; color: #1890ff; }
        &.priority-4 { background-color: #f5f5f5; color: #999; }
      }
    }
  }
  
  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .handler-info {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .avatar { width: 48rpx; height: 48rpx; border-radius: 50%; }
      .handler-name { font-size: 26rpx; color: #666; }
    }
    
    .action-btns {
      button {
        font-size: 24rpx;
        padding: 0 24rpx;
        height: 56rpx;
        line-height: 56rpx;
        border-radius: 28rpx;
        
        &.btn-accept { background-color: #1890ff; color: #fff; }
        &.btn-complete { background-color: #52c41a; color: #fff; }
      }
    }
  }
}

.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.4);
}

.filter-popup {
  width: 600rpx;
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .popup-title { font-size: 32rpx; font-weight: 600; }
    .reset-btn { font-size: 26rpx; color: #1890ff; }
  }
  
  .filter-content {
    flex: 1;
    padding: 30rpx;
    overflow-y: auto;
    
    .filter-group {
      margin-bottom: 40rpx;
      
      .group-title { font-size: 28rpx; color: #333; font-weight: 500; display: block; margin-bottom: 20rpx; }
      
      .option-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        
        .option-item {
          padding: 12rpx 24rpx;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          font-size: 26rpx;
          color: #666;
          
          &.active { background-color: #e6f7ff; color: #1890ff; }
        }
      }
      
      .date-range {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .date-input {
          flex: 1;
          padding: 16rpx 20rpx;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          font-size: 26rpx;
          color: #666;
          text-align: center;
        }
        
        .date-separator { font-size: 26rpx; color: #999; }
      }
    }
  }
  
  .popup-footer {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f0f0f0;
    
    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      
      &.btn-cancel { background-color: #f5f5f5; color: #666; }
      &.btn-confirm { background-color: #1890ff; color: #fff; }
    }
  }
}

.loading-more, .no-more { text-align: center; padding: 30rpx 0; color: #999; font-size: 24rpx; }
.empty { text-align: center; padding: 100rpx 0; image { width: 200rpx; height: 200rpx; } text { display: block; margin-top: 20rpx; color: #999; font-size: 26rpx; } }
</style>
