<template>
  <div class="linkage-action-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Operation /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">动作总数</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card enabled"><div class="icon"><el-icon :size="24"><CircleCheck /></el-icon></div><div class="content"><div class="value">{{ stats.enabled }}</div><div class="label">已启用</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card executed"><div class="icon"><el-icon :size="24"><Finished /></el-icon></div><div class="content"><div class="value">{{ stats.executed }}</div><div class="label">今日执行</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card device"><div class="icon"><el-icon :size="24"><Monitor /></el-icon></div><div class="content"><div class="value">{{ stats.device }}</div><div class="label">关联设备</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header">
            <span>动作分类</span>
            <el-button type="primary" link><el-icon><Plus /></el-icon></el-button>
          </div>
          <div class="category-list">
            <div v-for="cat in categoryList" :key="cat.id" class="category-item" :class="{ active: selectedCategory?.id === cat.id }" @click="selectedCategory = cat">
              <div class="info">
                <el-icon :size="18"><component :is="cat.icon" /></el-icon>
                <span>{{ cat.name }}</span>
              </div>
              <el-tag size="small" type="info">{{ cat.count }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>执行统计</span></div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>动作列表</span>
            <el-button type="primary" size="small" @click="handleAddAction"><el-icon><Plus /></el-icon>新建动作</el-button>
          </div>
          <div class="action-grid">
            <div v-for="action in actionList" :key="action.id" class="action-card">
              <div class="card-header">
                <div class="name">{{ action.name }}</div>
                <el-switch v-model="action.enabled" size="small" @change="handleToggle(action)" />
              </div>
              <div class="card-type"><el-tag size="small" :type="action.typeTag">{{ action.type }}</el-tag></div>
              <div class="card-desc">{{ action.desc }}</div>
              <div class="card-target">
                <span>目标设备:</span>
                <span class="device">{{ action.device }}</span>
              </div>
              <div class="card-footer">
                <el-button type="primary" link size="small" @click="handleEdit(action)">编辑</el-button>
                <el-button type="warning" link size="small" @click="handleTest(action)">测试</el-button>
                <el-button type="danger" link size="small" @click="handleDelete(action)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>执行记录</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="log in logList" :key="log.id" :type="log.result === 'success' ? 'success' : 'danger'" :timestamp="log.time">
              <div class="log-title">{{ log.action }}</div>
              <div class="log-device">{{ log.device }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>执行趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑动作' : '新建动作'" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="动作名称"><el-input v-model="formData.name" placeholder="请输入动作名称" /></el-form-item>
        <el-form-item label="动作类型"><el-select v-model="formData.type" placeholder="选择类型" style="width:100%"><el-option label="设备控制" value="control" /><el-option label="消息通知" value="notify" /><el-option label="场景调用" value="scene" /></el-select></el-form-item>
        <el-form-item label="目标设备"><el-select v-model="formData.device" placeholder="选择设备" style="width:100%"><el-option label="广播终端-01" value="1" /><el-option label="照明-A5F" value="2" /><el-option label="空调主机" value="3" /></el-select></el-form-item>
        <el-form-item label="执行参数"><el-input v-model="formData.params" type="textarea" :rows="3" placeholder="输入执行参数 JSON" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="formData.enabled" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Operation, CircleCheck, Finished, Monitor, Plus, Setting, Bell, VideoCamera, Cpu } from '@element-plus/icons-vue'

const stats = reactive({ total: 56, enabled: 42, executed: 168, device: 124 })

const categoryList = ref([
  { id: 1, name: '设备控制', icon: Setting, count: 28 },
  { id: 2, name: '消息通知', icon: Bell, count: 12 },
  { id: 3, name: '视频联动', icon: VideoCamera, count: 8 },
  { id: 4, name: '系统调用', icon: Cpu, count: 8 }
])
const selectedCategory = ref(categoryList.value[0])

const actionList = ref([
  { id: 1, name: '开启新风系统', type: '设备控制', typeTag: 'primary', desc: '当CO2超标时开启', device: '新风机组-01', enabled: true },
  { id: 2, name: '播放火警广播', type: '设备控制', typeTag: 'primary', desc: '当火警报警时执行', device: '广播终端-01', enabled: true },
  { id: 3, name: '发送告警通知', type: '消息通知', typeTag: 'warning', desc: '发送微信/短信通知', device: '消息网关', enabled: true },
  { id: 4, name: '调取监控画面', type: '视频联动', typeTag: 'success', desc: '弹出对应摄像头', device: '摄像头-A1', enabled: false }
])

const logList = ref([
  { id: 1, action: '开启新风系统', device: '新风机组-01', result: 'success', time: '10:30' },
  { id: 2, action: '播放火警广播', device: '广播终端-01', result: 'success', time: '09:15' },
  { id: 3, action: '发送告警通知', device: '消息网关', result: 'failed', time: '08:45' }
])

const dialogVisible = ref(false)
const formData = reactive({ id: 0, name: '', type: '', device: '', params: '', enabled: true })

const chartRef = ref()
const pieRef = ref()

const handleAddAction = () => { Object.assign(formData, { id: 0, name: '', type: '', device: '', params: '', enabled: true }); dialogVisible.value = true }
const handleEdit = (row: any) => { Object.assign(formData, row); dialogVisible.value = true }
const handleToggle = (row: any) => { ElMessage.success(`${row.name} 已${row.enabled ? '启用' : '停用'}`) }
const handleTest = (row: any) => { ElMessage.success(`测试动作: ${row.name}`) }
const handleDelete = (row: any) => { ElMessage.warning(`删除动作: ${row.name}`) }
const handleSave = () => { dialogVisible.value = false; ElMessage.success('保存成功') }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ type: 'line', data: [28, 32, 26, 38, 35, 22, 18], smooth: true, areaStyle: { color: 'rgba(64,158,255,0.15)' }, lineStyle: { color: '#409EFF' }, itemStyle: { color: '#409EFF' } }]
    })
  }
  if (pieRef.value) {
    echarts.init(pieRef.value).setOption({
      series: [{ type: 'pie', radius: ['40%', '70%'], data: [
        { value: 48, name: '设备控制', itemStyle: { color: '#409EFF' } },
        { value: 28, name: '消息通知', itemStyle: { color: '#E6A23C' } },
        { value: 18, name: '视频联动', itemStyle: { color: '#67C23A' } },
        { value: 12, name: '系统调用', itemStyle: { color: '#909399' } }
      ], label: { fontSize: 10 } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.linkage-action-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.enabled .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.executed .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.device .icon { background: linear-gradient(135deg, #909399, #c0c4cc); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.category-list { padding: 8px; .category-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .info { display: flex; align-items: center; gap: 8px; } } }

.pie-chart { height: 200px; padding: 12px; }
.chart { height: 160px; padding: 8px 12px 12px; }

.action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 12px; max-height: 480px; overflow: auto; }
.action-card { background: #f5f7fa; border-radius: 8px; padding: 14px; .card-header { display: flex; justify-content: space-between; align-items: center; .name { font-weight: 600; } } .card-type { margin: 8px 0; } .card-desc { color: #606266; font-size: 13px; margin-bottom: 8px; } .card-target { font-size: 12px; color: #909399; .device { color: #409EFF; margin-left: 4px; } } .card-footer { margin-top: 12px; padding-top: 10px; border-top: 1px solid #ebeef5; display: flex; gap: 8px; } }

.timeline { padding: 12px 16px; max-height: 280px; overflow: auto; .log-title { font-weight: 500; } .log-device { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }
</style>
