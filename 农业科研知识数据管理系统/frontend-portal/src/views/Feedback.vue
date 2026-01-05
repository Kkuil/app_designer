<template>
  <div class="feedback-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="container">
        <h1>用户反馈与留言</h1>
        <p>您的意见和建议是我们进步的动力</p>
      </div>
    </div>

    <div class="container">
      <el-row :gutter="24">
        <!-- 提交反馈 -->
        <el-col :xs="24" :md="14">
          <el-card class="feedback-form-card">
            <template #header>
              <div class="card-header">
                <el-icon><EditPen /></el-icon>
                <span>提交反馈</span>
              </div>
            </template>
            <el-form :model="feedbackForm" :rules="rules" ref="formRef" label-position="top">
              <el-form-item label="反馈类型" prop="type">
                <el-radio-group v-model="feedbackForm.type">
                  <el-radio-button label="问题反馈">问题反馈</el-radio-button>
                  <el-radio-button label="功能建议">功能建议</el-radio-button>
                  <el-radio-button label="使用咨询">使用咨询</el-radio-button>
                  <el-radio-button label="其他">其他</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="反馈标题" prop="title">
                <el-input v-model="feedbackForm.title" placeholder="请简要描述您的问题或建议" maxlength="50" show-word-limit />
              </el-form-item>
              <el-form-item label="详细内容" prop="content">
                <el-input
                  v-model="feedbackForm.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细描述您遇到的问题或具体建议..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="联系方式" prop="contact">
                <el-input v-model="feedbackForm.contact" placeholder="请输入手机号或邮箱，方便我们回复您" />
              </el-form-item>
              <el-form-item label="上传截图">
                <el-upload
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-change="handleChange"
                  :file-list="fileList"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">支持 jpg、png 格式，单个文件不超过 5MB</div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" @click="submitFeedback" :loading="submitting">
                  <el-icon><Position /></el-icon> 提交反馈
                </el-button>
                <el-button size="large" @click="resetForm">
                  <el-icon><Refresh /></el-icon> 重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 我的反馈 -->
        <el-col :xs="24" :md="10">
          <el-card class="my-feedback-card">
            <template #header>
              <div class="card-header">
                <el-icon><List /></el-icon>
                <span>我的反馈</span>
              </div>
            </template>
            <div class="feedback-list">
              <div v-for="item in myFeedbacks" :key="item.id" class="feedback-item" @click="viewFeedback(item)">
                <div class="feedback-header">
                  <el-tag :type="getStatusType(item.status)" size="small">{{ item.status }}</el-tag>
                  <span class="feedback-date">{{ item.date }}</span>
                </div>
                <h4>{{ item.title }}</h4>
                <p>{{ item.content }}</p>
                <div class="feedback-reply" v-if="item.reply">
                  <el-icon><ChatLineRound /></el-icon>
                  <span>管理员回复: {{ item.reply }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 留言板 -->
          <el-card class="message-board-card">
            <template #header>
              <div class="card-header">
                <el-icon><Comment /></el-icon>
                <span>公开留言板</span>
              </div>
            </template>
            <div class="message-input">
              <el-input
                v-model="newMessage"
                type="textarea"
                :rows="2"
                placeholder="发表您的留言..."
              />
              <el-button type="primary" size="small" @click="postMessage" style="margin-top: 10px;">
                发表留言
              </el-button>
            </div>
            <el-divider />
            <div class="message-list">
              <div v-for="msg in messages" :key="msg.id" class="message-item">
                <el-avatar :size="40">{{ msg.author.charAt(0) }}</el-avatar>
                <div class="message-content">
                  <div class="message-header">
                    <span class="author">{{ msg.author }}</span>
                    <span class="time">{{ msg.time }}</span>
                  </div>
                  <p>{{ msg.content }}</p>
                  <div class="message-actions">
                    <el-button type="primary" link size="small" @click="likeMessage(msg)">
                      <el-icon><Pointer /></el-icon> {{ msg.likes }}
                    </el-button>
                    <el-button type="primary" link size="small" @click="replyMessage(msg)">
                      <el-icon><ChatLineRound /></el-icon> 回复
                    </el-button>
                  </div>
                  <!-- 回复列表 -->
                  <div v-if="msg.replies && msg.replies.length" class="reply-list">
                    <div v-for="reply in msg.replies" :key="reply.id" class="reply-item">
                      <span class="reply-author">{{ reply.author }}</span>
                      <span class="reply-content">{{ reply.content }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" title="图片预览">
      <img :src="previewUrl" alt="预览" style="width: 100%" />
    </el-dialog>

    <!-- 反馈详情 -->
    <el-dialog v-model="detailVisible" title="反馈详情" width="500px">
      <div class="feedback-detail" v-if="currentFeedback">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="反馈类型">{{ currentFeedback.type }}</el-descriptions-item>
          <el-descriptions-item label="反馈标题">{{ currentFeedback.title }}</el-descriptions-item>
          <el-descriptions-item label="反馈内容">{{ currentFeedback.content }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentFeedback.date }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusType(currentFeedback.status)">{{ currentFeedback.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="管理员回复" v-if="currentFeedback.reply">
            {{ currentFeedback.reply }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'

const formRef = ref<FormInstance>()
const submitting = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')
const detailVisible = ref(false)
const currentFeedback = ref<any>(null)
const newMessage = ref('')
const fileList = ref<UploadFile[]>([])

const feedbackForm = reactive({
  type: '问题反馈',
  title: '',
  content: '',
  contact: ''
})

const rules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入反馈标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入详细内容', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
}

// 我的反馈列表
const myFeedbacks = ref([
  {
    id: 1,
    type: '问题反馈',
    title: '设备预约页面加载缓慢',
    content: '使用Chrome浏览器访问设备预约页面时，加载时间超过10秒...',
    date: '2024-12-18',
    status: '已回复',
    reply: '感谢您的反馈，我们已优化相关页面的加载速度，请清除缓存后重试。'
  },
  {
    id: 2,
    type: '功能建议',
    title: '建议增加批量导入功能',
    content: '希望在试剂入库时能支持Excel批量导入，提高工作效率...',
    date: '2024-12-15',
    status: '处理中',
    reply: ''
  },
  {
    id: 3,
    type: '使用咨询',
    title: '如何申请大型设备使用权限？',
    content: '我是新入职的研究员，请问如何申请核磁共振等大型设备的使用权限？',
    date: '2024-12-10',
    status: '已回复',
    reply: '请联系您的部门管理员提交权限申请，审批通过后即可预约使用。'
  }
])

// 留言列表
const messages = ref([
  {
    id: 1,
    author: '李研究员',
    content: '系统用起来很方便，设备预约功能大大提高了我们的工作效率！',
    time: '2024-12-20 14:30',
    likes: 15,
    replies: [
      { id: 1, author: '管理员', content: '感谢您的认可，我们会继续努力！' }
    ]
  },
  {
    id: 2,
    author: '王博士',
    content: '希望能增加移动端APP的离线功能，这样在实验室网络不好的时候也能使用。',
    time: '2024-12-19 09:15',
    likes: 8,
    replies: []
  },
  {
    id: 3,
    author: '张老师',
    content: '项目管理模块的进度跟踪功能非常实用，强烈推荐！',
    time: '2024-12-18 16:45',
    likes: 12,
    replies: [
      { id: 1, author: '陈同学', content: '同意，我们课题组也在用这个功能' }
    ]
  }
])

const getStatusType = (status: string): string => {
  const types: Record<string, string> = {
    '待处理': 'info',
    '处理中': 'warning',
    '已回复': 'success'
  }
  return types[status] || 'info'
}

const handlePreview = (file: UploadFile) => {
  previewUrl.value = file.url || ''
  previewVisible.value = true
}

const handleRemove = () => {
  ElMessage.info('图片已移除')
}

const handleChange = (file: UploadFile, files: UploadFile[]) => {
  fileList.value = files
  ElMessage.success('图片已添加')
}

const submitFeedback = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('反馈提交成功，我们会尽快处理！')
        resetForm()
      }, 1500)
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  fileList.value = []
  ElMessage.info('表单已重置')
}

const viewFeedback = (item: any) => {
  currentFeedback.value = item
  detailVisible.value = true
}

const postMessage = () => {
  if (!newMessage.value.trim()) {
    ElMessage.warning('请输入留言内容')
    return
  }
  messages.value.unshift({
    id: Date.now(),
    author: '当前用户',
    content: newMessage.value,
    time: new Date().toLocaleString(),
    likes: 0,
    replies: []
  })
  newMessage.value = ''
  ElMessage.success('留言发表成功！')
}

const likeMessage = (msg: any) => {
  msg.likes++
  ElMessage.success('点赞成功！')
}

const replyMessage = (msg: any) => {
  ElMessage.info(`回复 ${msg.author} 的留言`)
}
</script>

<style scoped>
.feedback-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.feedback-form-card {
  margin-bottom: 20px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.my-feedback-card {
  margin-bottom: 20px;
}

.feedback-list {
  max-height: 400px;
  overflow-y: auto;
}

.feedback-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background 0.3s;
}

.feedback-item:last-child {
  border-bottom: none;
}

.feedback-item:hover {
  background: #f5f7fa;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feedback-date {
  font-size: 12px;
  color: #909399;
}

.feedback-item h4 {
  font-size: 15px;
  color: #303133;
  margin-bottom: 8px;
}

.feedback-item p {
  font-size: 13px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-reply {
  margin-top: 10px;
  padding: 10px;
  background: #f0f9eb;
  border-radius: 4px;
  font-size: 13px;
  color: #67c23a;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.message-board-card {
  margin-bottom: 20px;
}

.message-input {
  margin-bottom: 15px;
}

.message-list {
  max-height: 400px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.message-item:last-child {
  border-bottom: none;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.message-header .author {
  font-weight: 500;
  color: #303133;
}

.message-header .time {
  font-size: 12px;
  color: #909399;
}

.message-content p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.message-actions {
  display: flex;
  gap: 15px;
}

.reply-list {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.reply-item {
  font-size: 13px;
  margin-bottom: 5px;
}

.reply-author {
  color: #409eff;
  margin-right: 8px;
}

.reply-content {
  color: #606266;
}

.feedback-detail {
  padding: 10px 0;
}
</style>
