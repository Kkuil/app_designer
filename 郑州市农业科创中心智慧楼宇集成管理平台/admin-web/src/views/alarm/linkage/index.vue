<template>
    <div class="alarm-linkage-container">
        <el-row :gutter="16" class="stat-row">
            <el-col :xs="12" :sm="6">
                <div class="stat-card total">
                    <div class="icon"><el-icon :size="24">
                            <Connection />
                        </el-icon></div>
                    <div class="content">
                        <div class="value">{{ stats.total }}</div>
                        <div class="label">联动规则</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="12" :sm="6">
                <div class="stat-card enabled">
                    <div class="icon"><el-icon :size="24">
                            <CircleCheck />
                        </el-icon></div>
                    <div class="content">
                        <div class="value">{{ stats.enabled }}</div>
                        <div class="label">已启用</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="12" :sm="6">
                <div class="stat-card triggered">
                    <div class="icon"><el-icon :size="24">
                            <Bell />
                        </el-icon></div>
                    <div class="content">
                        <div class="value">{{ stats.triggered }}</div>
                        <div class="label">今日触发</div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="12" :sm="6">
                <div class="stat-card success">
                    <div class="icon"><el-icon :size="24">
                            <Finished />
                        </el-icon></div>
                    <div class="content">
                        <div class="value">{{ stats.success }}%</div>
                        <div class="label">执行成功率</div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="16" class="main-content">
            <el-col :span="6">
                <div class="panel">
                    <div class="panel-header"><span>告警类型</span></div>
                    <div class="alarm-type-list">
                        <div v-for="type in alarmTypes" :key="type.id" class="type-item"
                            :class="{ active: selectedType?.id === type.id }" @click="selectedType = type">
                            <el-icon :size="20" :style="{ color: type.color }">
                                <component :is="type.icon" />
                            </el-icon>
                            <span class="name">{{ type.name }}</span>
                            <el-tag size="small" type="info">{{ type.count }}</el-tag>
                        </div>
                    </div>
                </div>

                <div class="panel mt-12">
                    <div class="panel-header"><span>联动统计</span></div>
                    <div ref="pieRef" class="pie-chart"></div>
                </div>
            </el-col>

            <el-col :span="12">
                <div class="panel">
                    <div class="panel-header">
                        <span>告警联动规则</span>
                        <el-button type="primary" size="small" @click="handleAddRule"><el-icon>
                                <Plus />
                            </el-icon>新建规则</el-button>
                    </div>
                    <el-table :data="ruleList" height="420" stripe>
                        <el-table-column prop="name" label="规则名称" width="160" />
                        <el-table-column prop="alarmType" label="告警类型" width="100" />
                        <el-table-column prop="condition" label="触发条件" width="140" />
                        <el-table-column prop="action" label="联动动作" width="160" />
                        <el-table-column prop="status" label="状态" width="80">
                            <template #default="{ row }"><el-switch v-model="row.enabled"
                                    @change="handleToggle(row)" /></template>
                        </el-table-column>
                        <el-table-column label="操作" width="140" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
                                <el-button type="warning" link size="small" @click="handleTest(row)">测试</el-button>
                                <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-col>

            <el-col :span="6">
                <div class="panel">
                    <div class="panel-header"><span>联动执行记录</span></div>
                    <el-timeline class="timeline">
                        <el-timeline-item v-for="log in executionLogs" :key="log.id"
                            :type="log.result === 'success' ? 'success' : 'danger'" :timestamp="log.time">
                            <div class="log-title">{{ log.rule }}</div>
                            <div class="log-action">{{ log.action }}</div>
                            <div class="log-result"><el-tag :type="log.result === 'success' ? 'success' : 'danger'"
                                    size="small">{{
                                        log.result === 'success' ? '成功' : '失败' }}</el-tag></div>
                        </el-timeline-item>
                    </el-timeline>
                </div>

                <div class="panel mt-12">
                    <div class="panel-header"><span>触发趋势</span></div>
                    <div ref="chartRef" class="chart"></div>
                </div>
            </el-col>
        </el-row>

        <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑规则' : '新建规则'" width="700px">
            <el-form :model="formData" label-width="100px">
                <el-form-item label="规则名称"><el-input v-model="formData.name" placeholder="请输入规则名称" /></el-form-item>
                <el-form-item label="告警类型"><el-select v-model="formData.alarmType" placeholder="选择告警类型"
                        style="width:100%"><el-option label="火警告警" value="fire" /><el-option label="入侵告警"
                            value="intrusion" /><el-option label="设备告警" value="device" /><el-option label="环境告警"
                            value="environment" /></el-select></el-form-item>
                <el-form-item label="告警级别"><el-checkbox-group v-model="formData.levels"><el-checkbox
                            label="critical">紧急</el-checkbox><el-checkbox label="major">重要</el-checkbox><el-checkbox
                            label="minor">次要</el-checkbox><el-checkbox
                            label="info">提示</el-checkbox></el-checkbox-group></el-form-item>
                <el-divider content-position="left">联动动作</el-divider>
                <el-form-item label="通知方式"><el-checkbox-group v-model="formData.notify"><el-checkbox
                            label="sms">短信</el-checkbox><el-checkbox label="email">邮件</el-checkbox><el-checkbox
                            label="wechat">微信</el-checkbox><el-checkbox
                            label="voice">语音</el-checkbox></el-checkbox-group></el-form-item>
                <el-form-item label="设备控制"><el-select v-model="formData.deviceAction" placeholder="选择设备动作"
                        style="width:100%"><el-option label="无" value="" /><el-option label="开启广播"
                            value="broadcast" /><el-option label="弹出监控" value="camera" /><el-option label="关闭电源"
                            value="power_off" /></el-select></el-form-item>
                <el-form-item label="创建工单"><el-switch v-model="formData.createWorkorder" /></el-form-item>
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
import { Connection, CircleCheck, Bell, Finished, Plus, Warning, Key, WarningFilled, Cpu } from '@element-plus/icons-vue'

const stats = reactive({ total: 36, enabled: 28, triggered: 45, success: 96.5 })

const alarmTypes = ref([
    { id: 1, name: '火警告警', icon: WarningFilled, color: '#F56C6C', count: 8 },
    { id: 2, name: '入侵告警', icon: Warning, color: '#E6A23C', count: 12 },
    { id: 3, name: '设备告警', icon: Cpu, color: '#409EFF', count: 10 },
    { id: 4, name: '门禁告警', icon: Key, color: '#67C23A', count: 6 }
])
const selectedType = ref(alarmTypes.value[0])

const ruleList = ref([
    { id: 1, name: '火警联动广播', alarmType: '火警', condition: '任意火警告警', action: '播放火警广播+通知', enabled: true },
    { id: 2, name: '入侵联动监控', alarmType: '入侵', condition: '入侵告警触发', action: '弹出监控画面', enabled: true },
    { id: 3, name: '设备故障通知', alarmType: '设备', condition: '紧急设备告警', action: '短信+微信通知', enabled: true },
    { id: 4, name: '门禁异常联动', alarmType: '门禁', condition: '强行开门', action: '监控+创建工单', enabled: false }
])

const executionLogs = ref([
    { id: 1, rule: '火警联动广播', action: '播放火警广播', result: 'success', time: '10:25' },
    { id: 2, rule: '入侵联动监控', action: '弹出摄像头画面', result: 'success', time: '09:15' },
    { id: 3, rule: '设备故障通知', action: '发送短信通知', result: 'failed', time: '08:45' }
])

const dialogVisible = ref(false)
const formData = reactive({ id: 0, name: '', alarmType: '', levels: [], notify: [], deviceAction: '', createWorkorder: false, enabled: true })

const pieRef = ref()
const chartRef = ref()

const handleAddRule = () => { Object.assign(formData, { id: 0, name: '', alarmType: '', levels: [], notify: [], deviceAction: '', createWorkorder: false, enabled: true }); dialogVisible.value = true }
const handleEdit = (row: any) => { Object.assign(formData, row); dialogVisible.value = true }
const handleToggle = (row: any) => { ElMessage.success(`${row.name} 已${row.enabled ? '启用' : '停用'}`) }
const handleTest = (row: any) => { ElMessage.success(`测试规则: ${row.name}`) }
const handleDelete = (row: any) => { ElMessage.warning(`删除规则: ${row.name}`) }
const handleSave = () => { dialogVisible.value = false; ElMessage.success('保存成功') }

const initCharts = () => {
    if (pieRef.value) {
        echarts.init(pieRef.value).setOption({
            series: [{
                type: 'pie', radius: ['40%', '70%'], data: [
                    { value: 35, name: '通知推送', itemStyle: { color: '#409EFF' } },
                    { value: 28, name: '设备控制', itemStyle: { color: '#67C23A' } },
                    { value: 22, name: '视频联动', itemStyle: { color: '#E6A23C' } },
                    { value: 15, name: '工单创建', itemStyle: { color: '#909399' } }
                ], label: { fontSize: 10 }
            }]
        })
    }
    if (chartRef.value) {
        echarts.init(chartRef.value).setOption({
            grid: { left: 40, right: 16, top: 20, bottom: 30 },
            xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLabel: { fontSize: 10 } },
            yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
            series: [{ type: 'bar', data: [8, 12, 6, 15, 10, 5, 3], barWidth: 16, itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] } }]
        })
    }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.alarm-linkage-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.stat-row {
    .stat-card {
        background: #fff;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 14px;

        .icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }

        .content {
            .value {
                font-size: 22px;
                font-weight: 600;
            }

            .label {
                color: #909399;
                font-size: 13px;
            }
        }

        &.total .icon {
            background: linear-gradient(135deg, #409EFF, #66b1ff);
        }

        &.enabled .icon {
            background: linear-gradient(135deg, #67C23A, #85ce61);
        }

        &.triggered .icon {
            background: linear-gradient(135deg, #E6A23C, #f3c078);
        }

        &.success .icon {
            background: linear-gradient(135deg, #909399, #c0c4cc);
        }
    }
}

.panel {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;

    .panel-header {
        padding: 14px 16px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
    }

    .mt-12 {
        margin-top: 12px;
    }
}

.alarm-type-list {
    padding: 8px;

    .type-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
            background: #f5f7fa;
        }

        &.active {
            background: #ecf5ff;
        }

        .name {
            flex: 1;
        }
    }
}

.pie-chart {
    height: 200px;
    padding: 12px;
}

.chart {
    height: 180px;
    padding: 12px;
}

.timeline {
    padding: 12px 16px;
    max-height: 280px;
    overflow: auto;

    .log-title {
        font-weight: 500;
    }

    .log-action {
        font-size: 13px;
        color: #606266;
    }

    .log-result {
        margin-top: 4px;
    }
}

.main-content {
    flex: 1;
}
</style>
