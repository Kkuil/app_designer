<template>
  <div class="knowledge-base-page">
    <el-row :gutter="20">
      <!-- 左侧分类树 -->
      <el-col :span="5">
        <el-card class="category-card">
          <template #header>
            <div class="card-header">
              <span>知识分类</span>
              <el-button type="primary" link @click="handleAddCategory"><el-icon><Plus /></el-icon></el-button>
            </div>
          </template>
          <el-tree :data="categoryTree" :props="treeProps" node-key="id" default-expand-all @node-click="handleCategoryClick" highlight-current>
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon><Folder /></el-icon>
                <span>{{ node.label }}</span>
                <span class="count">({{ data.count }})</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧内容区 -->
      <el-col :span="19">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>科研仪器知识库</span>
              <div class="header-actions">
                <el-input v-model="searchKeyword" placeholder="搜索知识..." style="width: 250px" clearable @clear="handleSearch">
                  <template #append>
                    <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
                  </template>
                </el-input>
                <el-button type="primary" @click="handleAddKnowledge"><el-icon><Plus /></el-icon>添加知识</el-button>
              </div>
            </div>
          </template>

          <!-- 知识列表 -->
          <div class="knowledge-list">
            <el-card v-for="item in knowledgeList" :key="item.id" class="knowledge-item" shadow="hover">
              <div class="knowledge-header">
                <div class="knowledge-title">
                  <el-tag :type="getTypeColor(item.type)" size="small">{{ item.typeName }}</el-tag>
                  <h3 @click="handleViewKnowledge(item)">{{ item.title }}</h3>
                </div>
                <div class="knowledge-actions">
                  <el-button type="primary" link size="small" @click="handleViewKnowledge(item)"><el-icon><View /></el-icon></el-button>
                  <el-button type="warning" link size="small" @click="handleEditKnowledge(item)"><el-icon><Edit /></el-icon></el-button>
                  <el-button type="danger" link size="small" @click="handleDeleteKnowledge(item)"><el-icon><Delete /></el-icon></el-button>
                </div>
              </div>
              <p class="knowledge-summary">{{ item.summary }}</p>
              <div class="knowledge-meta">
                <span><el-icon><User /></el-icon> {{ item.author }}</span>
                <span><el-icon><Calendar /></el-icon> {{ item.updateTime }}</span>
                <span><el-icon><View /></el-icon> {{ item.views }}次浏览</span>
                <span><el-icon><Star /></el-icon> {{ item.likes }}赞</span>
              </div>
              <div class="knowledge-tags">
                <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
              </div>
            </el-card>
          </div>

          <div class="pagination-container">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" />
          </div>
        </el-card>

        <!-- 热门知识 -->
        <el-card class="hot-card" style="margin-top: 20px">
          <template #header><span>热门知识</span></template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="item in hotKnowledge" :key="item.id">
              <div class="hot-item" @click="handleViewKnowledge(item)">
                <el-icon :size="32" color="#409eff"><Document /></el-icon>
                <span class="hot-title">{{ item.title }}</span>
                <span class="hot-views">{{ item.views }}次浏览</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑知识对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑知识' : '添加知识'" width="800px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="知识标题" required>
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="知识类型">
              <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
                <el-option label="操作指南" value="guide" />
                <el-option label="技术文档" value="tech" />
                <el-option label="常见问题" value="faq" />
                <el-option label="维护保养" value="maintenance" />
                <el-option label="安全规范" value="safety" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分类">
              <el-cascader v-model="form.categoryId" :options="categoryOptions" placeholder="请选择分类" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="关联仪器">
          <el-select v-model="form.instrumentIds" multiple placeholder="请选择关联仪器" style="width: 100%">
            <el-option v-for="inst in instrumentOptions" :key="inst.id" :label="inst.name" :value="inst.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" rows="2" placeholder="请输入知识摘要" />
        </el-form-item>
        <el-form-item label="正文内容">
          <el-input v-model="form.content" type="textarea" rows="8" placeholder="请输入详细内容" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tags" multiple allow-create filterable placeholder="添加标签" style="width: 100%">
            <el-option label="操作技巧" value="操作技巧" />
            <el-option label="故障排除" value="故障排除" />
            <el-option label="维护保养" value="维护保养" />
            <el-option label="安全注意" value="安全注意" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件">
          <el-upload action="#" :auto-upload="false" :limit="5" multiple>
            <el-button type="primary" plain><el-icon><Upload /></el-icon>上传附件</el-button>
            <template #tip><div class="el-upload__tip">支持上传PDF、Word、图片等格式，单个文件不超过10MB</div></template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">发布</el-button>
      </template>
    </el-dialog>

    <!-- 知识详情对话框 -->
    <el-dialog v-model="detailVisible" :title="currentKnowledge?.title" width="800px">
      <div class="knowledge-detail" v-if="currentKnowledge">
        <div class="detail-meta">
          <el-tag :type="getTypeColor(currentKnowledge.type)">{{ currentKnowledge.typeName }}</el-tag>
          <span>作者：{{ currentKnowledge.author }}</span>
          <span>更新时间：{{ currentKnowledge.updateTime }}</span>
          <span>浏览：{{ currentKnowledge.views }}</span>
        </div>
        <el-divider />
        <div class="detail-content" v-html="currentKnowledge.content"></div>
        <el-divider />
        <div class="detail-tags">
          标签：<el-tag v-for="tag in currentKnowledge.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
        </div>
        <div class="detail-attachments" v-if="currentKnowledge.attachments?.length">
          <h4>附件下载：</h4>
          <div v-for="file in currentKnowledge.attachments" :key="file.name" class="attachment-item">
            <el-icon><Document /></el-icon>
            <a href="#">{{ file.name }}</a>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentKnowledge = ref<any>(null)

const treeProps = { children: 'children', label: 'label' }

const categoryTree = ref([
  { id: 1, label: '全部知识', count: 156, children: [
    { id: 11, label: '分析仪器', count: 45, children: [
      { id: 111, label: '色谱仪器', count: 20 },
      { id: 112, label: '光谱仪器', count: 15 },
      { id: 113, label: '质谱仪器', count: 10 }
    ]},
    { id: 12, label: '生物仪器', count: 38, children: [
      { id: 121, label: '离心机', count: 12 },
      { id: 122, label: '显微镜', count: 18 },
      { id: 123, label: 'PCR仪', count: 8 }
    ]},
    { id: 13, label: '通用设备', count: 35 },
    { id: 14, label: '安全规范', count: 28 },
    { id: 15, label: '常见问题', count: 10 }
  ]}
])

const categoryOptions = ref([
  { value: 11, label: '分析仪器', children: [
    { value: 111, label: '色谱仪器' },
    { value: 112, label: '光谱仪器' },
    { value: 113, label: '质谱仪器' }
  ]},
  { value: 12, label: '生物仪器', children: [
    { value: 121, label: '离心机' },
    { value: 122, label: '显微镜' },
    { value: 123, label: 'PCR仪' }
  ]},
  { value: 13, label: '通用设备' },
  { value: 14, label: '安全规范' },
  { value: 15, label: '常见问题' }
])

const instrumentOptions = ref([
  { id: 1, name: '高效液相色谱仪' },
  { id: 2, name: '气相色谱质谱联用仪' },
  { id: 3, name: '紫外可见分光光度计' },
  { id: 4, name: '原子吸收光谱仪' },
  { id: 5, name: '超速离心机' }
])

const form = reactive({
  title: '',
  type: '',
  categoryId: [],
  instrumentIds: [],
  summary: '',
  content: '',
  tags: []
})

const knowledgeList = ref([
  { id: 1, title: '高效液相色谱仪操作指南', type: 'guide', typeName: '操作指南', summary: '本文详细介绍高效液相色谱仪的基本操作流程，包括开机准备、样品进样、数据采集、关机维护等步骤...', author: '张教授', updateTime: '2024-12-28', views: 1256, likes: 89, tags: ['操作技巧', 'HPLC', '色谱分析'], content: '详细操作内容...', attachments: [{ name: '操作手册.pdf' }] },
  { id: 2, title: '气质联用仪常见故障排除', type: 'faq', typeName: '常见问题', summary: '汇总了气相色谱质谱联用仪在日常使用中常见的故障现象及解决方法，帮助用户快速排除问题...', author: '李教授', updateTime: '2024-12-25', views: 856, likes: 56, tags: ['故障排除', 'GC-MS'], content: '故障排除内容...', attachments: [] },
  { id: 3, title: '实验室安全操作规范', type: 'safety', typeName: '安全规范', summary: '实验室安全是科研工作的基础保障，本文汇总了实验室通用安全规范及各类仪器的安全注意事项...', author: '安全办', updateTime: '2024-12-20', views: 2156, likes: 128, tags: ['安全注意', '规范'], content: '安全规范内容...', attachments: [{ name: '安全手册.pdf' }] },
  { id: 4, title: '原子吸收光谱仪维护保养指南', type: 'maintenance', typeName: '维护保养', summary: '定期维护保养是保证仪器性能稳定的关键，本文介绍原子吸收光谱仪的日常维护要点...', author: '王工程师', updateTime: '2024-12-18', views: 523, likes: 34, tags: ['维护保养', 'AAS'], content: '维护保养内容...', attachments: [] }
])

const hotKnowledge = ref([
  { id: 1, title: '高效液相色谱仪操作指南', views: 1256 },
  { id: 3, title: '实验室安全操作规范', views: 2156 },
  { id: 2, title: '气质联用仪常见故障排除', views: 856 },
  { id: 5, title: '样品前处理技术汇总', views: 689 }
])

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    guide: 'success',
    tech: 'primary',
    faq: 'warning',
    maintenance: 'info',
    safety: 'danger'
  }
  return colors[type] || 'info'
}

const handleCategoryClick = (data: any) => {
  ElMessage.info(`筛选分类：${data.label}`)
}

const handleAddCategory = () => ElMessage.info('添加分类')

const handleSearch = () => ElMessage.success('搜索完成')

const handleAddKnowledge = () => {
  isEdit.value = false
  Object.assign(form, { title: '', type: '', categoryId: [], instrumentIds: [], summary: '', content: '', tags: [] })
  dialogVisible.value = true
}

const handleViewKnowledge = (item: any) => {
  currentKnowledge.value = item
  detailVisible.value = true
}

const handleEditKnowledge = (item: any) => {
  isEdit.value = true
  Object.assign(form, item)
  dialogVisible.value = true
}

const handleDeleteKnowledge = (item: any) => {
  ElMessageBox.confirm(`确定删除知识"${item.title}"吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const handleSubmit = () => {
  ElMessage.success(isEdit.value ? '更新成功' : '发布成功')
  dialogVisible.value = false
}
</script>

<style scoped>
.knowledge-base-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.category-card {
  height: calc(100vh - 160px);
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.tree-node .count {
  color: #909399;
  font-size: 12px;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.knowledge-item {
  cursor: pointer;
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.knowledge-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.knowledge-title h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  cursor: pointer;
}

.knowledge-title h3:hover {
  color: #409eff;
}

.knowledge-summary {
  color: #606266;
  font-size: 14px;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.knowledge-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.knowledge-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.knowledge-tags {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.hot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.3s;
}

.hot-item:hover {
  background: #f5f7fa;
}

.hot-title {
  margin-top: 10px;
  font-size: 14px;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-views {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.detail-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.detail-content {
  line-height: 1.8;
  color: #606266;
}

.detail-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-attachments {
  margin-top: 20px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.attachment-item a {
  color: #409eff;
  text-decoration: none;
}
</style>
