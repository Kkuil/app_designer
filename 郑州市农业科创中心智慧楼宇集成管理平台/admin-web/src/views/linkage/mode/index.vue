<template>
  <div class="linkage-mode-container">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card total"><div class="icon"><el-icon :size="24"><Menu /></el-icon></div><div class="content"><div class="value">{{ stats.total }}</div><div class="label">场景模式</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card active"><div class="icon"><el-icon :size="24"><Sunrise /></el-icon></div><div class="content"><div class="value">{{ stats.active }}</div><div class="label">当前激活</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card triggered"><div class="icon"><el-icon :size="24"><Promotion /></el-icon></div><div class="content"><div class="value">{{ stats.triggered }}</div><div class="label">今日切换</div></div></div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card device"><div class="icon"><el-icon :size="24"><Connection /></el-icon></div><div class="content"><div class="value">{{ stats.device }}</div><div class="label">关联设备</div></div></div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="main-content">
      <el-col :span="6">
        <div class="panel">
          <div class="panel-header">
            <span>模式分类</span>
            <el-button type="primary" link><el-icon><Plus /></el-icon></el-button>
          </div>
          <div class="category-list">
            <div v-for="cat in categoryList" :key="cat.id" class="category-item" :class="{ active: selectedCategory?.id === cat.id }" @click="selectedCategory = cat">
              <el-icon :size="20" :style="{ color: cat.color }"><component :is="cat.icon" /></el-icon>
              <span>{{ cat.name }}</span>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>切换趋势</span></div>
          <div ref="chartRef" class="chart"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">
            <span>场景模式列表</span>
            <el-button type="primary" size="small" @click="handleAddMode"><el-icon><Plus /></el-icon>新建模式</el-button>
          </div>
          <div class="mode-grid">
            <div v-for="mode in modeList" :key="mode.id" class="mode-card" :class="{ active: mode.isActive }">
              <div class="card-icon" :style="{ background: mode.color }">
                <el-icon :size="28" color="#fff"><component :is="mode.icon" /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <div class="name">{{ mode.name }}</div>
                  <el-tag v-if="mode.isActive" type="success" size="small">运行中</el-tag>
                </div>
                <div class="card-desc">{{ mode.desc }}</div>
                <div class="card-meta">
                  <span>{{ mode.deviceCount }} 设备</span>
                  <span>{{ mode.ruleCount }} 规则</span>
                </div>
                <div class="card-footer">
                  <el-button :type="mode.isActive ? 'info' : 'primary'" size="small" @click="handleActivate(mode)">
                    {{ mode.isActive ? '停用' : '激活' }}
                  </el-button>
                  <el-button type="default" size="small" @click="handleEdit(mode)">编辑</el-button>
                  <el-button type="danger" link size="small" @click="handleDelete(mode)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="panel">
          <div class="panel-header"><span>模式关联设备</span></div>
          <div class="device-list">
            <div v-for="dev in deviceList" :key="dev.id" class="device-item">
              <el-icon :size="16" :color="dev.online ? '#67C23A' : '#909399'"><Monitor /></el-icon>
              <span class="name">{{ dev.name }}</span>
              <el-tag :type="dev.online ? 'success' : 'info'" size="small">{{ dev.online ? '在线' : '离线' }}</el-tag>
            </div>
          </div>
        </div>

        <div class="panel mt-12">
          <div class="panel-header"><span>切换日志</span></div>
          <el-timeline class="timeline">
            <el-timeline-item v-for="log in logList" :key="log.id" :type="log.type" :timestamp="log.time">
              <div class="log-title">{{ log.mode }}</div>
              <div class="log-meta">{{ log.operator }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑模式' : '新建模式'" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="模式名称"><el-input v-model="formData.name" placeholder="请输入模式名称" /></el-form-item>
        <el-form-item label="模式图标"><el-select v-model="formData.icon" placeholder="选择图标" style="width:100%"><el-option label="☀️ 日间模式" value="Sunny" /><el-option label="🌙 夜间模式" value="Moon" /><el-option label="🏠 节假日" value="House" /></el-select></el-form-item>
        <el-form-item label="描述"><el-input v-model="formData.desc" type="textarea" :rows="2" placeholder="模式描述" /></el-form-item>
        <el-form-item label="关联设备"><el-select v-model="formData.devices" multiple placeholder="选择设备" style="width:100%"><el-option label="照明-A5F" value="1" /><el-option label="空调主机" value="2" /><el-option label="窗帘控制器" value="3" /></el-select></el-form-item>
        <el-form-item label="触发条件"><el-select v-model="formData.trigger" placeholder="选择触发条件" style="width:100%"><el-option label="手动触发" value="manual" /><el-option label="定时触发" value="timer" /><el-option label="传感器触发" value="sensor" /></el-select></el-form-item>
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
import { Menu, Sunrise, Promotion, Connection, Plus, Sunny, Moon, House, Monitor } from '@element-plus/icons-vue'

const stats = reactive({ total: 12, active: 2, triggered: 24, device: 86 })

const categoryList = ref([
  { id: 1, name: '日常模式', icon: Sunny, color: '#E6A23C' },
  { id: 2, name: '节能模式', icon: Moon, color: '#409EFF' },
  { id: 3, name: '安全模式', icon: House, color: '#F56C6C' },
  { id: 4, name: '会议模式', icon: Monitor, color: '#67C23A' }
])
const selectedCategory = ref(categoryList.value[0])

const modeList = ref([
  { id: 1, name: '工作日日间模式', icon: Sunny, color: '#E6A23C', desc: '上班时段照明空调自动开启', deviceCount: 24, ruleCount: 6, isActive: true },
  { id: 2, name: '工作日夜间模式', icon: Moon, color: '#303133', desc: '下班后关闭非必要设备', deviceCount: 18, ruleCount: 4, isActive: false },
  { id: 3, name: '节假日模式', icon: House, color: '#67C23A', desc: '仅保留安保必要设备', deviceCount: 12, ruleCount: 3, isActive: false },
  { id: 4, name: '会议模式', icon: Monitor, color: '#409EFF', desc: '会议室灯光空调优化', deviceCount: 8, ruleCount: 5, isActive: true }
])

const deviceList = ref([
  { id: 1, name: '照明-A5F', online: true },
  { id: 2, name: '空调主机-01', online: true },
  { id: 3, name: '窗帘控制器-A', online: true },
  { id: 4, name: '投影仪-会议室', online: false }
])

const logList = ref([
  { id: 1, mode: '工作日日间模式', type: 'success', operator: '系统自动', time: '08:00' },
  { id: 2, mode: '会议模式', type: 'primary', operator: '管理员', time: '09:30' },
  { id: 3, mode: '工作日夜间模式', type: 'info', operator: '系统自动', time: '18:30' }
])

const dialogVisible = ref(false)
const formData = reactive({ id: 0, name: '', icon: '', desc: '', devices: [], trigger: '' })

const chartRef = ref()

const handleAddMode = () => { Object.assign(formData, { id: 0, name: '', icon: '', desc: '', devices: [], trigger: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { Object.assign(formData, row); dialogVisible.value = true }
const handleActivate = (row: any) => { row.isActive = !row.isActive; ElMessage.success(`${row.name} 已${row.isActive ? '激活' : '停用'}`) }
const handleDelete = (row: any) => { ElMessage.warning(`删除模式: ${row.name}`) }
const handleSave = () => { dialogVisible.value = false; ElMessage.success('保存成功') }

const initCharts = () => {
  if (chartRef.value) {
    echarts.init(chartRef.value).setOption({
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [{ type: 'bar', data: [4, 5, 3, 6, 4, 2, 1], barWidth: 16, itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] } }]
    })
  }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.linkage-mode-container { display: flex; flex-direction: column; gap: 12px; }
.stat-row { .stat-card { background: #fff; border-radius: 8px; padding: 14px; display: flex; align-items: center; gap: 12px; .icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; } .content { .value { font-size: 20px; font-weight: 600; } .label { color: #909399; font-size: 12px; } }
  &.total .icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
  &.active .icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
  &.triggered .icon { background: linear-gradient(135deg, #E6A23C, #f3c078); }
  &.device .icon { background: linear-gradient(135deg, #909399, #c0c4cc); }
  }}

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 12px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; } .mt-12 { margin-top: 12px; } }

.category-list { padding: 8px; .category-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } } }

.chart { height: 180px; padding: 12px; }

.mode-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 12px; max-height: 500px; overflow: auto; }
.mode-card { background: #f5f7fa; border-radius: 10px; padding: 16px; display: flex; gap: 14px; &.active { border: 2px solid #67C23A; background: #f0f9eb; } .card-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; } .card-content { flex: 1; .card-header { display: flex; justify-content: space-between; align-items: center; .name { font-weight: 600; font-size: 15px; } } .card-desc { color: #606266; font-size: 13px; margin: 6px 0; } .card-meta { font-size: 12px; color: #909399; display: flex; gap: 12px; } .card-footer { margin-top: 12px; display: flex; gap: 8px; } } }

.device-list { padding: 12px; max-height: 240px; overflow: auto; .device-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; &:last-child { border-bottom: none; } .name { flex: 1; } } }

.timeline { padding: 12px 16px; max-height: 200px; overflow: auto; .log-title { font-weight: 500; } .log-meta { font-size: 12px; color: #909399; } }

.main-content { flex: 1; }
</style>
