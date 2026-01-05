<template>
  <view class="execute-page">
    <!-- 任务信息头部 -->
    <view class="task-header">
      <view class="task-info">
        <text class="task-name">{{ task.name }}</text>
        <text class="task-route">{{ task.routeName }}</text>
      </view>
      <view class="task-progress">
        <view class="progress-circle">
          <text class="progress-value">{{ task.progress }}%</text>
        </view>
      </view>
    </view>

    <!-- 巡检点列表 -->
    <view class="point-list">
      <view class="point-item" v-for="(point, index) in pointList" :key="point.id" :class="{ active: currentPointIndex === index, completed: point.status === 'completed' }" @click="selectPoint(index)">
        <view class="point-index">{{ index + 1 }}</view>
        <view class="point-content">
          <text class="point-name">{{ point.name }}</text>
          <text class="point-location">{{ point.location }}</text>
        </view>
        <view class="point-status">
          <CircleCheck v-if="point.status === 'completed'" style="width:20px;height:20px;color:#52c41a" />
          <InfoFilled v-else-if="point.status === 'abnormal'" style="width:20px;height:20px;color:#f5222d" />
          <view v-else class="status-pending"></view>
        </view>
      </view>
    </view>

    <!-- 当前巡检点详情 -->
    <view class="current-point card" v-if="currentPoint">
      <view class="card-header">
        <text class="card-title">巡检项目</text>
        <text class="point-name">{{ currentPoint.name }}</text>
      </view>
      
      <view class="check-list">
        <view class="check-item" v-for="item in currentPoint.checkItems" :key="item.id">
          <view class="check-header">
            <text class="check-name">{{ item.name }}</text>
            <view class="check-result">
              <view class="result-btn" :class="{ active: item.result === 'normal' }" @click="setResult(item, 'normal')">正常</view>
              <view class="result-btn abnormal" :class="{ active: item.result === 'abnormal' }" @click="setResult(item, 'abnormal')">异常</view>
            </view>
          </view>
          <view class="check-detail" v-if="item.result === 'abnormal'">
            <textarea v-model="item.remark" placeholder="请描述异常情况" :maxlength="200" />
            <view class="image-upload">
              <view class="image-item" v-for="(img, idx) in item.images" :key="idx">
                <image :src="img" mode="aspectFill" />
                <Close style="width:20px;height:20px" class="delete-icon" @click="removeImage(item, idx)" />
              </view>
              <view class="add-image" @click="addImage(item)" v-if="item.images.length < 4">
                <Camera style="width:32px;height:32px;color:#999" />
                <text>拍照</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="point-actions">
        <button class="btn-prev" @click="prevPoint" :disabled="currentPointIndex === 0">上一点</button>
        <button class="btn-submit" @click="submitPoint">提交</button>
        <button class="btn-next" @click="nextPoint" :disabled="currentPointIndex === pointList.length - 1">下一点</button>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <button class="btn-pause" @click="pauseInspection">暂停巡检</button>
      <button class="btn-complete" @click="completeInspection" :disabled="!canComplete">完成巡检</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface CheckItem {
  id: number
  name: string
  result: string
  remark: string
  images: string[]
}

interface Point {
  id: number
  name: string
  location: string
  status: string
  checkItems: CheckItem[]
}

const task = reactive({
  id: 1,
  name: '设备间日常巡检',
  routeName: 'A栋设备路线',
  progress: 25
})

const currentPointIndex = ref(0)

const pointList = ref<Point[]>([
  { id: 1, name: '配电室', location: 'A栋B1层', status: 'completed', checkItems: [
    { id: 1, name: '设备运行状态', result: 'normal', remark: '', images: [] },
    { id: 2, name: '仪表读数记录', result: 'normal', remark: '', images: [] },
    { id: 3, name: '环境温湿度', result: 'normal', remark: '', images: [] }
  ]},
  { id: 2, name: '空调机房', location: 'A栋B1层', status: 'pending', checkItems: [
    { id: 4, name: '主机运行状态', result: '', remark: '', images: [] },
    { id: 5, name: '冷却水温度', result: '', remark: '', images: [] },
    { id: 6, name: '过滤网清洁度', result: '', remark: '', images: [] }
  ]},
  { id: 3, name: '消防控制室', location: 'A栋1层', status: 'pending', checkItems: [
    { id: 7, name: '消防主机状态', result: '', remark: '', images: [] },
    { id: 8, name: '报警记录检查', result: '', remark: '', images: [] }
  ]},
  { id: 4, name: '电梯机房', location: 'A栋顶层', status: 'pending', checkItems: [
    { id: 9, name: '电梯运行状态', result: '', remark: '', images: [] },
    { id: 10, name: '安全装置检查', result: '', remark: '', images: [] }
  ]}
])

const currentPoint = computed(() => pointList.value[currentPointIndex.value])

const canComplete = computed(() => {
  return pointList.value.every(p => p.status === 'completed' || p.status === 'abnormal')
})

const selectPoint = (index: number) => {
  currentPointIndex.value = index
}

const prevPoint = () => {
  if (currentPointIndex.value > 0) currentPointIndex.value--
}

const nextPoint = () => {
  if (currentPointIndex.value < pointList.value.length - 1) currentPointIndex.value++
}

const setResult = (item: CheckItem, result: string) => {
  item.result = result
  if (result === 'normal') {
    item.remark = ''
    item.images = []
  }
}

const addImage = (item: CheckItem) => {
  uni.chooseImage({
    count: 4 - item.images.length,
    sourceType: ['camera'],
    success: (res) => {
      item.images.push(...res.tempFilePaths)
    }
  })
}

const removeImage = (item: CheckItem, index: number) => {
  item.images.splice(index, 1)
}

const submitPoint = () => {
  const point = currentPoint.value
  if (!point) return
  
  const allChecked = point.checkItems.every(item => item.result !== '')
  if (!allChecked) {
    uni.showToast({ title: '请完成所有巡检项', icon: 'none' })
    return
  }
  
  const hasAbnormal = point.checkItems.some(item => item.result === 'abnormal')
  point.status = hasAbnormal ? 'abnormal' : 'completed'
  
  const completedCount = pointList.value.filter(p => p.status === 'completed' || p.status === 'abnormal').length
  task.progress = Math.round((completedCount / pointList.value.length) * 100)
  
  uni.showToast({ title: '提交成功' })
  
  if (currentPointIndex.value < pointList.value.length - 1) {
    nextPoint()
  }
}

const pauseInspection = () => {
  uni.showModal({
    title: '暂停巡检',
    content: '确认暂停当前巡检任务？已完成的巡检点数据将被保存。',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}

const completeInspection = () => {
  uni.showModal({
    title: '完成巡检',
    content: '确认完成本次巡检任务？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '巡检完成' })
        setTimeout(() => uni.navigateBack(), 1500)
      }
    }
  })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options
  if (options?.id) {
    console.log('加载任务ID:', options.id)
  }
})
</script>

<style lang="scss">
.execute-page { min-height: 100vh; background-color: #f5f5f5; padding-bottom: 160rpx; }

.task-header {
  display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1890ff, #40a9ff); padding: 40rpx 30rpx; color: #fff;
  .task-info { .task-name { display: block; font-size: 32rpx; font-weight: 600; margin-bottom: 8rpx; } .task-route { font-size: 24rpx; opacity: 0.8; } }
  .task-progress { .progress-circle { width: 100rpx; height: 100rpx; border-radius: 50%; background-color: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; .progress-value { font-size: 28rpx; font-weight: 600; } } }
}

.point-list {
  display: flex; overflow-x: auto; padding: 20rpx; gap: 16rpx; background-color: #fff;
  .point-item {
    flex-shrink: 0; width: 160rpx; padding: 16rpx; border-radius: 12rpx; background-color: #f5f5f5; text-align: center;
    &.active { background-color: #e6f7ff; border: 2rpx solid #1890ff; }
    &.completed { background-color: #f6ffed; }
    .point-index { width: 40rpx; height: 40rpx; background-color: #d9d9d9; color: #fff; border-radius: 50%; line-height: 40rpx; font-size: 24rpx; margin: 0 auto 8rpx; }
    &.active .point-index { background-color: #1890ff; }
    &.completed .point-index { background-color: #52c41a; }
    .point-content { .point-name { display: block; font-size: 24rpx; color: #333; margin-bottom: 4rpx; } .point-location { font-size: 20rpx; color: #999; } }
    .point-status { margin-top: 8rpx; .status-pending { width: 20rpx; height: 20rpx; border: 2rpx solid #d9d9d9; border-radius: 50%; margin: 0 auto; } }
  }
}

.card { background-color: #fff; margin: 20rpx; border-radius: 16rpx; padding: 30rpx;
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; .card-title { font-size: 30rpx; font-weight: 600; color: #333; } .point-name { font-size: 26rpx; color: #1890ff; } }
}

.check-list {
  .check-item { padding: 20rpx 0; border-bottom: 1rpx solid #f0f0f0; &:last-child { border-bottom: none; }
    .check-header { display: flex; justify-content: space-between; align-items: center; .check-name { font-size: 28rpx; color: #333; }
      .check-result { display: flex; gap: 16rpx; .result-btn { padding: 8rpx 24rpx; border-radius: 20rpx; font-size: 24rpx; background-color: #f5f5f5; color: #666; &.active { background-color: #f6ffed; color: #52c41a; } &.abnormal.active { background-color: #fff1f0; color: #f5222d; } } }
    }
    .check-detail { margin-top: 16rpx; textarea { width: 100%; height: 120rpx; padding: 16rpx; background-color: #f5f5f5; border-radius: 8rpx; font-size: 26rpx; box-sizing: border-box; }
      .image-upload { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 16rpx;
        .image-item { width: 140rpx; height: 140rpx; position: relative; image { width: 100%; height: 100%; border-radius: 8rpx; } .delete-icon { position: absolute; top: -10rpx; right: -10rpx; background: #fff; border-radius: 50%; } }
        .add-image { width: 140rpx; height: 140rpx; background-color: #f5f5f5; border-radius: 8rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; text { font-size: 22rpx; color: #999; margin-top: 8rpx; } }
      }
    }
  }
}

.point-actions { display: flex; gap: 16rpx; margin-top: 30rpx;
  button { flex: 1; height: 72rpx; line-height: 72rpx; border-radius: 36rpx; font-size: 28rpx;
    &.btn-prev, &.btn-next { background-color: #f5f5f5; color: #666; &[disabled] { opacity: 0.5; } }
    &.btn-submit { background-color: #1890ff; color: #fff; }
  }
}

.bottom-actions {
  position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 20rpx; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background-color: #fff; box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  button { flex: 1; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; font-size: 28rpx;
    &.btn-pause { background-color: #fff; color: #666; border: 1rpx solid #d9d9d9; }
    &.btn-complete { background-color: #52c41a; color: #fff; &[disabled] { opacity: 0.5; } }
  }
}
</style>
