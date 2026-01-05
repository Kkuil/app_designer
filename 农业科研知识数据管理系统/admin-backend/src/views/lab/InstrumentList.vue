<template>
  <div class="instrument-list-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="仪器名称"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="仪器分类"><el-select v-model="searchForm.category" placeholder="全部" clearable><el-option label="大型精密仪器" value="large" /><el-option label="常规分析仪器" value="regular" /><el-option label="专用仪器" value="special" /></el-select></el-form-item>
        <el-form-item label="开放状态"><el-select v-model="searchForm.openStatus" placeholder="全部" clearable><el-option label="开放预约" value="1" /><el-option label="暂停预约" value="0" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="instrument-cards">
      <el-card v-for="item in instrumentList" :key="item.id" class="instrument-card" :body-style="{ padding: '0' }">
        <div class="card-image"><el-image :src="item.image" fit="cover" style="width: 100%; height: 150px"><template #error><div class="image-placeholder"><el-icon :size="40"><Picture /></el-icon></div></template></el-image><el-tag :type="item.openStatus === 1 ? 'success' : 'info'" class="status-tag">{{ item.openStatus === 1 ? '开放预约' : '暂停预约' }}</el-tag></div>
        <div class="card-content">
          <h3 class="instrument-name">{{ item.name }}</h3>
          <p class="instrument-info"><el-icon><Location /></el-icon>{{ item.location }}</p>
          <p class="instrument-info"><el-icon><User /></el-icon>负责人：{{ item.manager }}</p>
          <p class="instrument-info"><el-icon><Clock /></el-icon>服务时间：{{ item.serviceTime }}</p>
          <div class="instrument-tags"><el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag></div>
          <div class="card-actions"><el-button type="primary" size="small" @click="handleReserve(item)" :disabled="item.openStatus !== 1">立即预约</el-button><el-button size="small" @click="handleDetail(item)">查看详情</el-button><el-button size="small" @click="handleDocuments(item)">资料</el-button><el-button size="small" @click="handleEdit(item)">编辑</el-button></div>
        </div>
      </el-card>
    </div>
    <div class="pagination-container" style="margin-top: 20px"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[8, 16, 24]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    <el-dialog v-model="detailVisible" :title="currentInstrument?.name" width="800px">
      <el-descriptions :column="2" border v-if="currentInstrument">
        <el-descriptions-item label="仪器编号">{{ currentInstrument.code }}</el-descriptions-item>
        <el-descriptions-item label="仪器名称">{{ currentInstrument.name }}</el-descriptions-item>
        <el-descriptions-item label="仪器分类">{{ currentInstrument.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">{{ currentInstrument.model }}</el-descriptions-item>
        <el-descriptions-item label="生产厂商">{{ currentInstrument.manufacturer }}</el-descriptions-item>
        <el-descriptions-item label="存放地点">{{ currentInstrument.location }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentInstrument.manager }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentInstrument.phone }}</el-descriptions-item>
        <el-descriptions-item label="服务时间">{{ currentInstrument.serviceTime }}</el-descriptions-item>
        <el-descriptions-item label="收费标准">{{ currentInstrument.price }}元/小时</el-descriptions-item>
        <el-descriptions-item label="仪器简介" :span="2">{{ currentInstrument.description }}</el-descriptions-item>
        <el-descriptions-item label="主要功能" :span="2">{{ currentInstrument.functions }}</el-descriptions-item>
        <el-descriptions-item label="操作要求" :span="2">{{ currentInstrument.requirements }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 资料/文档管理对话框 -->
    <el-dialog v-model="documentVisible" :title="currentInstrument?.name + ' - 资料管理'" width="900px">
      <div class="document-header">
        <el-button type="primary" @click="handleUploadDocument"><el-icon><Upload /></el-icon>上传资料</el-button>
        <el-input v-model="documentSearch" placeholder="搜索资料名称" style="width: 200px" clearable />
      </div>
      <el-tabs v-model="documentTab">
        <el-tab-pane label="操作手册" name="manual">
          <el-table :data="documentList.filter(d => d.type === 'manual')" stripe>
            <el-table-column prop="name" label="文档名称" min-width="200" />
            <el-table-column prop="size" label="文件大小" width="100" />
            <el-table-column prop="uploadTime" label="上传时间" width="160" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button>
                <el-button type="success" link size="small" @click="handleDownload(row)">下载</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteDoc(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="技术参数" name="params">
          <el-table :data="documentList.filter(d => d.type === 'params')" stripe>
            <el-table-column prop="name" label="文档名称" min-width="200" />
            <el-table-column prop="size" label="文件大小" width="100" />
            <el-table-column prop="uploadTime" label="上传时间" width="160" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button>
                <el-button type="success" link size="small" @click="handleDownload(row)">下载</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteDoc(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="培训资料" name="training">
          <el-table :data="documentList.filter(d => d.type === 'training')" stripe>
            <el-table-column prop="name" label="文档名称" min-width="200" />
            <el-table-column prop="size" label="文件大小" width="100" />
            <el-table-column prop="uploadTime" label="上传时间" width="160" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button>
                <el-button type="success" link size="small" @click="handleDownload(row)">下载</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteDoc(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="维护记录" name="maintenance">
          <el-table :data="documentList.filter(d => d.type === 'maintenance')" stripe>
            <el-table-column prop="name" label="文档名称" min-width="200" />
            <el-table-column prop="size" label="文件大小" width="100" />
            <el-table-column prop="uploadTime" label="上传时间" width="160" />
            <el-table-column prop="uploader" label="上传人" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button>
                <el-button type="success" link size="small" @click="handleDownload(row)">下载</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteDoc(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <!-- 上传资料对话框 -->
    <el-dialog v-model="uploadVisible" title="上传资料" width="500px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="资料类型">
          <el-select v-model="uploadForm.type" placeholder="请选择" style="width: 100%">
            <el-option label="操作手册" value="manual" />
            <el-option label="技术参数" value="params" />
            <el-option label="培训资料" value="training" />
            <el-option label="维护记录" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item label="资料名称">
          <el-input v-model="uploadForm.name" placeholder="请输入资料名称" />
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload action="#" :auto-upload="false" :limit="5" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png">
            <el-button type="primary"><el-icon><Upload /></el-icon>选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 PDF、Word、Excel、PPT、图片等格式，单个文件不超过50MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="uploadForm.remark" type="textarea" rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUploadSubmit">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(8), total = ref(20), detailVisible = ref(false), documentVisible = ref(false), uploadVisible = ref(false), currentInstrument = ref<any>(null)
const documentTab = ref('manual'), documentSearch = ref('')
const searchForm = reactive({ name: '', category: '', openStatus: '' })
const uploadForm = reactive({ type: '', name: '', remark: '' })
const documentList = ref([
  { id: 1, name: '高效液相色谱仪操作手册.pdf', type: 'manual', size: '2.5MB', uploadTime: '2024-01-10 09:30', uploader: '张三' },
  { id: 2, name: 'Agilent 1260技术参数.pdf', type: 'params', size: '1.2MB', uploadTime: '2024-01-05 14:20', uploader: '张三' },
  { id: 3, name: '液相色谱仪培训教程.pptx', type: 'training', size: '8.5MB', uploadTime: '2024-01-08 10:00', uploader: '李四' },
  { id: 4, name: '2024年1月维护报告.docx', type: 'maintenance', size: '500KB', uploadTime: '2024-01-15 16:00', uploader: '王五' }
])
const instrumentList = ref([
  { id: 1, code: 'INS001', name: '高效液相色谱仪', category: 'large', categoryName: '大型精密仪器', model: 'Agilent 1260', manufacturer: '安捷伦科技', location: '实验楼A301', manager: '张三', phone: '13800138001', serviceTime: '工作日 9:00-17:00', price: 200, openStatus: 1, image: '', tags: ['分离分析', '化合物检测'], description: '用于化合物的分离和定量分析', functions: '可进行化合物分离、定性定量分析、纯度检测等', requirements: '需经过培训并考核合格后方可操作' },
  { id: 2, code: 'INS002', name: '气相色谱质谱联用仪', category: 'large', categoryName: '大型精密仪器', model: 'Shimadzu GCMS', manufacturer: '岛津', location: '实验楼A302', manager: '张三', phone: '13800138001', serviceTime: '工作日 9:00-17:00', price: 300, openStatus: 1, image: '', tags: ['挥发物检测', '农残分析'], description: '用于挥发性化合物的检测分析', functions: '挥发性有机物分析、农药残留检测、香气成分分析', requirements: '需预约培训' },
  { id: 3, code: 'INS003', name: '紫外可见分光光度计', category: 'regular', categoryName: '常规分析仪器', model: 'UV-2600', manufacturer: '岛津', location: '实验楼B201', manager: '李四', phone: '13800138002', serviceTime: '工作日 8:30-18:00', price: 50, openStatus: 1, image: '', tags: ['光谱分析', '浓度测定'], description: '用于物质吸收光谱的测定', functions: '吸光度测定、浓度测定、光谱扫描', requirements: '自助使用' },
  { id: 4, code: 'INS004', name: '原子吸收光谱仪', category: 'large', categoryName: '大型精密仪器', model: 'AA-7000', manufacturer: '岛津', location: '实验楼A305', manager: '李四', phone: '13800138002', serviceTime: '工作日 9:00-17:00', price: 250, openStatus: 0, image: '', tags: ['金属分析', '元素测定'], description: '用于金属元素含量的测定', functions: '微量金属元素测定、重金属分析', requirements: '暂停服务，维修中' },
  { id: 5, code: 'INS005', name: '超速离心机', category: 'large', categoryName: '大型精密仪器', model: 'Optima XE-100', manufacturer: '贝克曼', location: '实验楼C101', manager: '王五', phone: '13800138003', serviceTime: '全天候', price: 150, openStatus: 1, image: '', tags: ['生物分离', '细胞分离'], description: '用于生物样品的超速离心分离', functions: '细胞分离、亚细胞组分分离、病毒纯化', requirements: '需操作培训' },
  { id: 6, code: 'INS006', name: '荧光显微镜', category: 'special', categoryName: '专用仪器', model: 'Olympus BX53', manufacturer: '奥林巴斯', location: '实验楼C102', manager: '王五', phone: '13800138003', serviceTime: '工作日 9:00-17:00', price: 100, openStatus: 1, image: '', tags: ['细胞观察', '荧光成像'], description: '用于生物样品的荧光观察', functions: '细胞荧光观察、免疫荧光、FISH检测', requirements: '需预约使用' }
])
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', category: '', openStatus: '' }); ElMessage.info('已重置') }
const handleReserve = (item: any) => ElMessage.success(`跳转到${item.name}预约页面`)
const handleDetail = (item: any) => { currentInstrument.value = item; detailVisible.value = true }
const handleDocuments = (item: any) => { currentInstrument.value = item; documentVisible.value = true }
const handleEdit = (item: any) => ElMessage.success(`编辑仪器：${item.name}`)
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
const handleUploadDocument = () => { Object.assign(uploadForm, { type: '', name: '', remark: '' }); uploadVisible.value = true }
const handlePreview = (row: any) => ElMessage.info(`预览文档：${row.name}`)
const handleDownload = (row: any) => ElMessage.success(`下载文档：${row.name}`)
const handleDeleteDoc = (row: any) => { ElMessageBox.confirm(`确定删除"${row.name}"吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('删除成功')).catch(() => {}) }
const handleUploadSubmit = () => { ElMessage.success('上传成功'); uploadVisible.value = false }
</script>
<style scoped>.instrument-list-page { height: 100%; }.instrument-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }.instrument-card { overflow: hidden; transition: transform 0.3s; }.instrument-card:hover { transform: translateY(-5px); }.card-image { position: relative; }.image-placeholder { height: 150px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #c0c4cc; }.status-tag { position: absolute; top: 10px; right: 10px; }.card-content { padding: 15px; }.instrument-name { margin: 0 0 10px 0; font-size: 16px; }.instrument-info { font-size: 13px; color: #909399; margin: 5px 0; display: flex; align-items: center; gap: 5px; }.instrument-tags { margin: 10px 0; display: flex; gap: 5px; flex-wrap: wrap; }.card-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }.document-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }</style>
