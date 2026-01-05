<template>
  <div class="alarm-manage-page">
    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="告警类型"><el-select v-model="searchForm.type" placeholder="全部" clearable><el-option label="设备告警" value="equipment" /><el-option label="库存告警" value="stock" /><el-option label="系统告警" value="system" /><el-option label="安全告警" value="security" /></el-select></el-form-item>
        <el-form-item label="告警级别"><el-select v-model="searchForm.level" placeholder="全部" clearable><el-option label="紧急" value="critical" /><el-option label="重要" value="major" /><el-option label="一般" value="minor" /><el-option label="提示" value="info" /></el-select></el-form-item>
        <el-form-item label="处理状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option label="未处理" value="0" /><el-option label="处理中" value="1" /><el-option label="已处理" value="2" /><el-option label="已忽略" value="3" /></el-select></el-form-item>
        <el-form-item label="时间范围"><el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
    </div>
    <div class="stats-cards">
      <el-card class="stat-card critical"><div class="stat-content"><span class="stat-value">{{ tableData.filter(r => r.level === 'critical' && r.status === 0).length }}</span><span class="stat-label">紧急告警</span></div></el-card>
      <el-card class="stat-card major"><div class="stat-content"><span class="stat-value">{{ tableData.filter(r => r.level === 'major' && r.status === 0).length }}</span><span class="stat-label">重要告警</span></div></el-card>
      <el-card class="stat-card minor"><div class="stat-content"><span class="stat-value">{{ tableData.filter(r => r.level === 'minor' && r.status === 0).length }}</span><span class="stat-label">一般告警</span></div></el-card>
      <el-card class="stat-card info"><div class="stat-content"><span class="stat-value">{{ tableData.filter(r => r.status === 0).length }}</span><span class="stat-label">待处理</span></div></el-card>
    </div>
    <div class="table-container">
      <div class="action-bar"><el-button type="primary" @click="handleBatchProcess"><el-icon><Check /></el-icon>批量处理</el-button><el-button type="warning" @click="handleBatchIgnore"><el-icon><Close /></el-icon>批量忽略</el-button><el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button></div>
      <el-table :data="tableData" stripe border @selection-change="handleSelectionChange" :row-class-name="getRowClass">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="告警编号" width="100" />
        <el-table-column prop="typeName" label="告警类型" width="100"><template #default="{ row }"><el-tag size="small">{{ row.typeName }}</el-tag></template></el-table-column>
        <el-table-column prop="levelName" label="告警级别" width="80"><template #default="{ row }"><el-tag :type="getLevelType(row.level)" size="small">{{ row.levelName }}</el-tag></template></el-table-column>
        <el-table-column prop="title" label="告警标题" min-width="200" />
        <el-table-column prop="source" label="告警来源" width="150" />
        <el-table-column prop="statusName" label="状态" width="90"><template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template></el-table-column>
        <el-table-column prop="alarmTime" label="告警时间" width="160" />
        <el-table-column prop="handler" label="处理人" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }"><el-button type="primary" link size="small" @click="handleView(row)">详情</el-button><el-button v-if="row.status === 0" type="success" link size="small" @click="handleProcess(row)">处理</el-button><el-button v-if="row.status === 0" type="warning" link size="small" @click="handleIgnore(row)">忽略</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" /></div>
    </div>
    <el-dialog v-model="dialogVisible" title="告警详情" width="700px">
      <el-descriptions :column="2" border v-if="currentAlarm">
        <el-descriptions-item label="告警编号">{{ currentAlarm.id }}</el-descriptions-item>
        <el-descriptions-item label="告警类型">{{ currentAlarm.typeName }}</el-descriptions-item>
        <el-descriptions-item label="告警级别"><el-tag :type="getLevelType(currentAlarm.level)" size="small">{{ currentAlarm.levelName }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="处理状态"><el-tag :type="getStatusType(currentAlarm.status)" size="small">{{ currentAlarm.statusName }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="告警标题" :span="2">{{ currentAlarm.title }}</el-descriptions-item>
        <el-descriptions-item label="告警来源">{{ currentAlarm.source }}</el-descriptions-item>
        <el-descriptions-item label="告警时间">{{ currentAlarm.alarmTime }}</el-descriptions-item>
        <el-descriptions-item label="告警内容" :span="2">{{ currentAlarm.content }}</el-descriptions-item>
        <el-descriptions-item label="处理人" v-if="currentAlarm.handler">{{ currentAlarm.handler }}</el-descriptions-item>
        <el-descriptions-item label="处理时间" v-if="currentAlarm.handleTime">{{ currentAlarm.handleTime }}</el-descriptions-item>
        <el-descriptions-item label="处理备注" :span="2" v-if="currentAlarm.handleRemark">{{ currentAlarm.handleRemark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <el-dialog v-model="processVisible" title="处理告警" width="500px">
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="处理结果"><el-select v-model="processForm.result" style="width: 100%"><el-option label="已解决" value="solved" /><el-option label="转交他人" value="transfer" /><el-option label="暂不处理" value="pending" /></el-select></el-form-item>
        <el-form-item label="处理备注"><el-input v-model="processForm.remark" type="textarea" rows="4" placeholder="请输入处理说明" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="processVisible = false">取消</el-button><el-button type="primary" @click="handleSubmitProcess">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(50), dialogVisible = ref(false), processVisible = ref(false), currentAlarm = ref<any>(null), selectedRows = ref<any[]>([])
const searchForm = reactive({ type: '', level: '', status: '', dateRange: null })
const processForm = reactive({ result: 'solved', remark: '' })
const tableData = ref([
  { id: 'ALM20241222001', type: 'equipment', typeName: '设备告警', level: 'critical', levelName: '紧急', title: '高效液相色谱仪温度异常', source: '实验室A-设备001', status: 0, statusName: '未处理', alarmTime: '2024-12-22 15:30:00', handler: '', handleTime: '', content: '设备温度超过设定阈值50℃，当前温度65℃，请立即检查', handleRemark: '' },
  { id: 'ALM20241222002', type: 'stock', typeName: '库存告警', level: 'major', levelName: '重要', title: '无水乙醇库存不足', source: '试剂库房', status: 0, statusName: '未处理', alarmTime: '2024-12-22 14:20:00', handler: '', handleTime: '', content: '当前库存50L，低于安全库存100L，请及时采购补充', handleRemark: '' },
  { id: 'ALM20241222003', type: 'system', typeName: '系统告警', level: 'minor', levelName: '一般', title: '磁盘空间不足', source: '服务器-192.168.1.10', status: 1, statusName: '处理中', alarmTime: '2024-12-22 10:15:00', handler: '管理员', handleTime: '', content: '系统磁盘使用率已达85%，建议清理日志文件', handleRemark: '' },
  { id: 'ALM20241222004', type: 'security', typeName: '安全告警', level: 'major', levelName: '重要', title: '异常登录尝试', source: '安全模块', status: 2, statusName: '已处理', alarmTime: '2024-12-22 08:45:00', handler: '张三', handleTime: '2024-12-22 09:00:00', content: 'IP 10.0.0.99 连续5次登录失败，疑似暴力破解', handleRemark: '已封禁该IP' },
  { id: 'ALM20241221001', type: 'equipment', typeName: '设备告警', level: 'info', levelName: '提示', title: '设备维护提醒', source: '质谱仪-MS001', status: 3, statusName: '已忽略', alarmTime: '2024-12-21 16:00:00', handler: '李四', handleTime: '2024-12-21 17:00:00', content: '设备运行已满1000小时，建议进行常规维护', handleRemark: '已安排下周维护' }
])
const getLevelType = (level: string) => { const m: Record<string, string> = { critical: 'danger', major: 'warning', minor: 'primary', info: 'info' }; return m[level] || 'info' }
const getStatusType = (status: number) => { const m: Record<number, string> = { 0: 'danger', 1: 'warning', 2: 'success', 3: 'info' }; return m[status] || 'info' }
const getRowClass = ({ row }: any) => row.status === 0 && row.level === 'critical' ? 'critical-row' : ''
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { type: '', level: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleSelectionChange = (rows: any[]) => { selectedRows.value = rows }
const handleBatchProcess = () => { if (selectedRows.value.length === 0) { ElMessage.warning('请选择要处理的告警'); return }; processVisible.value = true }
const handleBatchIgnore = () => { if (selectedRows.value.length === 0) { ElMessage.warning('请选择要忽略的告警'); return }; ElMessageBox.confirm(`确定忽略选中的${selectedRows.value.length}条告警吗？`, '提示', { type: 'warning' }).then(() => ElMessage.success('已忽略')).catch(() => {}) }
const handleExport = () => ElMessage.success('导出成功')
const handleView = (row: any) => { currentAlarm.value = row; dialogVisible.value = true }
const handleProcess = (row: any) => { currentAlarm.value = row; processVisible.value = true }
const handleIgnore = (row: any) => { ElMessageBox.confirm(`确定忽略告警"${row.title}"吗？`, '提示', { type: 'warning' }).then(() => { row.status = 3; row.statusName = '已忽略'; ElMessage.success('已忽略') }).catch(() => {}) }
const handleSubmitProcess = () => { ElMessage.success('处理成功'); processVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>.alarm-manage-page { height: 100%; }.stats-cards { display: flex; gap: 20px; margin-bottom: 20px; }.stat-card { flex: 1; }.stat-card.critical { border-left: 4px solid #F56C6C; }.stat-card.major { border-left: 4px solid #E6A23C; }.stat-card.minor { border-left: 4px solid #409EFF; }.stat-card.info { border-left: 4px solid #909399; }.stat-content { display: flex; flex-direction: column; align-items: center; padding: 10px; }.stat-value { font-size: 32px; font-weight: bold; }.stat-label { font-size: 14px; color: #909399; }:deep(.critical-row) { background-color: #fef0f0 !important; }</style>
