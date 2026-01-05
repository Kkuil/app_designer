<template>
  <view class="complaint-create">
    <view class="form-card">
      <view class="form-item">
        <text class="label">类型</text>
        <picker mode="selector" :range="typeOptions" @change="onTypeChange">
          <view class="picker-value">{{ form.typeText || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">标题</text>
        <input v-model="form.title" placeholder="请输入投诉/建议标题" />
      </view>

      <view class="form-item">
        <text class="label">详情描述</text>
        <textarea v-model="form.content" placeholder="请描述问题或建议" :maxlength="300" />
      </view>

      <view class="form-item">
        <text class="label">上传图片</text>
        <view class="images">
          <view class="img" v-for="(img, idx) in form.images" :key="idx">
            <image :src="img" mode="aspectFill" />
            <Close style="width:18px;height:18px" class="del" @click="remove(idx)" />
          </view>
          <view class="add" v-if="form.images.length < 4" @click="choose">
            <Plus style="width:28px;height:28px;color:#999" />
            <text>添加</text>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-bar">
      <button class="btn" @click="submit">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const typeOptions = ['服务问题', '环境卫生', '设施设备', '安全管理', '其他']

const form = reactive({
  typeText: '',
  title: '',
  content: '',
  images: [] as string[]
})

const onTypeChange = (e: any) => {
  form.typeText = typeOptions[e.detail.value]
}

const choose = () => {
  uni.chooseImage({
    count: 4 - form.images.length,
    success: (res) => form.images.push(...res.tempFilePaths)
  })
}

const remove = (idx: number) => {
  form.images.splice(idx, 1)
}

const submit = () => {
  if (!form.typeText || !form.title || !form.content) {
    uni.showToast({ title: '请完善必填项', icon: 'none' })
    return
  }
  uni.showToast({ title: '提交成功', icon: 'none' })
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<style lang="scss">
.complaint-create { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.form-card { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.form-item { margin-bottom: 20rpx; }
.label { font-size: 26rpx; color: #333; display: block; margin-bottom: 10rpx; }
.picker-value, input, textarea { width: 100%; background: #f5f5f5; border-radius: 12rpx; padding: 16rpx; font-size: 26rpx; box-sizing: border-box; }
textarea { height: 180rpx; }
.images { display: flex; flex-wrap: wrap; gap: 16rpx; }
.img { width: 160rpx; height: 160rpx; position: relative; }
.img image { width: 100%; height: 100%; border-radius: 12rpx; }
.img .del { position: absolute; top: -10rpx; right: -10rpx; background: #fff; border-radius: 50%; }
.add { width: 160rpx; height: 160rpx; background: #f5f5f5; border-radius: 12rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 22rpx; }
.submit-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05); }
.btn { width: 100%; height: 80rpx; line-height: 80rpx; border-radius: 40rpx; background: #1890ff; color: #fff; font-size: 28rpx; text-align: center; }
</style>
