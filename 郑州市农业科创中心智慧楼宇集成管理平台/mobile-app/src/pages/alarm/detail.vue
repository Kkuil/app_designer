<template>
  <view class="alarm-detail-page">
    <!-- 报警状态头部 -->
    <view class="status-header" :class="'level-' + alarm.level">
      <view class="status-icon">
        <CircleCheck v-if="alarm.status === 'resolved'" style="width:48px;height:48px;color:#fff" />
        <InfoFilled v-else style="width:48px;height:48px;color:#fff" />
      </view>
      <text class="status-text">{{ getStatusText(alarm.status) }}</text>
      <text class="alarm-time">{{ alarm.time }}</text>
    </view>

    <!-- 报警基本信息 -->
    <view class="card info-card">
      <view class="card-header">
        <text class="card-title">报警信息</text>
        <view class="alarm-level-tag" :class="'level-' + alarm.level">
          {{ getLevelText(alarm.level) }}
        </view>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">报警标题</text>
          <text class="value">{{ alarm.title }}</text>
        </view>
        <view class="info-item">
          <text class="label">报警类型</text>
          <text class="value">{{ alarm.typeName }}</text>
        </view>
        <view class="info-item">
          <text class="label">报警设备</text>
          <text class="value">{{ alarm.deviceName }}</text>
        </view>
        <view class="info-item">
          <text class="label">设备位置</text>
          <text class="value">{{ alarm.location }}</text>
        </view>
        <view class="info-item">
          <text class="label">报警值</text>
          <text class="value warning">{{ alarm.alarmValue }} {{ alarm.unit }}</text>
        </view>
        <view class="info-item">
          <text class="label">阈值范围</text>
          <text class="value">{{ alarm.threshold }}</text>
        </view>
      </view>
    </view>

    <!-- 报警描述 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">报警描述</text>
      </view>
      <view class="desc-content">
        <text>{{ alarm.description }}</text>
      </view>
    </view>

    <!-- 处理记录 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">处理记录</text>
      </view>
      <view class="timeline">
        <view class="timeline-item" v-for="(record, index) in handleRecords" :key="index">
          <view class="timeline-dot" :class="record.type"></view>
          <view class="timeline-content">
            <view class="timeline-header">
              <text class="action">{{ record.action }}</text>
              <text class="time">{{ record.time }}</text>
            </view>
            <text class="operator">操作人：{{ record.operator }}</text>
            <text class="remark" v-if="record.remark">{{ record.remark }}</text>
          </view>
        </view>
        <view class="empty-tip" v-if="handleRecords.length === 0">
          <text>暂无处理记录</text>
        </view>
      </view>
    </view>

    <!-- 关联工单 -->
    <view class="card" v-if="relatedWorkorder">
      <view class="card-header">
        <text class="card-title">关联工单</text>
        <text class="view-link" @click="goToWorkorder">查看详情</text>
      </view>
      <view class="workorder-info">
        <view class="info-row">
          <text class="label">工单编号</text>
          <text class="value">{{ relatedWorkorder.code }}</text>
        </view>
        <view class="info-row">
          <text class="label">工单状态</text>
          <view class="status-tag" :class="relatedWorkorder.status">
            {{ relatedWorkorder.statusText }}
          </view>
        </view>
        <view class="info-row">
          <text class="label">处理人</text>
          <text class="value">{{ relatedWorkorder.handler }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-if="alarm.status !== 'resolved'">
      <button class="btn-confirm" @click="confirmAlarm" v-if="alarm.status === 'pending'">
        确认报警
      </button>
      <button class="btn-handle" @click="showHandleDialog">
        处理报警
      </button>
      <button class="btn-workorder" @click="createWorkorder">
        生成工单
      </button>
    </view>

    <!-- 处理弹窗 -->
    <uni-popup ref="handlePopup" type="bottom">
      <view class="handle-popup">
        <view class="popup-header">
          <text class="popup-title">处理报警</text>
          <Close style="width:20px;height:20px" @click="closeHandlePopup" />
        </view>
        <view class="popup-content">
          <view class="form-item">
            <text class="label">处理方式</text>
            <picker mode="selector" :range="handleMethods" @change="onMethodChange">
              <view class="picker-value">
                <text>{{ handleForm.method || '请选择处理方式' }}</text>
                <ArrowDown style="width:14px;height:14px;color:#999" />
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="label">处理说明</text>
            <textarea 
              v-model="handleForm.remark" 
              placeholder="请输入处理说明"
              :maxlength="200"
            />
          </view>
          <view class="form-item">
            <text class="label">现场照片</text>
            <view class="image-list">
              <view class="image-item" v-for="(img, index) in handleForm.images" :key="index">
                <image :src="img" mode="aspectFill" />
                <Close style="width:20px;height:20px" class="delete-icon" @click="removeImage(index)" />
              </view>
              <view class="add-image" @click="chooseImage" v-if="handleForm.images.length < 4">
                <Plus style="width:32px;height:32px;color:#999" />
              </view>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <button class="btn-cancel" @click="closeHandlePopup">取消</button>
          <button class="btn-submit" @click="submitHandle">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Alarm {
  id: number
  level: number
  status: string
  title: string
  typeName: string
  deviceName: string
  location: string
  alarmValue: string
  unit: string
  threshold: string
  description: string
  time: string
}

interface HandleRecord {
  action: string
  operator: string
  time: string
  type: string
  remark?: string
}

interface Workorder {
  id: number
  code: string
  status: string
  statusText: string
  handler: string
}

const alarm = ref<Alarm>({
  id: 1,
  level: 1,
  status: 'confirmed',
  title: '温度过高报警',
  typeName: '环境监测',
  deviceName: '1号楼温度传感器',
  location: 'A栋1楼大厅',
  alarmValue: '38.5',
  unit: '℃',
  threshold: '18-28℃',
  description: '监测到1号楼大厅温度超出正常范围，当前温度38.5℃，已超过上限阈值28℃，请及时检查空调设备运行状态。',
  time: '2025-01-15 14:30:25'
})

const handleRecords = ref<HandleRecord[]>([
  { action: '报警产生', operator: '系统', time: '14:30:25', type: 'create' },
  { action: '报警确认', operator: '张三', time: '14:35:10', type: 'confirm', remark: '已确认报警，正在排查原因' }
])

const relatedWorkorder = ref<Workorder | null>({
  id: 1,
  code: 'WO202501150001',
  status: 'processing',
  statusText: '处理中',
  handler: '李四'
})

const handlePopup = ref()
const handleMethods = ['现场处理', '远程调节', '设备重启', '人工干预', '其他']
const handleForm = reactive({
  method: '',
  remark: '',
  images: [] as string[]
})

const getLevelText = (level: number): string => {
  const levels: Record<number, string> = { 1: '紧急', 2: '重要', 3: '一般', 4: '提示' }
  return levels[level] || '未知'
}

const getStatusText = (status: string): string => {
  const statuses: Record<string, string> = { pending: '待处理', confirmed: '已确认', processing: '处理中', resolved: '已解决' }
  return statuses[status] || '未知'
}

const confirmAlarm = () => {
  uni.showModal({
    title: '确认报警',
    content: '确认已知晓此报警信息？',
    success: (res) => {
      if (res.confirm) {
        alarm.value.status = 'confirmed'
        handleRecords.value.push({
          action: '报警确认',
          operator: '当前用户',
          time: new Date().toLocaleTimeString(),
          type: 'confirm'
        })
        uni.showToast({ title: '确认成功' })
      }
    }
  })
}

const showHandleDialog = () => {
  handlePopup.value.open()
}

const closeHandlePopup = () => {
  handlePopup.value.close()
}

const onMethodChange = (e: any) => {
  handleForm.method = handleMethods[e.detail.value]
}

const chooseImage = () => {
  uni.chooseImage({
    count: 4 - handleForm.images.length,
    success: (res) => {
      handleForm.images.push(...res.tempFilePaths)
    }
  })
}

const removeImage = (index: number) => {
  handleForm.images.splice(index, 1)
}

const submitHandle = () => {
  if (!handleForm.method) {
    uni.showToast({ title: '请选择处理方式', icon: 'none' })
    return
  }
  alarm.value.status = 'resolved'
  handleRecords.value.push({
    action: '报警处理',
    operator: '当前用户',
    time: new Date().toLocaleTimeString(),
    type: 'resolve',
    remark: handleForm.remark
  })
  closeHandlePopup()
  uni.showToast({ title: '处理成功' })
}

const createWorkorder = () => {
  uni.navigateTo({ url: '/pages/workorder/create?alarmId=' + alarm.value.id })
}

const goToWorkorder = () => {
  if (relatedWorkorder.value) {
    uni.navigateTo({ url: '/pages/workorder/detail?id=' + relatedWorkorder.value.id })
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options
  if (options?.id) {
    // 加载报警详情数据
    console.log('加载报警ID:', options.id)
  }
})
</script>

<style lang="scss">
.alarm-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 180rpx;
}

.status-header {
  padding: 60rpx 30rpx;
  text-align: center;
  color: #fff;
  
  &.level-1 { background: linear-gradient(135deg, #f5222d, #ff4d4f); }
  &.level-2 { background: linear-gradient(135deg, #fa8c16, #ffa940); }
  &.level-3 { background: linear-gradient(135deg, #1890ff, #40a9ff); }
  &.level-4 { background: linear-gradient(135deg, #52c41a, #73d13d); }
  
  .status-icon { margin-bottom: 16rpx; }
  .status-text { display: block; font-size: 36rpx; font-weight: 600; margin-bottom: 8rpx; }
  .alarm-time { font-size: 24rpx; opacity: 0.8; }
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
    .view-link { font-size: 26rpx; color: #1890ff; }
  }
  
  .alarm-level-tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    color: #fff;
    
    &.level-1 { background-color: #f5222d; }
    &.level-2 { background-color: #fa8c16; }
    &.level-3 { background-color: #1890ff; }
    &.level-4 { background-color: #52c41a; }
  }
}

.info-list {
  .info-item {
    display: flex;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child { border-bottom: none; }
    
    .label { width: 160rpx; font-size: 26rpx; color: #999; }
    .value { flex: 1; font-size: 26rpx; color: #333; &.warning { color: #f5222d; font-weight: 600; } }
  }
}

.desc-content { font-size: 26rpx; color: #666; line-height: 1.8; }

.timeline {
  .timeline-item {
    display: flex;
    padding-left: 30rpx;
    padding-bottom: 30rpx;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 12rpx;
      top: 24rpx;
      bottom: 0;
      width: 2rpx;
      background-color: #e8e8e8;
    }
    
    &:last-child::before { display: none; }
    
    .timeline-dot {
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      background-color: #1890ff;
      position: absolute;
      left: 0;
      top: 6rpx;
      
      &.create { background-color: #f5222d; }
      &.confirm { background-color: #fa8c16; }
      &.resolve { background-color: #52c41a; }
    }
    
    .timeline-content {
      flex: 1;
      
      .timeline-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;
        
        .action { font-size: 28rpx; color: #333; font-weight: 500; }
        .time { font-size: 24rpx; color: #999; }
      }
      
      .operator { font-size: 24rpx; color: #666; display: block; }
      .remark { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
    }
  }
}

.workorder-info {
  .info-row {
    display: flex;
    align-items: center;
    padding: 12rpx 0;
    
    .label { width: 150rpx; font-size: 26rpx; color: #999; }
    .value { flex: 1; font-size: 26rpx; color: #333; }
    
    .status-tag {
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      
      &.processing { background-color: #e6f7ff; color: #1890ff; }
      &.completed { background-color: #f6ffed; color: #52c41a; }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    
    &.btn-confirm { background-color: #fa8c16; color: #fff; }
    &.btn-handle { background-color: #1890ff; color: #fff; }
    &.btn-workorder { background-color: #fff; color: #1890ff; border: 1rpx solid #1890ff; }
  }
}

.handle-popup {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .popup-title { font-size: 32rpx; font-weight: 600; }
  }
  
  .popup-content {
    padding: 30rpx;
    max-height: 60vh;
    overflow-y: auto;
    
    .form-item {
      margin-bottom: 30rpx;
      
      .label { display: block; font-size: 28rpx; color: #333; margin-bottom: 16rpx; }
      
      .picker-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #666;
      }
      
      textarea {
        width: 100%;
        height: 160rpx;
        padding: 20rpx;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        font-size: 28rpx;
        box-sizing: border-box;
      }
      
      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        
        .image-item {
          width: 160rpx;
          height: 160rpx;
          position: relative;
          
          image { width: 100%; height: 100%; border-radius: 8rpx; }
          .delete-icon { position: absolute; top: -10rpx; right: -10rpx; background: #fff; border-radius: 50%; }
        }
        
        .add-image {
          width: 160rpx;
          height: 160rpx;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
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
      &.btn-submit { background-color: #1890ff; color: #fff; }
    }
  }
}

.empty-tip { text-align: center; color: #999; font-size: 26rpx; padding: 40rpx 0; }
</style>
