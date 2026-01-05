<template>
  <div class="paper-claim-page">
    <!-- ★重点项目：论文成果认领，知网机器人抓取、自动推送给作者认领，引文识别功能 -->
    <el-card class="stats-card">
      <template #header>
        <span>★ 论文成果认领系统（重点功能）</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="5">
          <el-statistic title="论文总数" :value="paperStats.total" />
        </el-col>
        <el-col :span="5">
          <el-statistic title="待认领" :value="paperStats.pending" class="pending" />
        </el-col>
        <el-col :span="5">
          <el-statistic title="已认领" :value="paperStats.claimed" class="claimed" />
        </el-col>
        <el-col :span="5">
          <el-statistic title="本周抓取" :value="paperStats.weekCrawl" class="crawl" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="引用总次数" :value="paperStats.citations" class="citations" />
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <template #header>
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="待认领论文" name="pending" />
          <el-tab-pane label="已认领论文" name="claimed" />
          <el-tab-pane label="知网抓取" name="crawl" />
          <el-tab-pane label="引文识别" name="citation" />
          <el-tab-pane label="推送设置" name="push" />
        </el-tabs>
      </template>

      <!-- 待认领论文 -->
      <div v-if="activeTab === 'pending'">
        <div class="search-bar">
          <el-form :inline="true">
            <el-form-item label="论文标题">
              <el-input v-model="searchForm.title" placeholder="请输入" clearable />
            </el-form-item>
            <el-form-item label="作者">
              <el-input v-model="searchForm.author" placeholder="请输入" clearable />
            </el-form-item>
            <el-form-item label="来源">
              <el-select v-model="searchForm.source" placeholder="全部" clearable>
                <el-option label="知网抓取" value="cnki" />
                <el-option label="手动录入" value="manual" />
                <el-option label="批量导入" value="import" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="pendingList" stripe border>
          <el-table-column prop="title" label="论文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="authors" label="作者" width="180" show-overflow-tooltip />
          <el-table-column prop="journal" label="发表期刊" width="150" />
          <el-table-column prop="publishDate" label="发表日期" width="100" />
          <el-table-column prop="source" label="来源" width="100">
            <template #default="{ row }">
              <el-tag :type="row.source === 'cnki' ? 'success' : 'info'">
                {{ row.source === 'cnki' ? '知网抓取' : row.source === 'manual' ? '手动录入' : '批量导入' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="matchedUsers" label="匹配作者" width="150">
            <template #default="{ row }">
              <el-tag v-for="user in row.matchedUsers" :key="user.id" size="small" class="user-tag">
                {{ user.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="pushStatus" label="推送状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.pushStatus === 'sent' ? 'success' : 'warning'">
                {{ row.pushStatus === 'sent' ? '已推送' : '未推送' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleClaimFor(row)">代认领</el-button>
              <el-button type="success" link size="small" @click="handlePush(row)">推送</el-button>
              <el-button type="warning" link size="small" @click="handleViewPaper(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" />
        </div>
      </div>

      <!-- 已认领论文 -->
      <div v-if="activeTab === 'claimed'">
        <el-table :data="claimedList" stripe border>
          <el-table-column prop="title" label="论文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="authors" label="作者" width="180" show-overflow-tooltip />
          <el-table-column prop="journal" label="发表期刊" width="150" />
          <el-table-column prop="publishDate" label="发表日期" width="100" />
          <el-table-column prop="claimUser" label="认领人" width="100" />
          <el-table-column prop="claimDate" label="认领时间" width="120" />
          <el-table-column prop="citationCount" label="引用次数" width="90">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleViewCitations(row)">{{ row.citationCount }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewPaper(row)">详情</el-button>
              <el-button type="danger" link size="small" @click="handleUnclaim(row)">取消认领</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 知网抓取 -->
      <div v-if="activeTab === 'crawl'">
        <el-alert type="info" :closable="false" show-icon class="mb-15">
          <template #title>
            知网机器人会定期自动抓取本单位作者发表的新论文，并自动匹配系统中的用户进行推送认领。
          </template>
        </el-alert>

        <el-row :gutter="20" class="crawl-stats">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-value">{{ crawlStats.lastCrawl }}</div>
                <div class="stat-label">上次抓取时间</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-value success">{{ crawlStats.todayCount }}</div>
                <div class="stat-label">今日抓取数量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-value primary">{{ crawlStats.weekCount }}</div>
                <div class="stat-label">本周抓取数量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div class="stat-value warning">{{ crawlStats.matchRate }}%</div>
                <div class="stat-label">作者匹配率</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="crawl-config">
          <template #header><span>抓取配置</span></template>
          <el-form :model="crawlConfig" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="抓取频率">
                  <el-select v-model="crawlConfig.frequency" style="width: 100%">
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="抓取时间">
                  <el-time-picker v-model="crawlConfig.time" format="HH:mm" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="单位关键词">
              <el-input v-model="crawlConfig.keywords" placeholder="用于匹配论文中的单位信息，多个关键词用逗号分隔" />
            </el-form-item>
            <el-form-item label="抓取数据库">
              <el-checkbox-group v-model="crawlConfig.databases">
                <el-checkbox value="cnki">中国知网</el-checkbox>
                <el-checkbox value="wanfang">万方数据</el-checkbox>
                <el-checkbox value="vip">维普网</el-checkbox>
                <el-checkbox value="scopus">Scopus</el-checkbox>
                <el-checkbox value="wos">Web of Science</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveCrawlConfig">保存配置</el-button>
              <el-button type="success" @click="handleManualCrawl">立即抓取</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="crawl-history">
          <template #header><span>抓取历史</span></template>
          <el-table :data="crawlHistory" stripe size="small">
            <el-table-column prop="time" label="抓取时间" width="180" />
            <el-table-column prop="database" label="数据库" width="120" />
            <el-table-column prop="count" label="抓取数量" width="100" />
            <el-table-column prop="matched" label="匹配数量" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="备注" />
          </el-table>
        </el-card>
      </div>

      <!-- 引文识别 -->
      <div v-if="activeTab === 'citation'">
        <el-alert type="success" :closable="false" show-icon class="mb-15">
          <template #title>
            引文识别功能可自动识别论文中的引用关系，追踪被引用情况，并关联到系统中的相关论文和成果。
          </template>
        </el-alert>

        <div class="citation-actions">
          <el-button type="primary" @click="handleAnalyzeCitations">批量识别引文</el-button>
          <el-button type="success" @click="handleUpdateCitations">更新引用统计</el-button>
        </div>

        <el-table :data="citationList" stripe border>
          <el-table-column prop="paperTitle" label="被引论文" min-width="250" show-overflow-tooltip />
          <el-table-column prop="paperAuthors" label="作者" width="150" />
          <el-table-column prop="citingTitle" label="引用论文" min-width="250" show-overflow-tooltip />
          <el-table-column prop="citingAuthors" label="引用作者" width="150" />
          <el-table-column prop="citingJournal" label="引用期刊" width="120" />
          <el-table-column prop="citingDate" label="引用日期" width="100" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewCitingPaper(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 推送设置 -->
      <div v-if="activeTab === 'push'">
        <el-form :model="pushConfig" label-width="150px" class="push-config-form">
          <el-form-item label="自动推送">
            <el-switch v-model="pushConfig.autoEnabled" />
            <span class="form-tip">开启后，新抓取的论文将自动推送给匹配的作者</span>
          </el-form-item>
          <el-form-item label="推送方式">
            <el-checkbox-group v-model="pushConfig.methods">
              <el-checkbox value="email">邮件</el-checkbox>
              <el-checkbox value="sms">短信</el-checkbox>
              <el-checkbox value="system">系统消息</el-checkbox>
              <el-checkbox value="wechat">微信</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="认领有效期">
            <el-input-number v-model="pushConfig.validDays" :min="1" :max="90" /> 天
            <span class="form-tip">超过有效期未认领的论文将自动关闭</span>
          </el-form-item>
          <el-form-item label="提醒频率">
            <el-select v-model="pushConfig.remindFreq" style="width: 200px">
              <el-option label="不提醒" value="none" />
              <el-option label="每天提醒" value="daily" />
              <el-option label="每周提醒" value="weekly" />
            </el-select>
          </el-form-item>
          <el-form-item label="推送模板">
            <el-input v-model="pushConfig.template" type="textarea" rows="4" placeholder="支持变量：{paperTitle}、{authors}、{journal}、{link}" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSavePushConfig">保存配置</el-button>
            <el-button @click="handleTestPush">发送测试</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 论文详情对话框 -->
    <el-dialog v-model="detailVisible" title="论文详情" width="800px">
      <el-descriptions :column="2" border v-if="currentPaper">
        <el-descriptions-item label="论文标题" :span="2">{{ currentPaper.title }}</el-descriptions-item>
        <el-descriptions-item label="作者" :span="2">{{ currentPaper.authors }}</el-descriptions-item>
        <el-descriptions-item label="发表期刊">{{ currentPaper.journal }}</el-descriptions-item>
        <el-descriptions-item label="发表日期">{{ currentPaper.publishDate }}</el-descriptions-item>
        <el-descriptions-item label="DOI">{{ currentPaper.doi || '-' }}</el-descriptions-item>
        <el-descriptions-item label="引用次数">{{ currentPaper.citationCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="来源">
          <el-tag>{{ currentPaper.source === 'cnki' ? '知网抓取' : '手动录入' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentPaper.claimed ? 'success' : 'warning'">
            {{ currentPaper.claimed ? '已认领' : '待认领' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="摘要" :span="2">{{ currentPaper.abstract }}</el-descriptions-item>
        <el-descriptions-item label="关键词" :span="2">{{ currentPaper.keywords }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 代认领对话框 -->
    <el-dialog v-model="claimDialogVisible" title="代认领论文" width="500px">
      <el-form :model="claimForm" label-width="100px" v-if="currentPaper">
        <el-form-item label="论文标题">
          <span>{{ currentPaper.title }}</span>
        </el-form-item>
        <el-form-item label="认领人" required>
          <el-select v-model="claimForm.userId" placeholder="请选择认领人" style="width: 100%">
            <el-option v-for="user in currentPaper?.matchedUsers || []" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者排名">
          <el-input-number v-model="claimForm.authorRank" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="是否通讯作者">
          <el-switch v-model="claimForm.isCorresponding" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="claimForm.remark" type="textarea" rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="claimDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleClaimSubmit">确定认领</el-button>
      </template>
    </el-dialog>

    <!-- 引用详情对话框 -->
    <el-dialog v-model="citationDialogVisible" title="引用详情" width="800px">
      <el-table :data="paperCitations" stripe size="small">
        <el-table-column prop="title" label="引用论文" min-width="250" show-overflow-tooltip />
        <el-table-column prop="authors" label="作者" width="150" />
        <el-table-column prop="journal" label="期刊" width="120" />
        <el-table-column prop="date" label="日期" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('pending')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const detailVisible = ref(false)
const claimDialogVisible = ref(false)
const citationDialogVisible = ref(false)
const currentPaper = ref<any>(null)

const paperStats = ref({
  total: 856,
  pending: 45,
  claimed: 811,
  weekCrawl: 23,
  citations: 3420
})

const searchForm = reactive({
  title: '',
  author: '',
  source: ''
})

const claimForm = reactive({
  userId: '',
  authorRank: 1,
  isCorresponding: false,
  remark: ''
})

const crawlStats = ref({
  lastCrawl: '2024-01-15 08:30:00',
  todayCount: 8,
  weekCount: 23,
  matchRate: 85
})

const crawlConfig = reactive({
  frequency: 'daily',
  time: new Date(),
  keywords: '农业科学研究院,农科院,农业大学',
  databases: ['cnki', 'wanfang']
})

const pushConfig = reactive({
  autoEnabled: true,
  methods: ['email', 'system'],
  validDays: 30,
  remindFreq: 'weekly',
  template: '尊敬的{authors}老师，系统检测到您发表的论文《{paperTitle}》（{journal}），请登录系统进行认领：{link}'
})

const pendingList = ref([
  { id: 1, title: '基于深度学习的农作物病虫害识别研究', authors: '张三、李四、王五', journal: '农业工程学报', publishDate: '2024-01-10', source: 'cnki', matchedUsers: [{ id: 1, name: '张三' }, { id: 2, name: '李四' }], pushStatus: 'sent' },
  { id: 2, title: '智能灌溉系统在设施农业中的应用', authors: '李教授、赵研究员', journal: '中国农业科学', publishDate: '2024-01-08', source: 'cnki', matchedUsers: [{ id: 3, name: '李教授' }], pushStatus: 'pending' },
  { id: 3, title: '玉米耐旱品种遗传改良研究进展', authors: '王博士、陈教授', journal: '作物学报', publishDate: '2024-01-05', source: 'manual', matchedUsers: [{ id: 4, name: '王博士' }], pushStatus: 'sent' }
])

const claimedList = ref([
  { id: 101, title: '农业物联网关键技术研究综述', authors: '张教授团队', journal: '农业机械学报', publishDate: '2023-12-20', claimUser: '张教授', claimDate: '2023-12-25', citationCount: 15 },
  { id: 102, title: '基于机器视觉的农产品分级系统', authors: '李研究员', journal: '农业工程学报', publishDate: '2023-11-15', claimUser: '李研究员', claimDate: '2023-11-20', citationCount: 8 }
])

const crawlHistory = ref([
  { time: '2024-01-15 08:30:00', database: '中国知网', count: 12, matched: 10, status: 'success', message: '正常完成' },
  { time: '2024-01-14 08:30:00', database: '中国知网', count: 8, matched: 7, status: 'success', message: '正常完成' },
  { time: '2024-01-13 08:30:00', database: '万方数据', count: 5, matched: 4, status: 'success', message: '正常完成' },
  { time: '2024-01-12 08:30:00', database: '中国知网', count: 0, matched: 0, status: 'error', message: '网络超时' }
])

const citationList = ref([
  { paperTitle: '农业物联网关键技术研究综述', paperAuthors: '张教授团队', citingTitle: '智慧农业发展趋势分析', citingAuthors: '其他学者', citingJournal: '计算机应用', citingDate: '2024-01-10' },
  { paperTitle: '基于机器视觉的农产品分级系统', paperAuthors: '李研究员', citingTitle: '农产品质量检测技术研究', citingAuthors: '王教授团队', citingJournal: '农业工程学报', citingDate: '2024-01-05' }
])

const paperCitations = ref([
  { title: '智慧农业发展趋势分析', authors: '其他学者', journal: '计算机应用', date: '2024-01-10' },
  { title: '物联网技术在现代农业中的应用', authors: '某研究团队', journal: '农业科技通讯', date: '2024-01-08' }
])

const handleTabChange = (tab: string) => console.log('切换标签:', tab)
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
  Object.assign(searchForm, { title: '', author: '', source: '' })
  ElMessage.info('已重置')
}

const handleViewPaper = (row: any) => {
  currentPaper.value = row
  detailVisible.value = true
}

const handleClaimFor = (row: any) => {
  currentPaper.value = row
  Object.assign(claimForm, { userId: '', authorRank: 1, isCorresponding: false, remark: '' })
  claimDialogVisible.value = true
}

const handlePush = (row: any) => {
  ElMessageBox.confirm(`确定推送论文"${row.title}"给匹配的作者吗？`, '提示', { type: 'info' })
    .then(() => ElMessage.success('推送成功'))
    .catch(() => {})
}

const handleViewCitations = (row: any) => {
  currentPaper.value = row
  citationDialogVisible.value = true
}

const handleUnclaim = (row: any) => {
  ElMessageBox.confirm('确定取消认领该论文吗？', '提示', { type: 'warning' })
    .then(() => ElMessage.success('已取消认领'))
    .catch(() => {})
}

const handleClaimSubmit = () => {
  ElMessage.success('认领成功')
  claimDialogVisible.value = false
}

const handleSaveCrawlConfig = () => ElMessage.success('抓取配置已保存')
const handleManualCrawl = () => ElMessage.success('抓取任务已启动')

const handleAnalyzeCitations = () => ElMessage.success('引文识别任务已启动')
const handleUpdateCitations = () => ElMessage.success('引用统计更新完成')
const handleViewCitingPaper = (row: any) => ElMessage.info('查看引用论文详情')

const handleSavePushConfig = () => ElMessage.success('推送配置已保存')
const handleTestPush = () => ElMessage.success('测试推送已发送')
</script>

<style scoped>
.paper-claim-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card .pending :deep(.el-statistic__number) { color: #e6a23c; }
.stats-card .claimed :deep(.el-statistic__number) { color: #67c23a; }
.stats-card .crawl :deep(.el-statistic__number) { color: #409eff; }
.stats-card .citations :deep(.el-statistic__number) { color: #f56c6c; }

.search-bar {
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.user-tag {
  margin-right: 5px;
}

.mb-15 {
  margin-bottom: 15px;
}

.crawl-stats {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-value.success { color: #67c23a; }
.stat-value.primary { color: #409eff; }
.stat-value.warning { color: #e6a23c; }

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}

.crawl-config, .crawl-history {
  margin-top: 20px;
}

.citation-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.push-config-form {
  max-width: 800px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}
</style>
