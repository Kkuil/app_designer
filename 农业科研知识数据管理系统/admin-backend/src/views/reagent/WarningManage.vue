<template>
  <div class="warning-manage-page">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card danger">
            <div class="stat-number">{{ warningStats.expired }}</div>
            <div class="stat-label">已过期</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card warning">
            <div class="stat-number">{{ warningStats.expiring }}</div>
            <div class="stat-label">即将过期(30天内)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card danger">
            <div class="stat-number">{{ warningStats.lowStock }}</div>
            <div class="stat-label">库存不足</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card info">
            <div class="stat-number">{{ warningStats.total }}</div>
            <div class="stat-label">预警总数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>预警管理</span>
          <div>
            <el-button type="info" @click="handleWarningSettings"><el-icon><Setting /></el-icon>预警设置</el-button>
            <el-button type="success" @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
          </div>
        </div>
      </template>
      <el-form :inline="true" class="filter-bar">
        <el-form-item label="试剂名称"><el-input v-model="filters.name" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="预警类型"><el-select v-model="filters.type" placeholder="全部" clearable><el-option label="过期预警" value="expired" /><el-option label="临期预警" value="expiring" /><el-option label="库存预警" value="lowStock" /></el-select></el-form-item>
        <el-form-item label="处理状态"><el-select v-model="filters.status" placeholder="全部" clearable><el-option label="未处理" value="pending" /><el-option label="处理中" value="processing" /><el-option label="已处理" value="done" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button><el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button></el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border size="small">
        <el-table-column prop="id" label="预警编号" width="120" />
        <el-table-column prop="reagentName" label="试剂名称" min-width="150" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="batchNo" label="批号" width="120" />
        <el-table-column prop="warningType" label="预警类型" width="100">
          <template #default="{ row }"><el-tag :type="getWarningTypeTag(row.warningType)" size="small">{{ row.warningTypeName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="warningContent" label="预警内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="currentStock" label="当前库存" width="90" />
        <el-table-column prop="minStock" label="最低库存" width="90" />
        <el-table-column prop="expireDate" label="有效期至" width="100" />
        <el-table-column prop="createTime" label="预警时间" width="150" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="getStatusType(row.status)" size="small">{{ row.statusName }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button type="success" link size="small" @click="handleProcess(row)" v-if="row.status !== 'done'">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next" /></div>
    </el-card>

    <el-dialog v-model="settingsVisible" title="预警设置" width="600px">
      <el-form :model="settings" label-width="150px">
        <el-form-item label="库存预警阈值"><el-input-number v-model="settings.stockThreshold" :min="1" style="width: 200px" /><span style="margin-left: 10px; color: #909399">当库存低于此值时预警</span></el-form-item>
        <el-form-item label="过期预警天数"><el-input-number v-model="settings.expireDays" :min="1" style="width: 200px" /><span style="margin-left: 10px; color: #909399">提前多少天提醒</span></el-form-item>
        <el-form-item label="预警通知方式">
          <el-checkbox-group v-model="settings.notifyMethods">
            <el-checkbox label="站内消息" value="message" />
            <el-checkbox label="邮件通知" value="email" />
            <el-checkbox label="短信通知" value="sms" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="自动处理过期试剂"><el-switch v-model="settings.autoHandleExpired" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="settingsVisible = false">取消</el-button><el-button type="primary" @click="handleSaveSettings">保存</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(30), settingsVisible = ref(false)
const filters = reactive({ name: '', type: '', status: '' })
const settings = reactive({ stockThreshold: 10, expireDays: 30, notifyMethods: ['message', 'email'], autoHandleExpired: false })
const warningStats = reactive({ expired: 5, expiring: 12, lowStock: 8, total: 25 })
const tableData = ref([
  { id: 'YJ202412001', reagentName: '无水乙醇', spec: '500mL', batchNo: 'BN2024060101', warningType: 'expired', warningTypeName: '已过期', warningContent: '试剂已于2024-12-15过期，请及时处理', currentStock: 5, minStock: 10, expireDate: '2024-12-15', createTime: '2024-12-16 08:00:00', status: 'pending', statusName: '未处理' },
  { id: 'YJ202412002', reagentName: '甲醇(色谱纯)', spec: '4L', batchNo: 'BN2024080102', warningType: 'expiring', warningTypeName: '即将过期', warningContent: '试剂将于2025-01-10过期，剩余15天', currentStock: 3, minStock: 5, expireDate: '2025-01-10', createTime: '2024-12-22 09:00:00', status: 'processing', statusName: '处理中' },
  { id: 'YJ202412003', reagentName: '盐酸', spec: '500mL', batchNo: 'BN2024090103', warningType: 'lowStock', warningTypeName: '库存不足', warningContent: '当前库存3瓶，低于最低库存10瓶', currentStock: 3, minStock: 10, expireDate: '2026-09-01', createTime: '2024-12-21 14:00:00', status: 'done', statusName: '已处理' },
  { id: 'YJ202412004', reagentName: 'Tris缓冲液', spec: '500g', batchNo: 'BN2024100104', warningType: 'lowStock', warningTypeName: '库存不足', warningContent: '当前库存2瓶，低于最低库存5瓶', currentStock: 2, minStock: 5, expireDate: '2027-03-20', createTime: '2024-12-20 10:00:00', status: 'pending', statusName: '未处理' }
])
const getWarningTypeTag = (type: string) => ({ expired: 'danger', expiring: 'warning', lowStock: 'info' }[type] || 'info')
const getStatusType = (status: string) => ({ pending: 'danger', processing: 'warning', done: 'success' }[status] || 'info')
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(filters, { name: '', type: '', status: '' }); ElMessage.info('已重置') }
const handleView = (row: any) => ElMessage.success(`查看预警 ${row.id}`)
const handleProcess = (row: any) => { ElMessageBox.confirm(`确定处理预警"${row.id}"吗？`, '提示').then(() => { row.status = 'done'; row.statusName = '已处理'; ElMessage.success('处理成功') }).catch(() => {}) }
const handleWarningSettings = () => { settingsVisible.value = true }
const handleSaveSettings = () => { settingsVisible.value = false; ElMessage.success('预警设置已保存') }
const handleExport = () => ElMessage.success('导出成功')
</script>
<style scoped>
.warning-manage-page { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filter-bar { margin-bottom: 10px; }
.pagination-container { margin-top: 15px; display: flex; justify-content: flex-end; }
.stat-card { text-align: center; padding: 15px; }
.stat-number { font-size: 32px; font-weight: bold; }
.stat-label { font-size: 14px; color: #606266; margin-top: 8px; }
.stat-card.danger .stat-number { color: #F56C6C; }
.stat-card.warning .stat-number { color: #E6A23C; }
.stat-card.info .stat-number { color: #409EFF; }
</style>
