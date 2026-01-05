<template>
    <div class="linkage-video-container">
        <el-row :gutter="16" class="stat-row">
            <el-col :xs="12" :sm="6">
                <div class="stat-card total">
                    <div class="icon"><el-icon :size="24">
                            <VideoCamera />
                        </el-icon></div>
                    <div class="content">
                        <div class="value">{{ stats.total }}</div>
                        <div class="label">视频联动规则</div>
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
                <div class="stat-card camera">
                    <div class="icon"><el-icon :size="24">
                            <Camera />
                        </el-icon></div>
                    <div class="content">
                        <div class="value">{{ stats.camera }}</div>
                        <div class="label">关联摄像头</div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <el-row :gutter="16" class="main-content">
            <el-col :span="6">
                <div class="panel">
                    <div class="panel-header">
                        <span>触发类型</span>
                    </div>
                    <div class="trigger-list">
                        <div v-for="trigger in triggerList" :key="trigger.id" class="trigger-item"
                            :class="{ active: selectedTrigger?.id === trigger.id }" @click="selectedTrigger = trigger">
                            <el-icon :size="20" :color="trigger.color">
                                <component :is="trigger.icon" />
                            </el-icon>
                            <div class="info">
                                <div class="name">{{ trigger.name }}</div>
                                <div class="count">{{ trigger.count }} 条规则</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel mt-12">
                    <div class="panel-header"><span>触发统计</span></div>
                    <div ref="pieRef" class="pie-chart"></div>
                </div>
            </el-col>

            <el-col :span="12">
                <div class="panel">
                    <div class="panel-header">
                        <span>视频联动规则</span>
                        <el-button type="primary" size="small" @click="handleAddRule"><el-icon>
                                <Plus />
                            </el-icon>新建规则</el-button>
                    </div>
                    <el-table :data="ruleList" height="420" stripe>
                        <el-table-column prop="name" label="规则名称" width="160" />
                        <el-table-column prop="trigger" label="触发事件" width="140" />
                        <el-table-column prop="camera" label="联动摄像头" width="160" />
                        <el-table-column prop="action" label="联动动作" width="120" />
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
                    <div class="panel-header"><span>联动画面预览</span></div>
                    <div class="preview-area">
                        <div class="preview-box">
                            <el-icon :size="40" color="#909399">
                                <VideoCamera />
                            </el-icon>
                            <span>摄像头预览</span>
                        </div>
                        <div class="camera-info">
                            <div class="name">摄像头: {{ currentCamera.name }}</div>
                            <div class="status">状态: <el-tag :type="currentCamera.online ? 'success' : 'danger'"
                                    size="small">{{
                                    currentCamera.online ? '在线' : '离线' }}</el-tag></div>
                        </div>
                    </div>
                </div>

                <div class="panel mt-12">
                    <div class="panel-header"><span>触发日志</span></div>
                    <el-timeline class="timeline">
                        <el-timeline-item v-for="log in logList" :key="log.id" :type="log.type" :timestamp="log.time">
                            <div class="log-title">{{ log.event }}</div>
                            <div class="log-camera">{{ log.camera }}</div>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </el-col>
        </el-row>

        <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑规则' : '新建规则'" width="650px">
            <el-form :model="formData" label-width="100px">
                <el-form-item label="规则名称"><el-input v-model="formData.name" placeholder="请输入规则名称" /></el-form-item>
                <el-form-item label="触发类型"><el-select v-model="formData.triggerType" placeholder="选择触发类型"
                        style="width:100%"><el-option label="入侵告警" value="intrusion" /><el-option label="火警告警"
                            value="fire" /><el-option label="门禁异常" value="access" /><el-option label="周界报警"
                            value="perimeter" /></el-select></el-form-item>
                <el-form-item label="触发设备"><el-select v-model="formData.triggerDevice" placeholder="选择触发设备"
                        style="width:100%"><el-option label="红外探测器-A101" value="1" /><el-option label="烟感探测器-B202"
                            value="2" /><el-option label="门禁-主入口" value="3" /></el-select></el-form-item>
                <el-form-item label="联动摄像头"><el-select v-model="formData.camera" multiple placeholder="选择摄像头"
                        style="width:100%"><el-option label="摄像头-大厅" value="1" /><el-option label="摄像头-走廊"
                            value="2" /><el-option label="摄像头-门口" value="3" /></el-select></el-form-item>
                <el-form-item label="联动动作"><el-checkbox-group v-model="formData.actions"><el-checkbox
                            label="popup">弹出画面</el-checkbox><el-checkbox label="record">开始录制</el-checkbox><el-checkbox
                            label="ptz">云台跟踪</el-checkbox><el-checkbox
                            label="capture">抓拍</el-checkbox></el-checkbox-group></el-form-item>
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
import {
    VideoCamera, CircleCheck, Bell, Camera, Plus, Warning, Key, WarningFilled

} from '@element-plus/icons-vue'

const stats = reactive({ total: 32, enabled: 28, triggered: 45, camera: 86 })

const triggerList = ref([
    { id: 1, name: '入侵告警', icon: Warning, color: '#F56C6C', count: 12 },
    { id: 2, name: '火警告警', icon: WarningFilled, color: '#E6A23C', count: 8 },
    { id: 3, name: '门禁异常', icon: Key, color: '#409EFF', count: 7 },
    { id: 4, name: '周界报警', icon: Bell, color: '#67C23A', count: 5 }
])
const selectedTrigger = ref(triggerList.value[0])

const ruleList = ref([
    { id: 1, name: '入侵联动监控', trigger: '红外报警', camera: '摄像头-大厅', action: '弹出+录制', enabled: true },
    { id: 2, name: '火警联动监控', trigger: '烟感报警', camera: '摄像头-走廊', action: '弹出+抓拍', enabled: true },
    { id: 3, name: '门禁异常联动', trigger: '门禁异常', camera: '摄像头-门口', action: '弹出', enabled: true },
    { id: 4, name: '周界报警联动', trigger: '周界报警', camera: '摄像头-围墙', action: '云台跟踪', enabled: false }
])

const currentCamera = reactive({ name: '摄像头-大厅', online: true })

const logList = ref([
    { id: 1, event: '入侵告警触发', camera: '摄像头-大厅', type: 'danger', time: '10:25' },
    { id: 2, event: '门禁异常触发', camera: '摄像头-门口', type: 'warning', time: '09:15' },
    { id: 3, event: '火警告警触发', camera: '摄像头-走廊', type: 'danger', time: '08:30' }
])

const dialogVisible = ref(false)
const formData = reactive({ id: 0, name: '', triggerType: '', triggerDevice: '', camera: [], actions: [], enabled: true })

const pieRef = ref()

const handleAddRule = () => { Object.assign(formData, { id: 0, name: '', triggerType: '', triggerDevice: '', camera: [], actions: [], enabled: true }); dialogVisible.value = true }
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
                    { value: 45, name: '入侵告警', itemStyle: { color: '#F56C6C' } },
                    { value: 25, name: '火警告警', itemStyle: { color: '#E6A23C' } },
                    { value: 18, name: '门禁异常', itemStyle: { color: '#409EFF' } },
                    { value: 12, name: '周界报警', itemStyle: { color: '#67C23A' } }
                ], label: { fontSize: 10 }
            }]
        })
    }
}

onMounted(() => { initCharts() })
</script>

<style lang="scss" scoped>
.linkage-video-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.stat-row {
    .stat-card {
        background: #fff;
        border-radius: 8px;
        padding: 14px;
        display: flex;
        align-items: center;
        gap: 12px;

        .icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }

        .content {
            .value {
                font-size: 20px;
                font-weight: 600;
            }

            .label {
                color: #909399;
                font-size: 12px;
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

        &.camera .icon {
            background: linear-gradient(135deg, #909399, #c0c4cc);
        }
    }
}

.panel {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;

    .panel-header {
        padding: 12px 16px;
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

.trigger-list {
    padding: 8px;

    .trigger-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
            background: #f5f7fa;
        }

        &.active {
            background: #ecf5ff;
        }

        .info {
            .name {
                font-weight: 500;
            }

            .count {
                font-size: 12px;
                color: #909399;
            }
        }
    }
}

.pie-chart {
    height: 200px;
    padding: 12px;
}

.preview-area {
    padding: 16px;

    .preview-box {
        height: 160px;
        background: #1a1a2e;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #909399;
    }

    .camera-info {
        margin-top: 12px;

        .name {
            font-weight: 500;
            margin-bottom: 6px;
        }

        .status {
            font-size: 13px;
            color: #606266;
        }
    }
}

.timeline {
    padding: 12px 16px;
    max-height: 200px;
    overflow: auto;

    .log-title {
        font-weight: 500;
    }

    .log-camera {
        font-size: 12px;
        color: #909399;
    }
}

.main-content {
    flex: 1;
}

.el-table {
    padding: 0 8px 12px;
}
</style>
