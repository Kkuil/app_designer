<template>
  <div class="announcements-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="container">
        <h1>公告浏览与搜索</h1>
        <p>查看系统公告、重要通知和学术会议信息</p>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="container">
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item label="公告类型">
            <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
              <el-option label="系统更新" value="系统更新" />
              <el-option label="重要通知" value="重要通知" />
              <el-option label="学术会议" value="学术会议" />
              <el-option label="政策法规" value="政策法规" />
            </el-select>
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 管理员发布入口 -->
      <div class="action-bar">
        <el-button type="primary" @click="handlePublish">
          <el-icon><Plus /></el-icon>发布公告
        </el-button>
      </div>

      <!-- 公告列表 -->
      <el-row :gutter="20">
        <el-col :xs="24" :md="18">
          <el-card v-for="item in announcements" :key="item.id" class="announcement-card">
            <div class="announcement-header">
              <el-tag :type="getTagType(item.type)" effect="plain">{{ item.type }}</el-tag>
              <span class="announcement-date">
                <el-icon><Clock /></el-icon>
                {{ item.date }}
              </span>
            </div>
            <h3 class="announcement-title" @click="viewDetail(item)">{{ item.title }}</h3>
            <p class="announcement-summary">{{ item.summary }}</p>
            <div class="announcement-footer">
              <span class="author">发布者: {{ item.author }}</span>
              <el-button type="primary" link @click="viewDetail(item)">
                查看详情 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </el-card>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-col>

        <!-- 侧边栏 -->
        <el-col :xs="24" :md="6">
          <el-card class="sidebar-card">
            <template #header>
              <span class="card-title">热门公告</span>
            </template>
            <ul class="hot-list">
              <li v-for="(item, index) in hotAnnouncements" :key="item.id" @click="viewDetail(item)">
                <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                <span class="title">{{ item.title }}</span>
              </li>
            </ul>
          </el-card>

          <el-card class="sidebar-card">
            <template #header>
              <span class="card-title">公告分类</span>
            </template>
            <div class="category-list">
              <div class="category-item" v-for="cat in categories" :key="cat.name" @click="filterByCategory(cat.name)">
                <span>{{ cat.name }}</span>
                <el-badge :value="cat.count" :type="cat.type" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 发布公告对话框 -->
    <el-dialog v-model="publishDialogVisible" title="发布公告" width="600px">
      <el-form :model="publishForm" label-width="80px">
        <el-form-item label="公告标题" required>
          <el-input v-model="publishForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告类型" required>
          <el-select v-model="publishForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="系统更新" value="系统更新" />
            <el-option label="重要通知" value="重要通知" />
            <el-option label="学术会议" value="学术会议" />
            <el-option label="政策法规" value="政策法规" />
          </el-select>
        </el-form-item>
        <el-form-item label="公告内容" required>
          <el-input v-model="publishForm.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-switch v-model="publishForm.isTop" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPublish">确认发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const searchForm = reactive({
  keyword: '',
  type: '',
  dateRange: null as Date[] | null
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(56)
const publishDialogVisible = ref(false)

const publishForm = reactive({
  title: '',
  type: '',
  content: '',
  isTop: false
})

// 公告列表数据
const announcements = ref([
  {
    id: 1,
    type: '系统更新',
    title: '系统V2.0版本正式上线，新增多项实用功能',
    summary: '本次更新包含实验室设备预约优化、试剂耗材管理升级、项目申报流程简化等多项功能改进，为用户提供更便捷的使用体验。',
    date: '2024-12-20',
    author: '系统管理员'
  },
  {
    id: 2,
    type: '学术会议',
    title: '2024年农业科技创新发展论坛即将召开',
    summary: '论坛将于2025年1月15日在北京国际会议中心举办，届时将邀请国内外知名专家学者分享最新研究成果。',
    date: '2024-12-18',
    author: '学术委员会'
  },
  {
    id: 3,
    type: '重要通知',
    title: '关于2024年度科研成果统计工作的通知',
    summary: '请各部门于12月30日前完成本年度科研成果的统计与上报工作，确保数据的准确性和完整性。',
    date: '2024-12-15',
    author: '科研管理处'
  },
  {
    id: 4,
    type: '政策法规',
    title: '国家重点研发计划项目申报指南发布',
    summary: '科技部发布2025年度国家重点研发计划农业领域项目申报指南，请有意向申报的团队尽早准备材料。',
    date: '2024-12-12',
    author: '科技处'
  },
  {
    id: 5,
    type: '系统更新',
    title: '移动端APP新版本发布通知',
    summary: '移动端APP V3.5版本已上线各大应用商店，新增设备预约提醒、项目进度推送等功能。',
    date: '2024-12-10',
    author: '技术支持部'
  }
])

// 热门公告
const hotAnnouncements = ref([
  { id: 1, title: '2024年度考核工作安排通知' },
  { id: 2, title: '科研经费使用管理办法修订' },
  { id: 3, title: '实验室安全培训通知' },
  { id: 4, title: '新进人员系统使用培训' },
  { id: 5, title: '元旦假期值班安排' }
])

// 分类统计
const categories = ref([
  { name: '系统更新', count: 15, type: 'primary' },
  { name: '重要通知', count: 23, type: 'warning' },
  { name: '学术会议', count: 12, type: 'success' },
  { name: '政策法规', count: 6, type: 'info' }
])

const getTagType = (type: string): string => {
  const types: Record<string, string> = {
    '系统更新': 'primary',
    '重要通知': 'warning',
    '学术会议': 'success',
    '政策法规': 'info'
  }
  return types[type] || 'info'
}

const handleSearch = () => {
  ElMessage.success('搜索成功，已更新公告列表')
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.dateRange = null
  ElMessage.info('搜索条件已重置')
}

const handlePublish = () => {
  publishDialogVisible.value = true
}

const submitPublish = () => {
  if (!publishForm.title || !publishForm.type || !publishForm.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  ElMessage.success('公告发布成功！')
  publishDialogVisible.value = false
  // 重置表单
  publishForm.title = ''
  publishForm.type = ''
  publishForm.content = ''
  publishForm.isTop = false
}

const viewDetail = (item: any) => {
  router.push(`/announcements/${item.id}`)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  ElMessage.info(`每页显示 ${val} 条`)
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  ElMessage.info(`跳转到第 ${val} 页`)
}

const filterByCategory = (name: string) => {
  searchForm.type = name
  ElMessage.success(`已筛选: ${name}`)
}
</script>

<style scoped>
.announcements-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.announcement-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.announcement-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.announcement-date {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.announcement-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.3s;
}

.announcement-title:hover {
  color: #409eff;
}

.announcement-summary {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 15px;
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.author {
  color: #909399;
  font-size: 13px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.sidebar-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.hot-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hot-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
  cursor: pointer;
  transition: color 0.3s;
}

.hot-list li:last-child {
  border-bottom: none;
}

.hot-list li:hover .title {
  color: #409eff;
}

.rank {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #909399;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank.top {
  background: linear-gradient(135deg, #f56c6c, #e6a23c);
}

.hot-list .title {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item:hover {
  color: #409eff;
}
</style>
