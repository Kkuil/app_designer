<template>
  <view class="index-page">
    <!-- 顶部用户信息 -->
    <view class="header">
      <view class="user-info">
        <image class="avatar" :src="userAvatar" mode="aspectFill" />
        <view class="user-detail">
          <text class="name">{{ userName }}</text>
          <text class="role">{{ userRole }}</text>
        </view>
      </view>
      <view class="header-actions">
        <view class="action-item" @click="goToNotice">
          <uni-badge :text="noticeCount" absolute="rightTop" size="small">
            <Bell style="width:24px;height:24px;color:#333" />
          </uni-badge>
        </view>
      </view>
    </view>

    <!-- 快捷功能入口 -->
    <view class="quick-actions card">
      <view class="section-title">快捷功能</view>
      <view class="action-grid">
        <view class="action-item" v-for="item in quickActions" :key="item.name" @click="navigateTo(item.path)">
          <view class="action-icon" :style="{ backgroundColor: item.color }">
            <component :is="getQuickIconComp(item.icon)" style="width:24px;height:24px;color:#fff" />
          </view>
          <text class="action-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 待处理事项 -->
    <view class="pending-tasks card">
      <view class="section-header">
        <text class="section-title">待处理事项</text>
        <text class="view-all" @click="goToWorkorder">查看全部</text>
      </view>
      <view class="task-list">
        <view class="task-item" v-for="task in pendingTasks" :key="task.id" @click="handleTask(task)">
          <view class="task-icon" :class="task.type">
            <component :is="getTaskIconComp(task.type)" style="width:20px;height:20px;color:#fff" />
          </view>
          <view class="task-content">
            <text class="task-title">{{ task.title }}</text>
            <text class="task-time">{{ task.time }}</text>
          </view>
          <ArrowRight style="width:16px;height:16px;color:#ccc" />
        </view>
        <view class="empty-tip" v-if="pendingTasks.length === 0">
          <text>暂无待处理事项</text>
        </view>
      </view>
    </view>

    <!-- 实时报警 -->
    <view class="realtime-alarms card">
      <view class="section-header">
        <text class="section-title">实时报警</text>
        <text class="view-all" @click="goToAlarm">查看全部</text>
      </view>
      <view class="alarm-list">
        <view class="alarm-item" v-for="alarm in realtimeAlarms" :key="alarm.id" @click="handleAlarm(alarm)">
          <view class="alarm-level" :class="'level-' + alarm.level"></view>
          <view class="alarm-content">
            <text class="alarm-title">{{ alarm.title }}</text>
            <text class="alarm-info">{{ alarm.device }} · {{ alarm.time }}</text>
          </view>
          <view class="alarm-status" :class="alarm.status">
            {{ alarm.status === 'pending' ? '待处理' : '已处理' }}
          </view>
        </view>
        <view class="empty-tip" v-if="realtimeAlarms.length === 0">
          <text>暂无报警信息</text>
        </view>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="statistics card">
      <view class="section-title">今日概览</view>
      <view class="stat-grid">
        <view class="stat-item">
          <text class="stat-value">{{ statistics.totalDevices }}</text>
          <text class="stat-label">设备总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value online">{{ statistics.onlineDevices }}</text>
          <text class="stat-label">在线设备</text>
        </view>
        <view class="stat-item">
          <text class="stat-value warning">{{ statistics.alarmCount }}</text>
          <text class="stat-label">今日报警</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ statistics.workorderCount }}</text>
          <text class="stat-label">处理工单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 用户信息
const userName = ref('管理员')
const userRole = ref('运维工程师')
const userAvatar = ref('/static/avatar-default.png')
const noticeCount = ref(5)

// 快捷功能
const quickActions = ref([
  { name: '故障报修', path: '/pages/repair/create', icon: 'wrench', color: '#f56c6c' },
  { name: '巡检任务', path: '/pages/inspection/index', icon: 'checkbox', color: '#409eff' },
  { name: '工单管理', path: '/pages/workorder/index', icon: 'list', color: '#67c23a' },
  { name: '设备台账', path: '/pages/device/index', icon: 'gear', color: '#e6a23c' },
  { name: '访客邀请', path: '/pages/visitor/invite', icon: 'person-filled', color: '#9c27b0' },
  { name: '会议预约', path: '/pages/meeting/book', icon: 'calendar', color: '#00bcd4' },
  { name: '考勤打卡', path: '/pages/attendance/index', icon: 'location', color: '#ff9800' },
  { name: '更多功能', path: '', icon: 'more', color: '#909399' }
])

// 待处理任务
const pendingTasks = ref([
  { id: 1, type: 'workorder', title: '3楼空调维修工单', time: '10分钟前' },
  { id: 2, type: 'inspection', title: '消防设备巡检任务', time: '30分钟前' },
  { id: 3, type: 'approval', title: '设备保养计划审批', time: '1小时前' }
])

// 实时报警
const realtimeAlarms = ref([
  { id: 1, level: 3, title: '烟感探测器报警', device: '5楼东区', time: '5分钟前', status: 'pending' },
  { id: 2, level: 2, title: '空调运行温度过高', device: '3楼会议室', time: '15分钟前', status: 'pending' },
  { id: 3, level: 1, title: '门禁设备离线', device: '1楼大厅', time: '30分钟前', status: 'handled' }
])

// 统计数据
const statistics = ref({
  totalDevices: 1256,
  onlineDevices: 1189,
  alarmCount: 23,
  workorderCount: 8
})

// 获取任务图标
const getTaskIconComp = (type: string) => {
  const map: Record<string, string> = {
    workorder: 'Edit',
    inspection: 'CircleCheck',
    approval: 'Finished'
  }
  return map[type] || 'List'
}

// 快捷入口图标映射（uni-icons 名称 -> Element Plus 图标名）
const getQuickIconComp = (name: string) => {
  const map: Record<string, string> = {
    wrench: 'Edit',
    checkbox: 'CircleCheck',
    list: 'List',
    gear: 'Setting',
    'person-filled': 'UserFilled',
    calendar: 'Calendar',
    location: 'Location',
    more: 'MoreFilled'
  }
  return map[name] || 'More'
}

// 页面导航
const navigateTo = (path: string) => {
  if (path) {
    uni.navigateTo({ url: path })
  }
}

const goToNotice = () => {
  uni.navigateTo({ url: '/pages/notice/index' })
}

const goToWorkorder = () => {
  uni.navigateTo({ url: '/pages/workorder/index' })
}

const goToAlarm = () => {
  uni.switchTab({ url: '/pages/alarm/index' })
}

// 处理任务
const handleTask = (task: any) => {
  console.log('处理任务:', task)
}

// 处理报警
const handleAlarm = (alarm: any) => {
  uni.navigateTo({ url: `/pages/alarm/detail?id=${alarm.id}` })
}

onMounted(() => {
  // 加载数据
})
</script>

<style lang="scss">
.index-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .user-info {
    display: flex;
    align-items: center;
    
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.5);
    }
    
    .user-detail {
      margin-left: 20rpx;
      
      .name {
        font-size: 32rpx;
        color: #fff;
        font-weight: 600;
      }
      
      .role {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 4rpx;
      }
    }
  }
  
  .header-actions {
    .action-item {
      padding: 10rpx;
    }
  }
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  margin: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .view-all {
    font-size: 24rpx;
    color: #409eff;
  }
}

.quick-actions {
  margin-top: -40rpx;
  
  .action-grid {
    display: flex;
    flex-wrap: wrap;
    
    .action-item {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx 0;
      
      .action-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .action-name {
        font-size: 24rpx;
        color: #666;
        margin-top: 12rpx;
      }
    }
  }
}

.pending-tasks {
  .task-list {
    .task-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .task-icon {
        width: 64rpx;
        height: 64rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.workorder { background-color: #f56c6c; }
        &.inspection { background-color: #409eff; }
        &.approval { background-color: #67c23a; }
      }
      
      .task-content {
        flex: 1;
        margin-left: 20rpx;
        
        .task-title {
          font-size: 28rpx;
          color: #333;
        }
        
        .task-time {
          font-size: 22rpx;
          color: #999;
          margin-top: 6rpx;
        }
      }
    }
  }
}

.realtime-alarms {
  .alarm-list {
    .alarm-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .alarm-level {
        width: 8rpx;
        height: 48rpx;
        border-radius: 4rpx;
        
        &.level-1 { background-color: #e6a23c; }
        &.level-2 { background-color: #f56c6c; }
        &.level-3 { background-color: #ff0000; }
      }
      
      .alarm-content {
        flex: 1;
        margin-left: 16rpx;
        
        .alarm-title {
          font-size: 28rpx;
          color: #333;
        }
        
        .alarm-info {
          font-size: 22rpx;
          color: #999;
          margin-top: 6rpx;
        }
      }
      
      .alarm-status {
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        
        &.pending {
          background-color: #fef0f0;
          color: #f56c6c;
        }
        
        &.handled {
          background-color: #f0f9eb;
          color: #67c23a;
        }
      }
    }
  }
}

.statistics {
  .stat-grid {
    display: flex;
    
    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-value {
        font-size: 40rpx;
        font-weight: 600;
        color: #333;
        
        &.online { color: #67c23a; }
        &.warning { color: #f56c6c; }
      }
      
      .stat-label {
        font-size: 22rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 26rpx;
}
</style>
