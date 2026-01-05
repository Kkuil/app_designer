<template>
    <div class="maintenance-repair-page">
        <div class="search-bar">
            <el-form :inline="true">
                <el-form-item label="设备名称"><el-input v-model="searchForm.name" placeholder="请输入"
                        clearable /></el-form-item>
                <el-form-item label="维修状态"><el-select v-model="searchForm.status" placeholder="全部" clearable><el-option
                            label="待维修" value="0" /><el-option label="维修中" value="1" /><el-option label="已完成"
                            value="2" /></el-select></el-form-item>
                <el-form-item label="维修时间"><el-date-picker v-model="searchForm.dateRange" type="daterange"
                        range-separator="-" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
                <el-form-item><el-button type="primary" @click="handleSearch"><el-icon>
                            <Search />
                        </el-icon>搜索</el-button><el-button @click="handleReset"><el-icon>
                            <Refresh />
                        </el-icon>重置</el-button></el-form-item>
            </el-form>
        </div>
        <div class="table-container">
            <div class="action-bar">
                <el-button type="primary" @click="handleAdd"><el-icon>
                        <Plus />
                    </el-icon>新增维修记录</el-button>
                <el-button type="success" @click="handleExport"><el-icon>
                        <Download />
                    </el-icon>导出</el-button>
            </div>
            <el-table :data="tableData" stripe border>
                <el-table-column prop="id" label="记录编号" width="100" />
                <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
                <el-table-column prop="equipmentCode" label="设备编号" width="120" />
                <el-table-column prop="faultType" label="故障类型" width="100">
                    <template #default="{ row }"><el-tag :type="getFaultTypeTag(row.faultType)" size="small">{{
                            row.faultTypeName }}</el-tag></template>
                </el-table-column>
                <el-table-column prop="faultDescription" label="故障描述" min-width="200" show-overflow-tooltip />
                <el-table-column prop="repairer" label="维修人员" width="100" />
                <el-table-column prop="reportDate" label="报修日期" width="100" />
                <el-table-column prop="finishDate" label="完成日期" width="100" />
                <el-table-column prop="cost" label="费用(元)" width="90" />
                <el-table-column prop="reservationClosed" label="预约状态" width="100">
                    <template #default="{ row }"><el-tag :type="row.reservationClosed ? 'danger' : 'success'"
                            size="small">{{ row.reservationClosed ? '已关闭' : '正常' }}</el-tag></template>
                </el-table-column>
                <el-table-column prop="status" label="维修状态" width="80"><template #default="{ row }"><el-tag
                            :type="getStatusType(row.status)" size="small">{{ row.statusName
                            }}</el-tag></template></el-table-column>
                <el-table-column label="操作" width="280" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
                        <el-button type="warning" link size="small" @click="handleEdit(row)"
                            v-if="row.status !== 2">编辑</el-button>
                        <el-button type="danger" link size="small" @click="handleCloseReservation(row)"
                            v-if="!row.reservationClosed && row.status !== 2">关闭预约</el-button>
                        <el-button type="success" link size="small" @click="handleComplete(row)"
                            v-if="row.status === 1">完成维修</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-container"><el-pagination v-model:current-page="currentPage"
                    v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="total"
                    layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" /></div>
        </div>
        <!-- 关闭预约通知对话框 -->
        <el-dialog v-model="closeReservationVisible" title="关闭仪器预约功能" width="600px">
            <el-alert title="关闭预约功能后，系统将自动给已预约的用户推送消息通知，告知设备进入维修状态。当维修完成后，仪器状态改为正常，将自动通知关注该仪器的用户。" type="warning"
                style="margin-bottom: 20px" :closable="false" />
            <el-form :model="closeForm" label-width="100px">
                <el-form-item label="设备名称"><el-input v-model="closeForm.equipmentName" disabled /></el-form-item>
                <el-form-item label="关闭原因"><el-select v-model="closeForm.reason" placeholder="请选择"
                        style="width: 100%"><el-option label="设备故障需维修" value="repair" /><el-option label="计划检修"
                            value="maintenance" /><el-option label="安全隐患" value="safety" /><el-option label="其他原因"
                            value="other" /></el-select></el-form-item>
                <el-form-item label="预计恢复时间"><el-date-picker v-model="closeForm.expectedDate" type="date"
                        style="width: 100%" placeholder="请选择预计恢复日期" /></el-form-item>
                <el-form-item label="通知内容"><el-input v-model="closeForm.notificationContent" type="textarea" rows="3"
                        placeholder="请输入通知用户的内容" /></el-form-item>
                <el-form-item label="受影响预约">
                    <div class="affected-reservations">
                        <el-tag v-for="(r, i) in affectedReservations" :key="i" style="margin: 5px">{{ r }}</el-tag>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer><el-button @click="closeReservationVisible = false">取消</el-button><el-button
                    type="primary" @click="handleConfirmClose">确认关闭并通知</el-button></template>
        </el-dialog>
        <!-- 新增/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑维修记录' : '新增维修记录'" width="700px">
            <el-form :model="form" label-width="100px">
                <el-form-item label="选择设备"><el-select v-model="form.equipmentId" placeholder="请选择设备" style="width: 100%"
                        filterable><el-option label="高效液相色谱仪 (EQ20240001)" value="1" /><el-option
                            label="气相色谱质谱联用仪 (EQ20240002)" value="2" /><el-option label="紫外可见分光光度计 (EQ20240003)"
                            value="3" /><el-option label="原子吸收光谱仪 (EQ20240004)" value="4" /></el-select></el-form-item>
                <el-form-item label="故障类型"><el-select v-model="form.faultType" placeholder="请选择"
                        style="width: 100%"><el-option label="机械故障" value="mechanical" /><el-option label="电气故障"
                            value="electrical" /><el-option label="软件故障" value="software" /><el-option label="光源故障"
                            value="light" /><el-option label="其他故障" value="other" /></el-select></el-form-item>
                <el-form-item label="故障描述"><el-input v-model="form.faultDescription" type="textarea" rows="3"
                        placeholder="请详细描述故障现象" /></el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12"><el-form-item label="维修人员"><el-input v-model="form.repairer"
                                placeholder="请输入" /></el-form-item></el-col>
                    <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone"
                                placeholder="请输入" /></el-form-item></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12"><el-form-item label="报修日期"><el-date-picker v-model="form.reportDate" type="date"
                                style="width: 100%" /></el-form-item></el-col>
                    <el-col :span="12"><el-form-item label="维修费用"><el-input-number v-model="form.cost" :min="0"
                                :precision="2" style="width: 100%" /></el-form-item></el-col>
                </el-row>
                <el-form-item label="服务商"><el-input v-model="form.serviceProvider"
                        placeholder="请输入维修服务商" /></el-form-item>
                <el-form-item label="维修方案"><el-input v-model="form.repairPlan" type="textarea" rows="2"
                        placeholder="请输入维修方案" /></el-form-item>
                <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2"
                        placeholder="请输入备注" /></el-form-item>
            </el-form>
            <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary"
                    @click="handleSubmit">确定</el-button></template>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const currentPage = ref(1), pageSize = ref(10), total = ref(30), dialogVisible = ref(false), closeReservationVisible = ref(false), isEdit = ref(false)
const searchForm = reactive({ name: '', status: '', dateRange: null })
const form = reactive({ equipmentId: '', faultType: '', faultDescription: '', repairer: '', phone: '', reportDate: '', cost: 0, serviceProvider: '', repairPlan: '', remark: '' })
const closeForm = reactive({ equipmentId: '', equipmentName: '', reason: '', expectedDate: '', notificationContent: '' })
const affectedReservations = ref<string[]>([])
const tableData = ref([
    { id: 'WX20241201', equipmentName: '原子吸收光谱仪', equipmentCode: 'EQ20240004', faultType: 'light', faultTypeName: '光源故障', faultDescription: '空心阴极灯老化，需更换', repairer: '李工', reportDate: '2024-12-18', finishDate: '', cost: 5000, reservationClosed: true, status: 1, statusName: '维修中' },
    { id: 'WX20241202', equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', faultType: 'mechanical', faultTypeName: '机械故障', faultDescription: '泵头密封件磨损，压力不稳', repairer: '张工', reportDate: '2024-12-15', finishDate: '2024-12-16', cost: 1500, reservationClosed: false, status: 2, statusName: '已完成' },
    { id: 'WX20241203', equipmentName: '紫外可见分光光度计', equipmentCode: 'EQ20240003', faultType: 'electrical', faultTypeName: '电气故障', faultDescription: '电源板故障，无法开机', repairer: '王工', reportDate: '2024-12-20', finishDate: '', cost: 2000, reservationClosed: true, status: 0, statusName: '待维修' }
])
const getFaultTypeTag = (type: string) => { const m: Record<string, string> = { mechanical: 'primary', electrical: 'warning', software: 'info', light: 'success', other: '' }; return m[type] || 'info' }
const getStatusType = (status: number) => { const m: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success' }; return m[status] || 'info' }
const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => { Object.assign(searchForm, { name: '', status: '', dateRange: null }); ElMessage.info('已重置') }
const handleAdd = () => { isEdit.value = false; Object.assign(form, { equipmentId: '', faultType: '', faultDescription: '', repairer: '', phone: '', reportDate: '', cost: 0, serviceProvider: '', repairPlan: '', remark: '' }); dialogVisible.value = true }
const handleEdit = (row: any) => { isEdit.value = true; Object.assign(form, row); dialogVisible.value = true }
const handleView = (row: any) => ElMessage.success(`查看维修记录：${row.id}`)
const handleCloseReservation = (row: any) => {
    Object.assign(closeForm, {
        equipmentId: row.equipmentCode,
        equipmentName: row.equipmentName,
        reason: 'repair',
        expectedDate: '',
        notificationContent: `${row.equipmentName}因故障需要维修，暂时关闭预约功能，给您带来不便敬请谅解。`
    })
    affectedReservations.value = ['张三 - 2024-12-23 09:00', '李四 - 2024-12-23 14:00', '王五 - 2024-12-24 10:00']
    closeReservationVisible.value = true
}
const handleConfirmClose = () => {
    ElMessage.success('已关闭预约功能并通知相关用户')
    closeReservationVisible.value = false
    const row = tableData.value.find(r => r.equipmentCode === closeForm.equipmentId)
    if (row) {
        row.reservationClosed = true
    }
}
const handleComplete = (row: any) => {
    ElMessageBox.confirm(`确定将维修记录"${row.id}"标记为已完成吗？系统将自动通知关注该仪器的用户。`, '提示', { type: 'info' })
        .then(() => {
            row.status = 2
            row.statusName = '已完成'
            row.reservationClosed = false
            row.finishDate = new Date().toISOString().split('T')[0]
            ElMessage.success('维修已完成，已恢复预约功能并通知关注用户')
        })
        .catch(() => { })
}
const handleExport = () => ElMessage.success('导出成功')
const handleSubmit = () => { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); dialogVisible.value = false }
const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>
<style scoped>
.maintenance-repair-page {
    height: 100%;
}

.affected-reservations {
    display: flex;
    flex-wrap: wrap;
}
</style>
