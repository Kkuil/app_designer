<template>
  <view class="notice-page">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <scroll-view class="category-scroll" scroll-x>
        <view
          class="category-item"
          :class="{ active: activeCategory === cat.value }"
          v-for="cat in categories"
          :key="cat.value"
          @click="changeCategory(cat.value)"
        >
          <text>{{ cat.label }}</text>
        </view>
      </scroll-view>
      <view class="toggle-read" @click="toggleUnread">
        <CircleCheck v-if="onlyUnread" style="width:18px;height:18px;color:#1890ff" />
        <CircleClose v-else style="width:18px;height:18px;color:#999" />
        <text>{{ onlyUnread ? '只看未读' : '全部' }}</text>
      </view>
    </view>

    <!-- 公告列表 -->
    <scroll-view class="notice-list" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view class="notice-item" v-for="item in displayList" :key="item.id" @click="openDetail(item)">
        <view class="item-header">
          <view class="badge" :class="item.type">{{ item.typeText }}</view>
          <view class="status" :class="{ unread: !item.read }">{{ item.read ? '已读' : '未读' }}</view>
        </view>
        <view class="item-title">{{ item.title }}</view>
        <view class="item-content">{{ item.summary }}</view>
        <view class="item-footer">
          <text class="time">{{ item.time }}</text>
          <view class="tags">
            <view class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</view>
          </view>
        </view>
      </view>
      <view class="empty" v-if="displayList.length === 0">
        <text>暂无公告</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface NoticeItem {
  id: number
  title: string
  summary: string
  type: string
  typeText: string
  tags: string[]
  time: string
  read: boolean
}

const categories = [
  { label: '全部', value: 'all' },
  { label: '公告', value: 'notice' },
  { label: '活动', value: 'event' },
  { label: '停水停电', value: 'utility' },
  { label: '安全', value: 'security' }
]

const activeCategory = ref('all')
const onlyUnread = ref(false)
const refreshing = ref(false)

const noticeList = ref<NoticeItem[]>([
  { id: 1, title: '园区消防演练通知', summary: '本周五15:00在B栋进行消防演练，请各单位提前做好准备。', type: 'security', typeText: '安全', tags: ['消防', '演练'], time: '2025-01-15 10:00', read: false },
  { id: 2, title: 'A栋停电检修通知', summary: '因线路维护，A栋将于本周六9:00-12:00停电，请提前安排。', type: 'utility', typeText: '停水停电', tags: ['电力', '检修'], time: '2025-01-14 18:00', read: true },
  { id: 3, title: '年会活动报名开启', summary: '园区年会报名通道开启，欢迎各单位踊跃参加，报名截止1月25日。', type: 'event', typeText: '活动', tags: ['年会', '报名'], time: '2025-01-13 09:00', read: false }
])

const displayList = computed(() => {
  return noticeList.value.filter((item) => {
    const categoryOk = activeCategory.value === 'all' || item.type === activeCategory.value
    const unreadOk = !onlyUnread.value || !item.read
    return categoryOk && unreadOk
  })
})

const changeCategory = (val: string) => {
  activeCategory.value = val
}

const toggleUnread = () => {
  onlyUnread.value = !onlyUnread.value
}

const onRefresh = () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
  }, 600)
}

const openDetail = (item: NoticeItem) => {
  if (!item.read) item.read = true
  uni.navigateTo({ url: '/pages/notice/detail?id=' + item.id })
}
</script>

<style lang="scss">
.notice-page { min-height: 100vh; background: #f5f5f5; display: flex; flex-direction: column; }
.filter-bar { background: #fff; padding: 16rpx 20rpx; display: flex; align-items: center; justify-content: space-between; }
.category-scroll { display: flex; gap: 12rpx; }
.category-item { padding: 10rpx 18rpx; border-radius: 20rpx; background: #f5f5f5; font-size: 24rpx; color: #666; }
.category-item.active { background: #e6f7ff; color: #1890ff; }
.toggle-read { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #1890ff; }

.notice-list { flex: 1; padding: 20rpx; }
.notice-item { background: #fff; border-radius: 16rpx; padding: 20rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.item-header { display: flex; justify-content: space-between; align-items: center; }
.badge { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 12rpx; color: #fff; }
.badge.notice { background: #1890ff; }
.badge.event { background: #722ed1; }
.badge.utility { background: #fa8c16; }
.badge.security { background: #f5222d; }
.status { font-size: 22rpx; color: #999; }
.status.unread { color: #f5222d; }
.item-title { font-size: 30rpx; color: #333; font-weight: 600; margin: 10rpx 0; }
.item-content { font-size: 24rpx; color: #666; line-height: 1.6; }
.item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12rpx; font-size: 22rpx; color: #999; }
.tags { display: flex; gap: 8rpx; }
.tag { background: #f5f5f5; padding: 6rpx 10rpx; border-radius: 10rpx; font-size: 22rpx; color: #666; }
.empty { text-align: center; color: #999; padding: 100rpx 0; font-size: 26rpx; }
</style>
