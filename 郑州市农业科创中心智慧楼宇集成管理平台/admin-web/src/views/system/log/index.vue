<template>
  <div class="log-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="操作日志" name="operation">
        <div class="filter-bar">
          <el-form :inline="true" :model="operationFilters">
            <el-form-item label="操作时间"><el-date-picker v-model="operationFilters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px" /></el-form-item>
            <el-form-item label="操作人"><el-input v-model="operationFilters.operator" placeholder="操作人姓名" style="width:140px" /></el-form-item>
            <el-form-item label="操作类型">
              <el-select v-model="operationFilters.type" placeholder="选择类型" style="width:130px">
                <el-option label="全部" value="" /><el-option label="新增" value="create" /><el-option label="修改" value="update" /><el-option label="删除" value="delete" /><el-option label="查询" value="query" />
              </el-select>
            </el-form-item>
            <el-form-item><el-button type="primary" @click="handleSearchOperation"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleResetOperation"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
          </el-form>
        </div>

        <el-table :data="operationLogs" stripe height="460">
          <el-table-column prop="time" label="操作时间" width="170" />
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="ip" label="IP地址" width="130" />
          <el-table-column prop="module" label="操作模块" width="120" />
          <el-table-column prop="type" label="操作类型" width="90">
            <template #default="{ row }"><el-tag :type="operationTypeTag(row.type)" size="small">{{ row.type }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
          <el-table-column prop="result" label="结果" width="80">
            <template #default="{ row }"><el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }"><el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button></template>
          </el-table-column>
        </el-table>
        <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="100" :page-size="10" /></div>
      </el-tab-pane>

      <el-tab-pane label="登录日志" name="login">
        <div class="filter-bar">
          <el-form :inline="true" :model="loginFilters">
            <el-form-item label="登录时间"><el-date-picker v-model="loginFilters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px" /></el-form-item>
            <el-form-item label="用户名"><el-input v-model="loginFilters.username" placeholder="用户名" style="width:140px" /></el-form-item>
            <el-form-item label="状态">
              <el-select v-model="loginFilters.status" placeholder="选择状态" style="width:120px">
                <el-option label="全部" value="" /><el-option label="成功" value="success" /><el-option label="失败" value="failed" />
              </el-select>
            </el-form-item>
            <el-form-item><el-button type="primary" @click="handleSearchLogin"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleResetLogin"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
          </el-form>
        </div>

        <el-table :data="loginLogs" stripe height="460">
          <el-table-column prop="time" label="登录时间" width="170" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="ip" label="IP地址" width="130" />
          <el-table-column prop="location" label="登录地点" width="140" />
          <el-table-column prop="browser" label="浏览器" width="120" />
          <el-table-column prop="os" label="操作系统" width="130" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }"><el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="message" label="消息" min-width="150" show-overflow-tooltip />
        </el-table>
        <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="80" :page-size="10" /></div>
      </el-tab-pane>

      <el-tab-pane label="系统日志" name="system">
        <div class="filter-bar">
          <el-form :inline="true" :model="systemFilters">
            <el-form-item label="时间"><el-date-picker v-model="systemFilters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px" /></el-form-item>
            <el-form-item label="级别">
              <el-select v-model="systemFilters.level" placeholder="选择级别" style="width:120px">
                <el-option label="全部" value="" /><el-option label="INFO" value="info" /><el-option label="WARN" value="warn" /><el-option label="ERROR" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item><el-button type="primary" @click="handleSearchSystem"><el-icon><Search /></el-icon>查询</el-button><el-button @click="handleResetSystem"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
          </el-form>
        </div>

        <el-table :data="systemLogs" stripe height="460">
          <el-table-column prop="time" label="时间" width="170" />
          <el-table-column prop="level" label="级别" width="90">
            <template #default="{ row }"><el-tag :type="row.level === 'ERROR' ? 'danger' : row.level === 'WARN' ? 'warning' : 'info'" size="small">{{ row.level }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="source" label="来源" width="150" />
          <el-table-column prop="message" label="日志内容" min-width="300" show-overflow-tooltip />
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }"><el-button type="primary" link size="small" @click="handleViewSystemLog(row)">详情</el-button></template>
          </el-table-column>
        </el-table>
        <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="200" :page-size="10" /></div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="detailVisible" title="日志详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="(value, key) in logDetail" :key="key" :label="key">{{ value }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

const activeTab = ref('operation')
const detailVisible = ref(false)
const logDetail = ref<Record<string, any>>({})

const operationFilters = reactive({ dateRange: [], operator: '', type: '' })
const loginFilters = reactive({ dateRange: [], username: '', status: '' })
const systemFilters = reactive({ dateRange: [], level: '' })

const operationLogs = ref([
  { time: '2025-01-15 10:30:25', operator: '张三', ip: '192.168.1.100', module: '用户管理', type: '新增', content: '新增用户: 李四', result: '成功' },
  { time: '2025-01-15 10:25:18', operator: '张三', ip: '192.168.1.100', module: '角色管理', type: '修改', content: '修改角色权限: 运维人员', result: '成功' },
  { time: '2025-01-15 10:20:05', operator: '管理员', ip: '192.168.1.1', module: '设备管理', type: '删除', content: '删除设备: 空调主机-02', result: '成功' },
  { time: '2025-01-15 09:45:30', operator: '李四', ip: '192.168.1.102', module: '告警管理', type: '查询', content: '查询告警列表', result: '成功' },
  { time: '2025-01-15 09:30:12', operator: '王五', ip: '192.168.1.105', module: '系统配置', type: '修改', content: '修改系统参数', result: '失败' }
])

const loginLogs = ref([
  { time: '2025-01-15 10:30:00', username: 'admin', ip: '192.168.1.100', location: '本地', browser: 'Chrome 120', os: 'Windows 10', status: '成功', message: '登录成功' },
  { time: '2025-01-15 09:15:20', username: 'zhangsan', ip: '192.168.1.102', location: '本地', browser: 'Firefox 121', os: 'Windows 11', status: '成功', message: '登录成功' },
  { time: '2025-01-15 08:45:10', username: 'test', ip: '10.0.0.55', location: '未知', browser: 'Chrome 119', os: 'MacOS', status: '失败', message: '用户名或密码错误' },
  { time: '2025-01-14 18:20:30', username: 'admin', ip: '192.168.1.100', location: '本地', browser: 'Chrome 120', os: 'Windows 10', status: '成功', message: '登录成功' }
])

const systemLogs = ref([
  { time: '2025-01-15 10:30:25', level: 'INFO', source: 'DeviceService', message: '设备状态同步完成, 共更新 156 台设备' },
  { time: '2025-01-15 10:25:18', level: 'WARN', source: 'AlarmService', message: '告警推送队列积压, 当前待推送: 25 条' },
  { time: '2025-01-15 10:20:05', level: 'ERROR', source: 'DataSyncService', message: '数据同步失败: 连接超时, 重试次数: 3' },
  { time: '2025-01-15 10:15:00', level: 'INFO', source: 'ScheduleTask', message: '定时任务执行完成: 能耗数据采集' },
  { time: '2025-01-15 10:10:30', level: 'WARN', source: 'MemoryMonitor', message: '内存使用率超过 80%: 当前 82.5%' }
])

const operationTypeTag = (type: string) => {
  const map: Record<string, string> = { '新增': 'success', '修改': 'warning', '删除': 'danger', '查询': 'info' }
  return map[type] || ''
}

const handleSearchOperation = () => { ElMessage.success('查询操作日志') }
const handleResetOperation = () => { Object.assign(operationFilters, { dateRange: [], operator: '', type: '' }) }
const handleSearchLogin = () => { ElMessage.success('查询登录日志') }
const handleResetLogin = () => { Object.assign(loginFilters, { dateRange: [], username: '', status: '' }) }
const handleSearchSystem = () => { ElMessage.success('查询系统日志') }
const handleResetSystem = () => { Object.assign(systemFilters, { dateRange: [], level: '' }) }
const handleViewDetail = (row: any) => { logDetail.value = row; detailVisible.value = true }
const handleViewSystemLog = (row: any) => { logDetail.value = row; detailVisible.value = true }
</script>

<style lang="scss" scoped>
.log-container { background: #fff; border-radius: 8px; padding: 16px; }

.filter-bar { margin-bottom: 16px; .el-form-item { margin-bottom: 0; } }

.pagination { padding: 12px 0; display: flex; justify-content: flex-end; }
</style>
