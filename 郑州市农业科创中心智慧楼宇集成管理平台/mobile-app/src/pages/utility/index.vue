<template>
  <view class="utility-page">
    <view class="header">
      <view class="title">能耗总览</view>
      <view class="date">{{ today }}</view>
    </view>

    <view class="summary">
      <view class="item">
        <view class="label">今日用电</view>
        <view class="value">{{ stats.power }} kWh</view>
      </view>
      <view class="item">
        <view class="label">今日用水</view>
        <view class="value">{{ stats.water }} m³</view>
      </view>
      <view class="item">
        <view class="label">本月费用</view>
        <view class="value">¥{{ stats.cost }}</view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">分区用能</view>
      <view class="zone" v-for="zone in zones" :key="zone.name">
        <view class="row">
          <text class="name">{{ zone.name }}</text>
          <text class="power">{{ zone.power }} kWh</text>
        </view>
        <view class="progress">
          <view class="bar" :style="{ width: zone.rate + '%' }"></view>
        </view>
        <view class="desc">水：{{ zone.water }} m³ · 占比 {{ zone.rate }}%</view>
      </view>
    </view>

    <view class="card">
      <view class="card-title">抄表记录</view>
      <scroll-view scroll-y class="meters">
        <view class="meter" v-for="m in meters" :key="m.id">
          <view class="row">
            <text class="name">{{ m.name }}</text>
            <text class="time">{{ m.time }}</text>
          </view>
          <view class="row">
            <text class="reading">电：{{ m.power }} kWh</text>
            <text class="reading">水：{{ m.water }} m³</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const today = new Date().toISOString().slice(0, 10)

const stats = reactive({ power: 128.4, water: 32.7, cost: 562.3 })

const zones = reactive([
  { name: '温室1区', power: 46.2, water: 12.4, rate: 36 },
  { name: '温室2区', power: 32.1, water: 8.6, rate: 25 },
  { name: '实验楼', power: 28.9, water: 6.1, rate: 22 },
  { name: '办公区', power: 21.2, water: 5.6, rate: 17 }
])

const meters = ref([
  { id: 1, name: '温室1-电表', power: 34567, water: 0, time: '2023-09-05 08:00' },
  { id: 2, name: '温室1-水表', power: 0, water: 1234, time: '2023-09-05 08:00' },
  { id: 3, name: '实验楼-电表', power: 25678, water: 0, time: '2023-09-05 09:00' },
  { id: 4, name: '实验楼-水表', power: 0, water: 980, time: '2023-09-05 09:00' }
])
</script>

<style lang="scss">
.utility-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; color: #333; }
.date { font-size: 24rpx; color: #999; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; margin-bottom: 16rpx; }
.summary .item { background: linear-gradient(135deg, #e6f7ff, #ffffff); border-radius: 12rpx; padding: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.label { font-size: 24rpx; color: #666; }
.value { font-size: 30rpx; font-weight: 700; color: #1890ff; margin-top: 6rpx; }
.card { background: #fff; border-radius: 12rpx; padding: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); margin-bottom: 16rpx; }
.card-title { font-size: 28rpx; font-weight: 600; color: #333; margin-bottom: 10rpx; }
.zone { margin-bottom: 14rpx; }
.row { display: flex; justify-content: space-between; align-items: center; }
.name { font-size: 26rpx; color: #333; }
.power { font-size: 24rpx; color: #1890ff; }
.progress { width: 100%; height: 12rpx; background: #f5f5f5; border-radius: 6rpx; overflow: hidden; margin: 10rpx 0; }
.bar { height: 100%; background: linear-gradient(90deg, #69c0ff, #1890ff); }
.desc { font-size: 22rpx; color: #777; }
.meters { max-height: 360rpx; }
.meter { padding: 12rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.meter:last-child { border-bottom: none; }
.time { font-size: 22rpx; color: #999; }
.reading { font-size: 24rpx; color: #555; }
</style>
