<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-scrollbar">
      <div class="tags-wrapper">
        <router-link
          v-for="tag in tagViews"
          :key="tag.path"
          :to="tag.path || '/'"
          class="tag-item"
          :class="{ active: isActive(tag) }"
        >
          <span class="tag-title">{{ tag.title }}</span>
          <el-icon
            v-if="!tag.meta?.affix"
            class="tag-close"
            @click.prevent.stop="closeTag(tag)"
          >
            <Close />
          </el-icon>
        </router-link>
      </div>
    </el-scrollbar>
    
    <!-- 右键菜单 -->
    <ul v-show="contextMenuVisible" class="context-menu" :style="contextMenuStyle">
      <li @click="refreshPage">刷新页面</li>
      <li @click="closeCurrentTag">关闭当前</li>
      <li @click="closeOtherTags">关闭其他</li>
      <li @click="closeAllTags">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, type TagView } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const tagViews = computed(() => appStore.tagViews)

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({ left: '0px', top: '0px' })
const selectedTag = ref<TagView | null>(null)

// 判断是否激活
const isActive = (tag: TagView) => {
  return tag.path === route.path
}

// 关闭标签
const closeTag = (tag: TagView) => {
  appStore.removeTagView(tag)
  if (isActive(tag)) {
    // 跳转到最后一个标签
    const lastTag = tagViews.value[tagViews.value.length - 1]
    if (lastTag) {
      router.push(lastTag.path || '/')
    } else {
      router.push('/')
    }
  }
}

// 刷新页面
const refreshPage = () => {
  // 实现页面刷新逻辑
  router.replace({ path: '/redirect' + route.path })
}

// 关闭当前标签
const closeCurrentTag = () => {
  if (selectedTag.value) {
    closeTag(selectedTag.value)
  }
  contextMenuVisible.value = false
}

// 关闭其他标签
const closeOtherTags = () => {
  if (selectedTag.value) {
    appStore.removeOtherTagViews(selectedTag.value)
    router.push(selectedTag.value.path || '/')
  }
  contextMenuVisible.value = false
}

// 关闭所有标签
const closeAllTags = () => {
  appStore.removeAllTagViews()
  router.push('/')
  contextMenuVisible.value = false
}

// 添加当前路由到标签
const addTagView = () => {
  if (route.name && !route.meta?.hidden) {
    appStore.addTagView({
      name: route.name as string,
      path: route.path,
      meta: route.meta,
      title: route.meta?.title as string
    })
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    addTagView()
  },
  { immediate: true }
)

// 点击其他区域关闭菜单
onMounted(() => {
  document.addEventListener('click', () => {
    contextMenuVisible.value = false
  })
})
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 100%;
  background-color: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
}

.tags-scrollbar {
  height: 100%;
  
  :deep(.el-scrollbar__wrap) {
    height: 100%;
  }
}

.tags-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
  white-space: nowrap;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 8px;
  margin-right: 4px;
  font-size: 12px;
  color: #495060;
  background-color: #fff;
  border: 1px solid #d8dce5;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    color: #409EFF;
  }
  
  &.active {
    background-color: #409EFF;
    color: #fff;
    border-color: #409EFF;
    
    .tag-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  
  .tag-title {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .tag-close {
    margin-left: 4px;
    border-radius: 50%;
    font-size: 12px;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
  margin: 0;
  padding: 5px 0;
  list-style: none;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  
  li {
    padding: 8px 16px;
    font-size: 12px;
    color: #333;
    cursor: pointer;
    
    &:hover {
      background-color: #f5f7fa;
      color: #409EFF;
    }
  }
}
</style>
