<template>
  <view class="device-detail-page">
    <!-- 设备头部 -->
    <view class="detail-header">
      <view>
        <text class="device-name">{{ device.name }}</text>
        <text class="device-code">编号：{{ device.code }}</text>
      </view>
      <view class="status-tag" :class="device.status">{{ getStatusText(device.status) }}</view>
    </view>

    <!-- 基本信息 -->
    <view class="card">
      <view class="card-title">基本信息</view>
      <view class="info-row"><text class="label">设备类型</text><text class="value">{{ device.type }}</text></view>
      <view class="info-row"><text class="label">所在位置</text><text class="value">{{ device.location }}</text></view>
      <view class="info-row"><text class="label">负责人</text><text class="value">{{ device.manager }} {{ device.phone }}</text></view>
      <view class="info-row"><text class="label">投运时间</text><text class="value">{{ device.startDate }}</text></view>
      <view class="info-row"><text class="label">维保到期</text><text class="value warning">{{ device.maintainDate }}</text></view>
    </view>

    <!-- 运行数据 -->
    <view class="card">
      <view class="card-title">运行数据</view>
      <view class="stat-grid">
        <view class="stat-item">
          <text class="stat-label">今日运行时长</text>
          <text class="stat-value">{{ device.runtimeToday }}h</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">今日能耗</text>
          <text class="stat-value">{{ device.energyToday }} kWh</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">告警次数</text>
          <text class="stat-value warning">{{ device.alarmToday }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">健康度</text>
          <text class="stat-value success">{{ device.health }}%</text>
        </view>
      </view>
    </view>

    <!-- 参数指标 -->
    <view class="card">
      <view class="card-title">实时指标</view>
      <view class="metric-list">
        <view class="metric-item" v-for="metric in metrics" :key="metric.name">
          <view>
            <text class="metric-name">{{ metric.name }}</text>
            <text class="metric-desc">{{ metric.desc }}</text>
          </view>
          <text class="metric-value">{{ metric.value }} {{ metric.unit }}</text>
        </view>
      </view>
    </view>

    <!-- 维护记录 -->
    <view class="card">
      <view class="card-title">维护记录</view>
      <view class="timeline">
        <view class="timeline-item" v-for="(record, index) in maintainRecords" :key="index">
          <view class="dot"></view>
          <view class="content">
            <view class="row"><text class="time">{{ record.time }}</text><text class="type">{{ record.type }}</text></view>
            <text class="remark">{{ record.remark }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="bottom-actions">
      <button class="btn" @click="createWorkorder">新建工单</button>
      <button class="btn secondary" @click="viewAlarms">查看告警</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface DeviceDetail {
  name: string
  code: string
  type: string
  status: string
  location: string
  manager: string
  phone: string
  startDate: string
  maintainDate: string
  runtimeToday: number
  energyToday: number
  alarmToday: number
  health: number
}

interface Metric {
  name: string
  desc: string
  value: string | number
  unit: string
}

interface MaintainRecord {
  time: string
  type: string
  remark: string
}

const device = reactive<DeviceDetail>({
  name: 'A栋主机空调',
  code: 'AC-001',
  type: '空调主机',
  status: 'online',
  location: 'A栋3F机房',
  manager: '张三',
  phone: '13800138000',
  startDate: '2022-06-01',
  maintainDate: '2025-06-01',
  runtimeToday: 12,
  energyToday: 68,
  alarmToday: 0,
  health: 96
})

const metrics = ref<Metric[]>([
  { name: '出风温度', desc: '当前温度', value: 18.6, unit: '℃' },
  { name: '回风温度', desc: '回风检测', value: 25.1, unit: '℃' },
  { name: '压力', desc: '管路压力', value: 0.68, unit: 'MPa' },
  { name: '电流', desc: '运行电流', value: 32, unit: 'A' }
])

const maintainRecords = ref<MaintainRecord[]>([
  { time: '2025-01-10 09:30', type: '例行巡检', remark: '检查运行电流，滤网清洁' },
  { time: '2023-12-05 14:20', type: '维修保养', remark: '更换冷凝器滤网，补充冷媒' }
])

const getStatusText = (status: string): string => {
  const map: Record<string, string> = { online: '在线', offline: '离线', alarm: '告警', maintenance: '检修' }
  return map[status] || '未知'
}

const createWorkorder = () => {
  uni.navigateTo({ url: '/pages/workorder/create?deviceId=' + device.code })
}

const viewAlarms = () => {
  uni.navigateTo({ url: '/pages/alarm/detail?id=' + device.code })
}
</script>

<style lang="scss">
.device-detail-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 140rpx; }
.detail-header { background: linear-gradient(135deg, #1890ff, #40a9ff); color: #fff; padding: 40rpx 30rpx; display: flex; justify-content: space-between; align-items: center; }
.device-name { display: block; font-size: 34rpx; font-weight: 700; }
.device-code { display: block; font-size: 24rpx; opacity: 0.85; margin-top: 6rpx; }
.status-tag { padding: 8rpx 18rpx; border-radius: 18rpx; font-size: 24rpx; background: rgba(255,255,255,0.2); }
.status-tag.online { background: rgba(82,196,26,0.2); color: #fff; }
.status-tag.offline { background: rgba(153,153,153,0.2); color: #fff; }
.status-tag.alarm { background: rgba(245,34,45,0.2); color: #fff; }
.status-tag.maintenance { background: rgba(250,140,22,0.2); color: #fff; }

.card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04); }
.card-title { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 16rpx; display: block; }
.info-row { display: flex; justify-content: space-between; padding: 12rpx 0; font-size: 26rpx; color: #555; border-bottom: 1rpx solid #f0f0f0; }
.info-row:last-child { border-bottom: none; }
.label { color: #888; width: 200rpx; }
.value { flex: 1; text-align: right; }
.value.warning { color: #fa8c16; }

.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.stat-item { background: #f7f9fc; border-radius: 12rpx; padding: 16rpx; }
.stat-label { font-size: 24rpx; color: #888; }
.stat-value { display: block; font-size: 32rpx; font-weight: 700; color: #333; margin-top: 6rpx; }
.stat-value.warning { color: #f5222d; }
.stat-value.success { color: #52c41a; }

.metric-list { display: flex; flex-direction: column; gap: 16rpx; }
.metric-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx; background: #f5f5f5; border-radius: 12rpx; }
.metric-name { font-size: 28rpx; color: #333; display: block; }
.metric-desc { font-size: 22rpx; color: #999; display: block; margin-top: 4rpx; }
.metric-value { font-size: 30rpx; font-weight: 700; color: #1890ff; }

.timeline { position: relative; padding-left: 20rpx; }
.timeline::before { content: ''; position: absolute; left: 8rpx; top: 0; bottom: 0; width: 2rpx; background: #e8e8e8; }
.timeline-item { display: flex; margin-bottom: 20rpx; position: relative; }
.timeline-item:last-child { margin-bottom: 0; }
.timeline-item .dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #1890ff; position: absolute; left: -1rpx; top: 6rpx; }
.timeline-item .content { margin-left: 24rpx; }
.timeline-item .row { display: flex; gap: 12rpx; align-items: center; margin-bottom: 6rpx; }
.timeline-item .time { font-size: 24rpx; color: #333; }
.timeline-item .type { font-size: 22rpx; color: #1890ff; background: #e6f7ff; padding: 4rpx 12rpx; border-radius: 12rpx; }
.timeline-item .remark { font-size: 24rpx; color: #666; }

.bottom-actions { position: fixed; left: 0; right: 0; bottom: 0; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: #fff; display: flex; gap: 20rpx; box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05); }
.btn { flex: 1; height: 80rpx; line-height: 80rpx; text-align: center; border-radius: 40rpx; background: #1890ff; color: #fff; font-size: 28rpx; }
.btn.secondary { background: #fff; color: #1890ff; border: 1rpx solid #1890ff; }
</style>
