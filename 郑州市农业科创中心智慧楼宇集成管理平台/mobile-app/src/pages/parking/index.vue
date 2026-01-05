<template>
  <view class="parking-page">
    <view class="summary">
      <view class="item">
        <view class="label">总车位</view>
        <view class="value">{{ stats.total }}</view>
      </view>
      <view class="item">
        <view class="label">可用</view>
        <view class="value">{{ stats.available }}</view>
      </view>
      <view class="item">
        <view class="label">占用</view>
        <view class="value">{{ stats.occupied }}</view>
      </view>
    </view>

    <view class="filter">
      <view
        v-for="f in filters"
        :key="f.value"
        class="tag"
        :class="{ active: current === f.value }"
        @click="current = f.value"
      >
        {{ f.label }}
      </view>
    </view>

    <scroll-view scroll-y class="list">
      <view class="card" v-for="slot in filtered" :key="slot.id">
        <view class="row">
          <view>
            <view class="plate">{{ slot.plate }}</view>
            <view class="meta">{{ slot.owner || '临停车' }}</view>
          </view>
          <view class="status" :class="slot.status">{{ statusText(slot.status) }}</view>
        </view>
        <view class="meta">车位：{{ slot.no }} · 区域：{{ slot.zone }}</view>
        <view class="meta">入场时间：{{ slot.enter }}</view>
        <view class="meta" v-if="slot.duration">时长：{{ slot.duration }} · 费用：¥{{ slot.fee }}</view>
        <view class="actions">
          <button size="mini" @click="showPath(slot)">去车位</button>
          <button size="mini" type="primary" v-if="slot.status === 'occupied'" @click="pay(slot)">缴费</button>
          <button size="mini" type="warn" v-if="slot.status === 'reserved'">取消预约</button>
        </view>
      </view>
      <uni-load-more status="noMore" :contentText="{ contentdown: '下拉刷新', contentrefresh: '加载中', contentnomore: '没有更多了' }" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const stats = reactive({ total: 120, available: 48, occupied: 62 })

const filters = [
  { label: '全部', value: '' },
  { label: '可用', value: 'free' },
  { label: '已占用', value: 'occupied' },
  { label: '已预约', value: 'reserved' }
]

const list = ref([
  { id: 1, no: 'B1-018', zone: '地下B1', plate: '粤A12345', owner: '张三', status: 'occupied', enter: '2023-09-05 09:20', duration: '1小时40分', fee: 12 },
  { id: 2, no: 'B1-020', zone: '地下B1', plate: '预留', owner: '', status: 'reserved', enter: '预约 10:30-12:00' },
  { id: 3, no: 'A1-105', zone: '地面A区', plate: '空闲', owner: '', status: 'free', enter: '' },
  { id: 4, no: 'A1-108', zone: '地面A区', plate: '湘B99887', owner: '李四', status: 'occupied', enter: '2023-09-05 08:10', duration: '3小时', fee: 24 }
])

const current = ref('')

const filtered = computed(() => list.value.filter((i) => !current.value || i.status === current.value))

const statusText = (s: string) => {
  const map: Record<string, string> = { free: '可用', occupied: '已占用', reserved: '已预约' }
  return map[s] || '未知'
}

const showPath = (slot: any) => uni.showToast({ title: `导航到${slot.no}`, icon: 'none' })
const pay = (slot: any) => uni.showToast({ title: `${slot.plate} 缴费 ¥${slot.fee}`, icon: 'none' })
</script>

<style lang="scss">
.parking-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; margin-bottom: 16rpx; }
.summary .item { background: linear-gradient(135deg, #e6f7ff, #ffffff); border-radius: 12rpx; padding: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.label { font-size: 24rpx; color: #666; }
.value { font-size: 32rpx; font-weight: 700; color: #1890ff; margin-top: 6rpx; }
.filter { display: flex; gap: 12rpx; margin-bottom: 12rpx; }
.tag { padding: 10rpx 20rpx; border-radius: 24rpx; background: #f2f2f2; color: #666; font-size: 24rpx; }
.tag.active { background: #e6f4ff; color: #1890ff; border: 1rpx solid #1890ff; }
.list { height: calc(100vh - 230rpx); }
.card { background: #fff; border-radius: 14rpx; padding: 20rpx; margin-bottom: 14rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.plate { font-size: 32rpx; font-weight: 700; color: #333; }
.meta { font-size: 24rpx; color: #666; margin: 4rpx 0; }
.status { font-size: 24rpx; padding: 6rpx 14rpx; border-radius: 20rpx; background: #f5f5f5; color: #666; }
.status.free { color: #52c41a; background: #f6ffed; }
.status.occupied { color: #fa541c; background: #fff2e8; }
.status.reserved { color: #1890ff; background: #e6f4ff; }
.actions { display: flex; gap: 12rpx; margin-top: 10rpx; }
button[size='mini'] { border-radius: 28rpx; padding: 0 18rpx; }
</style>
