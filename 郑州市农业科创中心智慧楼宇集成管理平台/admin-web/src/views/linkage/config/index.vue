<template>
  <div class="linkage-config-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Connection /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">联动规则</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card enabled"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.enabled }}</div><div class="label">已启用</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card triggered"><div class="icon"><el-icon :size="24"><Promotion /></el-icon></div><div class="content"><div class="value">{{ stats.triggered }}</div><div class="label">今日触发</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card failed"><div class="icon"><el-icon :size="24"><Warning /></el-icon></div><div class="content"><div class="value">{{ stats.failed }}</div><div class="label">执行失败</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header">
            <span>规则分类</span>
            <el-button type="primary" link @click="handleAddCategory"><el-icon><Plus /></el-icon></el-button>
          </div>
          <div class="category-list">
            <div v-for="cat in categoryList" :key="cat.id" class="category-item" :class="{ active: selectedCategory?.id === cat.id }" @click="handleSelectCategory(cat)">
              <div class="name">{{ cat.name }}</div>
              <div class="count">{{ cat.count }} 条</div>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>触发类型</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>联动规则列表</span>
            <el-button type="primary" size="small" @click="handleAddRule"><el-icon><Plus /></el-icon>新建规则</el-button>
          </div>
          <el-table :data="ruleList" height="420" stripe>
            <el-table-column prop="name" label="规则名称" width="180" />
            <el-table-column prop="trigger" label="触发条件" width="200" />
            <el-table-column prop="action" label="执行动作" width="200" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }"><el-switch v-model="row.enabled" @change="handleToggleRule(row)" /></template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditRule(row)">编辑</el-button>
                <el-button type="warning" link size="small" @click="handleTestRule(row)">测试</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>执行日志</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="log in logList" :key="log.id" :type="log.result === 'success' ? 'success' : 'danger'" :timestamp="log.time">
              <div class="log-title">{{ log.rule }}</div>
              <div class="log-meta">{{ log.desc }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>触发趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 新建/编辑规则弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="ruleForm.id ? '编辑规则' : '新建规则'" width="700px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称"><el-input v-model="ruleForm.name" placeholder="请输入规则名称" /></el-form-item>
        <el-form-item label="分类"><el-select v-model="ruleForm.category" placeholder="选择分类" style="width:100%"><el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" /></el-select></el-form-item>
        <el-divider content-position="left">触发条件</el-divider>
        <el-form-item label="触发设备"><el-select v-model="ruleForm.triggerDevice" placeholder="选择设备" style="width:100%"><el-option label="烟感-A101" value="1" /><el-option label="门禁-B201" value="2" /></el-select></el-form-item>
        <el-form-item label="触发条件"><el-select v-model="ruleForm.triggerCondition" placeholder="选择条件" style="width:100%"><el-option label="报警" value="alarm" /><el-option label="离线" value="offline" /><el-option label="阈值超限" value="threshold" /></el-select></el-form-item>
        <el-divider content-position="left">执行动作</el-divider>
        <el-form-item label="目标设备"><el-select v-model="ruleForm.actionDevice" placeholder="选择设备" style="width:100%"><el-option label="广播终端-01" value="1" /><el-option label="照明-A5F" value="2" /></el-select></el-form-item>
        <el-form-item label="执行动作"><el-select v-model="ruleForm.actionType" placeholder="选择动作" style="width:100%"><el-option label="开启" value="on" /><el-option label="关闭" value="off" /><el-option label="播放广播" value="broadcast" /></el-select></el-form-item>
        <el-form-item label="启用"><el-switch v-model="ruleForm.enabled" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Connection, CircleCheck, Promotion, Warning, Plus } from '@element-plus/icons-vue'

const stats = reactive({ total: 48, enabled: 36, triggered: 128, failed: 3 })

const categoryList = ref([
  { id: 1, name: '消防联动', count: 12 },
  { id: 2, name: '安防联动', count: 18 },
  { id: 3, name: '节能联动', count: 10 },
  { id: 4, name: '环境联动', count: 8 }
])
const selectedCategory = ref(categoryList.value[0])

const ruleList = ref([
  { id: 1, name: '火警联动广播', trigger: '烟感报警', action: '播放火警广播', enabled: true },
  { id: 2, name: '入侵联动监控', trigger: '红外探测报警', action: '弹出监控画面', enabled: true },
  { id: 3, name: '下班关灯', trigger: '18:30 定时', action: '关闭办公区照明', enabled: true },
  { id: 4, name: 'CO2 超标通风', trigger: 'CO2 > 1000ppm', action: '开启新风系统', enabled: false }
])

const logList = ref([
  { id: 1, rule: '火警联动广播', result: 'success', desc: '执行成功', time: '10:25' },
  { id: 2, rule: '下班关灯', result: 'success', desc: '执行成功', time: '18:30' },
  { id: 3, rule: '入侵联动监控', result: 'failed', desc: '设备离线', time: '09:15' }
])

const ruleDialogVisible = ref(false)
const ruleForm = reactive({ id: 0, name: '', category: '', triggerDevice: '', triggerCondition: '', actionDevice: '', actionType: '', enabled: true })

const chartRef = ref()
const pieRef = ref()

const handleSelectCategory = (cat: any) => { selectedCategory.value = cat }
const handleAddCategory = () => { ElMessage.info('新增分类') }
const handleAddRule = () => { Object.assign(ruleForm, { id: 0, name: '', category: '', triggerDevice: '', triggerCondition: '', actionDevice: '', actionType: '', enabled: true }); ruleDialogVisible.value = true }
const handleEditRule = (row: any) => { Object.assign(ruleForm, row); ruleDialogVisible.value = true }
const handleToggleRule = (row: any) => { ElMessage.success(`规则 ${row.name} 已${row.enabled ? '启用' : '停用'}`) }
const handleTestRule = (row: any) => { ElMessage.success(`测试规则: ${row.name}`) }
const handleDeleteRule = (row: any) => { ElMessage.warning(`删除规则: ${row.name}`) }
const handleSaveRule = () => { ruleDialogVisible.value = false; ElMessage.success('保存成功') }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ type: 'bar', data: [18, 22, 16, 24, 20, 12, 8], barWidth: 16, itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] } }]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 30, name: '设备告警', itemStyle: { color: '#F56C6C' } },
        { value: 25, name: '定时触发', itemStyle: { color: '#409EFF' } },
        { value: 20, name: '阈值触发', itemStyle: { color: '#E6A23C' } },
        { value: 15, name: '手动触发', itemStyle: { color: '#67C23A' } }
      ], label: { fontSize: 10 } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.linkage-config-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.enabled .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.triggered .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.failed .icon { background: linear-gradient(135deg, #F56C6C, #f89898); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.category-list { padding: 8px; .category-item { display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .name { font-weight: 500; } .count { color: #909399; font-size: 12px; } } }

.pie-chart { height: 200px; padding: 12px; }
.chart { height: 160px; padding: 8px 12px 12px; }

.timeline { padding: 12px 16px; max-height: 280px; overflow: auto; .log-title { font-weight: 500; } .log-meta { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }

.el-table { padding: 0 8px 12px; }
</style>
