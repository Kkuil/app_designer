<template>
  <view class="workorder-detail-page">
    <!-- 工单状态头部 -->
    <view class="status-header" :class="order.status">
      <view class="status-icon">
        <component :is="getStatusIconComp(order.status)" style="width:48px;height:48px;color:#fff" />
      </view>
      <text class="status-text">{{ getStatusText(order.status) }}</text>
      <text class="status-time">{{ order.updateTime }}</text>
    </view>

    <!-- 工单基本信息 -->
    <view class="card info-card">
      <view class="card-header">
        <text class="card-title">工单信息</text>
        <text class="order-code">{{ order.code }}</text>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">工单标题</text>
          <text class="value">{{ order.title }}</text>
        </view>
        <view class="info-item">
          <text class="label">工单类型</text>
          <view class="type-tag">{{ order.typeName }}</view>
        </view>
        <view class="info-item">
          <text class="label">优先级</text>
          <view class="priority-tag" :class="'priority-' + order.priority">{{ getPriorityText(order.priority) }}</view>
        </view>
        <view class="info-item">
          <text class="label">故障位置</text>
          <text class="value">{{ order.location }}</text>
        </view>
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ order.createTime }}</text>
        </view>
        <view class="info-item">
          <text class="label">期望完成</text>
          <text class="value">{{ order.expectTime }}</text>
        </view>
      </view>
    </view>

    <!-- 问题描述 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">问题描述</text>
      </view>
      <view class="desc-content">
        <text>{{ order.description }}</text>
      </view>
      <view class="image-list" v-if="order.images && order.images.length > 0">
        <image v-for="(img, index) in order.images" :key="index" :src="img" mode="aspectFill" @click="previewImage(index)" />
      </view>
    </view>

    <!-- 处理人信息 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">处理人员</text>
      </view>
      <view class="handler-info" v-if="order.handler">
        <image class="avatar" :src="order.handler.avatar" mode="aspectFill" />
        <view class="handler-detail">
          <text class="name">{{ order.handler.name }}</text>
          <text class="dept">{{ order.handler.dept }}</text>
        </view>
        <view class="contact-btns">
          <view class="contact-btn" @click="callHandler">
            <Phone style="width:20px;height:20px;color:#1890ff" />
          </view>
        </view>
      </view>
      <view class="empty-tip" v-else>
        <text>暂未指派处理人</text>
      </view>
    </view>

    <!-- 处理进度 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">处理进度</text>
      </view>
      <view class="timeline">
        <view class="timeline-item" v-for="(record, index) in progressRecords" :key="index">
          <view class="timeline-dot" :class="{ active: index === 0 }"></view>
          <view class="timeline-content">
            <view class="timeline-header">
              <text class="action">{{ record.action }}</text>
              <text class="time">{{ record.time }}</text>
            </view>
            <text class="operator">{{ record.operator }}</text>
            <text class="remark" v-if="record.remark">{{ record.remark }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 处理结果 -->
    <view class="card" v-if="order.status === 'completed'">
      <view class="card-header">
        <text class="card-title">处理结果</text>
      </view>
      <view class="result-content">
        <view class="result-item">
          <text class="label">完成时间</text>
          <text class="value">{{ order.completeTime }}</text>
        </view>
        <view class="result-item">
          <text class="label">处理说明</text>
          <text class="value">{{ order.resultRemark }}</text>
        </view>
        <view class="result-images" v-if="order.resultImages && order.resultImages.length > 0">
          <text class="label">现场照片</text>
          <view class="image-list">
            <image v-for="(img, index) in order.resultImages" :key="index" :src="img" mode="aspectFill" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions" v-if="order.status !== 'completed' && order.status !== 'cancelled'">
      <button class="btn-accept" v-if="order.status === 'pending'" @click="acceptOrder">接单</button>
      <button class="btn-transfer" v-if="order.status === 'pending' || order.status === 'processing'" @click="transferOrder">转派</button>
      <button class="btn-complete" v-if="order.status === 'processing'" @click="completeOrder">完成</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Handler {
  name: string
  dept: string
  phone: string
  avatar: string
}

interface ProgressRecord {
  action: string
  operator: string
  time: string
  remark?: string
}

interface Order {
  id: number
  code: string
  title: string
  status: string
  typeName: string
  priority: number
  location: string
  description: string
  createTime: string
  updateTime: string
  expectTime: string
  completeTime?: string
  resultRemark?: string
  images?: string[]
  resultImages?: string[]
  handler?: Handler
}

const order = ref<Order>({
  id: 1,
  code: 'WO202501150001',
  title: '空调系统故障维修',
  status: 'processing',
  typeName: '设备维修',
  priority: 1,
  location: 'A栋3楼会议室',
  description: '会议室空调无法正常制冷，开机后有异响，影响正常使用。请尽快安排维修人员处理。',
  createTime: '2025-01-15 10:30',
  updateTime: '2025-01-15 11:00',
  expectTime: '2025-01-15 18:00',
  images: ['/static/logo.png', '/static/logo.png'],
  handler: {
    name: '张三',
    dept: '设备维护部',
    phone: '13800138000',
    avatar: '/static/avatar-default.png'
  }
})

const progressRecords = ref<ProgressRecord[]>([
  { action: '接单处理', operator: '张三', time: '11:00', remark: '已了解情况，准备前往现场' },
  { action: '工单指派', operator: '系统', time: '10:35', remark: '已自动指派给张三' },
  { action: '工单创建', operator: '李四', time: '10:30' }
])

const getStatusText = (status: string): string => {
  const statuses: Record<string, string> = { pending: '待处理', processing: '处理中', completed: '已完成', cancelled: '已取消' }
  return statuses[status] || '未知'
}

const getStatusIconComp = (status: string): string => {
  const icons: Record<string, string> = { pending: 'InfoFilled', processing: 'Loading', completed: 'CircleCheck', cancelled: 'CircleClose' }
  return icons[status] || 'InfoFilled'
}

const getPriorityText = (priority: number): string => {
  const priorities: Record<number, string> = { 1: '紧急', 2: '高', 3: '中', 4: '低' }
  return priorities[priority] || '未知'
}

const previewImage = (index: number) => {
  if (order.value.images) {
    uni.previewImage({ urls: order.value.images, current: index })
  }
}

const callHandler = () => {
  if (order.value.handler) {
    uni.makePhoneCall({ phoneNumber: order.value.handler.phone })
  }
}

const acceptOrder = () => {
  uni.showModal({
    title: '接单确认',
    content: '确认接受此工单？',
    success: (res) => {
      if (res.confirm) {
        order.value.status = 'processing'
        uni.showToast({ title: '接单成功' })
      }
    }
  })
}

const transferOrder = () => {
  uni.navigateTo({ url: '/pages/workorder/transfer?id=' + order.value.id })
}

const completeOrder = () => {
  uni.navigateTo({ url: '/pages/workorder/complete?id=' + order.value.id })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options
  if (options?.id) {
    console.log('加载工单ID:', options.id)
  }
})
</script>

<style lang="scss">
.workorder-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx;
}

.status-header {
  padding: 60rpx 30rpx;
  text-align: center;
  color: #fff;
  
  &.pending { background: linear-gradient(135deg, #fa8c16, #ffa940); }
  &.processing { background: linear-gradient(135deg, #1890ff, #40a9ff); }
  &.completed { background: linear-gradient(135deg, #52c41a, #73d13d); }
  &.cancelled { background: linear-gradient(135deg, #999, #bbb); }
  
  .status-icon { margin-bottom: 16rpx; }
  .status-text { display: block; font-size: 36rpx; font-weight: 600; margin-bottom: 8rpx; }
  .status-time { font-size: 24rpx; opacity: 0.8; }
}

.card {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .card-title { font-size: 30rpx; font-weight: 600; color: #333; }
    .order-code { font-size: 24rpx; color: #999; }
  }
}

.info-list .info-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  &:last-child { border-bottom: none; }
  .label { width: 160rpx; font-size: 26rpx; color: #999; }
  .value { flex: 1; font-size: 26rpx; color: #333; }
  .type-tag { font-size: 22rpx; padding: 4rpx 12rpx; background-color: #e6f7ff; color: #1890ff; border-radius: 4rpx; }
  .priority-tag {
    font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 4rpx;
    &.priority-1 { background-color: #fff1f0; color: #f5222d; }
    &.priority-2 { background-color: #fff7e6; color: #fa8c16; }
    &.priority-3 { background-color: #e6f7ff; color: #1890ff; }
    &.priority-4 { background-color: #f5f5f5; color: #999; }
  }
}

.desc-content { font-size: 26rpx; color: #666; line-height: 1.8; margin-bottom: 20rpx; }
.image-list { display: flex; flex-wrap: wrap; gap: 16rpx; image { width: 160rpx; height: 160rpx; border-radius: 8rpx; } }

.handler-info {
  display: flex;
  align-items: center;
  .avatar { width: 80rpx; height: 80rpx; border-radius: 50%; margin-right: 20rpx; }
  .handler-detail { flex: 1; .name { display: block; font-size: 28rpx; color: #333; font-weight: 500; } .dept { font-size: 24rpx; color: #999; } }
  .contact-btn { width: 64rpx; height: 64rpx; background-color: #e6f7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
}

.timeline {
  .timeline-item {
    display: flex; padding-left: 30rpx; padding-bottom: 30rpx; position: relative;
    &::before { content: ''; position: absolute; left: 12rpx; top: 24rpx; bottom: 0; width: 2rpx; background-color: #e8e8e8; }
    &:last-child::before { display: none; }
    .timeline-dot { width: 24rpx; height: 24rpx; border-radius: 50%; background-color: #d9d9d9; position: absolute; left: 0; top: 6rpx; &.active { background-color: #1890ff; } }
    .timeline-content {
      flex: 1;
      .timeline-header { display: flex; justify-content: space-between; margin-bottom: 8rpx; .action { font-size: 28rpx; color: #333; font-weight: 500; } .time { font-size: 24rpx; color: #999; } }
      .operator { font-size: 24rpx; color: #666; display: block; }
      .remark { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
    }
  }
}

.result-content {
  .result-item { display: flex; padding: 12rpx 0; .label { width: 160rpx; font-size: 26rpx; color: #999; } .value { flex: 1; font-size: 26rpx; color: #333; } }
  .result-images { margin-top: 16rpx; .label { display: block; font-size: 26rpx; color: #999; margin-bottom: 12rpx; } }
}

.bottom-actions {
  position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 20rpx; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background-color: #fff; box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  button { flex: 1; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; font-size: 28rpx;
    &.btn-accept { background-color: #1890ff; color: #fff; }
    &.btn-transfer { background-color: #fff; color: #fa8c16; border: 1rpx solid #fa8c16; }
    &.btn-complete { background-color: #52c41a; color: #fff; }
  }
}

.empty-tip { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
