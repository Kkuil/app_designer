<template>
  <div class="information-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="container">
        <h1>信息展示</h1>
        <p>了解系统特色、功能介绍、使用指南及常见问题</p>
      </div>
    </div>

    <div class="container">
      <!-- 系统特色 -->
      <section class="info-section">
        <h2 class="section-title">系统特色</h2>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" v-for="feature in systemFeatures" :key="feature.id">
            <el-card class="feature-card card-hover" shadow="hover">
              <div class="feature-icon" :style="{ background: feature.gradient }">
                <el-icon :size="36"><component :is="feature.icon" /></el-icon>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
              <el-button type="primary" link @click="learnMore(feature)">
                了解更多 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </section>

      <!-- 功能介绍 -->
      <section class="info-section">
        <h2 class="section-title">功能介绍</h2>
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="实验室管理" name="lab">
            <div class="tab-content">
              <el-row :gutter="30" align="middle">
                <el-col :xs="24" :md="12">
                  <h3>实验室设备及预约管理</h3>
                  <ul class="feature-list">
                    <li><el-icon color="#67c23a"><Check /></el-icon> 设备台账管理，全生命周期追踪</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 在线预约系统，实时查看设备状态</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 计费规则配置，自动生成账单</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 维护保养提醒，延长设备寿命</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 使用统计分析，优化资源配置</li>
                  </ul>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-image src="https://via.placeholder.com/500x300/409eff/ffffff?text=实验室管理" fit="cover" class="feature-image" />
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          <el-tab-pane label="试剂耗材" name="reagent">
            <div class="tab-content">
              <el-row :gutter="30" align="middle">
                <el-col :xs="24" :md="12">
                  <h3>试剂耗材管理系统</h3>
                  <ul class="feature-list">
                    <li><el-icon color="#67c23a"><Check /></el-icon> 库存管理，实时掌握物料状态</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 入库出库，全流程可追溯</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 申购采购，简化审批流程</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 报损废弃，规范处理程序</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 统计分析，优化采购计划</li>
                  </ul>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-image src="https://via.placeholder.com/500x300/67c23a/ffffff?text=试剂耗材" fit="cover" class="feature-image" />
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          <el-tab-pane label="项目管理" name="project">
            <div class="tab-content">
              <el-row :gutter="30" align="middle">
                <el-col :xs="24" :md="12">
                  <h3>实验室项目管理系统</h3>
                  <ul class="feature-list">
                    <li><el-icon color="#67c23a"><Check /></el-icon> 项目申报，在线提交快速审批</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 进度跟踪，实时监控项目状态</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 资源管理，合理分配人财物</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 团队协作，高效沟通与协同</li>
                    <li><el-icon color="#67c23a"><Check /></el-icon> 成果管理，汇总展示科研产出</li>
                  </ul>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-image src="https://via.placeholder.com/500x300/e6a23c/ffffff?text=项目管理" fit="cover" class="feature-image" />
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </section>

      <!-- 使用指南 -->
      <section class="info-section">
        <h2 class="section-title">使用指南</h2>
        <el-collapse v-model="activeGuide">
          <el-collapse-item v-for="guide in userGuides" :key="guide.id" :name="guide.id">
            <template #title>
              <div class="guide-title">
                <el-icon><component :is="guide.icon" /></el-icon>
                <span>{{ guide.title }}</span>
              </div>
            </template>
            <div class="guide-content">
              <p>{{ guide.content }}</p>
              <el-steps :active="guide.steps.length" finish-status="success" class="guide-steps">
                <el-step v-for="(step, index) in guide.steps" :key="index" :title="step.title" :description="step.desc" />
              </el-steps>
              <el-button type="primary" @click="downloadGuide(guide)">
                <el-icon><Download /></el-icon> 下载详细指南
              </el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </section>

      <!-- 联系方式和常见问题 -->
      <section class="info-section">
        <el-row :gutter="24">
          <el-col :xs="24" :md="12">
            <el-card class="contact-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Phone /></el-icon>
                  <span>联系方式</span>
                </div>
              </template>
              <div class="contact-list">
                <div class="contact-item">
                  <el-icon color="#409eff"><Phone /></el-icon>
                  <div>
                    <label>服务热线</label>
                    <span>400-123-4567</span>
                  </div>
                </div>
                <div class="contact-item">
                  <el-icon color="#67c23a"><Message /></el-icon>
                  <div>
                    <label>电子邮箱</label>
                    <span>support@agri-research.com</span>
                  </div>
                </div>
                <div class="contact-item">
                  <el-icon color="#e6a23c"><Location /></el-icon>
                  <div>
                    <label>办公地址</label>
                    <span>北京市海淀区中关村科技园区</span>
                  </div>
                </div>
                <div class="contact-item">
                  <el-icon color="#f56c6c"><Clock /></el-icon>
                  <div>
                    <label>工作时间</label>
                    <span>周一至周五 9:00-18:00</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card class="faq-card">
              <template #header>
                <div class="card-header">
                  <el-icon><QuestionFilled /></el-icon>
                  <span>常见问题</span>
                </div>
              </template>
              <el-collapse accordion>
                <el-collapse-item v-for="faq in faqs" :key="faq.id" :title="faq.question">
                  <p>{{ faq.answer }}</p>
                </el-collapse-item>
              </el-collapse>
            </el-card>
          </el-col>
        </el-row>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('lab')
const activeGuide = ref([1])

// 系统特色
const systemFeatures = ref([
  {
    id: 1,
    icon: 'DataLine',
    title: '智能数据分析',
    description: '基于大数据技术，提供智能化数据分析与可视化展示，助力科研决策。',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    icon: 'Connection',
    title: '全流程管理',
    description: '涵盖设备、试剂、项目全生命周期管理，实现科研过程全流程数字化。',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    icon: 'Cellphone',
    title: '移动办公',
    description: '支持PC端和移动端协同办公，随时随地处理科研事务。',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 4,
    icon: 'Lock',
    title: '安全可靠',
    description: '多重安全防护机制，确保科研数据安全，支持权限精细化管理。',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 5,
    icon: 'SetUp',
    title: '灵活配置',
    description: '支持自定义工作流程，满足不同科研场景的个性化需求。',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 6,
    icon: 'Service',
    title: '专业服务',
    description: '7×24小时技术支持，专业团队快速响应，保障系统稳定运行。',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
])

// 使用指南
const userGuides = ref([
  {
    id: 1,
    icon: 'User',
    title: '新用户入门指南',
    content: '欢迎使用农业科研知识数据管理系统，以下是新用户快速上手的步骤：',
    steps: [
      { title: '注册账号', desc: '填写基本信息完成注册' },
      { title: '完善资料', desc: '补充个人信息和研究方向' },
      { title: '熟悉界面', desc: '浏览各功能模块了解系统' },
      { title: '开始使用', desc: '根据需求使用相关功能' }
    ]
  },
  {
    id: 2,
    icon: 'Calendar',
    title: '设备预约指南',
    content: '如何高效预约实验室设备：',
    steps: [
      { title: '查看设备', desc: '浏览可用设备列表' },
      { title: '选择时间', desc: '选择合适的预约时段' },
      { title: '提交申请', desc: '填写预约信息并提交' },
      { title: '等待审批', desc: '管理员审批通过后生效' }
    ]
  },
  {
    id: 3,
    icon: 'Document',
    title: '项目申报指南',
    content: '科研项目在线申报流程说明：',
    steps: [
      { title: '准备材料', desc: '整理项目申报所需材料' },
      { title: '在线填报', desc: '登录系统填写申报表单' },
      { title: '上传附件', desc: '上传项目计划书等材料' },
      { title: '提交审核', desc: '提交后等待评审结果' }
    ]
  }
])

// 常见问题
const faqs = ref([
  { id: 1, question: '如何重置密码？', answer: '点击登录页面的"忘记密码"，通过手机号或邮箱验证后即可重置密码。' },
  { id: 2, question: '设备预约后如何取消？', answer: '在"我的预约"中找到相应预约记录，点击"取消预约"即可。请注意取消时间要求，避免产生违约费用。' },
  { id: 3, question: '如何申请新增试剂？', answer: '进入试剂耗材模块，点击"申购"按钮，填写所需试剂信息后提交审批。' },
  { id: 4, question: '项目审批需要多长时间？', answer: '一般项目审批周期为3-5个工作日，具体时间取决于审批流程和审批人员安排。' },
  { id: 5, question: '如何导出数据报表？', answer: '在相应的数据列表页面，点击"导出"按钮，选择导出格式（Excel/PDF）即可下载报表。' }
])

const learnMore = (feature: any) => {
  ElMessage.info(`了解更多: ${feature.title}`)
}

const downloadGuide = (guide: any) => {
  ElMessage.success(`正在下载: ${guide.title}`)
}
</script>

<style scoped>
.information-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40px;
}

.info-section {
  margin-bottom: 40px;
}

.feature-card {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
}

.feature-card h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  margin-bottom: 15px;
}

.tab-content {
  padding: 20px;
}

.tab-content h3 {
  font-size: 22px;
  color: #303133;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  font-size: 15px;
  color: #606266;
}

.feature-image {
  width: 100%;
  border-radius: 8px;
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
}

.guide-content {
  padding: 20px;
}

.guide-content p {
  margin-bottom: 20px;
  color: #606266;
}

.guide-steps {
  margin: 30px 0;
}

.contact-card,
.faq-card {
  height: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.contact-item .el-icon {
  font-size: 24px;
}

.contact-item label {
  display: block;
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.contact-item span {
  font-size: 15px;
  color: #303133;
}

.faq-card p {
  color: #606266;
  line-height: 1.8;
}
</style>
