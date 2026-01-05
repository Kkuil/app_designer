<template>
  <div class="tools-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="container">
        <h1>用户工具集</h1>
        <p>APP下载、微信公众号及更多便捷工具</p>
      </div>
    </div>

    <div class="container">
      <!-- APP下载 -->
      <section class="tools-section">
        <h2 class="section-title">移动端APP下载</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :md="12">
            <el-card class="app-card">
              <div class="app-info">
                <div class="app-icon android">
                  <el-icon :size="48"><Cellphone /></el-icon>
                </div>
                <div class="app-detail">
                  <h3>Android 版本</h3>
                  <p>适用于安卓手机和平板设备</p>
                  <div class="app-meta">
                    <span>版本: V3.5.0</span>
                    <span>大小: 45.6MB</span>
                    <span>更新: 2024-12-15</span>
                  </div>
                  <div class="app-actions">
                    <el-button type="success" @click="downloadApp('android')">
                      <el-icon><Download /></el-icon> 下载APK
                    </el-button>
                    <el-button @click="showQrCode('android')">
                      <el-icon><Grid /></el-icon> 扫码下载
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card class="app-card">
              <div class="app-info">
                <div class="app-icon ios">
                  <el-icon :size="48"><Iphone /></el-icon>
                </div>
                <div class="app-detail">
                  <h3>iOS 版本</h3>
                  <p>适用于iPhone和iPad设备</p>
                  <div class="app-meta">
                    <span>版本: V3.5.0</span>
                    <span>大小: 52.3MB</span>
                    <span>更新: 2024-12-15</span>
                  </div>
                  <div class="app-actions">
                    <el-button type="primary" @click="downloadApp('ios')">
                      <el-icon><Download /></el-icon> App Store
                    </el-button>
                    <el-button @click="showQrCode('ios')">
                      <el-icon><Grid /></el-icon> 扫码下载
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- APP功能介绍 -->
        <el-card class="feature-intro-card">
          <template #header>
            <span class="card-title">移动端APP功能特色</span>
          </template>
          <el-row :gutter="20">
            <el-col :xs="12" :sm="8" :md="4" v-for="feature in appFeatures" :key="feature.id">
              <div class="feature-item">
                <div class="feature-icon" :style="{ backgroundColor: feature.color }">
                  <el-icon :size="24"><component :is="feature.icon" /></el-icon>
                </div>
                <span>{{ feature.name }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </section>

      <!-- 微信公众号 -->
      <section class="tools-section">
        <h2 class="section-title">微信公众号</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :md="8">
            <el-card class="wechat-card">
              <div class="qrcode-wrapper">
                <div class="qrcode-placeholder">
                  <el-icon :size="80" color="#07c160"><ChatDotRound /></el-icon>
                  <p>微信公众号二维码</p>
                </div>
              </div>
              <h3>农业科研知识管理</h3>
              <p>扫描二维码关注公众号</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="16">
            <el-card class="wechat-feature-card">
              <template #header>
                <span class="card-title">公众号功能</span>
              </template>
              <el-row :gutter="20">
                <el-col :xs="12" :md="8" v-for="item in wechatFeatures" :key="item.id">
                  <div class="wechat-feature-item" @click="handleWechatFeature(item)">
                    <el-icon :size="32" :color="item.color"><component :is="item.icon" /></el-icon>
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.desc }}</p>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </section>

      <!-- SDK开发包 -->
      <section class="tools-section">
        <h2 class="section-title">开发者工具</h2>
        <el-card class="sdk-card">
          <el-row :gutter="30" align="middle">
            <el-col :xs="24" :md="12">
              <div class="sdk-intro">
                <h3>SDK 开发包</h3>
                <p>提供完整的SDK开发包和开发文档，支持通过SDK新增应用，并无缝集成进入现有的移动端APP内。</p>
                <ul class="sdk-features">
                  <li><el-icon color="#67c23a"><Check /></el-icon> 完整的API接口文档</li>
                  <li><el-icon color="#67c23a"><Check /></el-icon> 丰富的示例代码</li>
                  <li><el-icon color="#67c23a"><Check /></el-icon> 支持多种开发语言</li>
                  <li><el-icon color="#67c23a"><Check /></el-icon> 快速接入与调试</li>
                  <li><el-icon color="#67c23a"><Check /></el-icon> 无限制应用扩展</li>
                </ul>
                <div class="sdk-actions">
                  <el-button type="primary" @click="downloadSDK">
                    <el-icon><Download /></el-icon> 下载SDK
                  </el-button>
                  <el-button @click="viewDocs">
                    <el-icon><Document /></el-icon> 查看文档
                  </el-button>
                  <el-button @click="viewDemo">
                    <el-icon><VideoPlay /></el-icon> 演示Demo
                  </el-button>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="sdk-versions">
                <h4>SDK版本列表</h4>
                <el-table :data="sdkVersions" stripe style="width: 100%">
                  <el-table-column prop="version" label="版本号" width="100" />
                  <el-table-column prop="platform" label="平台" width="100" />
                  <el-table-column prop="date" label="发布日期" width="120" />
                  <el-table-column prop="size" label="大小" width="80" />
                  <el-table-column label="操作" fixed="right" width="100">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="downloadVersion(row)">下载</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </section>

      <!-- 更多工具 -->
      <section class="tools-section">
        <h2 class="section-title">更多工具</h2>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8" :md="6" v-for="tool in moreTools" :key="tool.id">
            <el-card class="tool-card card-hover" shadow="hover" @click="useTool(tool)">
              <div class="tool-icon" :style="{ background: tool.gradient }">
                <el-icon :size="32"><component :is="tool.icon" /></el-icon>
              </div>
              <h4>{{ tool.name }}</h4>
              <p>{{ tool.desc }}</p>
            </el-card>
          </el-col>
        </el-row>
      </section>
    </div>

    <!-- 二维码弹窗 -->
    <el-dialog v-model="qrDialogVisible" :title="qrTitle" width="350px" center>
      <div class="qr-dialog-content">
        <div class="qr-placeholder">
          <el-icon :size="120" color="#409eff"><Grid /></el-icon>
        </div>
        <p>扫描二维码下载{{ qrTitle }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const qrDialogVisible = ref(false)
const qrTitle = ref('')

// APP功能特色
const appFeatures = ref([
  { id: 1, icon: 'Calendar', name: '设备预约', color: '#409eff' },
  { id: 2, icon: 'Document', name: '项目管理', color: '#67c23a' },
  { id: 3, icon: 'Box', name: '试剂领用', color: '#e6a23c' },
  { id: 4, icon: 'Bell', name: '消息通知', color: '#f56c6c' },
  { id: 5, icon: 'DataLine', name: '数据统计', color: '#909399' },
  { id: 6, icon: 'Scan', name: '扫码入库', color: '#00d1b2' }
])

// 微信公众号功能
const wechatFeatures = ref([
  { id: 1, icon: 'Bell', title: '公告推送', desc: '第一时间获取系统公告', color: '#409eff' },
  { id: 2, icon: 'Calendar', title: '预约提醒', desc: '设备预约到期提醒', color: '#67c23a' },
  { id: 3, icon: 'Document', title: '进度查询', desc: '项目审批进度查询', color: '#e6a23c' },
  { id: 4, icon: 'Service', title: '在线客服', desc: '随时咨询问题', color: '#f56c6c' },
  { id: 5, icon: 'DataAnalysis', title: '报表查看', desc: '查看统计报表', color: '#909399' },
  { id: 6, icon: 'Link', title: '账号绑定', desc: '绑定系统账号', color: '#00d1b2' }
])

// SDK版本列表
const sdkVersions = ref([
  { version: 'V2.3.0', platform: 'Android', date: '2024-12-15', size: '12.5MB' },
  { version: 'V2.3.0', platform: 'iOS', date: '2024-12-15', size: '14.2MB' },
  { version: 'V2.2.1', platform: 'Android', date: '2024-11-20', size: '12.1MB' },
  { version: 'V2.2.1', platform: 'iOS', date: '2024-11-20', size: '13.8MB' }
])

// 更多工具
const moreTools = ref([
  { id: 1, icon: 'Coin', name: '费用计算器', desc: '设备使用费用预估', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 2, icon: 'Tickets', name: '预约日历', desc: '查看预约排班', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 3, icon: 'Search', name: '化学品查询', desc: '危化品信息查询', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 4, icon: 'Calculator', name: '单位换算', desc: '常用单位换算工具', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' }
])

const downloadApp = (platform: string) => {
  ElMessage.success(`正在下载 ${platform === 'android' ? 'Android' : 'iOS'} 版本APP`)
}

const showQrCode = (platform: string) => {
  qrTitle.value = platform === 'android' ? 'Android版' : 'iOS版'
  qrDialogVisible.value = true
}

const handleWechatFeature = (item: any) => {
  ElMessage.info(`${item.title}: ${item.desc}`)
}

const downloadSDK = () => {
  ElMessage.success('正在下载SDK开发包...')
}

const viewDocs = () => {
  ElMessage.info('正在打开开发文档...')
}

const viewDemo = () => {
  ElMessage.info('正在加载演示Demo...')
}

const downloadVersion = (row: any) => {
  ElMessage.success(`正在下载 ${row.platform} SDK ${row.version}`)
}

const useTool = (tool: any) => {
  ElMessage.info(`正在打开: ${tool.name}`)
}
</script>

<style scoped>
.tools-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40px;
}

.tools-section {
  margin-bottom: 40px;
}

.app-card {
  margin-bottom: 20px;
}

.app-info {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.app-icon {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.app-icon.android {
  background: linear-gradient(135deg, #3ddc84, #00a36c);
}

.app-icon.ios {
  background: linear-gradient(135deg, #333, #666);
}

.app-detail h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
}

.app-detail > p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 12px;
}

.app-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.app-meta span {
  font-size: 13px;
  color: #606266;
}

.app-actions {
  display: flex;
  gap: 10px;
}

.feature-intro-card {
  margin-top: 20px;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  text-align: center;
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 10px;
}

.feature-item span {
  font-size: 14px;
  color: #606266;
}

.wechat-card {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.qrcode-wrapper {
  margin-bottom: 20px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: #f5f7fa;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qrcode-placeholder p {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.wechat-card h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 8px;
}

.wechat-card > p {
  color: #909399;
  font-size: 14px;
}

.wechat-feature-card {
  height: 100%;
  margin-bottom: 20px;
}

.wechat-feature-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 15px;
}

.wechat-feature-item:hover {
  background: #f5f7fa;
  transform: translateY(-3px);
}

.wechat-feature-item h4 {
  font-size: 15px;
  color: #303133;
  margin: 12px 0 8px;
}

.wechat-feature-item p {
  font-size: 13px;
  color: #909399;
}

.sdk-card {
  margin-bottom: 20px;
}

.sdk-intro h3 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 15px;
}

.sdk-intro > p {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 20px;
}

.sdk-features {
  list-style: none;
  padding: 0;
  margin-bottom: 25px;
}

.sdk-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #606266;
}

.sdk-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sdk-versions h4 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
}

.tool-card {
  text-align: center;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.tool-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 15px;
}

.tool-card h4 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.tool-card p {
  font-size: 13px;
  color: #909399;
}

.qr-dialog-content {
  text-align: center;
  padding: 20px;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  background: #f5f7fa;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-dialog-content p {
  color: #606266;
}
</style>
