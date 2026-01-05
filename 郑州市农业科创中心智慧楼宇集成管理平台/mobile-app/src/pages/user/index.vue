<template>
  <view class="user-page">
    <!-- 头像和基本信息 -->
    <view class="user-header">
      <image class="avatar" :src="profile.avatar" mode="aspectFill" />
      <view class="info">
        <text class="name">{{ profile.name }}</text>
        <text class="role">{{ profile.role }}</text>
      </view>
      <view class="status">
        <view class="tag online">在线</view>
      </view>
    </view>

    <!-- 快捷卡片 -->
    <view class="stat-cards">
      <view class="stat-card">
        <text class="value">{{ stats.todo }}</text>
        <text class="label">待办事项</text>
      </view>
      <view class="stat-card">
        <text class="value">{{ stats.workorders }}</text>
        <text class="label">我的工单</text>
      </view>
      <view class="stat-card">
        <text class="value">{{ stats.alarms }}</text>
        <text class="label">我的报警</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="menu-grid">
      <view class="menu-item" v-for="item in menuList" :key="item.name" @click="navigate(item)">
        <view class="icon" :style="{ backgroundColor: item.color }">
          <component :is="iconMap[item.icon]" style="width:26px;height:26px;color:#fff" />
        </view>
        <text class="text">{{ item.name }}</text>
      </view>
    </view>

    <!-- 设置列表 -->
    <view class="section">
      <view class="section-title">账号与安全</view>
      <view class="list">
        <view class="list-item" @click="goPassword">
          <view class="left">
            <Lock style="width:22px;height:22px;color:#1890ff" />
            <text>修改密码</text>
          </view>
          <ArrowRight style="width:18px;height:18px;color:#ccc" />
        </view>
        <view class="list-item" @click="goAuth">
          <view class="left">
            <User style="width:22px;height:22px;color:#1890ff" />
            <text>身份认证</text>
          </view>
          <ArrowRight style="width:18px;height:18px;color:#ccc" />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">常用功能</view>
      <view class="list">
        <view class="list-item" @click="goNotice">
          <view class="left">
            <Bell style="width:22px;height:22px;color:#52c41a" />
            <text>我的通知</text>
          </view>
          <ArrowRight style="width:18px;height:18px;color:#ccc" />
        </view>
        <view class="list-item" @click="goSettings">
          <view class="left">
            <Setting style="width:22px;height:22px;color:#fa8c16" />
            <text>系统设置</text>
          </view>
          <ArrowRight style="width:18px;height:18px;color:#ccc" />
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" @click="logout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const profile = reactive({
  avatar: '/static/avatar-default.png',
  name: '王小明',
  role: '运维工程师'
})

const stats = reactive({
  todo: 6,
  workorders: 12,
  alarms: 3
})

// 映射快捷入口使用的图标键到 Element Plus 图标组件名
const iconMap: Record<string, string> = {
  list: 'List',
  flag: 'Flag',
  gear: 'Setting',
  alert: 'Warning'
}

const menuList = reactive([
  { name: '我的工单', icon: 'list', color: '#1890ff', path: '/pages/workorder/index' },
  { name: '我的巡检', icon: 'flag', color: '#52c41a', path: '/pages/inspection/index' },
  { name: '设备台账', icon: 'gear', color: '#fa8c16', path: '/pages/device/index' },
  { name: '报警中心', icon: 'alert', color: '#f5222d', path: '/pages/alarm/index' }
])

const navigate = (item: any) => {
  uni.navigateTo({ url: item.path })
}

const goPassword = () => {
  uni.showToast({ title: '前往修改密码', icon: 'none' })
}

const goAuth = () => {
  uni.showToast({ title: '前往身份认证', icon: 'none' })
}

const goNotice = () => {
  uni.navigateTo({ url: '/pages/notice/index' })
}

const goSettings = () => {
  uni.showToast({ title: '打开系统设置', icon: 'none' })
}

const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确认退出当前账号？',
    success: (res) => {
      if (res.confirm) {
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}
</script>

<style lang="scss">
.user-page { min-height: 100vh; background: #f5f5f5; padding: 0 20rpx 60rpx; }
.user-header { background: #fff; border-radius: 16rpx; padding: 24rpx; display: flex; align-items: center; margin-top: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; }
.info { margin-left: 16rpx; flex: 1; }
.name { display: block; font-size: 32rpx; font-weight: 700; color: #333; }
.role { display: block; font-size: 24rpx; color: #999; margin-top: 4rpx; }
.status { display: flex; align-items: center; }
.tag { padding: 6rpx 14rpx; border-radius: 14rpx; font-size: 22rpx; }
.tag.online { background: #f6ffed; color: #52c41a; }

.stat-cards { display: flex; gap: 16rpx; margin-top: 20rpx; }
.stat-card { flex: 1; background: linear-gradient(135deg, #1890ff, #40a9ff); color: #fff; border-radius: 14rpx; padding: 20rpx; box-shadow: 0 4rpx 16rpx rgba(24,144,255,0.2); }
.stat-card:nth-child(2) { background: linear-gradient(135deg, #52c41a, #73d13d); box-shadow: 0 4rpx 16rpx rgba(82,196,26,0.2); }
.stat-card:nth-child(3) { background: linear-gradient(135deg, #fa8c16, #ffa940); box-shadow: 0 4rpx 16rpx rgba(250,140,22,0.2); }
.value { display: block; font-size: 40rpx; font-weight: 700; }
.label { display: block; font-size: 24rpx; opacity: 0.9; margin-top: 6rpx; }

.menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; background: #fff; padding: 20rpx; margin-top: 20rpx; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.menu-item { text-align: center; }
.menu-item .icon { width: 80rpx; height: 80rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; margin: 0 auto 8rpx; }
.menu-item .text { font-size: 24rpx; color: #333; }

.section { background: #fff; border-radius: 16rpx; margin-top: 20rpx; padding: 12rpx 0; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.section-title { font-size: 26rpx; color: #999; padding: 0 20rpx 10rpx; }
.list { }
.list-item { display: flex; justify-content: space-between; align-items: center; padding: 18rpx 20rpx; border-top: 1rpx solid #f5f5f5; font-size: 26rpx; color: #333; }
.list-item:first-child { border-top: none; }
.list-item .left { display: flex; align-items: center; gap: 12rpx; }

.logout-btn { margin-top: 30rpx; background: #fff; color: #f5222d; text-align: center; padding: 20rpx; border-radius: 16rpx; font-size: 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
</style>
