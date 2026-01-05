<template>
  <view class="repair-create">
    <view class="form-card">
      <view class="form-item">
        <text class="label">报修标题</text>
        <input v-model="form.title" placeholder="请输入问题标题" />
      </view>

      <view class="form-item">
        <text class="label">设备/位置</text>
        <input v-model="form.device" placeholder="请输入设备或位置" />
      </view>

      <view class="form-item">
        <text class="label">紧急程度</text>
        <picker mode="selector" :range="priorityOptions" @change="onPriorityChange">
          <view class="picker-value">{{ form.priorityText || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">详细描述</text>
        <textarea v-model="form.content" placeholder="请描述故障现象、影响范围等" :maxlength="400" />
      </view>

      <view class="form-item">
        <text class="label">上传图片</text>
        <view class="images">
          <view class="img" v-for="(img, idx) in form.images" :key="idx">
            <image :src="img" mode="aspectFill" />
            <Close style="width:18px;height:18px" class="del" @click="remove(idx)" />
          </view>
          <view class="add" v-if="form.images.length < 6" @click="choose">
            <Plus style="width:28px;height:28px;color:#999" />
            <text>添加</text>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-bar">
      <button class="btn" @click="submit">提交报修</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const priorityOptions = ['低', '中', '高', '紧急']

const form = reactive({
  title: '',
  device: '',
  priorityText: '',
  content: '',
  images: [] as string[]
})

const onPriorityChange = (e: any) => {
  form.priorityText = priorityOptions[e.detail.value]
}

const choose = () => {
  uni.chooseImage({
    count: 6 - form.images.length,
    success: (res) => form.images.push(...res.tempFilePaths)
  })
}

const remove = (idx: number) => form.images.splice(idx, 1)

const submit = () => {
  if (!form.title || !form.device || !form.priorityText || !form.content) {
    uni.showToast({ title: '请完善必填项', icon: 'none' })
    return
  }
  uni.showToast({ title: '报修已提交', icon: 'none' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style lang="scss">
.repair-create { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.form-card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.form-item { margin-bottom: 20rpx; }
.label { font-size: 26rpx; color: #333; display: block; margin-bottom: 10rpx; }
.picker-value, input, textarea { width: 100%; background: #f5f5f5; border-radius: 12rpx; padding: 16rpx; font-size: 26rpx; box-sizing: border-box; }
textarea { height: 200rpx; }
.images { display: flex; flex-wrap: wrap; gap: 16rpx; }
.img { width: 160rpx; height: 160rpx; position: relative; }
.img image { width: 100%; height: 100%; border-radius: 12rpx; }
.img .del { position: absolute; top: -10rpx; right: -10rpx; background: #fff; border-radius: 50%; }
.add { width: 160rpx; height: 160rpx; background: #f5f5f5; border-radius: 12rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 22rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05); }
.btn { width: 100%; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; background: #1890ff; color: #fff; font-size: 28rpx; text-align: center; }
</style>
