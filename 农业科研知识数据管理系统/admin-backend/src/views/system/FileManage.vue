<template>
  <div class="file-manage-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="文件名"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="文件类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="文档" value="doc" /><el-option label="图片" value="img" /><el-option label="视频" value="video" /><el-option label="压缩包" value="zip" /><el-option label="其他" value="other" /></el-select></el-form-item>
        <el-form-item label="上传时间"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-upload action="#" :show-file-list="false" :before-upload="handleUpload"><el-button type="primary"><el-icon><Upload /></el-icon>上传文件</el-button></el-upload><el-button type="danger" @click="handleBatchDelete"><el-icon><Delete /></el-icon>批量删除</el-button></div>
      <el-table :data="tableData" stripe border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="文件名" min-width="200"><template #default="{ row }"><el-icon :color="getFileColor(row.type)"><component :is="getFileIcon(row.type)" /></el-icon><span style="margin-left: 8px">{{ row.name }}</span></template></el-table-column>
        <el-table-column prop="typeName" label="类型" width="80" />
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="uploader" label="上传者" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column prop="downloads" label="下载次数" width="90" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button><el-button type="success" link size="small" @click="handleDownload(row)">下载</el-button><el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="previewVisible" title="文件预览" width="800px"><div class="preview-content"><el-image v-if="currentFile?.type === 'img'" :src="currentFile?.url" fit="contain" style="max-height: 500px" /><div v-else class="file-preview-info"><el-icon :size="64" :color="getFileColor(currentFile?.type)"><component :is="getFileIcon(currentFile?.type)" /></el-icon><p>{{ currentFile?.name }}</p><p>{{ currentFile?.size }}</p></div></div></el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Picture, VideoPlay, Files } from '@element-plus/icons-vue'
const currentPage = ref(1), pageSize = ref(10), total = ref(100), previewVisible = ref(false), currentFile = ref<any>(null), selectedRows = ref<any[]>([])
const searchForm = reactive({ name: '', type: '', dateRange: null })
const tableData = ref([
  { id: 1, name: '农业科研项目方案.docx', type: 'doc', typeName: '文档', size: '2.5 MB', uploader: '管理员', uploadTime: '2024-12-22 10:30:00', downloads: 156, url: '' },
  { id: 2, name: '实验室设备照片.jpg', type: 'img', typeName: '图片', size: '1.2 MB', uploader: '张三', uploadTime: '2024-12-21 15:20:00', downloads: 89, url: 'https://picsum.photos/800/600' },
  { id: 3, name: '操作培训视频.mp4', type: 'video', typeName: '视频', size: '256 MB', uploader: '李四', uploadTime: '2024-12-20 09:15:00', downloads: 45, url: '' },
  { id: 4, name: '数据备份2024.zip', type: 'zip', typeName: '压缩包', size: '1.5 GB', uploader: '管理员', uploadTime: '2024-12-19 16:45:00', downloads: 12, url: '' },
  { id: 5, name: '试剂使用记录.xlsx', type: 'doc', typeName: '文档', size: '856 KB', uploader: '王五', uploadTime: '2024-12-18 11:30:00', downloads: 234, url: '' }
])
const getFileIcon = (type: string) => { const m: Record<string, any> = { doc: Document, img: Picture, video: VideoPlay }; return m[type] || Files }
const getFileColor = (type: string) => { const m: Record<string, string> = { doc: '#409EFF', img: '#67C23A', video: '#E6A23C', zip: '#909399' }; return m[type] || '#909399' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', type: '', dateRange: null }); ElMessage.info('已重置') }
const handleUpload = () => { ElMessage.success('文件上传成功'); return false }
const handleBatchDelete = () => { if (selectedRows.value.length === 0) { ElMessage.warning('请选择要删除的文件'); return }; ElMessageBox.confirm(`确定删除选中的${selectedRows.value.length}个文件吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handlePreview = (row: any) => { currentFile.value = row; previewVisible.value = true }
const handleDownload = (row: any) => ElMessage.success(`开始下载：${row.name}`)
const handleDelete = (row: any) => { ElMessageBox.confirm(`确定删除文件"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleSelectionChange = (rows: any[]) => { selectedRows.value = rows }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.file-manage-page { height: 100%; }.preview-content { text-align: center; padding: 20px; }.file-preview-info { padding: 40px; }.file-preview-info p { margin: 10px 0; color: #606266; }</style>
